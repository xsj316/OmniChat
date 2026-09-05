# Vendor 目录

首次运行 `python app.py` 时，后端会自动下载以下文件到本目录（仅需联网一次）：

- `marked.min.js` — Markdown 解析（https://cdn.jsdelivr.net/npm/marked@12/）
- `highlight.min.js` — 代码高亮（https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/）
- `highlight.min.css` — 代码高亮样式
- `purify.min.js` — XSS 过滤（https://cdn.jsdelivr.net/npm/dompurify@3.1.6/）

下载完成后断网也能正常使用 Markdown 渲染。

> 如需完全离线分发，请手动将以上 4 个文件放入本目录后再打包。
