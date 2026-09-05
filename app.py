"""OmniChat -- Flask backend  (RC 1.0.0)

RC 1.0 变更：
  - 修复 GITHUB_REPO 重复赋值笔误
  - 自动更新 apply 时保护 static/vendor/（不删，不覆盖）
  - 配置迁移：config.json 带 schema_version，升级时自动迁移
  - VERSION 升级为 RC 1.0.0
"""
import os
import re
import io
import sys
import json
import uuid
import shutil
import datetime
import urllib.request
import threading
import zipfile
import tempfile

import requests
from flask import Flask, request, jsonify, render_template, Response, stream_with_context

# ==================== 版本 ====================
VERSION = "RC 1.1.0"
GITHUB_REPO = "xsj316/OmniChat"
GITHUB_API = "https://api.github.com/repos/{repo}/releases/latest"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONV_DIR = os.path.join(BASE_DIR, "conversations")
VENDOR_DIR = os.path.join(BASE_DIR, "static", "vendor")
MARKED_PATH = os.path.join(VENDOR_DIR, "marked.min.js")
CACHE_DIR = os.path.join(BASE_DIR, "cache")
UPDATE_DIR = os.path.join(BASE_DIR, "cache", "updates")
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")
AUTOUPDATE_FLAG = os.path.join(CACHE_DIR, "autoupdate.json")

os.makedirs(CONV_DIR, exist_ok=True)
os.makedirs(VENDOR_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(UPDATE_DIR, exist_ok=True)

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
)

# ==================== 配置迁移 ====================
DEFAULT_CONFIG = {
    "schema_version": 2,
    "base_url": "http://127.0.0.1:11434",
    "api_key": "",
    "model": "qwen2.5:7b",
    "lang": "zh-CN",
    "history_rounds": 10,
    "system_prompt": "",
    "upgrade_policy": "ask",
    "force_openai": False,
}

_config_cache = None
_config_lock = threading.Lock()


def _migrate_config(old):
    """把旧格式 config 迁移到当前 schema_version。"""
    new = dict(DEFAULT_CONFIG)
    new.update(old)

    old_ver = old.get("schema_version", 0)

    if old_ver < 1:
        pol = old.get("upgrade_policy", "ask")
        if pol not in ("ask", "never", "auto"):
            pol = "ask"
        new["upgrade_policy"] = pol

    if old_ver < 2:
        new.setdefault("force_openai", False)

    new["schema_version"] = DEFAULT_CONFIG["schema_version"]
    return new


def load_config():
    global _config_cache
    if _config_cache is not None:
        return _config_cache
    data = {}
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass
    migrated = _migrate_config(data)
    # 无论是否变化，只要含 schema_version 就确保落盘（避免首次迁移不写回）
    try:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(migrated, f, ensure_ascii=False, indent=2)
    except Exception:
        pass
    _config_cache = migrated
    return migrated


def save_config(data):
    global _config_cache
    with _config_lock:
        data["schema_version"] = DEFAULT_CONFIG["schema_version"]
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        _config_cache = data


