import { expect, type Page } from '@playwright/test'

export const assertNoDocumentOverflowX = async (page: Page): Promise<void> => {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement
    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
    }
  })

  expect(
    overflow.scrollWidth,
    `documentElement overflow-x: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1)
}

/**
 * Nav is available when the AppBar/Auth header chrome exposes reachable
 * destinations (hotels/map/auth links or AuthLayout brand).
 */
export const assertNavAvailable = async (page: Page): Promise<void> => {
  const navigation = page.getByRole('navigation')
  if (await navigation.count()) {
    await expect(navigation.first()).toBeVisible()
    await expect(
      navigation.getByRole('link', { name: /Отели|Hotels|Карта|Map|Вход|Sign in/i }).first(),
    ).toBeVisible()
    return
  }

  // AuthLayout: brand + language switcher, no navigation landmark
  await expect(page.getByRole('link', { name: /Hotel Booking System/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'EN', exact: true })).toBeVisible()
}

/**
 * AppHeader brand wordmark must stay readable at narrow viewports (375px):
 * visible text and a positive layout width (not flex-collapsed to 0).
 */
export const assertHeaderBrandVisible = async (page: Page): Promise<void> => {
  const brand = page.getByRole('banner').getByRole('link', { name: /Hotel Booking System/i })
  await expect(brand).toBeVisible()

  const box = await brand.boundingBox()
  expect(box, 'header brand boundingBox').not.toBeNull()
  expect(box!.width, 'header brand width must be > 0').toBeGreaterThan(0)
}

export const assertHomeHeroFullBleed = async (page: Page): Promise<void> => {
  const hero = page.locator('section[aria-label]').first()
  await expect(hero).toBeVisible()

  const metrics = await hero.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return {
      left: rect.left,
      width: rect.width,
      viewportWidth: window.innerWidth,
    }
  })

  expect(Math.abs(metrics.left), 'hero should start at viewport left edge').toBeLessThanOrEqual(1)
  expect(
    Math.abs(metrics.width - metrics.viewportWidth),
    'hero should span full viewport width (full-bleed)',
  ).toBeLessThanOrEqual(2)
}
