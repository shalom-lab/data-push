# GitHub Data Push

<div align="center">

<img src="logo.svg" alt="GitHub Data Push logo" width="128" />

**用自己的模板，把结构化数据推进任意仓库。**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-238636?logo=github)](https://shalom-lab.github.io/data-push/)
[![BYOK](https://img.shields.io/badge/BYOK-local%20token-58a6ff)](https://shalom-lab.github.io/data-push/settings.html)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](#-english) · [在线使用](https://shalom-lab.github.io/data-push/)

</div>

## ✨ 功能特性

### 📝 模板推送
- **自定义模板**：文本、多行、链接、下拉、日期、数字、复选、单选、标签
- **追加写入**：把一条记录 append 到仓库里的 JSON 数组，自动处理 SHA 与 UTF-8
- **仓库搜索 / 分支**：按 `owner/repo` 筛选，可指定分支和提交说明

### 🔑 BYOK
- **Token 只在本机**：存在浏览器 `localStorage`，请求直达 `api.github.com`
- **保存即验证**：调用 `/user` 确认身份，导航栏显示账号
- **Fine-grained / Classic**：Classic 勾选 `repo`；细粒度 PAT 授予 Contents 读写

### 🧰 比扩展更完整
- **仓库同步模板**：指定仓库与路径（默认 `data-push/templates.json`），本机只缓存，换设备可再拉
- **可视化模板编辑**：卡片改字段，也可继续用 JSON 导入导出（兼容原扩展格式）
- **提交预览**：提交前看到将追加的对象
- **本地历史**：回填表单、跳转 GitHub 文件、清空记录
- **7 种语言 + 深浅色**

## 🚀 快速开始

1. 打开 [在线站点](https://shalom-lab.github.io/data-push/)（或克隆后直接用静态服务器打开根目录）
2. 在设置中粘贴 GitHub Token 并验证
3. 按场景编辑或导入模板
4. 在推送页选择仓库与分支，填写后提交

本地预览：

```bash
npx --yes serve .
```

## 📖 使用指南

### Token
1. 打开 [GitHub Tokens](https://github.com/settings/tokens)
2. Classic PAT 选择 `repo`；Fine-grained PAT 对目标仓库授予 **Contents: Read and write**
3. 粘贴到设置页，点「保存并验证」

### 模板格式

```json
{
  "my-project": {
    "name": "我的项目",
    "filename": "data-raw/projects.json",
    "fieldOrder": ["title", "tags"],
    "fields": {
      "title": { "type": "text", "label": "名称", "required": true },
      "tags": { "type": "array", "label": "标签", "default": [] }
    }
  }
}
```

字段类型：`text` · `textarea` · `url` · `select` · `date` · `number` · `checkbox` · `radio` · `array`

## 🛠️ 发布

推送到 `main` 后，[GitHub Actions](.github/workflows/pages.yml) 会把根目录静态文件部署为 GitHub Pages。

仓库设置里 **Pages → Source** 选 **GitHub Actions**（第一次即可）。

## 🔧 技术栈

- 原生 HTML / CSS / JS（无构建、无后端）
- GitHub REST API（浏览器 CORS）
- GitHub Actions → GitHub Pages

## 📄 License

MIT · 见 [LICENSE](LICENSE)

原浏览器扩展源码保留在 `push-data-main/`。

## English

A BYOK static site that appends structured JSON to any GitHub repo using custom templates. Token stays in your browser; CI deploys Pages on every push to `main`.

---

<div align="center">

**如果这个项目对您有帮助，请给个 ⭐ Star！**

Made with ❤️ by [shalom-lab](https://github.com/shalom-lab)

</div>