# ==================== 启动自检：vendor 文件 ====================
def ensure_marked():
    if os.path.exists(MARKED_PATH) and os.path.getsize(MARKED_PATH) > 1000:
        return True
    url = "https://cdn.jsdelivr.net/npm/marked@12/marked.min.js"
    try:
        os.makedirs(VENDOR_DIR, exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": "OmniChat/" + VERSION})
        with urllib.request.urlopen(req, timeout=30) as r, open(MARKED_PATH, "wb") as f:
            f.write(r.read())
        print(f"[OK] marked.js downloaded -> {MARKED_PATH}")
        return True
    except Exception as e:
        print(f"[WARN] cannot download marked.js: {e}")
        return False


HIGHLIGHT_JS_PATH = os.path.join(VENDOR_DIR, "highlight.min.js")
HIGHLIGHT_CSS_PATH = os.path.join(VENDOR_DIR, "highlight.min.css")
PURIFY_PATH = os.path.join(VENDOR_DIR, "purify.min.js")

HIGHLIGHT_JS_URL = "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"
HIGHLIGHT_CSS_URL = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css"
PURIFY_URL = "https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js"


def ensure_highlight():
    ok = True
    if not os.path.exists(HIGHLIGHT_JS_PATH):
        try:
            urllib.request.urlretrieve(HIGHLIGHT_JS_URL, HIGHLIGHT_JS_PATH)
            print("[OK] highlight.min.js downloaded")
        except Exception as e:
            print(f"[WARN] highlight.js failed: {e}")
            ok = False
    if not os.path.exists(HIGHLIGHT_CSS_PATH):
        try:
            urllib.request.urlretrieve(HIGHLIGHT_CSS_URL, HIGHLIGHT_CSS_PATH)
            print("[OK] highlight.min.css downloaded")
        except Exception as e:
            print(f"[WARN] highlight.css failed: {e}")
            ok = False
    return ok


def ensure_purify():
    if os.path.exists(PURIFY_PATH):
        return
    try:
        urllib.request.urlretrieve(PURIFY_URL, PURIFY_PATH)
        print("[OK] purify.min.js downloaded")
    except Exception as e:
        print(f"[WARN] purify failed: {e}")


# ==================== 存档：JSONL ====================
def _conv_path(conv_id):
    return os.path.join(CONV_DIR, conv_id + ".jsonl")


def load_conversation(conv_id):
    path = _conv_path(conv_id)
    if not os.path.exists(path):
        return None
    messages, title = [], ""
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            if rec.get("type") == "meta":
                title = rec.get("title", "")
            elif rec.get("type") == "message":
                messages.append({"role": rec.get("role"), "content": rec.get("content", "")})
    return {"id": conv_id, "title": title, "messages": messages}


def save_conversation(conv):
    conv_id = conv.get("id") or uuid.uuid4().hex
    title = (conv.get("title") or "").strip()
    if not title:
        for m in conv.get("messages", []):
            if m.get("role") == "user":
                title = (m.get("content") or "").strip().replace("\n", " ")[:20]
                break
    path = _conv_path(conv_id)
    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps({"type": "meta", "title": title,
                            "updated_at": datetime.datetime.now().isoformat(timespec="seconds")},
                           ensure_ascii=False) + "\n")
        for m in conv.get("messages", []):
            f.write(json.dumps({"type": "message", "role": m.get("role"),
                                "content": m.get("content", "")}, ensure_ascii=False) + "\n")
    return {"id": conv_id, "title": title}


def list_conversations():
    result = []
    for fn in os.listdir(CONV_DIR):
        if not fn.endswith(".jsonl"):
            continue
        conv_id = fn[:-len(".jsonl")]
        data = load_conversation(conv_id)
        if not data:
            continue
        updated = ""
        try:
            with open(_conv_path(conv_id), "r", encoding="utf-8") as f:
                first = f.readline().strip()
                updated = (json.loads(first) if first else {}).get("updated_at", "")
        except Exception:
            pass
        result.append({"id": conv_id, "title": data.get("title") or "(未命名)",
                       "message_count": len(data.get("messages", [])), "updated_at": updated})
    result.sort(key=lambda x: x.get("updated_at") or "", reverse=True)
    return result


# ==================== 后端类型判断 ====================
def is_ollama(base_url):
    cfg = load_config()
    if cfg.get("force_openai"):
        return False
    s = (base_url or "").lower()
    return ("/v1" not in s) and ("openai" not in s)


def _auth_headers(api_key):
    h = {"Content-Type": "application/json", "Accept": "application/json"}
    if api_key:
        h["Authorization"] = "Bearer " + api_key
    return h


# ==================== 流式生成器 ====================
def stream_chat(base_url, api_key, model, system, history, user_msg):
    base_url = (base_url or "").rstrip("/")
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.extend(history)
    messages.append({"role": "user", "content": user_msg})

    try:
        if is_ollama(base_url):
            payload = {"model": model, "messages": messages, "stream": True}
            url = base_url + "/api/chat"
            with requests.post(url, headers=_auth_headers(api_key),
                               json=payload, stream=True, timeout=60) as r:
                r.raise_for_status()
                for line in r.iter_lines(decode_unicode=True):
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    chunk = (obj.get("message") or {}).get("content", "")
                    if chunk:
                        yield chunk
                    if obj.get("done"):
                        break
        else:
            payload = {"model": model, "messages": messages, "stream": True}
            url = base_url + "/v1/chat/completions"
            with requests.post(url, headers=_auth_headers(api_key),
                               json=payload, stream=True, timeout=60) as r:
                r.raise_for_status()
                for line in r.iter_lines(decode_unicode=True):
                    if not line or not line.startswith("data:"):
                        continue
                    data_str = line[5:].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        obj = json.loads(data_str)
                    except json.JSONDecodeError:
                        continue
                    delta = (obj.get("choices") or [{}])[0].get("delta") or {}
                    chunk = delta.get("content", "")
                    if chunk:
                        yield chunk
        yield json.dumps({"__done__": True})
    except Exception as e:
        yield json.dumps({"__error__": str(e)})


