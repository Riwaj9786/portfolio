import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { parseMarkdownContent } from './src/markdownContent.mjs'
import tailwindcss from '@tailwindcss/vite'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    {
      name: 'portfolio-markdown-content',
      resolveId(id) {
        if (id === 'virtual:portfolio-content') return '\0virtual:portfolio-content'
      },
      load(id) {
        if (id !== '\0virtual:portfolio-content') return
        const path = fileURLToPath(new URL('./FRONTEND_DATABASE.md', import.meta.url))
        this.addWatchFile(path)
        return `export default ${JSON.stringify(parseMarkdownContent(readFileSync(path, 'utf8')))}`
      },
    },
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  }
})
