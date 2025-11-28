# Form Matrix · Visual Form Builder 🇺🇸

> Build production-ready form specs like stacking LEGO bricks.

## ✨ Highlights

- ⚡️ **Instant experience** powered by Vite + Vue 3, every click reflects immediately.
- 📚 **Template library** with collapsible sidebar, including sample & blank presets.
- 🧱 **Field workbench** covering text, select, radio, array, checkbox, etc., plus sorting/editing/deleting.
- 🪟 **Dual-view panel** where Field List & JSON Preview share the same tabbed column.
- 🚀 **Export & deploy** via copy / download buttons and the bundled GitHub Pages workflow.

## 🛠 Quick Start

```bash
npm install        # install deps
npm run dev        # dev server at http://localhost:5173/
npm run build      # production bundle
```

## 🌐 Deployment

The repo ships with `.github/workflows/deploy.yml`:

1. Set GitHub Pages Source to “GitHub Actions”.
2. Push to `master` or trigger the workflow manually.
3. The workflow builds with `VITE_BASE_PATH=/$REPO/` and publishes through `actions/deploy-pages@v4`.

You can then browse the app at `https://<user>.github.io/<repo>/`.

## 📁 File Map

- `src/App.vue` – dashboard UI & logic.
- `src/style.css` – global layout and compact design tokens.
- `public/temp/*.json` – built-in templates.
- `.github/workflows/deploy.yml` – CI/CD pipeline for GitHub Pages.

## 🤝 Contribute

Feel free to open issues or PRs to push Form Matrix forward!***

