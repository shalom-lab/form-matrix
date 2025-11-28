import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoName = 'form-matrix' 

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? `/${repoName}/` : '/',
  plugins: [vue()],
})
