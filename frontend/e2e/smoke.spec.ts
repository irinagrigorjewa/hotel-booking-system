import { expect, test } from '@playwright/test'

import { installApiMocks } from './fixtures/mockApi'
import {
  assertHomeHeroFullBleed,
  assertNavAvailable,
  assertNoDocumentOverflowX,
} from './fixtures/viewportChecks'

test.describe('HBS UI smoke', () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page)
    await page.addInitScript(() => {
      window.localStorage.removeItem('i18n_lang')
      window.localStorage.removeItem('auth_tokens')
    })
  })

  test('home → city search → hotels list → hotel detail', async ({ page }, testInfo) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /Подберите проживание|Find your next stay/i }),
    ).toBeVisible()

    const cityField = page.getByRole('textbox', { name: /Город|City/i }).first()
    await cityField.fill('Moscow')
    await page.getByRole('button', { name: /Найти|Search/i }).first().click()

    await expect(page).toHaveURL(/\/hotels\?city=Moscow/)
    await expect(page.getByRole('heading', { name: 'Grand Hotel' }).first()).toBeVisible()
    await expect(page.getByText('Moscow').first()).toBeVisible()

    await page.getByRole('link', { name: /Grand Hotel/i }).first().click()
    await expect(page).toHaveURL(/\/hotels\/1/)
    await expect(page.getByRole('heading', { name: 'Grand Hotel' }).first()).toBeVisible()

    await page.screenshot({
      path: `test-results/smoke-flow-${testInfo.project.name}.png`,
      fullPage: true,
    })
  })

  test('nav clicks and i18n RU→EN visible text change', async ({ page }, testInfo) => {
    await page.goto('/')
    await assertNavAvailable(page)

    await page.getByRole('link', { name: /Отели|Hotels/i }).first().click()
    await expect(page).toHaveURL(/\/hotels/)

    await page.getByRole('link', { name: /Карта|Map/i }).first().click()
    await expect(page).toHaveURL(/\/hotels\/map/)

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Подберите проживание' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Отели' }).first()).toBeVisible()

    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Find your next stay' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Hotels' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Search/i }).first()).toBeVisible()

    await page.screenshot({
      path: `test-results/i18n-en-${testInfo.project.name}.png`,
      fullPage: true,
    })
  })

  test('login page reachable', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Вход|Sign in/i }).first().click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /Вход|Sign in/i })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()

    await page.screenshot({
      path: `test-results/login-${testInfo.project.name}.png`,
      fullPage: true,
    })
  })

  test('guest /bookings/new redirects to login', async ({ page }) => {
    await page.goto('/bookings/new?room_id=5')
    await expect(page).toHaveURL(/\/login\?returnUrl=/)
    expect(decodeURIComponent(page.url())).toContain('/bookings/new?room_id=5')
    await expect(page.getByRole('heading', { name: /Вход|Sign in/i })).toBeVisible()
  })

  test('viewport: no overflow-x, nav, home hero full-bleed', async ({ page }, testInfo) => {
    for (const path of ['/', '/hotels', '/login'] as const) {
      await page.goto(path)
      await assertNavAvailable(page)
      await assertNoDocumentOverflowX(page)

      if (path === '/') {
        await assertHomeHeroFullBleed(page)
      }

      const slug = path === '/' ? 'home' : path.slice(1)
      await page.screenshot({
        path: `test-results/viewport-${slug}-${testInfo.project.name}.png`,
        fullPage: true,
      })
    }
  })
})
