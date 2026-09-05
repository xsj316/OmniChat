// ===== 安全 Storage 包装 =====
var safeStorage = (function () {
    var mem = {};
    function getLS() {
        try { return window.localStorage; } catch (e) { return null; }
    }
    return {
        get: function (key) {
            var LS = getLS();
            try { return LS ? LS.getItem(key) : mem[key] || null; }
            catch (e) { return mem[key] || null; }
        },
        set: function (key, val) {
            var LS = getLS();
            try { if (LS) LS.setItem(key, val); else mem[key] = String(val); }
            catch (e) { mem[key] = String(val); }
        }
    };
})();

(function () {
    "use strict";

    // ============================================================
    //  多语言字典
    // ============================================================
    var I18N = {
        "zh-CN": {
            settings: "设置", modelSettings: "模型设置", language: "语言 / Language",
            baseUrl: "API Base URL", baseUrlPlaceholder: "http://127.0.0.1:11434",
            apiKey: "API Key", apiKeyPlaceholder: "留空=不需要",
            model: "模型", modelPlaceholder: "或手动输入模型名", fetch: "获取", fetchFirst: "先点获取",
            saveConfig: "保存配置", archive: "会话存档",
            newConv: "＋ 新对话", saveConv: "⇩ 保存当前", export: "⇪ 导出备份",
            ready: "就绪", welcome: "你好！填好配置后开始聊天。流式输出、Markdown、对话历史均已就绪。",
            inputPlaceholder: "输入消息... Enter 发送",
            thinking: "思考中...", error: "错误", offline: "离线", emptyReply: "(空回复)",
            saved: "已保存", parseFailed: "解析失败", requestFailed: "请求失败",
            networkError: "网络错误", noBaseUrl: "请先填 Base URL", fetchFailed: "获取失败",
            fetchOk: "已获取 {n} 个模型", loadFailed: "加载失败",
            noMessages: "当前还没有对话可保存。", deleteConfirm: "删除这个会话？此操作不可撤销。",
            emptyArchive: "暂无存档，点「保存当前」留存对话", unnamed: "(未命名)",
            promptTitle: "给这个会话起个名字（留空=自动用首句）：",
            loaded: "已加载：", newConvStarted: "新对话已开始。开始聊天吧。",
            yes: "是", no: "否", irrelevant: "不重要",
            historyRounds: "记忆轮数（最近 N 轮，0=不记忆）",
            stop: "停止生成", streaming: "生成中...",
            updateTitle: "发现新版本 🎉", updateBody: "最新版本：<b>{ver}</b><br><span class=\"update__notes\">{notes}</span>",
            updateNow: "立刻升级", updateLater: "暂不升级", updateNever: "以后不再提示", updateAuto: "自动升级",
            updateChecking: "正在检查更新...", updateNone: "已是最新版本", updateSkip: "已跳过该版本",
            downloadAndApply: "正在下载并应用更新，请勿关闭...", restartRequired: "升级完成，请重启程序。",
            systemPromptLabel: "System Prompt",
            systemPlaceholder: "在此输入系统提示词（留空则无）",
            checkUpdate: "检查更新", checkNow: "立即检查", about: "关于", aboutDesc: "本地大模型聊天客户端，支持流式输出、Markdown 渲染与对话历史。",
        },
        "en": {
            settings: "Settings", modelSettings: "Model Settings", language: "Language",
            baseUrl: "API Base URL", baseUrlPlaceholder: "http://127.0.0.1:11434",
            apiKey: "API Key", apiKeyPlaceholder: "Leave empty if not needed",
            model: "Model", modelPlaceholder: "Or type a model name", fetch: "Fetch", fetchFirst: "fetch first",
            saveConfig: "Save Config", archive: "Conversation Archive",
            newConv: "＋ New", saveConv: "⇩ Save", export: "⇪ Export",
            ready: "Ready", welcome: "Hi! Configure your settings, then start chatting. Streaming, Markdown and conversation history are ready.",
            inputPlaceholder: "Type a message... Enter to send",
            thinking: "Thinking...", error: "Error", offline: "Offline", emptyReply: "(empty reply)",
            saved: "Saved", parseFailed: "Parse failed", requestFailed: "Request failed",
            networkError: "Network error", noBaseUrl: "Please fill in the Base URL first", fetchFailed: "Fetch failed",
            fetchOk: "Fetched {n} models", loadFailed: "Load failed",
            noMessages: "No conversation to save yet.", deleteConfirm: "Delete this conversation? This cannot be undone.",
            emptyArchive: "No archive yet — click \"Save\" to keep a conversation.", unnamed: "(Untitled)",
            promptTitle: "Name this conversation (leave empty = auto-use first message):",
            loaded: "Loaded: ", newConvStarted: "New conversation started. Let's chat.",
            yes: "Yes", no: "No", irrelevant: "Irrelevant",
            historyRounds: "History rounds (last N, 0=none)",
            stop: "Stop", streaming: "Streaming...",
            updateTitle: "New version available 🎉", updateNow: "Upgrade now", updateLater: "Later", updateNever: "Don't ask again", updateAuto: "Auto-update",
            updateChecking: "Checking for updates...", updateNone: "You're up to date", updateSkip: "Version skipped",
            downloadAndApply: "Downloading and applying update, please don't close...", restartRequired: "Update done. Please restart the app.",
            systemPromptLabel: "System Prompt",
            systemPlaceholder: "Enter system prompt here (leave empty for none)",
            checkUpdate: "Check for updates", checkNow: "Check now", about: "About", aboutDesc: "A local LLM chat client with streaming, Markdown rendering and conversation history.",
        },
        "ja": {
            settings: "設定", language: "言語 / Language",
            baseUrl: "API Base URL", baseUrlPlaceholder: "http://127.0.0.1:11434",
            apiKey: "API Key", apiKeyPlaceholder: "空欄＝不要",
            model: "モデル", modelPlaceholder: "またはモデル名を入力", fetch: "取得", fetchFirst: "まず取得",
            saveConfig: "設定を保存", archive: "会話アーカイブ",
            newConv: "＋ 新規", saveConv: "⇩ 保存", export: "⇪ エクスポート",
            ready: "準備完了", welcome: "こんにちは！設定を入力してチャットを開始してください。",
            inputPlaceholder: "メッセージを入力... Enter で送信",
            thinking: "考え中...", error: "エラー", offline: "オフライン", emptyReply: "(空の返信)",
            saved: "保存しました", parseFailed: "解析失敗", requestFailed: "要求失敗",
            networkError: "ネットワークエラー", noBaseUrl: "まず Base URL を入力してください", fetchFailed: "取得失敗",
            fetchOk: "{n} 個のモデルを取得", loadFailed: "読み込み失敗",
            noMessages: "保存する会話がありません。", deleteConfirm: "この会話を削除しますか？元に戻せません。",
            emptyArchive: "アーカイブはまだありません。", unnamed: "(無題)",
            promptTitle: "会話に名前を付けてください（空欄＝最初の文を使用）:", loaded: "読み込み済み: ",
            newConvStarted: "新しい会話が始まりました。", yes: "はい", no: "いいえ", irrelevant: "関係なし",
            historyRounds: "履歴（最近Nラウンド、0=なし）",
            stop: "停止", streaming: "生成中...",
            updateTitle: "新しいバージョン 🎉", updateNow: "今すぐ更新", updateLater: "後で", updateNever: "今後通知しない", updateAuto: "自動更新",
            updateChecking: "更新を確認中...", updateNone: "最新です", downloadAndApply: "ダウンロード中...",
            systemPromptLabel: "System Prompt",
            systemPlaceholder: "システムプロンプトを入力（空欄＝なし）",
            checkUpdate: "更新を確認", checkNow: "今すぐ確認", about: "について", aboutDesc: "ローカル LLM チャットクライアント。ストリーミング・Markdown・会話履歴に対応。",
        },
        "ko": {
            settings: "설정", language: "언어 / Language",
            baseUrl: "API Base URL", baseUrlPlaceholder: "http://127.0.0.1:11434",
            apiKey: "API Key", apiKeyPlaceholder: "비워 두면 사용 안 함",
            model: "모델", modelPlaceholder: "또는 모델 이름 입력", fetch: "가져오기", fetchFirst: "먼저 가져오기",
            saveConfig: "설정 저장", archive: "대화 아카이브",
            newConv: "＋ 새로", saveConv: "⇩ 저장", export: "⇪ 내보내기",
            ready: "준비됨", welcome: "안녕하세요! 설정을 채우고 채팅을 시작하세요.",
            inputPlaceholder: "메시지 입력... Enter로 전송",
            thinking: "생각 중...", error: "오류", offline: "오프라인", emptyReply: "(빈 응답)",
            saved: "저장됨", parseFailed: "파싱 실패", requestFailed: "요청 실패",
            networkError: "네트워크 오류", noBaseUrl: "먼저 Base URL을 입력하세요", fetchFailed: "가져오기 실패",
            fetchOk: "{n}개 모델 가져옴", loadFailed: "로드 실패",
            noMessages: "저장할 대화가 없습니다.", deleteConfirm: "이 대화를 삭제할까요?", emptyArchive: "아카이브 없음",
            unnamed: "(제목없음)", promptTitle: "대화 이름(비워두면 첫 문장 사용):",
            loaded: "로드됨: ", newConvStarted: "새 대화 시작.", yes: "예", no: "아니오", irrelevant: "관계없음",
            historyRounds: "기록 라운드 수(최근 N, 0=없음)",
            stop: "중지", streaming: "생성 중...",
            updateTitle: "새 버전 🎉", updateNow: "지금 업그레이드", updateLater: "나중에", updateNever: "다시 묻지 않음", updateAuto: "자동 업데이트",
            updateChecking: "업데이트 확인 중...", updateNone: "최신 버전", downloadAndApply: "다운로드 중...",
            systemPromptLabel: "System Prompt",
            systemPlaceholder: "시스템 프롬프트 입력 (비워 두면 없음)",
            checkUpdate: "업데이트 확인", checkNow: "지금 확인", about: "정보", aboutDesc: "로컬 LLM 채팅 클라이언트. 스트리밍·Markdown·대화 기록을 지원합니다.",
        },
        "es": {
            settings: "Ajustes", language: "Idioma", baseUrl: "API Base URL", baseUrlPlaceholder: "http://127.0.0.1:11434",
            apiKey: "API Key", apiKeyPlaceholder: "Vacío = no necesaria", model: "Modelo", modelPlaceholder: "O escribe un modelo", fetch: "Obtener", fetchFirst: "obtener primero",
            saveConfig: "Guardar", archive: "Archivo de conversaciones",
            newConv: "＋ Nueva", saveConv: "⇩ Guardar", export: "⇪ Exportar",
            ready: "Listo", welcome: "¡Hola! Configura y empieza a chatear.",
            inputPlaceholder: "Escribe un mensaje... Enter para enviar",
            thinking: "Pensando...", error: "Error", offline: "Desconectado", emptyReply: "(vacío)", saved: "Guardado", parseFailed: "Fallo al parsear", requestFailed: "Fallo", networkError: "Error de red", noBaseUrl: "Rellena Base URL", fetchFailed: "Fallo al obtener", fetchOk: "Obtenidos {n} modelos", loadFailed: "Fallo al cargar", noMessages: "Aún no hay conversación.", deleteConfirm: "¿Borrar esta conversación?", emptyArchive: "Sin archivo aún", unnamed: "(Sin título)", promptTitle: "Nombra esta conversación (vacío = primera frase):", loaded: "Cargado: ", newConvStarted: "Nueva conversación.", yes: "Sí", no: "No", irrelevant: "Irrelevante", historyRounds: "Rondas recordadas (últimas N, 0=ninguna)", stop: "Detener", streaming: "Generando...",
            updateTitle: "¡Nueva versión! 🎉", updateNow: "Actualizar ahora", updateLater: "Más tarde", updateNever: "No volver a preguntar", updateAuto: "Auto-actualizar", updateChecking: "Buscando actualizaciones...", updateNone: "Estás al día", downloadAndApply: "Descargando...",
            systemPromptLabel: "System Prompt",
            systemPlaceholder: "Escribe el system prompt aquí (vacío = ninguno)",
            checkUpdate: "Buscar actualizaciones", checkNow: "Buscar ahora", about: "Acerca de", aboutDesc: "Cliente de chat local para LLM, con streaming, renderizado Markdown e historial.",
        },
        "fr": {
            settings: "Paramètres", language: "Langue", baseUrl: "URL de base API", baseUrlPlaceholder: "http://127.0.0.1:11434",
            apiKey: "Clé API", apiKeyPlaceholder: "Vide = non nécessaire", model: "Modèle", modelPlaceholder: "Ou tapez un modèle", fetch: "Obtenir", fetchFirst: "d'abord obtenir",
            saveConfig: "Enregistrer", archive: "Archive des conversations",
            newConv: "＋ Nouveau", saveConv: "⇩ Enregistrer", export: "⇪ Exporter",
            ready: "Prêt", welcome: "Bonjour ! Configurez et commencez à discuter.",
            inputPlaceholder: "Tapez un message... Entrée pour envoyer", thinking: "Réflexion...", error: "Erreur", offline: "Hors ligne", emptyReply: "(vide)", saved: "Enregistré", parseFailed: "Échec d'analyse", requestFailed: "Échec", networkError: "Erreur réseau", noBaseUrl: "Remplissez l'URL de base", fetchFailed: "Échec", fetchOk: "{n} modèles obtenus", loadFailed: "Échec de chargement", noMessages: "Aucune conversation à enregistrer.", deleteConfirm: "Supprimer cette conversation ?", emptyArchive: "Aucune archive", unnamed: "(Sans titre)", promptTitle: "Nommez cette conversation (vide = première phrase):", loaded: "Chargé: ", newConvStarted: "Nouvelle conversation.", yes: "Oui", no: "Non", irrelevant: "Non pertinent", historyRounds: "Tours mémorisés (N derniers, 0=aucun)", stop: "Arrêter", streaming: "Génération...",
            updateTitle: "Nouvelle version 🎉", updateNow: "Mettre à jour", updateLater: "Plus tard", updateNever: "Ne plus demander", updateAuto: "Mise à jour auto", updateChecking: "Vérification...", updateNone: "Vous êtes à jour", downloadAndApply: "Téléchargement...",
            systemPromptLabel: "System Prompt",
            systemPlaceholder: "Saisissez le system prompt ici (vide = aucun)",
            checkUpdate: "Rechercher des mises à jour", checkNow: "Vérifier", about: "À propos", aboutDesc: "Client de chat local pour LLM, avec streaming, rendu Markdown et historique.",
        },
    };

    var currentLang = safeStorage.get("omni_lang") || "zh-CN";

    function t(key, params) {
        var dict = I18N[currentLang] || I18N["zh-CN"];
        var s = (dict && dict[key] != null) ? dict[key] : (I18N["zh-CN"][key] != null ? I18N["zh-CN"][key] : key);
        if (params && typeof s === "string") {
            for (var k in params) s = s.split("{" + k + "}").join(params[k]);
        }
        return s;
    }

    function applyI18n() {
        document.documentElement.lang = currentLang;
        var nodes = document.querySelectorAll("[data-i18n]");
        for (var i = 0; i < nodes.length; i++) {
            var key = nodes[i].getAttribute("data-i18n");
            if (nodes[i].tagName === "INPUT" || nodes[i].tagName === "TEXTAREA") continue;
            nodes[i].textContent = t(key);
        }
        var ph = document.querySelectorAll("[data-i18n-placeholder]");
        for (var j = 0; j < ph.length; j++) {
            ph[j].placeholder = t(ph[j].getAttribute("data-i18n-placeholder"));
        }
    }

    // ===== Markdown 渲染（marked + DOMPurify + highlight.js）=====
    function markdown(text) {
        if (window.marked && typeof window.marked.parse === "function") {
            try {
                var rawHtml = window.marked.parse(String(text));
                var cleanHtml = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml) : rawHtml;
                return '<div class="markdown-body">' + cleanHtml + '</div>';
            } catch (e) {}
        }
        var esc = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        esc = esc.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>');
        esc = esc.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        esc = esc.replace(/\n/g, "<br>");
        return esc;
    }

    // ===== 元素 =====
    var messagesEl = document.getElementById("messages");
    var form = document.getElementById("composer");
    var input = document.getElementById("input");
    var sendBtn = document.getElementById("send");
    var stopBtn = document.getElementById("stop");
    var statusEl = document.getElementById("status");
    var headerModel = document.getElementById("headerModel");
    var headerVer = document.getElementById("headerVer");
    var baseUrlEl = document.getElementById("baseUrl");
    var apiKeyEl = document.getElementById("apiKey");
    var modelEl = document.getElementById("model");
    var modelSelect = document.getElementById("modelSelect");
    var fetchModelsBtn = document.getElementById("fetchModels");
    var sysEl = document.getElementById("systemPrompt");
    var saveBtn = document.getElementById("saveBtn");
    var saveStatus = document.getElementById("saveStatus");
    var menuBtn = document.getElementById("menuBtn");
    var sidebar = document.getElementById("sidebar");
    var sidebarToggle = document.getElementById("sidebarToggle");
    var langSelect = document.getElementById("langSelect");
    var roundsEl = document.getElementById("historyRounds");

    // ===== 当前会话 =====
    var currentMessages = [];
    var currentConvId = null;
    var streaming = false;
    var abortCtrl = null;
    var botBubble = null;
    var botRaw = "";

    // ===== 配置持久化 =====
    function loadConfig() {
        baseUrlEl.value = safeStorage.get("omni_base_url") || "";
        apiKeyEl.value = safeStorage.get("omni_api_key") || "";
        modelEl.value = safeStorage.get("omni_model") || "";
        sysEl.value = safeStorage.get("omni_system") || "";
        if (roundsEl) roundsEl.value = safeStorage.get("omni_rounds") || "10";
        var savedModel = safeStorage.get("omni_model_select") || "";
        if (savedModel) {
            var opt = document.createElement("option");
            opt.value = opt.textContent = savedModel;
            modelSelect.appendChild(opt);
            modelSelect.value = savedModel;
        }
        if (langSelect) langSelect.value = currentLang;
        ajax("GET", "/api/config", null, function (ok, res) {
            if (ok && res && res.config) {
                if (!baseUrlEl.value) baseUrlEl.value = res.config.base_url || "";
                if (!modelEl.value) modelEl.value = res.config.model || "";
                if (roundsEl && !roundsEl.value) roundsEl.value = res.config.history_rounds || 10;
            }
        });
        ajax("GET", "/api/version", null, function (ok, res) {
            if (ok && res && headerVer) headerVer.textContent = " · " + (res.version || "");
        });
    }
    function saveConfig() {
        safeStorage.set("omni_base_url", baseUrlEl.value.trim());
        safeStorage.set("omni_api_key", apiKeyEl.value.trim());
        safeStorage.set("omni_model", modelEl.value.trim());
        safeStorage.set("omni_system", sysEl.value.trim());
        if (roundsEl) safeStorage.set("omni_rounds", roundsEl.value.trim());
        ajax("POST", "/api/config", {
            base_url: baseUrlEl.value.trim(), api_key: apiKeyEl.value.trim(),
            model: modelEl.value.trim(), system_prompt: sysEl.value.trim(),
            lang: currentLang, history_rounds: parseInt((roundsEl && roundsEl.value) || "10", 10) || 0,
        }, function () { flashStatus(t("saved")); });
    }
    function flashStatus(text) {
        if (!saveStatus) return;
        saveStatus.textContent = text;
        setTimeout(function () { if (saveStatus.textContent === text) saveStatus.textContent = ""; }, 1500);
    }


    // ===== 渲染消息列表 =====
    function renderMessages() {
        messagesEl.innerHTML = "";
        currentMessages.forEach(function (m) { addMsg(m.content, m.role === "user" ? "user" : "bot", true); });
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function addMsg(text, type, silent) {
        var wrap = document.createElement("div");
        wrap.className = "message message--" + (type || "bot");
        var b = document.createElement("div");
        b.className = "message__bubble";
        if (type === "bot") b.innerHTML = markdown(text); else b.textContent = text;
        wrap.appendChild(b);
        messagesEl.appendChild(wrap);
        if (!silent) messagesEl.scrollTop = messagesEl.scrollHeight;
        return b;
    }
    function pushMessage(role, content) { currentMessages.push({ role: role, content: content }); }
    function setStatus(text) { if (statusEl) statusEl.textContent = text; }

    // ===== 发送消息 =====
    function sendMessage() {
        var text = input.value.trim();
        if (!text || streaming) return;

        abortCurrentStream();

        pushMessage("user", text);
        renderMessages();
        input.value = "";
        autoGrow();
        startStream(text);
    }

    // ===== 流式核心：增量 buffer + marked + DOMPurify + hljs =====
    function startStream(userText) {
        streaming = true;
        setUIStreaming(true);
        setStatus(t("streaming"));

        var wrap = document.createElement("div");
        wrap.className = "message message--bot";
        botBubble = document.createElement("div");
        botBubble.className = "message__bubble";
        botBubble.innerHTML = '<div class="markdown-body"></div>';
        wrap.appendChild(botBubble);
        messagesEl.appendChild(wrap);
        botRaw = "";

        var renderTimer = null;
        abortCtrl = new AbortController();

        fetch('/api/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: userText }),
            signal: abortCtrl.signal
        })
        .then(function(res) {
            var reader = res.body.getReader();
            var decoder = new TextDecoder();

            function pump() {
                return reader.read().then(function(result) {
                    if (result.done) {
                        renderBuffer(true);
                        streaming = false;
                        setUIStreaming(false);
                        setStatus(t("ready"));
                        abortCtrl = null;
                        // 存档
                        if (botRaw) {
                            pushMessage("assistant", botRaw);
                            autoSave();
                        }
                        return;
                    }
                    var chunk = decoder.decode(result.value, { stream: true });
                    var lines = chunk.split('\n');
                    lines.forEach(function(line) {
                        if (line.startsWith('data: ')) {
                            try {
                                var data = JSON.parse(line.slice(6));
                                if (data.content) {
                                    botRaw += data.content;
                                    scheduleRender();
                                }
                            } catch(e) {}
                        }
                    });
                    return pump();
                });
            }
            return pump();
        })
        .catch(function(err) {
            if (err.name !== 'AbortError') {
                botBubble.innerHTML = '<span class="msg-error">' + t("error") + ' ' + escapeHtml(err.message) + '</span>';
            }
            streaming = false;
            setUIStreaming(false);
            setStatus(t("ready"));
            abortCtrl = null;
        });

        function scheduleRender() {
            if (renderTimer) return;
            renderTimer = setTimeout(function() {
                renderTimer = null;
                renderBuffer(false);
            }, 16);
        }

        function renderBuffer(isFinal) {
            if (!botRaw) return;
            var rawHtml = marked.parse(botRaw);
            var cleanHtml = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml) : rawHtml;
            botBubble.innerHTML = '<div class="markdown-body">' + cleanHtml + '</div>';

            if (typeof hljs !== 'undefined') {
                botBubble.querySelectorAll('pre code').forEach(function(block) {
                    hljs.highlightElement(block);
                });
            }

            if (!isFinal) messagesEl.scrollTop = messagesEl.scrollHeight;
        }
    }

    function abortCurrentStream() {
        if (abortCtrl) {
            try { abortCtrl.abort(); } catch (e) {}
            abortCtrl = null;
        }
    }

    function setUIStreaming(on) {
        streaming = on;
        if (stopBtn) stopBtn.hidden = !on;
        if (sendBtn) sendBtn.disabled = on;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
    }

    // ===== 停止生成 =====
    if (stopBtn) {
        stopBtn.onclick = function () {
            abortCurrentStream();
            if (botRaw && botBubble) {
                pushMessage("assistant", botRaw);
                autoSave();
            }
            streaming = false;
            setUIStreaming(false);
            setStatus(t("ready"));
        };
    }

    // ===== 自动保存 / 存档 =====
    function autoSave() {
        if (!currentConvId || currentMessages.length === 0) return;
        saveConversation(currentConvId, null);
    }
    function saveConversation(id, title) {
        ajax("POST", "/api/conversations", { id: id, title: title || undefined, messages: currentMessages }, function (ok, res) {
            if (ok && res && res.id) currentConvId = res.id;
        });
    }
    function refreshConvList() {
        ajax("GET", "/api/conversations", null, function (ok, res) {
            if (!ok || !res) return;
            var list = (res.conversations || []).map(function (c) {
                return '<div class="conv-item" data-id="' + c.id + '"><span class="conv-item__title">' + escapeHtml(c.title || t("unnamed")) +
                    '</span><span class="conv-item__meta">' + escapeHtml(c.updated_at || "") + '</span></div>';
            }).join("");
            var el = document.getElementById("convList");
            if (el) el.innerHTML = list || '<div class="conv-empty">' + t("emptyArchive") + "</div>";
            var items = document.querySelectorAll(".conv-item");
            for (var i = 0; i < items.length; i++) {
                items[i].onclick = function () { loadConversation(this.getAttribute("data-id")); };
            }
        });
    }
    function loadConversation(id) {
        ajax("GET", "/api/conversations/" + encodeURIComponent(id), null, function (ok, r) {
            if (!ok) { alert(t("loadFailed")); return; }
            currentConvId = r.id;
            currentMessages = (r.messages || []).map(function (m) { return { role: m.role, content: m.content }; });
            renderMessages();
            refreshConvList();
            setStatus(t("loaded") + (r.title || ""));
        });
    }
    function newConversation() {
        abortCurrentStream();
        currentConvId = null;
        currentMessages = [];
        renderMessages();
        refreshConvList();
        setStatus(t("ready"));
    }

    if (document.getElementById("newConvBtn")) document.getElementById("newConvBtn").onclick = newConversation;
    if (document.getElementById("saveConvBtn")) {
        document.getElementById("saveConvBtn").onclick = function () {
            if (currentMessages.length === 0) { alert(t("noMessages")); return; }
            var title = prompt(t("promptTitle"), "") || "";
            if (!currentConvId) currentConvId = generateId();
            saveConversation(currentConvId, title.trim());
            refreshConvList();
            flashStatus(t("saved"));
        };
    }
    if (document.getElementById("exportBtn")) {
        document.getElementById("exportBtn").onclick = function () {
            ajax("POST", "/api/export", {}, function (ok, res) {
                if (!ok) return;
                var blob = new Blob([JSON.stringify(res, null, 2)], { type: "application/json" });
                var a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "omni-chat-backup-" + new Date().toISOString().slice(0, 10) + ".json";
                a.click();
                URL.revokeObjectURL(a.href);
                flashStatus(t("saved"));
            });
        };
    }
    function generateId() { return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); }

    // ===== 模型列表 =====
    if (fetchModelsBtn) {
        fetchModelsBtn.onclick = function () {
            var url = baseUrlEl.value.trim().replace(/\/$/, "");
            var key = apiKeyEl.value.trim();
            if (!url) { alert(t("noBaseUrl")); return; }
            fetchModelsBtn.disabled = true;
            fetchModelsBtn.textContent = "...";
            ajax("POST", "/api/models", { base_url: url, api_key: key }, function (ok, res) {
                fetchModelsBtn.disabled = false;
                fetchModelsBtn.textContent = t("fetch");
                modelSelect.innerHTML = "";
                if (ok && res && res.ok && res.models && res.models.length > 0) {
                    res.models.forEach(function (m) {
                        var o = document.createElement("option");
                        o.value = o.textContent = m;
                        modelSelect.appendChild(o);
                    });
                    if (modelEl.value) modelSelect.value = modelEl.value;
                    flashStatus(t("fetchOk", { n: res.models.length }));
                } else {
                    var o = document.createElement("option");
                    o.textContent = (res && res.msg) || "—";
                    modelSelect.appendChild(o);
                }
            });
        };
    }
    if (modelSelect) {
        modelSelect.onchange = function () {
            if (modelSelect.value) {
                modelEl.value = modelSelect.value;
                safeStorage.set("omni_model_select", modelSelect.value);
            }
        };
    }

    // ===== 语言切换 =====
    if (langSelect) {
        langSelect.onchange = function () {
            currentLang = langSelect.value;
            safeStorage.set("omni_lang", currentLang);
            applyI18n();
        };
    }

    // ===== 侧边栏开关 =====
    if (menuBtn) menuBtn.onclick = function () { sidebar.classList.remove("sidebar-collapsed"); };
    if (sidebarToggle) sidebarToggle.onclick = function () { sidebar.classList.add("sidebar-collapsed"); };

    // ===== 输入框自动增高 =====
    function autoGrow() {
        if (!input) return;
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 160) + "px";
    }
    if (input) input.addEventListener("input", autoGrow);

    // ===== 提交 =====
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); sendMessage(); });
    if (input) input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // ===== ajax =====
    function ajax(method, url, body, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var ok = xhr.status >= 200 && xhr.status < 300;
                var res = null;
                try { res = xhr.responseText ? JSON.parse(xhr.responseText) : null; } catch (e) {}
                if (cb) cb(ok, res, xhr.status);
            }
        };
        xhr.onerror = function () { if (cb) cb(false, null, 0); };
        xhr.send(body ? JSON.stringify(body) : null);
    }

    // ============================================================
    //  自动升级模块
    // ============================================================
    function initUpdater() {
        var modal = document.getElementById("updateModal");
        if (!modal) return;
        setTimeout(function () { checkUpdate(); }, 1500);

        var updateNow = document.getElementById("updateNow");
        var updateLater = document.getElementById("updateLater");
        var updateNever = document.getElementById("updateNever");
        var updateAuto = document.getElementById("updateAuto");

        if (updateNow) updateNow.onclick = function () { doUpgrade(); };
        if (updateLater) updateLater.onclick = function () { closeModal(); };
        if (updateNever) updateNever.onclick = function () {
            ajax("POST", "/api/update/policy", { policy: "never" }, function () {});
            closeModal();
        };
        if (updateAuto) updateAuto.onclick = function () {
            ajax("POST", "/api/update/policy", { policy: "auto" }, function () {});
            closeModal();
            doUpgrade();
        };
    }
    function checkUpdate() {
        ajax("GET", "/api/check-update", null, function (ok, res) {
            if (ok && res && res.has_update && res.latest) { window.__latestUpdate = res.latest; showUpdateModal(res.latest); }
        });
    }
    function showUpdateModal(latest) {
        var body = document.getElementById("updateBody");
        var notes = (latest.body || "").replace(/\n/g, "<br>").substring(0, 600);
        body.innerHTML = t("updateBody", { ver: escapeHtml(latest.version || latest.name || ""), notes: notes || t("updateNone") });
        document.getElementById("updateModal").hidden = false;
    }
    function closeModal() { document.getElementById("updateModal").hidden = true; }
    function doUpgrade() {
        closeModal();
        setStatus(t("downloadAndApply"));
        ajax("POST", "/api/update/download", { latest: window.__latestUpdate }, function (ok, res) {
            if (!ok || !res || !res.ok) { setStatus(t("error")); return; }
            ajax("POST", "/api/update/apply", { path: res.path }, function (ok2, res2) {
                if (ok2 && res2 && res2.ok) { alert(t("restartRequired")); setStatus(t("ready")); }
                else setStatus(t("error"));
            });
        });
    }

    // ============================================================
    //  设置页面（右上角齿轮 Modal）
    // ============================================================
    var settingsModal = document.getElementById("settingsModal");
    var gearBtn = document.getElementById("gearBtn");
    var settingsClose = document.getElementById("settingsClose");
    var settingsScrim = document.getElementById("settingsScrim");
    var checkUpdateBtn = document.getElementById("checkUpdateBtn");
    var updateCheckStatus = document.getElementById("updateCheckStatus");
    var aboutVer = document.getElementById("aboutVer");

    function openSettings() {
        if (settingsModal) settingsModal.hidden = false;
        refreshConvList();
    }
    function closeSettings() { if (settingsModal) settingsModal.hidden = true; }

    if (gearBtn) gearBtn.onclick = openSettings;
    if (settingsClose) settingsClose.onclick = closeSettings;
    if (settingsScrim) settingsScrim.onclick = closeSettings;
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && settingsModal && !settingsModal.hidden) closeSettings();
    });

    if (checkUpdateBtn) {
        checkUpdateBtn.onclick = function () {
            if (updateCheckStatus) updateCheckStatus.textContent = "...";
            ajax("GET", "/api/check-update", null, function (ok, res) {
                if (!ok) { if (updateCheckStatus) updateCheckStatus.textContent = t("loadFailed"); return; }
                if (res && res.has_update && res.latest) {
                    window.__latestUpdate = res.latest;
                    showUpdateModal(res.latest);
                    if (updateCheckStatus) updateCheckStatus.textContent = "";
                } else {
                    if (updateCheckStatus) updateCheckStatus.textContent = t("updateNone");
                }
            });
        };
    }

    ajax("GET", "/api/version", null, function (ok, res) {
        if (ok && res && aboutVer) aboutVer.textContent = res.version || "";
    });

    // ===== 初始化 =====
    loadConfig();
    applyI18n();
    if (saveBtn) saveBtn.onclick = saveConfig;
    refreshConvList();
    if (currentMessages.length === 0) setStatus(t("ready"));
    initUpdater();
})();