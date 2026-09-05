# OmniChat（全能聊天）

> 一个基于 Flask 的轻量级本地大模型聊天应用，支持 OpenAI 兼容接口，一键部署、多模型切换、流式输出。

---

## ✨ 功能特性

- 🚀 **轻量部署**：纯 Flask 后端 + 原生前端，无重型框架依赖，`pip install` 即可运行
- 🔌 **OpenAI 兼容**：支持任意 OpenAI API 格式的服务（OpenAI / DeepSeek / 智谱 GLM / 通义千问 等）
- 💬 **流式输出**：逐字打印回复，体验丝滑
- 🧠 **多模型切换**：运行时动态选择不同模型，无需重启
- 📜 **多轮对话**：自动维护上下文历史
- 🎨 **Markdown 渲染**：代码高亮、表格、公式全支持
- 💾 **会话持久化**：SQLite 本地存储，刷新不丢记录
- 📱 **响应式 UI**：PC / 手机 / 平板自适应

---

## 🏗️ 架构图

```
┌──────────────┐         ┌──────────────┐         ┌──────────────────┐
│   浏览器 UI   │ ◄─────► │  Flask 后端   │ ◄─────► │  OpenAI 兼容 API  │
│ (HTML/CSS/JS)│  HTTP  │  (app.py)    │  SDK    │  (任意服务商)      │
└──────────────┘         └──────┬───────┘         └──────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   SQLite     │
                        │  (会话存储)   │
                        └──────────────┘
```

---

## 🚀 快速开始

### 环境要求
- Python 3.8+
- 一个 OpenAI 兼容的 API Key（或自建网关地址）

### 1. 克隆仓库

```bash
git clone https://github.com/xsj316/OmniChat.git
cd OmniChat
```

### 2. 创建虚拟环境

```bash
# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 配置环境变量

复制配置模板：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
# OpenAI 兼容 API 配置
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4o-mini

# 服务端口（可选，默认 5000）
PORT=5000
```

### 5. 启动服务

```bash
python app.py
```

浏览器打开 `http://localhost:5000` 即可使用。

---

## ⚙️ 配置详解

所有配置通过 `.env` 文件或环境变量设置：

| 变量名 | 说明 | 默认值 |
|---|---|---|
| `OPENAI_API_KEY` | API 密钥 | 无（必填） |
| `OPENAI_BASE_URL` | API 网关地址 | `https://api.openai.com/v1` |
| `MODEL_NAME` | 默认模型名称 | `gpt-4o-mini` |
| `PORT` | 服务监听端口 | `5000` |

### 支持的服务商

只要兼容 OpenAI API 格式的服务都可以接入，例如：

| 服务商 | `OPENAI_BASE_URL` | 说明 |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | 官方 |
| DeepSeek | `https://api.deepseek.com/v1` | 国产，性价比高 |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | 国产 |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 阿里云 |
| 自建网关 | `http://localhost:11434/v1` | 本地自建 OpenAI 兼容层 |

> 💡 只需要把 `OPENAI_BASE_URL` 指向你的服务地址，`MODEL_NAME` 填对应模型名，即可无缝切换。

---

## 📁 项目结构

```
OmniChat/
├── app.py              # Flask 主应用入口
├── config.py           # 配置加载（环境变量）
├── requirements.txt    # Python 依赖
├── .env.example        # 配置模板
├── static/             # 前端静态资源
│   ├── css/
│   ├── js/
│   └── vendor/         # 第三方库（marked.js 等）
├── templates/          # Jinja2 HTML 模板
│   └── index.html
├── models/             # 数据模型 / 数据库操作
└── README.md
```

---

## 📝 使用说明

1. **发送消息**：在输入框输入内容，回车或点击发送
2. **切换模型**：右上角下拉菜单选择不同模型
3. **新建会话**：点击「+ 新对话」按钮
4. **历史记录**：左侧栏展示所有历史会话，点击切换
5. **代码复制**：代码块右上角点击复制按钮

---

## 🤝 贡献

欢迎 Issue / PR！

1. Fork 本仓库
2. 创建分支：`git checkout -b feature/xxx`
3. 提交改动：`git commit -m "feat: xxx"`
4. 推送分支：`git push origin feature/xxx`
5. 提交 Pull Request

---

## 📄 License

[MIT](./LICENSE)
