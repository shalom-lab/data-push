# GitHub Data Push

<div align="center">

<img src="icons/icon128.png" alt="GitHub Data Push logo" width="128" />

**用自己的模板，把结构化数据推进任意仓库。**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-238636?logo=github)](https://shalom-lab.github.io/data-push/)
[![BYOK](https://img.shields.io/badge/BYOK-local%20token-58a6ff)](https://shalom-lab.github.io/data-push/settings.html)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](#-english) · [在线使用](https://shalom-lab.github.io/data-push/) · [仓库](https://github.com/shalom-lab/data-push)

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

### 支持的字段类型

| 类型 | 界面 | 必填怎么算 | 额外属性 |
|------|------|------------|----------|
| `text` | 单行文本 | `required: true` 时不能为空 | `default` · `placeholder` |
| `textarea` | 多行文本 | 同上 | `default` · `placeholder` |
| `url` | 链接输入 | 同上 | `default` · `placeholder` |
| `number` | 数字 | 同上；空则用 `default` 或空字符串 | `default` |
| `date` | 日期选择 | 同上 | `default` |
| `select` | 下拉 | 同上 | **必须** `options: []`，可选 `default` |
| `radio` | 单选组 | 同上 | **必须** `options: []`，可选 `default` |
| `checkbox` | 复选 | 不按空校验，只提交 true/false | `default`（布尔） |
| `array` | 标签（回车或空格添加） | `required: true` 时至少 1 个标签 | `default: []` · `placeholder` |

### 必填规则

- 只有写了 `"required": true` 才会拦截提交；未写或 `false` 都可空
- 必填的 `array` 不能是 `[]`
- 必填的文本 / 链接 / 下拉 / 单选 / 日期 / 数字不能是空字符串
- 提交时会自动追加 `timestamp`（ISO 时间），不需要在模板里声明
- 模板必须有 `name`、`filename`、`fieldOrder`、`fields`；`fieldOrder` 与 `fields` 的键要一一对应

## 🛠️ 发布

推送到 `main` 后，[GitHub Actions](.github/workflows/pages.yml) 会把根目录静态文件部署为 GitHub Pages。

仓库设置里 **Pages → Source** 选 **GitHub Actions**（第一次即可）。

## 🔧 技术栈

- 原生 HTML / CSS / JS（无构建、无后端）
- GitHub REST API（浏览器 CORS）
- GitHub Actions → GitHub Pages

## 📄 License

MIT · 见 [LICENSE](LICENSE)

## English

A BYOK static site that appends structured JSON to any GitHub repo using custom templates. Token stays in your browser; CI deploys Pages on every push to `main`. Repo: [shalom-lab/data-push](https://github.com/shalom-lab/data-push).

Field types: `text` · `textarea` · `url` · `number` · `date` · `select` · `radio` · `checkbox` · `array`. Only `"required": true` blocks submit (`array` needs at least one tag). `select` / `radio` need `options`. Each submit adds `timestamp`.

---

<div align="center">

**如果这个项目对您有帮助，请给个 ⭐ Star！**

Made with ❤️ by [shalom-lab](https://github.com/shalom-lab)

</div>
