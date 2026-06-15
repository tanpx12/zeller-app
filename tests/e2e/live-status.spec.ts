import { expect, test } from '@playwright/test'
import { freshLiveStatus, mockApi, staleLiveStatus } from './mock-api'

/**
 * End-to-end guard for the runner-offline indicator — the exact bug this
 * was reported for: the TopBar showed "Live runner offline" for a healthy
 * hourly runner because it compared `age_seconds` to a hardcoded 120s.
 *
 * The indicator (`[data-slot="live-indicator"]`) carries `data-status`
 * (healthy | lagging | down | paused) and a label. We assert against a
 * mocked `/live/status` so the behaviour is deterministic.
 *
 * Asserted on `/reports` (TopBar is global) to avoid the live page's
 * WebSocket stream, which isn't mocked here and is irrelevant to the
 * HTTP-polled indicator.
 */

const INDICATOR = '[data-slot="live-indicator"]'

test('fresh-but-old snapshot reads HEALTHY, not offline (the fixed bug)', async ({ page }) => {
  // age_seconds=1500 — far past the old 120s rule — but is_stale=false.
  await mockApi(page, { liveStatus: freshLiveStatus() })
  await page.goto('/reports')

  const indicator = page.locator(INDICATOR)
  await expect(indicator).toHaveAttribute('data-status', 'healthy')
  await expect(indicator).not.toContainText('offline')
  await expect(indicator).toContainText('last bar')
})

test('stale snapshot (is_stale=true) reads OFFLINE', async ({ page }) => {
  await mockApi(page, { liveStatus: staleLiveStatus() })
  await page.goto('/reports')

  const indicator = page.locator(INDICATOR)
  await expect(indicator).toHaveAttribute('data-status', 'down')
  await expect(indicator).toContainText('Live runner offline')
})

test('lagging when older than half the ceiling but not yet stale', async ({ page }) => {
  // ceiling 7200 → half 3600; age 4000, not stale → lagging (warning), not down.
  await mockApi(page, {
    liveStatus: freshLiveStatus({ age_seconds: 4000, is_stale: false }),
  })
  await page.goto('/reports')

  await expect(page.locator(INDICATOR)).toHaveAttribute('data-status', 'lagging')
})
