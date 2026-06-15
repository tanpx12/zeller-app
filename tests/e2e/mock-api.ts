import type { Page, Route } from '@playwright/test'

/**
 * Hermetic backend mock. Every `/api/v1/**` request the dashboard makes
 * is fulfilled from a fixture here, so the E2E suite needs no live Rust
 * backend or paper_trade runner — the dependency that made the original
 * "live backend" E2E job perpetually flaky.
 *
 * Per-test overrides let a spec pin a specific `/live/status` shape (e.g.
 * a stale snapshot) without rebuilding the whole map.
 */

/** A healthy `LiveStatusDto`: fresh, NOT stale. `age_seconds` is set well
 * past the old hardcoded 120s rule on purpose — the dashboard must read
 * this as healthy (the bug we fixed), driven by `is_stale`, not age. */
export function freshLiveStatus(over: Record<string, unknown> = {}) {
  return {
    timestamp: 1781496000000,
    equity: 10077.76,
    current_position: 10127.57,
    last_forecast: 0.00056,
    sigma_hat: null,
    n_fills: 0,
    written_at_ms: 1781499601193,
    age_seconds: 1500, // ~25 min: way past 120s, but a healthy hourly runner
    stale_threshold_secs: 7200,
    is_stale: false,
    recent_pnl: { pnl_1h_usd: 0, pnl_24h_usd: 0, pnl_7d_usd: 0, trades_24h: 0 },
    forecast_diagnostics: {
      forward_ic_7d: null,
      forward_ic_7d_ci: null,
      holdout_ic: null,
      ic_within_tolerance: null,
      hit_rate_7d: null,
    },
    ...over,
  }
}

/** A stale `LiveStatusDto`: age past the ceiling, `is_stale=true`. */
export function staleLiveStatus(over: Record<string, unknown> = {}) {
  return freshLiveStatus({ age_seconds: 9000, is_stale: true, ...over })
}

function emptyPage() {
  return { data: [], next_cursor: null, total_count_estimate: 0 }
}

export interface ApiOverrides {
  /** Body returned for `GET /api/v1/live/status` (and per-model status). */
  liveStatus?: Record<string, unknown>
}

/**
 * Install the mock on a page. Call before `page.goto(...)`.
 */
export async function mockApi(page: Page, over: ApiOverrides = {}): Promise<void> {
  // Regex, not a glob: API requests go to an absolute cross-origin URL
  // (`http://127.0.0.1:8787/api/v1/...`), and a `**/api/v1/**` glob does
  // not reliably match across the scheme/host. A regex on the path is
  // unambiguous.
  await page.route(/\/api\/v1\//, async (route: Route) => {
    const path = new URL(route.request().url()).pathname
    const json = (body: unknown) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        // The dashboard fetches the API cross-origin (page is
        // localhost:3000, API base is 127.0.0.1:8787). The browser applies
        // CORS even to an intercepted/fulfilled response, so without this
        // header the fetch is blocked and the client sees no data — which
        // would silently read as "runner down". The real backend sends
        // `Access-Control-Allow-Origin: *`; the mock must too.
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(body),
      })

    if (path.endsWith('/health')) {
      return json({ version: '0.0.0-test', uptime_secs: 1, started_at_ms: 0 })
    }
    if (path.endsWith('/live/models')) {
      return json({ models: ['euler', 'gauss', 'laplace'] })
    }
    // Default + per-model live status (…/live/status, …/live/{model}/status).
    if (path.includes('/live/') && path.endsWith('/status')) {
      return json(over.liveStatus ?? freshLiveStatus())
    }
    if (path.endsWith('/reports')) {
      return json({ ...emptyPage(), facets: { mode: {}, asset: {}, interval: {} } })
    }
    if (path.endsWith('/models')) {
      return json({ models: [] })
    }
    if (path.endsWith('/decisions')) {
      return json({ ...emptyPage(), facets: {} })
    }
    // Time-series / list endpoints the pages may probe: empty-but-valid.
    if (path.endsWith('/equity') || path.endsWith('/fills') || path.endsWith('/risk_events')) {
      return json({ points: [], data: [], fills: [], series_name: '', downsample: 'none' })
    }
    // Anything else: a benign empty object so the page renders its empty state.
    return json({})
  })
}
