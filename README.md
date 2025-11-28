# Form Matrix · 可视化表单生成器 🇨🇳

> 轻松拼搭表单规范，酷似“乐高 Dashboard”。  
> English guide ➜ [README.en.md](README.en.md)

## ✨ 项目速览

- ⚡️ **所见即所得**：使用 Vite + Vue 3 构建，极速响应，所有操作都有即时反馈。
- 📚 **模板仓库**：内置示例与空白模板，面板可随时折叠/展开，不占视野。
- 🧱 **字段工作台**：支持文本、选择、数组等多类型字段，包含排序、编辑、删除全流程。
- 🪟 **扁平双视图**：字段列表与 JSON 预览同列切换，所见即所得。
- 🚀 **一键导出**：复制到剪贴板、下载 JSON、自动部署 GitHub Pages，一条龙搞定。

## 🛠️ 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器 (http://localhost:5173/)
npm run build      # 生成生产包
```

## 🌐 部署指南

项目自带 `.github/workflows/deploy.yml`，开箱即用：

1. 将仓库 Pages Source 设为 “GitHub Actions”。
2. Push 到 `master` 或手动触发 workflow。
3. Workflow 会自动注入 `VITE_BASE_PATH=/仓库名/`，构建后借助 `actions/deploy-pages@v4` 发布。

🎉 完成后即可通过 `https://你的账户.github.io/仓库名/` 访问在线版本。

## 📁 目录速查

- `src/App.vue`：仪表盘主界面与逻辑。
- `src/style.css`：全局样式、布局与紧凑化控制。
- `public/temp/*.json`：示例模板文件。
- `.github/workflows/deploy.yml`：GitHub Pages 部署脚本。

## 🤝 一起协作

欢迎提 Issue 或 PR，一起把 Form Matrix 打造成更顺手的表单规范工坊！
