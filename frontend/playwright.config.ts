import { defineConfig, devices } from '@playwright/test'

// 5173 is often an SSH tunnel to a stale Compose frontend; use a dedicated port.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 5174)
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  outputDir: 'test-results',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ru-RU',
  },
  projects: [
    {
      name: 'mobile-375',
      use: {
        ...devices['iPhone 12'],
        browserName: 'chromium',
        defaultBrowserType: 'chromium',
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet-768',
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'desktop-1280',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    // Prefer a fresh Vite from this branch; stale servers break selectors.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
