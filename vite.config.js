import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { gitChangelogPlugin } from './plugins/vite-plugin-git-changelog.js'

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'),
)

export default defineConfig({
  plugins: [vue(), gitChangelogPlugin(20)],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['exceljs'],
  },
  server: {
    host: '0.0.0.0',
    // PRD: vue3-js uses 5174; API proxies to xn-admin-cloud gateway
    port: 1801,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/swagger-ui': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/v3/api-docs': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8088',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
})
