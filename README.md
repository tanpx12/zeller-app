# perps-dashboard

> A single-page web dashboard for the perps_model trading system — visualizes live paper trading, persisted reports, side-by-side strategy comparisons, and weekly retrain decisions through the backend's read-only HTTP API.

---

## Stack

- **Language:** TypeScript 5 (strict mode)
- **Framework:** Next.js 15 (App Router) with `output: 'export'` — fully static build, no Node.js runtime in production
- **UI primitives:** shadcn/ui (Radix UI underneath) — copy-paste registry, components live in the repo
- **Styling:** Tailwind CSS 4 with CSS variables for theming
- **Runtime:** Node.js 20 at build time; modern evergreen browsers at runtime
- **Package manager:** pnpm

### Key dependencies

- `next` + `react` + `react-dom` — framework
- `tailwindcss` + `@tailwindcss/postcss` — utility-first styling
- `next-themes` — theme switching, persistence, SSR-safe
- `@tanstack/react-query` — server-state cache, retries, stale-while-revalidate
- `zustand` — minimal client state for WS connection + cross-route runtime data
- `recharts` — line/area charts (equity curves, drawdown, IC over time)
- `chart.js` + `react-chartjs-2` — bar charts, donuts, histograms (where Recharts is weak)
- `sonner` — toast notifications for WS connection state (via shadcn)
- `date-fns` + `date-fns-tz` — UTC-first time formatting
- `lucide-react` — icon set used by shadcn
- `vitest` + `@testing-library/react` — unit and component tests
- `@playwright/test` — end-to-end tests, including WebSocket reconnect scenarios
- `openapi-typescript-codegen` — generates the API client from the backend's `openapi.json`

shadcn/ui components are **not a runtime dependency** — they're added via `pnpm dlx shadcn@latest add <name>` which copies source files into `src/components/ui/`. You own them.

---

## Project type

**Type:** web-app

Single-page application, static build via `next build` with `output: 'export'`. The compiled `out/` directory is served either by the Rust backend (via `tower-http::ServeDir`) or by any static HTTP server. No Node.js runtime in production.

---

## Architecture

### Components