# ==================== 路由 ====================
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/version")
def api_version():
    return jsonify({"version": VERSION, "repo": GITHUB_REPO})


@app.route("/api/config", methods=["GET", "POST"])
def api_config():
    if request.method == "POST":
        d = request.get_json(force=True, silent=True) or {}
        cur = dict(load_config())
        cur.update({k: v for k, v in d.items() if k in DEFAULT_CONFIG})
        save_config(cur)
        return jsonify({"ok": True, "config": cur})
    return jsonify({"ok": True, "config": load_config()})


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        d = request.get_json(force=True, silent=True) or {}
        cfg = load_config()
        # 优先用请求里的，否则用 config 里的；记录“是否来自 config 默认值”
        base_url = (d.get("base_url") or "").strip().rstrip("/") or cfg.get("base_url", "")
        model = (d.get("model") or "").strip() or cfg.get("model", "")
        api_key = d.get("api_key") if d.get("api_key") else cfg.get("api_key", "")
        msg = (d.get("message") or "").strip()
        system = d.get("system") or cfg.get("system_prompt", "")
        # 未配置（用默认值）时友好提示，避免直接连 localhost 报 500
        if base_url == DEFAULT_CONFIG["base_url"] and not (d.get("base_url") or "").strip():
            return jsonify({"error": "请先在「模型设置」中填写 Base URL 并保存"}), 400
        if not base_url or not model:
            return jsonify({"error": "Need Base URL and Model"}), 400
        if not msg:
            return jsonify({"error": "Empty message"}), 400
        rounds = int(d.get("history_rounds") or cfg.get("history_rounds") or 10)
        history = build_history(d.get("messages") or [], rounds)
        headers = _auth_headers(api_key)
        messages = [{"role": "system", "content": system}] if system else []
        messages.extend(history)
        messages.append({"role": "user", "content": msg})
        if is_ollama(base_url):
            r = requests.post(base_url + "/api/chat", headers=headers,
                              json={"model": model, "messages": messages, "stream": False}, timeout=60)
            r.raise_for_status()
            reply = (r.json().get("message") or {}).get("content", "")
        else:
            r = requests.post(base_url + "/v1/chat/completions", headers=headers,
                              json={"model": model, "messages": messages, "stream": False}, timeout=60)
            r.raise_for_status()
            reply = r.json()["choices"][0]["message"]["content"]
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat/stream", methods=["POST"])
def chat_stream():
    try:
        d = request.get_json(force=True, silent=True) or {}
    except Exception:
        d = {}
    cfg = load_config()
    base_url = (d.get("base_url") or cfg.get("base_url") or "").rstrip("/")
    api_key = d.get("api_key") if d.get("api_key") else cfg.get("api_key", "")
    model = d.get("model") or cfg.get("model", "")
    msg = (d.get("message") or "").strip()
    system = d.get("system") or cfg.get("system_prompt", "")
    rounds = int(d.get("history_rounds") or cfg.get("history_rounds") or 10)
    history = build_history(d.get("messages") or [], rounds)

    if not base_url or not model:
        return jsonify({"error": "Need Base URL and Model"}), 400

    def gen():
        for chunk in stream_chat(base_url, api_key, model, system, history, msg):
            if chunk.startswith("{"):
                yield chunk + "\n"
            else:
                yield "data: " + json.dumps(chunk, ensure_ascii=False) + "\n\n"

    return Response(stream_with_context(gen()), mimetype="text/event-stream")


def build_history(messages, rounds):
    try:
        rounds = max(0, int(rounds))
    except Exception:
        rounds = 10
    if rounds == 0:
        return []
    pairs = [m for m in messages if m.get("role") in ("user", "assistant")]
    return pairs[-(rounds * 2):] if rounds > 0 else pairs


