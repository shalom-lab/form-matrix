import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoName = 'form-matrix'

export default defineConfig(({ mode }) => {
  const baseFromEnv = process.env.VITE_BASE_PATH || process.env.BASE_PATH
  const base = baseFromEnv ?? (mode === 'production' ? `/${repoName}/` : '/')
  return {
    base,
    plugins: [vue()],
  }
})
