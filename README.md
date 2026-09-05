# OmniChat — RC 1.1.0

一个轻量级本地大模型聊天应用，支持任意兼容 Ollama / OpenAI `/v1` 接口的模型服务。**RC 1.1.0** 在 RC 1.0.0 基础上进一步简化设置：**移除 System Prompt 预设，仅保留自定义文本框**。

## 环境要求

- **Python 3.10 或更高版本**

> 低于 3.10 可能缺少某些特性导致运行异常。
> 下载地址：https://www.python.org/downloads/

## RC 1.1 新变化

| 类别 | 内容 |
|------|------|
| 🔧 **移除 System Prompt 预设** | 删除「默认 / 海龟汤 / 翻译 / 代码」四个预设，System Prompt 改为**纯自定义文本框**，配置更直观、无隐藏逻辑 |
| 🔧 清理前端 | 移除预设下拉框 `<select>`、相关 JS 逻辑（`applyPreset` / `presetText`）及 6 种语言的预设词条 |

## RC 1.0 新变化

| 类别 | 内容 |
|------|------|
| 🔧 自动更新跑通 | 检测 → 下载 zip → 解压覆盖 → 提示重启；升级时**保护 `conversations/` `cache/` `static/vendor/`**，用户数据不丢 |
| 🔧 配置迁移 | `config.json` 带 `schema_version`，旧版（Beta）升级到 RC 自动迁移，**不丢设置** |
| 🔧 设置页修复 | CSS z-index 层级 + 关闭事件绑定 + safeStorage 异常兜底 |
| 🔧 版本号 | `VERSION = "RC 1.1.0"`，对齐 RC 阶段规划 |

## 功能

| 功能 | 说明 |
|------|------|
| ⚡ 流式输出 (SSE) | 打字机效果，逐字实时显示；自动识别 Ollama `/api/chat` 与 OpenAI `/v1/chat/completions` |
| 📜 对话历史 | 每次请求带「最近 N 轮」，N 可在模型设置栏配置（默认 10，0=不记忆） |
| 📝 Markdown 渲染 | 代码块/加粗/列表/链接实时渲染 + 代码高亮（highlight.js）+ XSS 过滤（DOMPurify）；渲染库**首次运行时自动下载到 `static/vendor/`，之后离线永久可用** |
| ⏹ 停止生成 | 流式时可点「■」中断；发新消息也会自动中断上一条 |
| 🔄 自动升级 | 启动时检查 GitHub Release，有新版弹窗让用户选「立刻升级 / 暂不 / 永不提示 / 自动升级」 |

## 快速开始

```powershell
cd omni-chat
pip install -r requirements.txt
python app.py
```

浏览器访问 `http://127.0.0.1:8000`。

> 首次运行时若 `static/vendor/` 下的 `marked.min.js` / `highlight.min.js` / `purify.min.js` 不存在，会自动联网下载（仅需这一次）；之后断网也能用 Markdown。若要完全离线分发，请保留 `static/vendor/` 目录。

## 配置自动升级

打开 `app.py`，确认这两行指向你自己的 GitHub 仓库：

```python
VERSION = "RC 1.1.0"
GITHUB_REPO = "xsj316/OmniChat"   # ← 改成你的 owner/repo
```

## RC 阶段规划

| 版本 | 重点 |
|------|------|
| RC 1.0 | 核心功能收口：自动更新跑通 + 配置迁移 + 设置页修复 |
| RC 2.0 | 体验打磨：全局错误兜底 + 加载/空状态 + 打字机光标 |
| RC 3.0 ~ 6.0 | 工程/分发：首次启动引导 + 关于页 + 卸载清理 + CHANGELOG |
| RC 6.0 ~ 8.0 | 打包测试 + 分发方案 |
| RC 8.0+ | 修复所有 bug → 发布正式版 |

## 项目结构

```
omni-chat/
├── app.py
├── templates/index.html
├── static/
│   ├── chat.js
│   ├── style.css
│   └── vendor/              ← 离线可用（首次自动下载）
│       ├── marked.min.js
│       ├── highlight.min.js
│       ├── highlight.min.css
│       └── purify.min.js
├── conversations/            ← 会话存档（升级时保留）
├── cache/                    ← 升级缓存（升级时保留）
├── config.json               ← 用户配置（带 schema_version，自动迁移）
└── requirements.txt
```
