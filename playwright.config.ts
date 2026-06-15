import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  // Serialized: the suite runs against a single `next dev` server, and
  // concurrent first-hits to uncompiled routes make the dev server return
  // 500s (on-demand compilation races). One worker keeps it deterministic;
  // the suite is small and network-mocked, so it's still fast.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Start the app in BOTH local and CI. The suite is hermetic — every
  // `/api/v1/**` request is mocked at the network layer (see
  // tests/e2e/mock-api.ts) — so no backend / paper_trade runner is
  // needed. (The previous config left `webServer: undefined` in CI, so
  // the dev server never started and the job could only ever fail.)
  // When PLAYWRIGHT_BASE_URL is set, assume an externally-managed server
  // and don't start our own.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