@app.route("/api/models", methods=["POST"])
def list_models():
    try:
        d = request.get_json(force=True, silent=True) or {}
        cfg = load_config()
        base_url = (d.get("base_url") or cfg.get("base_url") or "").rstrip("/")
        api_key = d.get("api_key") if d.get("api_key") else cfg.get("api_key", "")
        if not base_url:
            return jsonify({"ok": False, "msg": "Base URL empty"}), 400
        headers = _auth_headers(api_key)
        if is_ollama(base_url):
            r = requests.get(base_url + "/api/tags", headers=headers, timeout=10)
            r.raise_for_status()
            models = [(m.get("name") or m.get("model")) for m in r.json().get("models", [])]
        else:
            r = requests.get(base_url + "/v1/models", headers=headers, timeout=10)
            r.raise_for_status()
            data = r.json()
            models = [(m.get("id") or m.get("name")) for m in data.get("data", [])]
        models = [m for m in models if m]
        return jsonify({"ok": bool(models), "models": models}) if models \
            else jsonify({"ok": False, "msg": "No models"})
    except Exception as e:
        return jsonify({"ok": False, "msg": str(e)}), 500


# ==================== 存档 API ====================
@app.route("/api/conversations", methods=["GET"])
def api_list():
    return jsonify({"ok": True, "conversations": list_conversations()})


@app.route("/api/conversations", methods=["POST"])
def api_save():
    d = request.get_json(force=True, silent=True) or {}
    saved = save_conversation(d)
    return jsonify({"ok": True, **saved})


@app.route("/api/conversations/<conv_id>", methods=["GET"])
def api_load(conv_id):
    data = load_conversation(conv_id)
    if not data:
        return jsonify({"ok": False, "msg": "Not found"}), 404
    return jsonify({"ok": True, **data})


@app.route("/api/conversations/<conv_id>", methods=["DELETE"])
def api_delete(conv_id):
    path = _conv_path(conv_id)
    if os.path.exists(path):
        os.remove(path)
    return jsonify({"ok": True})


@app.route("/api/export", methods=["POST"])
def api_export():
    d = request.get_json(force=True, silent=True) or {}
    ids = d.get("ids") or [c["id"] for c in list_conversations()]
    data = [load_conversation(cid) for cid in ids]
    data = [x for x in data if x]
    return jsonify({"ok": True,
                    "exported_at": datetime.datetime.now().isoformat(timespec="seconds"),
                    "conversations": data})


# ==================== 自动升级模块 ====================
def load_update_policy():
    if os.path.exists(AUTOUPDATE_FLAG):
        try:
            with open(AUTOUPDATE_FLAG, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"policy": load_config().get("upgrade_policy", "ask"), "skip_version": None}


def save_update_policy(pol):
    with open(AUTOUPDATE_FLAG, "w", encoding="utf-8") as f:
        json.dump(pol, f, ensure_ascii=False)


def fetch_latest_release():
    if not GITHUB_REPO or "yourname" in GITHUB_REPO:
        return None
    try:
        url = GITHUB_API.format(repo=GITHUB_REPO)
        req = urllib.request.Request(url, headers={"User-Agent": "OmniChat/" + VERSION})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        return {
            "version": data.get("tag_name", ""),
            "name": data.get("name", ""),
            "body": data.get("body", ""),
            "html_url": data.get("html_url", ""),
            "assets": [{"name": a.get("name"), "url": a.get("browser_download_url")} for a in data.get("assets", [])],
            "zipball_url": data.get("zipball_url", ""),
        }
    except Exception:
        return None


# 版本阶段权重：数字越大越新。正式版（无前缀）权重最高。
_STAGE_WEIGHT = {
    "dev": 10, "alpha": 30, "beta": 50, "rc": 70,
}
_FORMAL_WEIGHT = 90  # 正式版（纯数字如 "1.0.0"）


def _parse_version(s):
    """把版本字符串解析为 (阶段权重, [数字版本])，便于比较。

    例：
        "Beta 3.1.1" -> (50, [3, 1, 1])
        "RC 1.0.0"   -> (70, [1, 0, 0])
        "1.0.0"      -> (90, [1, 0, 0])
    """
    s = str(s or "").strip().lower()
    # 提取阶段前缀
    stage = ""
    for key in _STAGE_WEIGHT:
        if s.startswith(key):
            stage = key
            break
    weight = _STAGE_WEIGHT.get(stage, _FORMAL_WEIGHT)
    nums = [int(x) for x in re.findall(r"\d+", s)]
    return (weight, nums)


def compare_version(a, b):
    """返回 True 表示 a 比 b 更新（更高版本）。"""
    return _parse_version(a) > _parse_version(b)


def check_update_sync():
    pol = load_update_policy()
    if pol.get("policy") == "never":
        return {"has_update": False}
    latest = fetch_latest_release()
    if not latest or not latest.get("version"):
        return {"has_update": False}
    if latest.get("version") == pol.get("skip_version"):
        return {"has_update": False}
    if not compare_version(latest.get("version"), VERSION):
        return {"has_update": False}
    return {"has_update": True, "latest": latest}


