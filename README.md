# Form Matrix · 可视化表单生成器

English version follows Chinese section.

## 简介

Form Matrix 是一个使用 **Vite + Vue 3** 开发的「所见即所得」表单规范构建器，可通过点击、输入快速生成配置，并提供模板管理、字段构建、JSON 预览与 GitHub Pages 自动部署。

## 功能特点

- **模板仓库**：内置示例/空白模板，可折叠隐藏并一键切换。
- **字段构建面板**：支持文本、选择、日期、数组等类型的新增、编辑、排序、删除。
- **字段列表 / JSON 预览**：Tab 共享同一面板，实时查看结构或原始 JSON。
- **快速导出**：支持复制到剪贴板或下载 JSON 文件。
- **自动部署**：提供 GitHub Actions 工作流，构建后推送至 GitHub Pages。

## 开发与构建

```bash
npm install
npm run dev
npm run build
```

开发服务器默认运行在 `http://localhost:5173/`。

## GitHub Pages 部署

项目提供 `.github/workflows/deploy.yml`：
- Push 到 `master` 或手动触发 workflow。
- 使用 `VITE_BASE_PATH=/仓库名/` 构建，确保静态资源路径正确。
- `actions/deploy-pages@v4` 自动发布到 GitHub Pages。
请在仓库 Settings → Pages 选择 “GitHub Actions” 作为 Source。

---

# Form Matrix · Visual Form Builder

## Overview

Form Matrix is a **Vite + Vue 3** powered visual builder that helps you design `field_types` specifications through a clean dashboard. It includes template browsing, field editing, JSON preview, and GitHub Pages automation.

## Highlights

- **Template library** with collapsible sidebar and sample/blank presets.
- **Field builder** for creating text, select, date, array, checkbox, etc., including ordering and validation.
- **Field list & JSON preview** share one panel via tabs for instant feedback.
- **Export helpers** to copy or download the generated JSON.
- **CI-ready deployment** via the included GitHub Actions workflow.

## Development

```bash
npm install
npm run dev
npm run build
```

Visit `http://localhost:5173/` during development.

## Deployment

- Configure GitHub Pages to use “GitHub Actions”.
- The provided workflow builds with `VITE_BASE_PATH=/your-repo/` and deploys using `actions/deploy-pages@v4`.
- Push to `master` or trigger manually to publish updates.
