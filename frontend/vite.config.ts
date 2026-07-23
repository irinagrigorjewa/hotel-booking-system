import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(rootDir, 'src/shared'),
      '@entities': path.resolve(rootDir, 'src/entities'),
      '@features': path.resolve(rootDir, 'src/features'),
      '@widgets': path.resolve(rootDir, 'src/widgets'),
      '@pages': path.resolve(rootDir, 'src/pages'),
      '@app': path.resolve(rootDir, 'src/app'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/shared/test/setup.ts',
    globals: true,
    exclude: [
      ...configDefaults.exclude,
      '**/e2e/**',
      '**/playwright/**',
      '**/tests-examples/**',
      '**/playwright.config.*',
    ],
  },
})
