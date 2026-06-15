import { expect, test } from '@playwright/test'
import { mockApi } from './mock-api'

/**
 * Boot smoke test: every top-level route renders its chrome (the global
 * TopBar) without crashing, against a fully-mocked API. This is the
 * "does the app come up" guard the CI job never actually had — the suite
 * was empty, so the E2E job only ever reported "No tests found".
 */

const ROUTES = ['/live', '/reports', '/models', '/compare', '/decisions'] as const

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

for (const route of ROUTES) {
  test(`renders TopBar on ${route}`, async ({ page }) => {
    await page.goto(route)
    // The TopBar lives in the root layout, so it must appear on every page.
    await expect(page.locator('[data-slot="top-bar"]')).toBeVisible()
    // And the primary nav links are present.
    await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible()
  })
}

test('home redirects/links into the app shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-slot="top-bar"]')).toBeVisible()
})