@app.route("/api/check-update")
def api_check_update():
    result = {"has_update": False, "error": None}

    def run():
        try:
            result.update(check_update_sync())
        except Exception as e:
            result["error"] = str(e)

    t = threading.Thread(target=run, daemon=True)
    t.start()
    t.join(timeout=12)
    if t.is_alive():
        return jsonify({"has_update": False, "pending": True})
    if result.get("has_update"):
        return jsonify({"has_update": True, "latest": result.get("latest")})
    return jsonify({"has_update": False, "error": result.get("error")})


@app.route("/api/update/policy", methods=["POST"])
def api_update_policy():
    d = request.get_json(force=True, silent=True) or {}
    pol = load_update_policy()
    if d.get("policy") in ("ask", "never", "auto"):
        pol["policy"] = d.get("policy")
        cfg = load_config()
        cfg["upgrade_policy"] = pol["policy"]
        save_config(cfg)
    if d.get("skip_version"):
        pol["skip_version"] = d.get("skip_version")
    if d.get("clear_skip"):
        pol.pop("skip_version", None)
    save_update_policy(pol)
    return jsonify({"ok": True, "policy": pol})


@app.route("/api/update/download", methods=["POST"])
def api_update_download():
    d = request.get_json(force=True, silent=True) or {}
    latest = d.get("latest") or check_update_sync().get("latest") or {}
    zip_url = latest.get("zipball_url")
    if not zip_url:
        return jsonify({"ok": False, "msg": "No download url"}), 400
    try:
        os.makedirs(UPDATE_DIR, exist_ok=True)
        target = os.path.join(UPDATE_DIR, f"{latest.get('version', 'latest')}.zip")
        req = urllib.request.Request(zip_url, headers={"User-Agent": "OmniChat/" + VERSION})
        with urllib.request.urlopen(req, timeout=120) as r, open(target, "wb") as f:
            shutil.copyfileobj(r, f)
        return jsonify({"ok": True, "path": target})
    except Exception as e:
        return jsonify({"ok": False, "msg": str(e)}), 500


@app.route("/api/update/apply", methods=["POST"])
def api_update_apply():
    """解压覆盖，保护 conversations/ cache/ static/vendor/ 和 app.py 自身"""
    d = request.get_json(force=True, silent=True) or {}
    zip_path = d.get("path")
    if not zip_path or not os.path.exists(zip_path):
        return jsonify({"ok": False, "msg": "Package not found, download first"}), 400
    try:
        extract_dir = tempfile.mkdtemp(prefix="omni_update_", dir=CACHE_DIR)
        with zipfile.ZipFile(zip_path, "r") as z:
            z.extractall(extract_dir)
        top = os.path.join(extract_dir, os.listdir(extract_dir)[0]) if len(
            os.listdir(extract_dir)) == 1 else extract_dir

        # 保护列表：这些不删不覆盖
        preserve = {"conversations", "cache", "static"}

        for item in os.listdir(BASE_DIR):
            if item in preserve:
                continue
            p = os.path.join(BASE_DIR, item)
            if item == os.path.basename(__file__):
                continue
            shutil.rmtree(p, ignore_errors=True) if os.path.isdir(p) else os.remove(p)

        for item in os.listdir(top):
            if item in preserve:
                continue
            s = os.path.join(top, item)
            d2 = os.path.join(BASE_DIR, item)
            if os.path.isdir(s):
                shutil.copytree(s, d2, dirs_exist_ok=True)
            else:
                shutil.copy2(s, d2)

        shutil.rmtree(extract_dir, ignore_errors=True)
        return jsonify({"ok": True, "msg": "Updated. Please restart the app.", "restart_required": True})
    except Exception as e:
        return jsonify({"ok": False, "msg": str(e)}), 500


# ==================== 启动 ====================
def bootstrap():
    ensure_marked()
    ensure_highlight()
    ensure_purify()
    try:
        pol = load_update_policy()
        if pol.get("policy") == "auto":
            threading.Thread(target=lambda: check_update_sync(), daemon=True).start()
    except Exception:
        pass


if __name__ == "__main__":
    bootstrap()
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
    print(f"OmniChat {VERSION}  running on http://127.0.0.1:8000")
    app.run(host="0.0.0.0", port=8000, debug=False, threaded=True)