| Name | Purpose |
|------|---------|
| `app/` | Next.js App Router pages — `live/`, `reports/`, `reports/[runId]/`, `compare/`, `decisions/`, plus `layout.tsx` (root layout with providers) |
| `src/components/ui/` | **shadcn-generated primitives** — `Button`, `Card`, `Badge`, `Input`, `Table`, `Tabs`, `Skeleton`, `Progress`, `ScrollArea`, etc. Copied via `pnpm dlx shadcn@latest add`; you own and can modify them |
| `src/components/dashboard/` | Trading-specific composites built on shadcn primitives — `Kpi`, `Stat`, `KvRow`, `SharpeBar`, `ModeBadge`, `VerdictBadge`, `TriggerChip`, `RunPick`, `LiveDot`, `RangeChips` |
| `src/components/sections/` | Section-level views that map 1:1 to `PerformanceReport` sections — `HeadlineKpis`, `EquityChart`, `DrawdownChart`, `TradeTable`, `CostAttributionDonut`, etc. |
| `src/components/charts/` | Theme-aware Recharts and Chart.js wrappers reading colors via the `useThemeColors()` hook |
| `src/hooks/` | TanStack Query bindings + the WebSocket subscription hook — `useReport`, `useReportList`, `useCompare`, `useLiveStatus`, `useLiveStream`, `useDecisions`, `useTriggers` |
| `src/lib/` | Cross-cutting utilities — `client.ts` (API client config), `ws-client.ts` (WebSocket manager), `format.ts` (money/percent), `time.ts` (UTC formatting), `colors.ts` (semantic helpers), `utils.ts` (shadcn's `cn()` for class composition) |
| `src/store/` | Zustand stores — `live` (WS connection state + recent event buffer), `compare` (selected runs A/B mirrored from URL) |
| `src/api-client/` | **Generated** typed client from the backend's OpenAPI spec — never edited by hand |
| `src/styles/` | `globals.css` with Tailwind directives, CSS variable tokens, font-face declarations |

### Data flow

The dashboard is a thin layer over the backend's read-only API. There are three update mechanisms in play:

1. **Static reports** (Reports, Compare, Decisions tabs) — TanStack Query fetches once, caches for 1 hour per the backend's `Cache-Control: immutable` headers. Section components render from cached data with `<Skeleton>` during initial load.
2. **Live polling** — `useLiveStatus()` polls `GET /live/status` every 1 second; powers the KPI strip and the live status indicator. `useReport("live")` (v1.1 API) or `useLiveSections()` (v1 API) fetches report sections at the 60-second cadence at which bar updates can change them.
3. **WebSocket stream** — single connection to `WS /live/stream` managed by `src/lib/ws-client.ts`. Components subscribe to message types they care about (`fill`, `equity`, `risk_event`). The Live tab's fills tape and risk events feed update in real time; the equity chart appends new points between 60-second polls.

The three sources are eventually consistent. WebSocket misses are recovered on the next poll — the polled endpoints are authoritative whenever they disagree with the WS stream.

### External integrations

| Service | Purpose |
|---------|---------|
| perps_model HTTP API | All data — reports, live state, decisions, comparisons. Base URL configured via `NEXT_PUBLIC_API_BASE` |
| perps_model WebSocket | `WS /api/v1/live/stream` — push-based live updates, base URL via `NEXT_PUBLIC_WS_BASE` |

The dashboard talks to nothing else. It does not call Hyperliquid directly, does not authenticate against any third-party service, does not load remote analytics. The only network egress at runtime is the one configured base URL.

---

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE` | Backend API base URL; inlined at build time | `http://127.0.0.1:8787/api/v1` |
| `NEXT_PUBLIC_WS_BASE` | Backend WebSocket base URL | `ws://127.0.0.1:8787/api/v1` |
| `NEXT_PUBLIC_BUILD_SHA` | Build-time git SHA for the `/about` debug page (optional) | `a3f2c1d` |

All variables are `NEXT_PUBLIC_*` prefixed because Next.js only inlines those into the client bundle; this is the build-time boundary. No secrets — the API has no authentication and the dashboard exposes no credentials.

A `.env.local` file in the dashboard root works for development:

```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787/api/v1
NEXT_PUBLIC_WS_BASE=ws://127.0.0.1:8787/api/v1
```

---

## Dev commands

```bash
# Install dependencies (one-time, or after package.json changes)
pnpm install

# Initialize shadcn (one-time during scaffold)
pnpm dlx shadcn@latest init

# Add a shadcn component into src/components/ui/
pnpm dlx shadcn@latest add button card badge input progress skeleton table tabs

# Run dev server with HMR on http://localhost:3000
pnpm dev

# Regenerate the API client from the running backend's OpenAPI spec
# REQUIRED before any other dev command if the backend's API has changed
pnpm codegen

# Type-check the entire codebase
pnpm typecheck

# Run unit tests in watch mode
pnpm test
# OR one-shot
pnpm test --run

# Run end-to-end tests (requires backend + paper_trade running for live tests)
pnpm test:e2e
pnpm test:e2e --ui          # opens Playwright's interactive runner

# Lint
pnpm lint

# Format
pnpm format

# Production build → ./out/  (Next.js static export, output: 'export')
pnpm build

# Verify generated client is in sync with spec (used in CI)
pnpm codegen && git diff --exit-code src/api-client/
```

---

## Conventions

- **The generated API client is the source of truth for types.** Never hand-write request or response interfaces — import them from `@/api-client/models/`. If a type is wrong, the spec is wrong; fix it in the backend and regenerate.
- **Pages never call `fetch` directly.** Always go through a hook in `src/hooks/`, which goes through the generated client. This is what makes the codegen-check meaningful — drift surfaces as a TypeScript error, not a runtime 404.
- **Server state lives in TanStack Query. Client state lives in Zustand or the URL.** No React Context for app state. No `useReducer` for things multiple components need to read.
- **URL is the source of truth for filter and selection state.** Filters on `/reports`, the selected runs on `/compare`, the range chip on a chart — all live in query parameters. This makes URLs link-shareable and the back button useful. Use Next.js's `useSearchParams()` + `useRouter().replace()` pattern.
- **Default to Server Components.** Add `"use client"` only when the component uses state, effects, browser APIs, or interactivity. Page roots that fetch data go through TanStack Query, which requires `"use client"`; section-level static components stay server-rendered.
- **All numbers render via `lib/format.ts`** with `Intl.NumberFormat` and explicit precision. No `value.toFixed(2)` scattered around the codebase. No `.toLocaleString()` without an explicit `timeZone: 'UTC'`.
- **All numeric text uses `font-mono`** (Tailwind class), which maps to Geist Mono with `font-feature-settings: "tnum" 1, "ss01" 1` configured globally. Columns of P&L values align by decimal position. Non-negotiable for a trading dashboard.
- **Theme tokens are CSS variables, mapped to Tailwind utilities.** `bg-background`, `text-foreground`, `text-positive`, `text-negative` resolve to the right value in both themes. Charts read raw values via `getComputedStyle()` at render time for libraries that can't read CSS vars (Chart.js).
- **shadcn components are checked into the repo, not imported from a package.** Modifications are allowed but should be intentional — they live in git so future `shadcn add` updates can be merged manually.
- **Every chart and table is wrapped in an error boundary.** A 404 on `/reports/{id}/trades` should fail the Trades section, not the entire page. Use `next/error` or a custom `<ErrorBoundary>` from `src/components/dashboard/`.
- **Functional components and hooks only.** No class components except where required (custom error boundaries).
- **Strict TypeScript.** Zero `any` in the codebase. `unknown` + narrowing if you genuinely don't know the type.
- **Route-level code splitting is automatic.** Each route under `app/` is its own chunk via Next.js's default behavior. The CI bundle-size report fails the build if any chunk exceeds 100 KB gzipped.

## Things to avoid

- **Never edit files in `src/api-client/`.** They are regenerated on every `pnpm codegen` and on every CI build. Hand-edits will be silently lost. If you need custom behavior, wrap the client in `src/lib/client.ts`.
- **Never put filter or selection state in `useState`.** It belongs in the URL via `useSearchParams()`. This isn't pedantry — local state breaks refresh, sharing, and the back button all at once.
- **Never use `Date.now().toLocaleString()` or any locale-default time formatting.** Always pass `{ timeZone: 'UTC' }` or use the wrappers in `src/lib/time.ts`. The backend is UTC-only; the dashboard is UTC-only; deviating leaks user-locale into time-series comparisons.
- **Never use server-only features.** No route handlers (`route.ts`), no Server Actions, no middleware. The dashboard is statically exported via `output: 'export'`; these would silently fail the build. If a feature seems to need a server, the answer is a CLI command on the Rust side, not a Next.js route handler.
- **Never use `next/image` for runtime sources.** Static export disables Next.js image optimization. The config sets `images: { unoptimized: true }`; use plain `<img>` for any non-trivial image (the dashboard has almost none).
- **Never introduce a third charting library.** Recharts + Chart.js already cover every chart type the dashboard needs. Adding a third means contributors must learn three APIs.
- **Never call `fetch` directly from a component.** Even for a "quick experiment." Use a hook, which uses the generated client. This rule is what makes the API contract enforceable.
- **Never use `localStorage` for server data.** `next-themes` uses it for theme preference (correct). The `compare` and `live` Zustand stores are in-memory only and reset on page reload — by design.
- **Never disable an ErrorBoundary because something is "edge-case unlikely."** The dashboard runs against a backend that can be killed, restarted, or have its model swapped at any time. Every section needs to fail gracefully.
- **Never add a write endpoint client method, even if the backend grows one.** The dashboard is read-only by architectural commitment. Changes happen via the Rust CLI binaries run by a human. If write-from-dashboard ever becomes a real requirement, that's a v2 with a new threat model.
- **Never embed credentials, API keys, or tokens in `NEXT_PUBLIC_*` variables.** Anything prefixed `NEXT_PUBLIC_` ships to the client. The current API has no auth so this is academic — but if it ever does, auth happens at a reverse proxy in front of the backend, not in the dashboard.
- **Never `npm install` instead of `pnpm install`.** The lockfile format is incompatible; you'll get phantom dependencies and slower installs.

---

## Contributing

1. Branch off `main`: `git checkout -b feat/your-feature`
2. Run `pnpm codegen` if you've pulled changes that touch the backend API
3. Commit atomically using `/checkpoint`
4. Open a PR — CI must pass: lint + typecheck + unit + e2e + codegen-check + bundle-budget

## License

MIT