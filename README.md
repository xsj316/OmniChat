# OmniChat 全能聊天

> 基于 Flask + SQLite + OpenAI 兼容接口的轻量级网页聊天应用，支持多模型、多会话、Markdown 渲染。

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](./LICENSE)
[![Python](https://img.shields.io/badge/python-3.8%2B-green)](https://www.python.org/)

---

## ✨ 功能特性

- 🤖 **多模型支持**：通过 OpenAI 兼容接口接入任意服务商（OpenAI / DeepSeek / 智谱 GLM / 通义千问 / 自建网关…）
- 💬 **多会话管理**：侧边栏创建、重命名、删除会话，SQLite 本地持久化
- 🎨 **Markdown 渲染**：代码高亮、表格、公式，前端 `marked` 解析
- 🔒 **本地优先**：数据存本地 SQLite，不上传第三方
- 🪶 **轻量零依赖负担**：纯 Flask 单文件应用，几行命令即可运行
- ⚡ **流式输出**：SSE 实时逐字返回，体验丝滑

## 📐 架构

```
┌─────────────┐      HTTP/SSE       ┌──────────────┐      OpenAI    ┌────────────┐
│  浏览器前端  │ ◄──────────────► │  Flask 后端   │ ────────────► │  模型服务   │
│ (HTML/JS)   │                    │ (app.py)     │  兼容接口      │ (任意兼容)  │
└─────────────┘                    └──────┬───────┘              └────────────┘
                                           │
                                           ▼
                                     ┌──────────┐
                                     │ SQLite   │
                                     │ (会话/消息)│
                                     └──────────┘
```

## 🚀 快速开始

### 环境要求
- Python 3.8+
- 一个 OpenAI 兼容的 API Key（任意服务商）

### 1. 克隆仓库

```bash
git clone https://github.com/xsj316/OmniChat.git
cd OmniChat
```

### 2. 创建虚拟环境

```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 配置环境变量

```bash
cp .env.example .env
# 然后编辑 .env，填入你的 API Key 与服务地址
```

### 5. 启动

```bash
python app.py
```

浏览器打开 `http://127.0.0.1:5000` 即可使用。

## ⚙️ 配置说明

复制 `.env.example` 为 `.env`，按需修改：

| 变量 | 说明 | 示例 |
|---|---|---|
| `OPENAI_API_KEY` | 服务商 API Key | `sk-xxx` |
| `OPENAI_BASE_URL` | 接口地址（兼容 OpenAI） | `https://api.deepseek.com/v1` |
| `MODEL_NAME` | 使用的模型名 | `deepseek-chat` |

### 常见服务商

| 服务商 | Base URL | 模型示例 |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-plus` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| 自建网关 | 你自己的地址 | 按网关文档 |

> 只要服务商提供 **OpenAI 兼容接口**，都可以接入，无需改代码。

## 📁 项目结构

```
OmniChat/
├── app.py              # 主应用（Flask 路由 + 接口转发）
├── requirements.txt    # Python 依赖
├── .env.example        # 环境变量模板
├── static/             # 前端资源（CSS/JS）
│   └── vendor/         # 第三方（marked 等，首次自动下载）
├── templates/          # Jinja2 模板（index.html）
└── instance/           # 运行时数据（SQLite，自动生成）
```

## 🤝 贡献

欢迎 Issue / PR！基于 GPL v3 协议，任何修改分发需保持同协议开源。

## 📜 License

**GNU General Public License v3** — 详见 [LICENSE](./LICENSE)。

> 任何人分发或修改本软件的衍生版本，必须以相同协议（GPL v3 或更高）开源其源码。

---

⭐ 觉得好用就点个 Star 吧 ～
