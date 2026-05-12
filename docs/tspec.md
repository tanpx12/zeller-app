# perps_model dashboard — Technical Spec & Implementation Plan (v2.0)

## Overview

A single-page web application that visualizes the perps_model trading system through its read-only HTTP API. The dashboard surfaces four primary views — Live paper trading, persisted Reports, side-by-side Compare, and weekly retrain Decisions — built against the v1 API contract (with optional adoption of v1.1 additions).

This is a **personal-use, single-operator dashboard**. It assumes one user on `localhost`, prioritizes information density and observability over onboarding flows or multi-user concerns. The aesthetic is quantitative trading desk: monospace numerics, dense tables, semantic-only color, no decorative gradients or animations.

---

## Goals

- Render every section of every `PerformanceReport` in under one second on a typical laptop
- Stream live equity, fills, and risk events from the WebSocket without dropped messages
- Survive WebSocket disconnects and Rust backend restarts without page reload
- Compile against a typed API client codegened from `/api/v1/openapi.json` — no hand-written request types
- Deploy as a single static bundle servable by any web server (no Node.js runtime in production)
- Match the design tokens and aesthetic of the existing HTML mockup exactly

## Non-goals (for now)

- Mobile / tablet layouts — desktop only, **target viewport ≥ 1100px** (matches the mockup's single `@media (max-width: 1100px)` breakpoint, which collapses the multi-column grids to single-column rather than introducing a true mobile layout)
- Authentication / authorization (the API has none either)
- Server-side rendering (SPA only)
- Offline mode / service worker caching
- Internationalization (English + UTC only)
- Multi-strategy or multi-asset visualization beyond what one `PerformanceReport` covers
- Editing / write actions of any kind (API is read-only by design)

---

## Stack decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15** (App Router) with `output: 'export'` | The dominant React stack; static export gives us a single `out/` directory the Rust backend can serve, no Node runtime in production; App Router gives Suspense + route-level code splitting for free |
| Language | **TypeScript 5** (strict mode) | Standard |
| UI primitives | **shadcn/ui** (Radix UI under the hood) | Copy-paste registry — components live in our repo, not as a versioned dependency; Radix handles the accessibility surface (keyboard, focus, ARIA) that would otherwise need per-component specification |
| Styling | **Tailwind CSS 4** with CSS variables for theming | shadcn's native styling approach; CSS variables (`--background`, `--foreground`, `--primary`, etc.) switch on `data-theme` attribute, Tailwind utilities become theme-aware automatically |
| Theme switching | **next-themes** | Standard pairing with shadcn — handles SSR/hydration mismatch, persists to localStorage, applies `data-theme` to `<html>` |
| Routing | Next.js App Router | File-based, zero config |
| Data fetching | **TanStack Query v5** | Caching, retry, stale-while-revalidate, request deduplication — the only sensible answer for a polling-heavy dashboard |
| State (client) | **Zustand** | Minimal API; used only for cross-route state that doesn't fit URL params (WS connection state, in-memory event buffers) |
| Charting | **Recharts** for time series + **Chart.js** for histograms/donuts | Recharts integrates cleanly with React; Chart.js handles dense bar/donut cases Recharts is weak on |
| Forms / inputs | shadcn `Input` + `Select` + `Popover` + `Command` | No form library needed — the dashboard has filters, not forms |
| HTTP client | **fetch** + generated client from OpenAPI | No axios, no superagent; the generated client handles serialization |
| Date / time | **date-fns** + **date-fns-tz** | Tree-shakeable; we only need UTC formatting and a handful of relative-time helpers |
| Number formatting | Custom utilities | `Intl.NumberFormat` for money/percent; small wrapper module for consistent precision |
| Toast / notifications | **sonner** (via shadcn) | Recommended shadcn pairing; used for WS connection state changes |
| Testing | **Vitest** + **React Testing Library** + **Playwright** for E2E | Standard React testing stack; Playwright covers WS reconnection scenarios |
| Linting | **ESLint** (Next.js config) + **TypeScript strict** + **Prettier** | Standard, nothing exotic |
| Package manager | **pnpm** | Faster than npm, deterministic lockfile |

**Why Next.js + shadcn (changed from v1's Vite + custom components):**

- **Ecosystem alignment** — Most React tutorials, Stack Overflow answers, and component examples in 2026 assume Next.js. Sticking with the dominant stack reduces friction looking up patterns.
- **Static export covers the deployment story** — `output: 'export'` produces a fully static `out/` directory, same shape as a Vite `dist/`. The Rust backend serves it via `tower-http::ServeDir`. No Node.js runtime in production.
- **shadcn/ui is the right answer for primitives** — Radix UI underneath handles accessibility (Lighthouse > 95 success criterion is realistic with Radix; uphill without it). The copy-paste model means we own the components — no version lock, no runtime dependency, free to modify.
- **Tailwind + CSS variables is the standard theming approach** — shadcn already uses this pattern with `--background` / `--foreground` / `--primary` etc. The mockup's design tokens map cleanly onto the shadcn convention.

**What I deliberately rejected:**

- **Vite (the v1 choice)** — One notch simpler config, but loses Next.js's ecosystem alignment and Suspense streaming. The "fewer moving parts" argument doesn't hold up when the parts in question are well-trodden defaults rather than custom config.
- **React Router v7** — Fine choice, but Next.js's App Router gives the same file-based routing plus build-time optimizations. Picking one removes a decision.
- **Headless UI / Aria Components / direct Radix** — All viable, but shadcn's pre-styled defaults match our aesthetic closer than headless alternatives, and we'd reinvent the same wheel.
- **Redux / Redux Toolkit** — Overkill. The only persistent client state is theme (next-themes), current route (URL), pinned-runs-in-Compare (URL), and WS connection state (Zustand). 
- **MUI / Mantine / Chakra** — Heavy, opinionated, harder to match the mockup's tight quantitative-trading aesthetic without override gymnastics. shadcn's lower-level approach gives us full control over visual details.
- **D3 directly** — Too low-level. Recharts wraps D3 with sane defaults.
- **Plotly** — Heavy bundle, financial-charting feature set we don't need.

---

## Architecture

The dashboard is a layered SPA where each layer has one job and is replaceable independently:

```
┌────────────────────────────────────────────────────────────┐
│  Pages (route components)                                  │
│  /live · /reports · /reports/:id · /compare · /decisions   │
└────────────────────────────────────────────────────────────┘
                            ↓ composes
┌────────────────────────────────────────────────────────────┐
│  Sections (PerformanceReport section views)                │
│  HeadlineKPIs · EquityChart · DrawdownChart · TradeTable   │
│  AttributionDonut · ForecastDiagnostics · HourOfDayChart   │
└────────────────────────────────────────────────────────────┘
                            ↓ uses
┌────────────────────────────────────────────────────────────┐
│  Hooks (TanStack Query + Zustand bindings)                 │
│  useReport · useEquity · useLiveStatus · useWebSocket      │
└────────────────────────────────────────────────────────────┘
                            ↓ calls
┌────────────────────────────────────────────────────────────┐
│  API client (codegen from openapi.json)                    │
│  ReportsService · CompareService · LiveService · ...       │
└────────────────────────────────────────────────────────────┘
                            ↓ HTTP / WS
┌────────────────────────────────────────────────────────────┐
│  Rust backend (perps_model API server)                     │
└────────────────────────────────────────────────────────────┘
```

**Rules that enforce the layering:**

- Pages never call `fetch` directly. They use hooks.
- Sections never call hooks for data they didn't render. They receive data as props from the parent page or call their own hook for their own section endpoint.
- Hooks never construct API URLs or request bodies. They call methods on the generated client.
- The generated client is regenerated on every CI build from the live OpenAPI spec — drift is impossible.

---

## File structure

```
dashboard/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts                  # output: 'export', images: { unoptimized: true }
├── tailwind.config.ts              # theme extension mapping tokens → utility classes
├── postcss.config.mjs
├── components.json                 # shadcn/ui registry config
├── playwright.config.ts
├── scripts/
│   └── codegen.ts                  # regenerates lib/api-client from openapi.json
├── public/
│   └── favicon.svg
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # root layout: <html data-theme>, fonts, providers
│   ├── globals.css                 # @tailwind directives, CSS variable tokens
│   ├── providers.tsx               # client-side: QueryClient, theme, sonner
│   ├── page.tsx                    # redirects to /live
│   ├── live/
│   │   └── page.tsx                # "use client" — Live tab
│   ├── reports/
│   │   ├── page.tsx                # "use client" — Reports list
│   │   └── [runId]/
│   │       └── page.tsx            # "use client" — Report detail
│   ├── compare/
│   │   └── page.tsx                # "use client" — Compare tab
│   └── decisions/
│       ├── page.tsx                # "use client" — Decisions list
│       └── [decisionId]/
│           └── page.tsx            # "use client" — Decision detail
└── src/
    ├── components/
    │   ├── ui/                     # shadcn/ui components (copied via `pnpm shadcn add`)
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── badge.tsx
    │   │   ├── input.tsx
    │   │   ├── progress.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── tooltip.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── popover.tsx
    │   │   ├── command.tsx
    │   │   ├── alert.tsx
    │   │   ├── separator.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── sonner.tsx
    │   │   └── toggle-group.tsx
    │   ├── dashboard/              # domain-specific composites
    │   │   ├── kpi.tsx             # large stat with sub-line
    │   │   ├── stat.tsx            # small stat with sub-line
    │   │   ├── kv-row.tsx          # key-value row used in Forecast Diagnostics
    │   │   ├── mode-badge.tsx      # Badge wrapper with batch/holdout/live/decision variants
    │   │   ├── verdict-badge.tsx   # Badge wrapper with ok/monitor/retrain variants
    │   │   ├── trigger-chip.tsx    # Badge wrapper with no-fire/soft-fire/hard-fire
    │   │   ├── sharpe-bar.tsx      # Progress wrapper + value display
    │   │   ├── range-chips.tsx     # ToggleGroup wrapper for 7D/30D/90D/All
    │   │   ├── live-indicator.tsx  # the breathing-dot connection indicator
    │   │   ├── run-pick.tsx        # Compare tab's run selector card
    │   │   ├── compare-grid.tsx    # display: contents A|label|B grid
    │   │   ├── decision-card.tsx
    │   │   ├── error-boundary.tsx
    │   │   └── empty-state.tsx
    │   ├── sections/               # PerformanceReport section views
    │   │   ├── headline-kpis.tsx
    │   │   ├── stat-grid.tsx
    │   │   ├── equity-chart.tsx
    │   │   ├── drawdown-chart.tsx
    │   │   ├── hour-of-day-chart.tsx
    │   │   ├── cost-attribution-donut.tsx
    │   │   ├── forecast-diagnostics.tsx
    │   │   ├── trade-table.tsx
    │   │   ├── risk-event-feed.tsx
    │   │   ├── compare-headline.tsx
    │   │   ├── equity-overlay.tsx
    │   │   ├── return-distribution.tsx
    │   │   ├── report-table.tsx
    │   │   └── decision-list.tsx
    │   ├── charts/
    │   │   ├── base-line-chart.tsx # shared Recharts wrapper with theme tokens
    │   │   ├── base-bar-chart.tsx
    │   │   └── chart-theme.ts      # reads CSS vars at render time for chart colors
    │   └── layout/
    │       ├── top-bar.tsx         # brand, tab navigation, live status, theme toggle
    │       └── page-header.tsx     # title + meta line
    ├── lib/
    │   ├── api-client/             # GENERATED — do not edit
    │   │   ├── index.ts
    │   │   ├── services/
    │   │   └── models/
    │   ├── client.ts               # configured API client instance + base URL
    │   ├── ws-client.ts            # WebSocket connection manager (reconnect, buffer)
    │   ├── query-client.ts         # TanStack Query default config
    │   ├── format.ts               # formatMoney, formatPct, formatRatio, formatBars
    │   ├── time.ts                 # formatUtc, formatDuration, ago()
    │   ├── colors.ts               # semantic helpers: pnlColor(value), modeColor(mode)
    │   └── utils.ts                # cn() utility (shadcn convention for clsx + tailwind-merge)
    ├── hooks/
    │   ├── use-report.ts           # GET /reports/{id} + section endpoints
    │   ├── use-report-list.ts      # GET /reports with filters
    │   ├── use-report-search.ts    # GET /reports/search (v1.1, optional)
    │   ├── use-compare.ts          # GET /compare?a=...&b=...
    │   ├── use-live-status.ts      # GET /live/status with 1s polling
    │   ├── use-live-stream.ts      # WS subscription, returns latest events
    │   ├── use-decisions.ts        # GET /decisions, GET /decisions/{id}
    │   ├── use-triggers.ts         # GET /triggers/current with manual refresh
    │   └── use-url-state.ts        # typed wrapper around useSearchParams
    ├── store/
    │   ├── compare-store.ts        # Zustand: selected run A + run B (mirrored to URL)
    │   └── live-store.ts           # Zustand: WS connection state, last heartbeat
    └── tests/
        ├── unit/                   # Vitest: format.ts, ws-client.ts logic
        └── e2e/                    # Playwright: WS reconnection, route nav
```

**Notes on conventions:**

- **`src/components/ui/` is shadcn's copy-paste registry.** Files are added via `pnpm dlx shadcn@latest add button` — they live in your repo and you own them. They are *not* a node_module. Modifications are allowed but logged in git so future shadcn updates can be merged manually.
- **`src/components/dashboard/` is for domain-specific composites** — trading-specific things like `Kpi`, `SharpeBar`, `RunPick` that build on shadcn primitives but encode trading-dashboard semantics.
- **`src/components/sections/` is for `PerformanceReport` section views** — each maps 1:1 to a section endpoint on the API.
- **Every route file is `"use client"`.** This is a fully client-rendered dashboard — every page needs hooks, WebSocket, and the in-memory query cache. Server Components are unnecessary and would add complexity around the static export path. The single `app/layout.tsx` is the only Server Component, and it just renders providers.
- **File names are kebab-case** (Next.js / shadcn convention). Imports use the names declared by the file.

---

## Data flow

### Static reports (Reports, Compare, Decisions tabs)

1. Route loads, page component mounts
2. Page calls a hook (e.g. `useReport(runId)`)
3. Hook returns a TanStack Query result — cached by `[endpoint, params]` key
4. On first call: HTTP request via generated client; subsequent calls hit cache
5. Cache TTL: 1 hour for persisted reports (immutable per `Cache-Control` header)
6. Sections render from `data` field; show `Skeleton` while `isLoading`, `ErrorBoundary` on failure

### Live tab — three data sources composed

The Live tab is the most complex page because it combines three update mechanisms:

1. **`useLiveStatus()`** — polls `GET /live/status` every 1 second. Powers the KPI strip (Equity, Position, 24h P&L, Forecast), the live status indicator in the top bar, and the Forecast Diagnostics card. 1s polling rather than WS-only because: it gives a definite "is the server alive" signal, and the response is tiny (~1KB).
2. **`useReport("live")`** (with v1.1) or **`useLiveSections()`** (v1) — fetches the report sections (equity, drawdown, hour-of-day, attribution) every 60 seconds. These change at bar boundaries (1h cadence), so faster polling is wasted.
3. **`useLiveStream()`** — single WebSocket, broadcasts events to subscribing components. Each component picks the event types it cares about. Used for: animated equity-curve tail (appends new points without refetching), recent-fills tape (prepends new fills), risk-event feed.

The three sources are **eventually consistent**: a fill arrives via WS, appears in the fills table immediately; the same fill shows up in `/live/status.recent_pnl.pnl_24h_usd` within 1 second; the same fill is reflected in `/reports/live/equity` within 60 seconds. If they ever disagree (e.g., WS missed a message), the polled endpoints are authoritative — components reading from WS should also re-fetch on reconnect.

---

## WebSocket client

The single most complex piece of the dashboard. Lives in `lib/ws-client.ts`, fronted by `useLiveStream()`.

### Responsibilities

- Maintain one open connection to `ws://localhost:8787/api/v1/live/stream`
- Send `subscribe` message on connect and every reconnect
- Parse incoming JSON, dispatch to subscribers by message `type`
- Detect dead connections (no heartbeat for 60s) and reconnect
- Exponential backoff on reconnect: 1s, 2s, 4s, 8s, 16s, max 30s
- Surface connection state to UI: `connecting | open | reconnecting | disconnected`
- Buffer the last N messages so a late subscriber doesn't miss recent events

### State machine

```
        ┌──────┐  open      ┌──────┐  close   ┌──────────────┐
START → │ idle │ ─────────→ │ open │ ────────→│ reconnecting │
        └──────┘            └──────┘          └──────────────┘
            ↑                  │                    │
            │                  │ heartbeat-timeout  │ exponential backoff
            │                  ↓                    ↓
            │            ┌──────────────┐   ┌──────────────┐
            │            │ reconnecting │ ← │  attempting  │
            │            └──────────────┘   └──────────────┘
            │                                      │
            │           giving-up (after 10 tries) │
            └──────────────────────────────────────┘
                          → disconnected
```

`disconnected` is a terminal state requiring manual reconnect via a UI button. We don't reconnect forever — if the backend has been down for ~3 minutes (sum of all backoffs through 10 attempts), it's not coming back without user intervention.

### Subscriber API

```typescript
type LiveMessage =
  | { type: 'snapshot'; ts: number; state: EngineState }
  | { type: 'bar_close'; ts: number; bar: Bar; forecast: number; signal: number; ... }
  | { type: 'fill'; ts: number; fill: Fill; equity_after_usd: number }
  | { type: 'equity'; ts: number; equity_usd: number; ... }
  | { type: 'risk_event'; ts: number; guard: string; action: string; ... }
  | { type: 'reconciliation'; ts: number; divergence_pct: number; status: string }
  | { type: 'heartbeat'; ts: number };

const unsubscribe = wsClient.subscribe(['fill', 'equity'], (msg) => {
  // handle msg, narrowed to fill | equity by TypeScript
});
```

Subscription is by message type. The hook `useLiveStream(['fill'])` returns the most recent N fills, automatically unsubscribes on unmount. Discriminated unions on `type` give component-level type narrowing.

### Why polling AND WS

WebSocket isn't a magic bullet. Pure-WS dashboards have a class of bug where the UI silently goes stale if the WS connection breaks in a way the browser doesn't surface as `close`. The polling fallback for `/live/status` is the canary — if it stops returning 200, the UI shows a "live runner unreachable" banner regardless of WS state.

---

## State management strategy

Most state is **server state**, owned by TanStack Query. The client owns very little:

| State | Owner | Persistence |
|---|---|---|
| Current route | Next.js App Router | URL |
| Theme (dark / light) | `next-themes` | localStorage (via next-themes' built-in handling) |
| Selected runs in Compare | Zustand store + URL query params | URL (so links are shareable) |
| WS connection status | Zustand store | none (re-established on mount) |
| Filter state on Reports / Decisions tabs | URL query params via `useUrlState` | URL |
| Range selector on equity charts (7D / 30D / 90D / All) | URL query params | URL |
| Form input values during filter editing | useState (component-local) | none |

**Rule of thumb:** if a piece of state changes the URL, it lives in the URL. Everything else either lives in `next-themes` (theme only) or Zustand (one global atom per concern) or is component-local `useState`. We do not use React Context for app state — TanStack Query, next-themes, and Zustand all have their own subscription mechanisms that are more efficient.

---

## Theming and design tokens

shadcn's CSS-variable-backed theme system is used unchanged. The mockup's design tokens map onto shadcn's variable names with minor renaming for ecosystem alignment.

Two themes selected via `data-theme="dark"` or `data-theme="light"` on `<html>`, controlled by `next-themes`. The defaults match the mockup:

```css
/* app/globals.css */
@import 'tailwindcss';

:root[data-theme="dark"] {
  --background:        #0a0a0a;     /* maps to bg-background utility */
  --surface:           #121212;     /* maps to bg-surface (custom) */
  --elevated:          #181818;     /* maps to bg-elevated (custom) */
  --border:            rgba(255,255,255,0.07);
  --foreground:        #fafafa;     /* maps to text-foreground */
  --muted-foreground:  #999996;
  --faint-foreground:  #5a5a57;
  --positive:          #4ade80;     /* P&L positive, success */
  --negative:          #f87171;
  --primary:           #60a5fa;     /* Model series, brand */
  --warning:           #fbbf24;     /* Momentum baseline, monitor verdict */
  --grid:              rgba(255,255,255,0.05);
  /* full set documented in Appendix A.1 */
}

:root[data-theme="light"] {
  /* light-mode values per Appendix A.1 */
}
```

The Tailwind config maps these variables to utility class names:

```ts
// tailwind.config.ts (excerpt)
export default {
  theme: {
    extend: {
      colors: {
        background:  'var(--background)',
        surface:     'var(--surface)',
        elevated:    'var(--elevated)',
        border:      'var(--border)',
        foreground:  'var(--foreground)',
        'muted-foreground':  'var(--muted-foreground)',
        'faint-foreground':  'var(--faint-foreground)',
        positive:    'var(--positive)',
        negative:    'var(--negative)',
        primary:     'var(--primary)',
        warning:     'var(--warning)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
}
```

Components then use Tailwind utilities — `bg-background`, `text-foreground`, `text-positive`, `font-mono` — and theme switching becomes free.

### Typography

- **Geist Sans** for UI chrome (labels, headers, prose)
- **Geist Mono** for every numerical value

Loaded via Next.js's `next/font/google` in `app/layout.tsx`:

```tsx
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  // tabular numerals + Geist's stylistic set 1 — both required
  preload: true,
});
```

The `<html>` element gets `className={`${geistSans.variable} ${geistMono.variable}`}` so the CSS variables are available everywhere.

The `font-feature-settings: "tnum" 1, "ss01" 1` is applied via a `.mono` utility class on every numeric element (or by default on `font-mono` in `globals.css`):

```css
.font-mono {
  font-feature-settings: "tnum" 1, "ss01" 1;
}
```

### Charts and theme switching

Recharts components accept color props from getComputedStyle-read CSS variables:

```tsx
const themeColors = useThemeColors(); // reads --primary, --positive, --grid at render
return <Line stroke={themeColors.primary} ... />;
```

`useThemeColors()` (in `components/charts/chart-theme.ts`) subscribes to `next-themes`' theme change event and re-reads variables — Recharts re-renders with the new colors. Chart.js follows the same pattern via its `options.scales.x.grid.color` etc.

---

## Performance budgets

| Budget | Target | Rationale |
|---|---|---|
| Initial bundle (gzipped) | < 250 KB | Loads in < 1s on local backend |
| Time to interactive | < 1.5s | First useful paint of Live tab |
| Tab-switch render | < 200ms | Should feel instant; charts may stream in |
| Chart render | < 100ms per chart | 168-point series should not feel slow |
| WS message handling | < 16ms | One animation frame, or we drop frames |
| `useLiveStatus` polling overhead | < 1% CPU sustained | Polling shouldn't dominate the tab |

Code-splitting per route (`React.lazy(() => import('./routes/reports'))`) is enabled by default; the bundle reports flag if any chunk exceeds 100 KB gzipped.

Recharts is the largest dependency. If bundle size becomes a problem, fallback is per-chart `lazy` loading — but only if we hit budget violations first.

---

## API client codegen

Run via `pnpm codegen`:

```bash
# Fetch fresh spec from the running backend
curl http://localhost:8787/api/v1/openapi.json > openapi.json

# Generate typed client
pnpm exec openapi-typescript-codegen \
  --input openapi.json \
  --output src/api-client \
  --client fetch \
  --useUnionTypes \
  --useOptions
```

`scripts/codegen.ts` wraps this so contributors run one command. CI runs it on every build and fails if the output diverges from what's committed — keeps the client in sync with the spec.

The generated `src/api-client/` directory is **committed to the repo** despite being generated. Reasoning: CI can verify regeneration produces an identical output (`git diff --exit-code src/api-client/`); developers don't need to run the backend locally just to type-check. The alternative — pure on-demand generation — adds a friction point we don't need for a single-developer project.

### Custom configuration

The generated client takes a base URL and request options. We wrap it in `lib/client.ts`:

```typescript
import { OpenAPI } from '@/api-client';

OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787/api/v1';
OpenAPI.HEADERS = { 'Accept': 'application/json' };

// Custom error handling: parse RFC 7807 problem details
OpenAPI.RESOLVER = async (response: Response) => {
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new ApiError(problem ?? { title: response.statusText, status: response.status });
  }
  return response.json();
};
```

---

## Error handling

Three levels:

1. **Per-section ErrorBoundary** — every chart, table, and stat grid is wrapped. If `/reports/{id}/trades` 404s, the Trades section shows an inline error; the rest of the page still renders.
2. **RFC 7807 Problem Details** — error responses are parsed and shown with their `title` and `detail`. Specific error types get specific UI: `report-period-mismatch` shows a clear "these reports don't overlap" message rather than a generic error.
3. **Network errors** — TanStack Query retries 3x with exponential backoff. WebSocket disconnects show a "Reconnecting…" banner.

A 503 from `/live/*` endpoints isn't an error in the UI sense — it's expected when the paper trader isn't running. The Live tab shows a clear "Paper trader not running" empty state with a recovery suggestion (`cargo run --bin paper_trade ...`).

---

## Routing

Next.js App Router; routes are folder-based under `app/`:

```
/                                  → app/page.tsx (redirects to /live)
/live                              → app/live/page.tsx
/reports                           → app/reports/page.tsx
   ?mode=batch&min_sharpe=0.5      → query params via useSearchParams()
/reports/:runId                    → app/reports/[runId]/page.tsx
   ?range=7d                       → range selector
/compare                           → app/compare/page.tsx
   ?a=01HXYZ...&b=01HXYZ...        → selected runs (URL = shareable)
/decisions                         → app/decisions/page.tsx
   ?verdict=retrain                → filter
/decisions/:decisionId             → app/decisions/[decisionId]/page.tsx
```

All query-param state goes through a typed wrapper hook (`hooks/use-url-state.ts`) that wraps Next's `useSearchParams()` + `useRouter()`:

```tsx
const [filters, setFilters] = useUrlState({
  mode: z.enum(['batch', 'holdout', 'live', 'decision']).optional(),
  min_sharpe: z.coerce.number().optional(),
  since: z.coerce.number().optional(),
});
```

`useUrlState` reads via `useSearchParams()`, parses with Zod, and writes via `router.replace()` so the back button is sane. URLs encode all filter and selection state — refresh-safe, link-shareable, browser-history-friendly.

---

## Implementation plan

### Phase 1 — Project scaffold (Step 1)

**Step 1: Project scaffold + tooling**
- `pnpm create next-app@latest dashboard --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint`
- Configure `next.config.ts` with `output: 'export'` for static export
- Add TanStack Query, Zustand, Recharts, Chart.js, next-themes, sonner
- Initialize shadcn: `pnpm dlx shadcn@latest init` (choose New York style, neutral base color — overridden by our tokens)
- Add initial shadcn components: `pnpm dlx shadcn@latest add button card badge input progress skeleton table tabs tooltip dropdown-menu popover command alert separator scroll-area toggle-group sonner`
- Configure TypeScript strict mode, Prettier, Vitest, Playwright
- Configure dev rewrites (`next.config.ts`'s `rewrites` is `output: 'export'`-incompatible, so use a `.env.local` `NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787/api/v1` instead and let the browser hit the backend directly during dev)
- Set up `pnpm codegen` script
- Configure `pnpm build` to produce an `out/` directory the Rust binary can serve

**Milestone:** `pnpm dev` shows a hello-world page; `pnpm build` produces a working static `out/` bundle; CI runs lint + test on every commit.

---

### Phase 2 — API client and primitives (Steps 2–4)

**Step 2: Generated API client**
- Run codegen against the live backend's OpenAPI spec
- Configure `lib/client.ts` with base URL + error handler
- Smoke test: hit `/health` and render the version string

**Step 3: Design tokens + domain components**
- Port the full token set from Appendix A.1 into `app/globals.css`
- Map tokens to Tailwind utilities in `tailwind.config.ts` (Appendix A.4)
- Wire `next-themes` in `app/providers.tsx` with `attribute="data-theme"`
- Build domain components in `src/components/dashboard/`:
  - `Kpi`, `Stat`, `KvRow` — pure compositions, no shadcn dependency
  - `ModeBadge`, `VerdictBadge`, `TriggerChip` — extend shadcn `Badge` with semantic variants
  - `SharpeBar` — extend shadcn `Progress` with value display
  - `RangeChips` — wrap shadcn `ToggleGroup` 
  - `LiveIndicator` + `LiveDot` — custom (the pulse animation isn't a shadcn primitive)
  - `RunPick` — custom card with left-border accent
  - `CompareGrid` — bespoke (`display: contents` trick)
  - `ErrorBoundary`, `EmptyState` — custom
- Each component has a `*.stories.tsx`-style demo on a gated `/dev` route (dev mode only)

**Step 4: Layout shell + theme toggle**
- `TopBar` with brand, tab navigation (Next.js `Link`), live status indicator, theme toggle (shadcn `Button` calling `setTheme()` from next-themes)
- `app/layout.tsx` renders the providers, fonts, and `<TopBar />` above the page slot

**Milestone:** the app shell matches the mockup pixel-for-pixel; clicking the theme toggle flips colors; tabs are routable.

---

### Phase 3 — Reports tab (Steps 5–7)

The Reports tab is built first because it exercises the full data path (list endpoint, detail endpoint, all sections) without the complexity of live streaming.

**Step 5: Report list view**
- `useReportList(filters)` hook wrapping TanStack Query
- `ReportTable` section component with `ReportRow` per row
- Filter pills wired to URL query params
- Cursor pagination (load more on scroll)
- Faceted counts (v1.1) gracefully degrade to plain counts if facets aren't in the response

**Step 6: Report detail — non-chart sections**
- Route `/reports/:runId`
- Parallel hooks: `useReportHeadline`, `useReportTrades`, `useReportRiskEvents`
- Render `HeadlineKpis`, `StatGrid`, `TradeTable`, `RiskEventFeed`
- Each section in its own `ErrorBoundary`; one failure doesn't blank the page

**Step 7: Report detail — charts**
- Build `BaseLineChart` and `BaseBarChart` Recharts wrappers reading colors from CSS vars
- `EquityChart` overlays model + baselines from `useReportEquity`
- `DrawdownChart` reads from `useReportDrawdown`
- `HourOfDayChart` from `useReportTimeAnalysis`
- `CostAttributionDonut` via Chart.js (Recharts donut is weak)
- `ForecastDiagnostics` card from `useReportForecast`
- Range chips (7D / 30D / 90D / All) update URL query, which updates the `since` param

**Milestone:** clicking any row in `/reports` opens a full detail page matching the mockup; all eight sections render correctly; theme toggle updates chart colors.

---

### Phase 4 — Compare tab (Steps 8–9)

**Step 8: Compare data flow**
- `useCompare(a, b)` hook
- Run pickers — search input wired to `useReportSearch` (v1.1) or to `useReportList` filtering (v1)
- Selection state in URL query params (`?a=...&b=...`)
- Handle 409 `report-period-mismatch` with a clear UI explanation

**Step 9: Compare sections**
- `CompareGrid` for A / label / B headline diff
- `EquityOverlay` showing both equity curves on one chart
- `DrawdownOverlay`
- `ReturnDistribution` (v1.1 only — gracefully hide section if missing)
- Statistical evidence card (DM test p-value, bootstrap CI on Sharpe diff)
- Verdict banner

**Milestone:** picking two runs shows a complete comparison report.

---

### Phase 5 — Decisions tab (Steps 10–11)

**Step 10: Decisions list**
- `useDecisions(filters)` with verdict filter
- `DecisionCard` component matching the mockup
- Trigger chips colored by fire status (no_fire = neutral, soft_fire = amber, hard_fire = red)
- Faceted verdict counts (v1.1) or plain counts (v1)

**Step 11: Decision detail**
- `useDecision(id)` for full report
- Embedded `PerformanceReport` link → opens `/reports/{embedded_report_run_id}` in same tab
- Min interval guard status displayed prominently

**Milestone:** decision history browsable; each card shows triggers and live-vs-holdout deltas.

---

### Phase 6 — Live tab and WebSocket (Steps 12–14)

Saved for last because it's the most complex and the static report flows give us a solid base to layer onto.

**Step 12: Static live sections**
- For v1 API: `useLiveEquity`, `useLiveFills`, `useLiveRiskEvents`
- For v1.1: `useReport("live")` with the same section endpoints
- These render the same components as `/reports/:runId` — proves the architectural payoff of treating live mode as a rolling report

**Step 13: WebSocket client**
- Implement `lib/ws-client.ts` with the state machine
- Reconnection logic with exponential backoff
- Heartbeat-based dead-connection detection
- Subscriber registry by message type
- Backpressure: ring buffer of last 1000 messages so late subscribers can catch up
- Tests: simulate disconnect, reconnect, missed messages

**Step 14: Live tab composition**
- `useLiveStatus` polling for KPI strip
- `useLiveStream(['fill'])` for fills tape with appending
- `useLiveStream(['risk_event'])` for risk feed
- `useLiveStream(['equity'])` appends to in-memory equity series for smooth chart updates between 60s polls
- Connection status surfaced in TopBar live indicator

**Milestone:** Live tab updates in real time; killing the backend triggers a reconnect banner; restarting the backend reconnects automatically.

---

### Phase 7 — Polish and testing (Steps 15–16)

**Step 15: Loading and error states**
- Verify every section has a skeleton during initial load
- Verify ErrorBoundary catches all common failure modes
- Empty states for "no reports match filters", "live runner not running", "no decisions yet"

**Step 16: E2E tests + deployment prep**
- Playwright scenarios:
  - Route navigation (Live → Reports → detail → Compare)
  - Filter persistence (URL roundtrip)
  - Theme toggle
  - WebSocket reconnection (kill backend, restart, verify UI recovers)
  - Compare flow (pick A, pick B, view comparison)
- Lighthouse audit — must pass Performance > 90, Accessibility > 95
- README with deployment notes (single `out/` directory from `next build && next export`, serve with any static server, optionally embed in Rust binary via `include_dir!`)

**Milestone:** `pnpm test:e2e` passes; production bundle deployed and tested against a live backend.

---

## Deployment

For a personal-use system, the deployment story is intentionally boring:

```bash
pnpm build       # produces ./out/ (Next.js static export)
```

`next.config.ts`:

```ts
export default {
  output: 'export',
  images: { unoptimized: true },  // no Next image server at runtime
  trailingSlash: true,             // safer for static hosts
};
```

Three deployment options, in order of simplicity:

1. **Embed in the Rust binary** via `tower-http`'s `ServeDir`:
   ```rust
   .nest_service("/", ServeDir::new("out"))
   ```
   The Rust API server serves the static files. One binary, one process. Recommended.

2. **Standalone static server**: any HTTP server can serve `out/`. `python -m http.server`, Caddy, nginx, even `serve` from npm.

3. **Run dev server**: `pnpm dev` proxies API calls via `NEXT_PUBLIC_API_BASE` env var. Only for development.

No Node.js runtime is required in production — `output: 'export'` produces a fully static site.

---

## Risk / Known Challenges

| Risk | Mitigation |
|---|---|
| WebSocket silently disconnects without firing `close` | Heartbeat timer: no heartbeat for 60s = reconnect |
| Polling load on `/live/status` | 1s interval; response is tiny; window blur pauses polling via `document.visibilitychange` |
| Recharts + shadcn + Next.js framework bundle size | Per-route code splitting is on by default in App Router; budget enforced in CI |
| Theme toggle missing chart updates | Chart components subscribe to next-themes via `useTheme()`; re-read CSS vars on theme change and force re-render via `key` prop on chart wrappers |
| OpenAPI spec drifts from implementation | CI regenerates client + asserts no diff; broken types fail the build |
| Time-zone confusion (UTC vs local) | UTC everywhere; explicit `UTC` suffix on timestamps; no `toLocaleString()` without explicit time zone |
| Backend down at page load | Empty states + retry button; no infinite spinners |
| Next.js `output: 'export'` constraint: no dynamic routes without `generateStaticParams` | Dynamic segments (`[runId]`, `[decisionId]`) get a `generateStaticParams()` that returns `[]`; the page renders client-side from `useParams()` regardless. Documented in `app/reports/[runId]/page.tsx` |
| Next.js feature creep (someone adds `route.ts` API handler or middleware) | CI grep check: `find app -name route.ts -o -name middleware.ts` must return empty. Static export breaks silently otherwise |
| shadcn component drifts from registry version after manual edits | Each shadcn component file carries a comment header tagging the registry version it was added at; future `shadcn add` runs warn before overwriting |
| Large reports (12+ months of 1h bars) overwhelming chart libraries | Server-side `downsample=hourly` for ranges > 7 days; client never receives raw bars beyond the visible range |
| WS message storm during volatile periods | Ring buffer caps memory; oldest messages dropped first; UI throttles re-renders to 30fps |
| Decimal precision lost in JSON | All money values formatted via `Intl.NumberFormat` with explicit `maximumFractionDigits`; no naive `toFixed()` |
| Tailwind utility class explosion in JSX | `cn()` helper composes classes; long class lists move to named constants in the component; ESLint plugin `eslint-plugin-tailwindcss` enforces ordering and detects collisions |

---

## Success criteria

1. **Visual fidelity:** screenshot-diff tests against the existing `perps_dashboard.html` mockup at < 2% pixel difference per page, in both light and dark themes; the **Design Tokens & Component Inventory appendix below is the canonical reference** for any disagreement between the mockup and an in-progress implementation
2. **Functional completeness:** every UI element in the mockup is wired to real API data (no hardcoded values in production code)
3. **Type safety:** zero `any` types in the codebase; zero TypeScript errors in `--strict` mode
4. **Generated client integrity:** CI passes `git diff --exit-code src/api-client/` after regeneration
5. **Performance:** initial load < 1.5s, tab-switch < 200ms, chart render < 100ms on a 2020-era laptop with backend on localhost
6. **WS resilience:** Playwright test demonstrates that killing and restarting the backend results in the UI reconnecting within 30 seconds without page reload
7. **Theme parity:** both light and dark themes render every section correctly (asserted by visual regression test)
8. **Bundle budget:** gzipped initial bundle < 250 KB; no single route chunk > 100 KB
9. **Test coverage:** all utility modules (`lib/format.ts`, `lib/time.ts`, `lib/ws-client.ts`) at > 90% line coverage; E2E suite covers every primary user flow
10. **Accessibility:** Lighthouse score > 95, keyboard navigation works for every interactive element, color choices pass WCAG AA for normal text

---

## What this spec deliberately does not address

- **Adoption of v1.1 API additions** — the dashboard works against v1; v1.1 features (`/reports/search`, `facets`, `recent_pnl`) are wrapped in feature flags that no-op when the response lacks the field. Migration is a config toggle, not a refactor.
- **A reference for adding a new tab** — once the patterns above are established, adding a fifth tab is mechanical: new route, new page, new sections, new hooks. Not worth specifying in advance.
- **Internationalization, mobile, real-time alerts to phone, multi-user, write actions, paid features** — all explicitly non-goals.
- **What to build with the data** — the dashboard surfaces the data; trading decisions remain with the human operator. This boundary aligns with the API's read-only contract.

---

## Appendix A — Design Tokens & Component Inventory

The implementation must hit pixel parity with the existing mockup file `perps_dashboard.html`. This appendix is the contract: every value below is extracted verbatim from the mockup and is the canonical reference for the `tokens.css` file and the primitive components.

### A.1 Color tokens

Two themes, identical variable names, selected via `data-theme` attribute on `<html>` (managed by `next-themes`). Tokens are CSS variables defined in `app/globals.css` and surfaced as Tailwind utility classes via the `tailwind.config.ts` extension shown in Appendix A.4.

Variable names follow shadcn convention (`--background`, `--foreground`, etc.) rather than the mockup's original names (`--bg`, `--text`). The numeric values are unchanged from the mockup — only the names have been aligned for ecosystem compatibility.

#### Dark theme (`data-theme="dark"`, default)

| Variable | Tailwind utility | Value | Usage |
|---|---|---|---|
| `--background` | `bg-background` | `#0a0a0a` | Page background |
| `--surface` | `bg-surface` | `#121212` | Card / section background |
| `--elevated` | `bg-elevated` | `#181818` | Cards on cards, hover states, active chip background |
| `--border` | `border-border` | `rgba(255,255,255,0.07)` | Default 1px borders, divider lines |
| `--border-strong` | `border-border-strong` | `rgba(255,255,255,0.13)` | Active / focused element borders |
| `--foreground` | `text-foreground` | `#fafafa` | Primary text |
| `--muted-foreground` | `text-muted-foreground` | `#999996` | Labels, secondary text, axis ticks |
| `--faint-foreground` | `text-faint-foreground` | `#5a5a57` | Tertiary text, disabled, count badges |
| `--positive` | `text-positive` / `bg-positive` | `#4ade80` | Positive P&L, success, live indicator |
| `--positive-soft` | `bg-positive/13` (via opacity) | `rgba(74,222,128,0.13)` | Green-tinted backgrounds (verdict banner, mode badge fill) |
| `--negative` | `text-negative` | `#f87171` | Negative P&L, errors, hard-fire triggers |
| `--negative-soft` | (opacity utility) | `rgba(248,113,113,0.13)` | Red-tinted backgrounds |
| `--primary` | `text-primary` / `bg-primary` | `#60a5fa` | Model series, brand, neutral emphasis, batch/decision badge |
| `--primary-soft` | (opacity utility) | `rgba(96,165,250,0.13)` | Blue-tinted backgrounds |
| `--warning` | `text-warning` | `#fbbf24` | Momentum baseline, monitor verdict, soft-fire triggers, holdout badge |
| `--warning-soft` | (opacity utility) | `rgba(251,191,36,0.13)` | Amber-tinted backgrounds |
| `--grid` | `border-grid` | `rgba(255,255,255,0.05)` | Chart gridlines only |

#### Light theme (`data-theme="light"`)

| Variable | Value |
|---|---|
| `--background` | `#fafaf8` |
| `--surface` | `#ffffff` |
| `--elevated` | `#ffffff` |
| `--border` | `rgba(0,0,0,0.08)` |
| `--border-strong` | `rgba(0,0,0,0.16)` |
| `--foreground` | `#0a0a0a` |
| `--muted-foreground` | `#525250` |
| `--faint-foreground` | `#a3a3a0` |
| `--positive` | `#15803d` |
| `--positive-soft` | `rgba(21,128,61,0.10)` |
| `--negative` | `#b91c1c` |
| `--negative-soft` | `rgba(185,28,28,0.10)` |
| `--primary` | `#1e40af` |
| `--primary-soft` | `rgba(30,64,175,0.10)` |
| `--warning` | `#b45309` |
| `--warning-soft` | `rgba(180,83,9,0.10)` |
| `--grid` | `rgba(0,0,0,0.06)` |

**Critical rule:** never hardcode a color in any component. Use Tailwind utility classes (`text-positive`, `bg-elevated`) which reference the variables. Chart libraries that can't read CSS variables (Chart.js) must read them at render time via `getComputedStyle(document.documentElement).getPropertyValue('--primary')`.

### A.2 Typography

Two families, used together:

| Family | Loaded as | Used for |
|---|---|---|
| Geist Sans | Google Fonts `Geist:wght@400;500;600` | All labels, headings, prose |
| Geist Mono | Google Fonts `Geist+Mono:wght@400;500` | Every numerical value, run IDs, timestamps |

The `.mono` utility class applies `font-family: 'Geist Mono'` plus `font-feature-settings: "tnum" 1, "ss01" 1` — tabular numerals (so decimal points align across rows) and Geist's stylistic set 1 (cleaner `a` and `g` at small UI sizes). **Both feature settings are required.**

#### Size scale

Eight defined sizes. Adding a ninth requires a deliberate decision.

| Token / class | Size | Weight | Used for |
|---|---|---|---|
| `kpi-value` | 26px | 500 | The four hero KPIs on Live tab (`Equity`, `Position`, `24h P&L`, `Forecast`) |
| `page-title` | 18px | 500 | Page header (`Live paper trading`, `Reports`, etc.) |
| `stat-value` | 18px | 500 | Stat grid values (`Sharpe`, `Max DD`, etc.) |
| `run-pick .name` | 16px | 500 | Run picker headlines on Compare |
| `body` | 14px | 400 | Default body |
| `card-title`, `verdict`, `brand` | 13px | 500 | Card headers, brand mark |
| `kpi-sub`, `kv-row`, `trade-row` | 12px | 400 | Numerical body, table cells, kv rows |
| `compare-cell` | 13px | 400 | Compare grid cells (slightly larger than other tables) |
| `label`, `tiny`, `kpi-label` | 11px | 500 (label) / 400 (tiny) | Uppercase labels, sub-lines |
| `stat-label`, `stat-sub`, `trade-row.head`, `risk-event` | 10px | 500 (label) / 400 (data) | Smallest readable size — used only for axis labels, table heads, micro-stats |

**Labels** (every `--label`, `kpi-label`, `stat-label`, `lbl`) share a strict treatment: 10–11px, `text-transform: uppercase`, `letter-spacing: 0.06em`, `font-weight: 500`, `color: var(--text-muted)`. The kerning matters — without it the labels read as condensed.

#### Letter-spacing

| Where | Value |
|---|---|
| Numbers (KPI value, page title) | `letter-spacing: -0.02em` (tight) |
| Brand mark | `letter-spacing: -0.02em` |
| Labels (uppercase) | `letter-spacing: 0.06em` |
| Stat labels (10px uppercase) | `letter-spacing: 0.06em` |
| Decision labels (.lbl) | `letter-spacing: 0.04em` |
| Body | `0` (default) |

### A.3 Spacing scale

Five values cover every gap and padding in the mockup. Treat this as the spacing system; do not introduce arbitrary values.

| Value | Used for |
|---|---|
| 4px | Smallest gap — between tab buttons, inside legend swatch boxes |
| 8px | Card-internal small gaps, table row vertical padding |
| 10px | `stat-grid` gap, `filter-bar` gap, `section-h` margin |
| 12px | `kpi-grid` gap, between minor sections, `decision-stats` gap |
| 14px | `card` padding y, `card-title` margin-bottom |
| 16px | Between major sections, between cards, page content gap, `legend` gap |
| 18px | Card padding x |
| 20px | Page-header margin-bottom, `decision-card .head` padding |
| 24px | Compare-header gap, `decision-card .body` gap |

#### Border radii

| Token | Value | Used for |
|---|---|---|
| Sharp | 4px | Range chips, mode badges, verdict badges, trigger chips, sharpe-bar-fill |
| Default | 6px | Filter pills, theme toggle |
| Card | 8px | All cards, KPI boxes, stat boxes, run-pick, reports-table, decision-card, compare-grid |
| Round | 50% | Live indicator dot, theme-toggle dot, mode badge dots |

**Never combine `border-radius` with `border-left` / `border-top` accents** — single-sided borders with rounded corners look broken. `.run-pick.a` and `.run-pick.b` use full borders + a 2px `border-left-color` override, not asymmetric radii.

### A.4 Layout grids

Five distinct grid templates, reused across pages. Each is a component-level pattern, not a one-off.

| Class | Template | Gap | Used by |
|---|---|---|---|
| `kpi-grid` | `repeat(4, 1fr)` | 12px | Live tab hero KPIs |
| `stat-grid` | `repeat(5, 1fr)` | 10px | Live tab stat row |
| `row-2` | `2fr 1fr` | 12px | Equity chart + side panel layouts |
| `row-12` | `1.4fr 1fr 1fr` | 12px | Live tab three-column bottom row (P&L by hour / Cost / Forecast) |
| `row-equal-2` | `1fr 1fr` | 12px | Compare tab side-by-side charts, Live tab fills + risk events |
| `row-3` | `repeat(3, 1fr)` | 12px | (Reserved — used by some Reports detail variants) |

**Responsive collapse (≤ 1100px viewport):** every grid above except simple two-column ones collapses to single-column via `grid-template-columns: 1fr`. The `reports-row` grid collapses by hiding the `col-trades` column. There is no intermediate breakpoint — it's full grid or single column.

### A.5 Component inventory

Every UI primitive that needs explicit specification. Each row lists where the implementation comes from (shadcn registry vs custom) and the mockup's CSS class for traceability.

#### From shadcn registry (`src/components/ui/`)

Add to the project via `pnpm dlx shadcn@latest add <name>`. These are accessibility-hard primitives where rebuilding from scratch would be wasted effort.

| shadcn component | Used for | Mockup class equivalent |
|---|---|---|
| `Card` | All card containers | `.card` |
| `Badge` | Base for `ModeBadge`, `VerdictBadge`, `TriggerChip` | `.mode-badge`, `.verdict-badge`, `.trigger-chip` (base only) |
| `Button` | Theme toggle, "Load more" pagination, retry buttons | `.theme-toggle` |
| `Input` | Filter search box | `.filter-input` |
| `Progress` | Base for `SharpeBar` | `.sharpe-bar` (base only) |
| `Skeleton` | Loading placeholders for every section | — |
| `Table` | Reports table, trade table (base only) | `.reports-table`, `.trade-row` (base only) |
| `Tabs` | Top bar navigation | `.tabs`, `.tab-btn` |
| `Tooltip` | Chart hover details, "what does this mean" hovers | — |
| `DropdownMenu` | Filter dropdowns (Asset, Period, etc.) | (mockup had these as static pills; real impl needs interactivity) |
| `Popover` + `Command` | Run picker autocomplete on Compare tab | (mockup had hardcoded picks; real impl needs typeahead) |
| `Alert` | Empty states, error containers | — |
| `Separator` | Dividers between sections | — |
| `ScrollArea` | Long trade lists, decision list | — |
| `ToggleGroup` | Base for `RangeChips` | `.range-chips`, `.range-chip` |
| `Sonner` (toast) | WS connection state changes, retrain decision notifications | — |

#### Custom domain components (`src/components/dashboard/`)

Trading-specific composites built on top of shadcn primitives or from scratch where shadcn has no equivalent.

| Component | Built on | Notes / mockup class |
|---|---|---|
| `<Kpi label sub value>` | `Card` | The hero stat: 11px uppercase label, 26px mono value, 12px mono sub. `.kpi` |
| `<Stat label sub value>` | `Card` | The mid stat: 10px uppercase label, 18px mono value, 10px mono sub. `.stat` |
| `<KvRow keyLabel value>` | — | Two-column row: muted key on left, weight-500 value on right, 8px y padding, 1px bottom border. `.kv-row` |
| `<ModeBadge mode>` | shadcn `Badge` | Variants: `batch` (primary-soft), `holdout` (warning-soft), `live` (positive-soft), `decision` (primary-soft). Adds `text-{color}` on top of the soft background. `.mode-badge` |
| `<VerdictBadge code>` | shadcn `Badge` | Variants: `ok` (positive), `monitor` (warning), `retrain` (negative). `.verdict-badge` |
| `<TriggerChip outcome>` | shadcn `Badge` | Variants: `no_fire` (default neutral), `fire_soft` (warning-soft), `fire_hard` (negative-soft). `.trigger-chip` |
| `<SharpeBar value max>` | shadcn `Progress` | Inline flex: 60×4 track, filled bar in `positive` (or `negative` for Sharpe < 0.7), numeric value to the right. `.sharpe-bar` |
| `<RangeChips value onChange>` | shadcn `ToggleGroup` | 4-state selector for time ranges (7D / 30D / 90D / All). `.range-chips` |
| `<LiveIndicator status>` | — | Inline-flex pill with the breathing dot + status text. `.live-indicator` |
| `<LiveDot color>` | — | 7×7 circle with `box-shadow: 0 0 8px <color>` and `animation: pulse 2s ease-in-out infinite`. **The breathing glow is essential** — it's how the operator confirms the connection is alive without reading anything. `.live-dot` |
| `<RunPick variant="a"\|"b" run>` | shadcn `Card` | Compare tab's run selector. `variant="a"` gets `border-l-2 border-l-primary`; `variant="b"` gets `border-l-2 border-l-warning`. **The left-border color is the A/B visual identity** that carries through every chart on the page. `.run-pick` |
| `<CompareGrid>` | — | 3-col grid `1fr 80px 1fr` using CSS `display: contents` on row wrappers so each row's children become grid cells. The A column right-aligned with right border; label centered with both borders; B column left-aligned with left border. `.compare-grid` |
| `<VsDivider>` | — | Just the text "VS" in monospace, 12px, faint. `.vs` |
| `<VerdictBanner>` | shadcn `Alert` | Color-tinted banner for Compare tab's headline conclusion. `.verdict-banner` |
| `<DecisionCard>` | shadcn `Card` | Card with `head` (3-col grid `110px 1fr auto`, bottom border) and `body` (2-col grid `1fr 1fr`, 24px gap). `.decision-card` |
| `<ErrorBoundary>` | React class component | Per-section error containment. Renders an `Alert` on failure |
| `<EmptyState icon title description action>` | — | Used for "no reports match", "paper trader not running", etc. |
| `<PageHeader title meta>` | — | Title + meta line below; appears once per page above content |

#### Custom sections (`src/components/sections/`)

Each maps 1:1 to a `PerformanceReport` section. Built from the components above.

| Component | Renders data from | Uses |
|---|---|---|
| `<HeadlineKpis report>` | `headline` section | 4× `<Kpi>` in a `grid-cols-4 gap-3` layout |
| `<StatGrid report>` | `headline` section | 5× `<Stat>` in a `grid-cols-5 gap-2.5` layout |
| `<EquityChart series baselines range>` | `equity` section | `<BaseLineChart>` (Recharts) with `<RangeChips>` and manual `<ChartLegend>` |
| `<DrawdownChart series>` | `drawdown` section | `<BaseLineChart>` (Recharts) |
| `<HourOfDayChart series>` | `time_analysis.pnl_by_hour_utc` | `<BaseBarChart>` (Chart.js) |
| `<CostAttributionDonut>` | `attribution` section | Chart.js doughnut + legend |
| `<ForecastDiagnostics>` | `forecast` section + `/live/status.forecast_diagnostics` | Stack of `<KvRow>` |
| `<TradeTable trades summary>` | `trades` section | shadcn `Table` with custom row component |
| `<RiskEventFeed events>` | `risk_events` section | shadcn `ScrollArea` containing stack of custom rows |
| `<CompareHeadline diff>` | `/compare.headline_diff` | `<CompareGrid>` with rows of metric values |
| `<EquityOverlay a b>` | `/compare.equity_overlay` | `<BaseLineChart>` with two series + A/B legend |
| `<ReturnDistribution>` | `/compare.return_distribution_overlay` (v1.1) | Chart.js bar chart |
| `<ReportTable rows facets>` | `/reports` | shadcn `Table` with `<ModeBadge>`, `<SharpeBar>` in rows |
| `<DecisionList decisions>` | `/decisions` | Stack of `<DecisionCard>` |

#### Chart wrappers (`src/components/charts/`)

| Component | Wraps | Notes |
|---|---|---|
| `<BaseLineChart data series>` | Recharts `LineChart` | Reads theme colors via `useThemeColors()`; standard axis/grid/tooltip styling from `chart-theme.ts` |
| `<BaseBarChart data>` | Recharts `BarChart` or Chart.js depending on density | Recharts for ≤ 24 bars, Chart.js for histograms with > 24 bars |
| `<ChartLegend items>` | — | Manual legend rendering — Recharts/Chart.js native legends are disabled |
| `useThemeColors()` | hook | Subscribes to `next-themes`, re-reads CSS variables on theme change, returns `{ primary, positive, negative, warning, muted, grid }` |

#### Utility classes

| Tailwind class | Purpose |
|---|---|
| `font-mono` | Geist Mono with `font-feature-settings: "tnum" 1, "ss01" 1` (configured globally) |
| `text-muted-foreground` | Secondary text |
| `text-faint-foreground` | Tertiary text |
| `text-positive` / `text-negative` | Signed numerical values |
| `border-border` / `border-border-strong` | Default and strong borders |

### A.6 Motion policy

**Transitions allowed:**

| Where | Property | Duration |
|---|---|---|
| Tab button hover | `color, border-color` | 150ms |
| Theme toggle hover | `color, border-color` | 150ms (implicit) |
| Filter pill hover | `color` | 150ms (implicit) |
| Range chip hover | `all` | 150ms |
| Reports row hover | `background` | 100ms |
| Theme switch | (no transition — instant) | — |

**Animations allowed:**

| Element | Animation | Duration |
|---|---|---|
| `.live-dot` | `pulse` keyframe (opacity 1 → 0.5 → 1) | 2s ease-in-out infinite |

**Decorative motion disallowed** — no fade-in entrances, no counter rollups on KPI updates, no chart bar growth animations beyond the chart library's defaults. Updates must be instantaneous; a trader scanning a dashboard needs to trust that what they see is the current state, not "what's being animated toward."

### A.7 Layout shell

| Element | Spec |
|---|---|
| `<main>` | `max-width: 1480px; margin: 0 auto; padding: 20px 24px 60px;` |
| Top bar | `position: sticky; top: 0; z-index: 50; height: 52px; padding: 0 24px;` |
| Brand mark | `◐ perps_model` — the circle glyph is `◐` (U+25D0) colored `--green`. Not an icon font, just a Unicode character |
| Live indicator (top bar) | Always visible; updates color based on `useLiveStatus()` connection state — green when fresh, amber when lag > 30s, red when 503 |

### A.8 Page-by-page composition

Each tab is a composition of the primitives above arranged in the standard grids:

#### Live tab

```
PageHeader
KpiGrid: [Equity, Position, 24h P&L, Forecast]                  // kpi-grid (4 cols)
Card: EquityChart with RangeChips + Legend + DrawdownChart      // h-200 + h-80
StatGrid: [Sharpe, Max DD, Win Rate, Profit Factor, Time]       // stat-grid (5 cols)
Row-12: [HourOfDayChart, CostDonut + legend, ForecastKvRows]   // row-12
Row-equal-2: [RecentFillsTable, RiskEventsFeed]                 // row-equal-2
```

#### Reports tab

```
PageHeader
FilterBar: [Search, FilterPills..., spacer, FilterPills...]
ReportsTable: [head, ...ReportRows]
```

#### Reports detail (`/reports/:runId`)

```
PageHeader (same as Live)
KpiGrid (same as Live, populated from headline section)
Card: EquityChart with baselines + DrawdownChart
StatGrid
Row-12 (same composition)
Row-equal-2: [TradeTable, RiskEventsFeed]
```

#### Compare tab

```
PageHeader
CompareHeader: [RunPick A, VS, RunPick B]
VerdictBanner
Row-2: [EquityOverlay chart (h-300), CompareGrid headline metrics]
Row-equal-2: [DrawdownOverlay (h-200), ReturnDistribution (h-200)]
Card: StatisticalEvidence as KvRows
```

#### Decisions tab

```
PageHeader
FilterBar
DecisionCard[]:
  .head: [date, verdict-text, VerdictBadge]
  .body:
    Left:  TriggerList
    Right: DecisionStatsGrid (2×2)
```

### A.9 Pixel parity test

The success criterion for visual fidelity is enforced by Playwright screenshot tests:

- Test fixture loads `out/index.html` (Next.js static export output) against a mocked backend producing deterministic data
- Per-page screenshots taken at 1440×900 viewport in both themes
- Compared against checked-in reference screenshots generated from `perps_dashboard.html` rendered under identical conditions
- Allowable per-page pixel difference: 2% (`pixelmatch` threshold `0.02`)
- A higher per-page threshold (5%) is acceptable for charts only, since SVG line rendering is subpixel-sensitive across browsers and OS versions

If a screenshot diff fails, the resolution rule is: **the appendix above is canonical, not the mockup file.** If they ever disagree (e.g., the mockup has a one-off override the appendix doesn't capture), update the appendix and the implementation together; do not silently match the mockup.

---

## Appendix B — Changelog

**v2.0** — Switched stack from Vite + custom CSS Modules to **Next.js 15 (App Router, static export) + shadcn/ui + Tailwind CSS**. Rationale: ecosystem alignment, accessibility-by-default via Radix primitives underneath shadcn, reduced boilerplate for accessible components. Architecture, data flow, WebSocket strategy, success criteria, and visual design all unchanged. Updates:
- Stack table replaced with Next.js + shadcn/ui + Tailwind choices
- File structure rewritten around `app/` (App Router) and `src/components/{ui,dashboard,sections}`
- Theming section updated: Tailwind utilities backed by CSS variables, `next-themes` replaces Zustand theme store
- Routing section updated: Next.js App Router, `useUrlState` wrapper around `useSearchParams`
- Implementation Steps 1, 3, 4 updated for Next.js scaffold + shadcn primitive set
- Deployment updated: `pnpm build` → `out/` via `output: 'export'`
- Risk table extended with Next.js-specific concerns (`output: 'export'` constraints, App Router feature creep)
- Appendix A.1 variable names aligned to shadcn convention (`--background`, `--foreground` etc.); numeric values unchanged
- Appendix A.5 fully rewritten to split shadcn primitives vs custom domain components

**v1.1** — Added Appendix A (Design Tokens & Component Inventory) after audit found the v1 spec referenced the mockup but didn't capture the design contract. Corrected responsive breakpoint (1100px, not 1280px). Strengthened visual-fidelity success criterion to reference the appendix as canonical.

**v1** — Initial spec.