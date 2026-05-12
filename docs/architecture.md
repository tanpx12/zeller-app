# Architecture

## Overview

`perps-dashboard` is a single-page web dashboard for the `perps_model` trading system.
It visualizes live paper trading, persisted performance reports, side-by-side strategy
comparisons, and weekly retrain decisions — all by consuming the backend's read-only
HTTP API and WebSocket stream.

It is statically exported (`next build` with `output: 'export'`): the production
artifact is a directory of HTML/CSS/JS files in `out/`, served by the Rust backend via
`tower-http::ServeDir` or by any static HTTP server. There is no Node.js runtime in
production.

The deeper technical spec lives in [`tspec.md`](./tspec.md).

## Components

| Name | Purpose |
|------|---------|
| `app/` | Next.js App Router pages — `live/`, `reports/`, `reports/[runId]/`, `compare/`, `decisions/`, plus root `layout.tsx` with theme + Query + WS providers |
| `src/components/ui/` | shadcn-generated primitives. Copied into the repo via `pnpm dlx shadcn@latest add`; owned by the project, not pulled from npm |
| `src/components/dashboard/` | Trading-specific composites built on shadcn primitives: `Kpi`, `Stat`, `KvRow`, `SharpeBar`, `ModeBadge`, `VerdictBadge`, `TriggerChip`, `RunPick`, `LiveDot`, `RangeChips` |
| `src/components/sections/` | Section-level views mapping 1:1 to `PerformanceReport` sections: `HeadlineKpis`, `EquityChart`, `DrawdownChart`, `TradeTable`, `CostAttributionDonut`, etc. |
| `src/components/charts/` | Theme-aware Recharts + Chart.js wrappers, reading colors via a `useThemeColors()` hook |
| `src/hooks/` | TanStack Query bindings + the WebSocket subscription hook: `useReport`, `useReportList`, `useCompare`, `useLiveStatus`, `useLiveStream`, `useDecisions`, `useTriggers` |
| `src/lib/` | Cross-cutting utilities — `client.ts` (API client config), `ws-client.ts` (WebSocket manager), `format.ts`, `time.ts`, `colors.ts`, `utils.ts` (`cn()`) |
| `src/store/` | Zustand stores — `live` (WS connection + recent event buffer), `compare` (selected runs, mirrored from the URL) |
| `src/api-client/` | **Generated** typed client from the backend's OpenAPI spec — never edited by hand |
| `src/styles/` | `globals.css` with Tailwind directives, CSS variable tokens, font-face declarations |

## Data flow

Three update mechanisms run side-by-side, all reading from the same backend:

1. **Static reports** (Reports, Compare, Decisions tabs)
   TanStack Query fetches once and caches for 1 hour, honoring the backend's
   `Cache-Control: immutable`. Components render from cache; `<Skeleton>` covers the
   initial load.

2. **Live polling** (`GET /live/status` every 1s; report sections every 60s)
   `useLiveStatus()` powers the KPI strip and the live status indicator.
   `useReport("live")` (v1.1 API) or `useLiveSections()` (v1 API) refreshes report
   sections at the 60-second cadence at which bar updates can change them.

3. **WebSocket stream** (`WS /live/stream`)
   A single connection managed by `src/lib/ws-client.ts`. Components subscribe to the
   message types they care about (`fill`, `equity`, `risk_event`). The fills tape and
   risk events feed update in real time; the equity chart appends points between polls.

The three sources are **eventually consistent**. The polled endpoints are authoritative
when they disagree with the WebSocket stream — WS misses are recovered on the next poll.

## Key design decisions

- **Static export, no server.** No route handlers, Server Actions, or middleware — these
  silently fail under `output: 'export'`. If a feature seems to need a server, the answer
  is a CLI command on the Rust side.
- **Read-only by architectural commitment.** No write endpoints in the client, ever.
  If write-from-dashboard ever becomes a real requirement, it's a v2 with a new threat model.
- **Generated API client is the single source of truth for types.** Hand-written
  request/response interfaces are forbidden. Type drift surfaces as a TypeScript
  compile error, not a runtime 404, because of the codegen-check in CI.
- **Server state in TanStack Query. Client state in Zustand or the URL. Never React
  Context for app state.**
- **URL is source of truth for filter/selection state** — query parameters are link-
  shareable and the back button stays useful.
- **CSS-variable theme tokens, mapped to Tailwind utilities.** Charts read raw values
  via `getComputedStyle()` where the library can't consume CSS vars (Chart.js).
- **UTC end-to-end.** Backend is UTC, dashboard is UTC. All time goes through
  `src/lib/time.ts` or is formatted with explicit `{ timeZone: 'UTC' }`.

## Dependencies

| Dependency | Why |
|------------|-----|
| `next` + `react` + `react-dom` | Framework + static export pipeline |
| `tailwindcss` + `@tailwindcss/postcss` | Utility-first styling, CSS variable theme |
| `next-themes` | Theme switching, persistence, SSR-safe |
| `@tanstack/react-query` | Server-state cache, retries, stale-while-revalidate |
| `zustand` | Minimal client state (WS connection + cross-route runtime data) |
| `recharts` | Line / area charts (equity, drawdown, IC over time) |
| `chart.js` + `react-chartjs-2` | Bar, donut, histogram (where Recharts is weak) |
| `sonner` | Toast notifications for WS connection state |
| `date-fns` + `date-fns-tz` | UTC-first time formatting |
| `lucide-react` | Icon set used by shadcn |
| `openapi-typescript-codegen` | Generates `src/api-client/` from `openapi.json` |
| `vitest` + `@testing-library/react` | Unit + component tests |
| `@playwright/test` | End-to-end tests including WebSocket reconnect scenarios |

## External integrations

| Service | Purpose |
|---------|---------|
| perps_model HTTP API | All data — reports, live state, decisions, comparisons. Base URL via `NEXT_PUBLIC_API_BASE` |
| perps_model WebSocket | `WS /api/v1/live/stream` — push-based live updates. Base URL via `NEXT_PUBLIC_WS_BASE` |

The dashboard talks to nothing else. No Hyperliquid calls, no third-party auth, no
remote analytics. The only runtime network egress is the one configured base URL.

## Known limitations

- **No authentication.** The dashboard exposes no credentials and the API has none.
  If auth ever lands, it terminates at a reverse proxy in front of the backend, not in
  the dashboard.
- **No persistent client storage for server data.** Zustand stores are in-memory and
  reset on reload by design. `next-themes` uses `localStorage` for theme preference only.
- **No image optimization.** Static export disables `next/image`; the dashboard has
  almost no images, so this is acceptable.
- **Single charting library family only.** Recharts + Chart.js. Adding a third would
  force contributors to learn three APIs for no incremental capability.
