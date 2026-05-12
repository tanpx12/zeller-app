# perps_model dashboard — Implementation Plan (v1)

This is the operational playbook for building the dashboard described in `dashboard_spec.md` (v2.0). It atomizes the spec's seven phases into concrete tasks (~2–4 hours each) with explicit Definition of Done per task and an acceptance gate per phase. A single experienced React/Next.js developer should clear this in **8–10 days**; double for less experienced.

The spec is the contract (what + why). This document is the schedule (in what order + how to know you're done).

---

## How to use this plan

**Each task has:**

- **Goal** — one sentence
- **Output** — concrete file paths, commands, or state changes
- **DoD** — a testable condition that ends the task
- **Est.** — hours of focused work
- **Notes** — gotchas, optional decisions, deferrals

**Each phase ends in an acceptance gate** — a small checklist that must pass before starting the next phase. Don't accumulate "I'll fix it later" — fix it now or it becomes Phase 7's problem at 3× the cost.

**Order matters but not absolutely.** Phases 3–5 (Reports → Compare → Decisions) build on the same primitives in similar ways; if blocked, you can swap their order. Phase 6 (Live + WebSocket) must come after Phase 3 because Live reuses the Reports section components.

**The dashboard is shippable after Phase 3.** If your primary use case is reviewing backtest reports, that's a working product. Phases 4–7 are additive. Worth knowing if you need to ship something quickly.

---

## Pre-flight (before any phase)

Confirm before starting:

- [ ] Rust backend builds and runs (`cargo run --release --bin serve`)
- [ ] Backend `/api/v1/health` returns 200 from `curl http://127.0.0.1:8787/api/v1/health`
- [ ] Backend `/api/v1/openapi.json` returns a valid OpenAPI 3.1 spec
- [ ] At least one persisted report exists in the report store (run a small backtest if not)
- [ ] Node.js 20+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] You've read `dashboard_spec.md` Appendix A end-to-end — it's the pixel-parity contract

If any of these fail, fix them before starting Phase 1.

---

## Phase 1 — Project scaffold (Day 1, ~6 hours)

The goal is to end Day 1 with a project that builds, lints, type-checks, has the right runtime dependencies installed, and renders an empty Next.js page with the theme provider wired up. No design work yet — just plumbing.

| Task | Goal                                          | Est. |
| ---- | --------------------------------------------- | ---- |
| 1.1  | Scaffold Next.js + Tailwind                   | 1h   |
| 1.2  | shadcn init + base primitive install          | 1h   |
| 1.3  | Add runtime libraries                         | 1h   |
| 1.4  | Configure scripts, lint, format, test runners | 1.5h |
| 1.5  | Set up CI baseline                            | 1.5h |

### 1.1 Scaffold Next.js + Tailwind

**Output:** new `dashboard/` directory with Next.js 15 + App Router + Tailwind v4 + TypeScript strict mode.

```bash
pnpm dlx create-next-app@latest dashboard \
  --typescript --tailwind --app --src-dir \
  --import-alias '@/*' --use-pnpm --no-eslint
cd dashboard
```

Then edit `tsconfig.json` to enable `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noUnusedLocals": true`.

Edit `next.config.ts`:

```ts
import type { NextConfig } from 'next'
export default {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
} satisfies NextConfig
```

**DoD:** `pnpm build` produces an `out/` directory; `pnpm dev` serves an empty page at `localhost:3000`; `pnpm tsc --noEmit` exits cleanly.

### 1.2 shadcn init + base primitive install

**Output:** `components.json`, `src/components/ui/` directory with the primitive components the dashboard needs.

```bash
pnpm dlx shadcn@latest init
# Choose: New York style, Neutral base color, CSS variables (yes)

pnpm dlx shadcn@latest add \
  button card badge input progress skeleton table tabs tooltip \
  dropdown-menu popover command alert separator scroll-area \
  toggle-group sonner sheet
```

**DoD:** `src/components/ui/` contains ~18 component files; `import { Button } from '@/components/ui/button'` resolves in a quick smoke test.

**Notes:** The full shadcn list above is the v2.0 inventory. If a future component is needed, add it on demand with `pnpm dlx shadcn@latest add <name>`. Don't bulk-install speculative components — they accumulate and rot.

### 1.3 Add runtime libraries

**Output:** updated `package.json` with the dependency set from `dashboard_README.md`.

```bash
pnpm add @tanstack/react-query@^5 zustand@^5 next-themes \
        recharts@^2 chart.js@^4 react-chartjs-2@^5 \
        date-fns date-fns-tz \
        lucide-react

pnpm add -D @playwright/test vitest @testing-library/react \
            @testing-library/jest-dom jsdom \
            openapi-typescript-codegen \
            prettier eslint-config-prettier
```

**DoD:** `pnpm install` exits cleanly; `pnpm ls --depth=0` shows the expected versions.

### 1.4 Configure scripts, lint, format, test runners

**Output:**

- `package.json` scripts: `dev`, `build`, `start`, `lint`, `format`, `typecheck`, `test`, `test:e2e`, `codegen`
- `.prettierrc.json` with 2-space indent, single quotes, no semicolons
- `vitest.config.ts` with `jsdom` environment + `@/` alias
- `playwright.config.ts` with one Chromium project, baseURL `http://localhost:3000`
- `.gitignore` adds `out/`, `playwright-report/`, `test-results/`, `.env.local`

**DoD:** `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm test --run`, `pnpm test:e2e --list` all execute without errors (even if there are no tests yet).

### 1.5 Set up CI baseline

**Output:** `.github/workflows/ci.yml` (or equivalent) running on every PR:

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm test --run`
5. `pnpm build`
6. Bundle-size check (Next.js's own output report or `@next/bundle-analyzer`); fail if main route > 250 KB gzipped

**DoD:** CI passes on `main` with the empty scaffold; failing any of typecheck/lint/test/build/bundle-budget causes a red status.

**Notes:** The codegen-check (`pnpm codegen && git diff --exit-code src/api-client/`) and Playwright E2E tests are added in later phases — this baseline is just to catch regressions in the basics.

### Phase 1 acceptance gate

- [ ] `pnpm build` produces a static `out/` directory
- [ ] `pnpm dev` runs without errors
- [ ] TypeScript strict mode is on, zero `any` in the codebase
- [ ] shadcn primitives importable from `@/components/ui/*`
- [ ] CI passes on `main`

---

## Phase 2 — Foundation (Days 2–3, ~12 hours)

This is where the dashboard starts to look like itself. By end of Phase 2 you'll have: a working API client generated from the backend, the design tokens applied (matching the mockup), the trading-specific primitives built, and the layout shell with working tab navigation and theme toggle. No data flowing yet — but everything is ready to be wired up in Phase 3.

| Task | Goal                                                   | Est. |
| ---- | ------------------------------------------------------ | ---- |
| 2.1  | Codegen API client + smoke test                        | 2h   |
| 2.2  | Design tokens → Tailwind config                        | 2h   |
| 2.3  | Trading primitives (Kpi, Stat, KvRow, SharpeBar, etc.) | 3h   |
| 2.4  | Layout shell (TopBar, theme toggle, providers)         | 3h   |
| 2.5  | Dev-only `/dev` showcase route                         | 2h   |

### 2.1 Codegen API client + smoke test

**Output:** `src/api-client/` (committed) with generated services and models; `src/lib/client.ts` wrapping it with base URL config.

```bash
# scripts/codegen.sh
curl -sS http://127.0.0.1:8787/api/v1/openapi.json > openapi.json
pnpm dlx openapi-typescript-codegen \
  --input openapi.json \
  --output src/api-client \
  --client fetch \
  --useUnionTypes \
  --useOptions \
  --exportSchemas false
```

Add to `package.json`:

```json
"codegen": "bash scripts/codegen.sh"
```

**`src/lib/client.ts`:**

```ts
import { OpenAPI } from '@/api-client'
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8787/api/v1'
```

**Smoke test:** create `src/app/page.tsx` that fetches `/health` via the generated `MetaService.getHealth()` and renders the version string.

**DoD:** loading `/` shows the backend version + uptime; CI's codegen-check step runs `pnpm codegen && git diff --exit-code src/api-client/` and passes.

**Notes:** The generated `src/api-client/` is committed deliberately. CI verifies it matches a fresh regen; this means developers don't need the backend running to compile and type-check.

### 2.2 Design tokens → Tailwind config

**Output:** `src/styles/tokens.css` with the 17 CSS variables × 2 themes from spec Appendix A.1; `tailwind.config.ts` mapping them to utility class names (`bg-background`, `text-foreground`, `text-positive`, etc.).

Geist Sans + Geist Mono loaded via `next/font/google` in `app/layout.tsx`. Tabular numerals + ss01 stylistic set configured via `font-feature-settings` in a global `.font-mono` rule.

**DoD:** A dev page using utility classes `bg-background text-foreground font-mono` renders correctly in both themes; theme toggle (manual test) re-paints everything; tabular numerals visibly align in a column of `12.34` / `1234.56` / `0.01`.

**Notes:** Spec A.1 has the exact token values — copy verbatim, don't paraphrase. If you find yourself "improving" a token value during this step, stop: the tokens are the contract.

### 2.3 Trading primitives

**Output:** `src/components/dashboard/` directory with the trading-specific composites:

- `Kpi.tsx` — 26px mono value, 11px uppercase label, 12px mono sub
- `Stat.tsx` — 18px mono value, 10px uppercase label, 10px mono sub
- `KvRow.tsx` — flex row with muted key + weight-500 value, 1px bottom border
- `ModeBadge.tsx` — extends shadcn `Badge`, 4 variants (`batch`/`holdout`/`live`/`decision`) with color-soft backgrounds
- `VerdictBadge.tsx` — extends shadcn `Badge`, 3 variants (`ok`/`monitor`/`retrain`)
- `TriggerChip.tsx` — 3 variants (`no_fire`/`fire_soft`/`fire_hard`)
- `SharpeBar.tsx` — extends shadcn `Progress` with inline numeric value, red below 0.7
- `RangeChips.tsx` — wraps shadcn `ToggleGroup` for 7D/30D/90D/All
- `LiveDot.tsx` — 7×7 circle with `pulse` keyframe and `box-shadow` glow
- `RunPick.tsx` — `variant="a" | "b"` with left-border accent
- `PageHeader.tsx` — title + meta line

**DoD:** Each primitive has a `*.test.tsx` snapshot test (Vitest + React Testing Library) verifying it renders without crashing and exposes its prop interface correctly.

**Notes:** Keep these dumb. Pure presentational components, no data-fetching, no business logic. Section-level components (Phase 3+) compose primitives with hooks.

### 2.4 Layout shell

**Output:**

- `src/app/layout.tsx` — root layout with `<ThemeProvider>` (next-themes), `<QueryClientProvider>` (TanStack Query), and `<Toaster />` (sonner)
- `src/components/dashboard/TopBar.tsx` — sticky 52px top bar with brand mark (`◐ perps_model`), four tab buttons, `LiveStatusPill`, theme toggle
- `src/components/dashboard/LiveStatusPill.tsx` — shows green dot + "BTC · 1h · last bar HH:MM UTC" when healthy; amber when lagging; red when 503 (driven by `useLiveStatus` once that exists; for now, hardcode green)
- `src/components/dashboard/ThemeToggle.tsx` — uses `useTheme()` from next-themes; renders "light" / "dark" text label per current theme

**DoD:** Clicking tabs navigates between four empty routes (`/live`, `/reports`, `/compare`, `/decisions`); theme toggle persists across page reloads (via next-themes' localStorage); the sticky top bar stays visible on scroll.

### 2.5 Dev-only `/dev` showcase route

**Output:** `src/app/dev/page.tsx` rendering every primitive in both themes, with sample data. Gated behind `process.env.NODE_ENV === 'development'` — returns 404 in production builds.

**DoD:** Loading `/dev` shows a single page with all primitives visible at once, in both themes; serves as the visual reference during Phases 3–6 development.

**Notes:** This replaces what would otherwise be Storybook. It's lightweight, doesn't add tooling, and you can screenshot it for visual regression baselines later. Spec calls this pattern out explicitly — don't reach for Storybook.

### Phase 2 acceptance gate

- [ ] `pnpm codegen` regenerates `src/api-client/` deterministically (committed and verifiable in CI)
- [ ] Loading `/` shows backend version (proves end-to-end data path works)
- [ ] All trading primitives render correctly in both themes on `/dev`
- [ ] Tab navigation works; theme toggle persists
- [ ] Every primitive has a snapshot test passing in `pnpm test`

---

## Phase 3 — Reports tab (Days 4–5, ~14 hours) → **Shippable milestone**

Phase 3 is where the dashboard becomes useful. Reports tab is built first because it exercises the full data path (list endpoint, detail endpoint, all section types, all chart types) without WebSocket complexity. By end of Phase 3, you have a working backtest-review dashboard.

| Task | Goal                                                        | Est. |
| ---- | ----------------------------------------------------------- | ---- |
| 3.1  | `useReportList` hook + ReportTable                          | 3h   |
| 3.2  | Filters + URL state sync + cursor pagination                | 2h   |
| 3.3  | Report detail route + headline/stat sections                | 2h   |
| 3.4  | TradeTable + RiskEventFeed                                  | 2h   |
| 3.5  | Chart wrappers (BaseLineChart, BaseBarChart)                | 2h   |
| 3.6  | EquityChart + DrawdownChart + RangeChips                    | 2h   |
| 3.7  | HourOfDayChart + CostAttributionDonut + ForecastDiagnostics | 1h   |

### 3.1 useReportList hook + ReportTable

**Output:**

- `src/hooks/useReportList.ts` — wraps `ReportsService.getReports({ mode, asset, since, ... })` with TanStack Query
- `src/components/sections/ReportTable.tsx` — renders rows with `ModeBadge`, period, `SharpeBar`, max DD, trade count, status
- `src/app/reports/page.tsx` — wires it together

**DoD:** Visiting `/reports` shows a table of real reports from the backend; clicking a row navigates to `/reports/[runId]` (which is empty for now).

### 3.2 Filters + URL state sync + cursor pagination

**Output:**

- Filter pills using shadcn `Button` variants with `count` from `facets.by_mode` (v1.1) or fallback unfiltered counts (v1)
- Asset, period, min Sharpe pickers using shadcn `Popover` + `Command`
- All filter state in URL via Next.js `useSearchParams()` + `router.replace()`
- "Load more" button at the bottom that uses cursor pagination

**DoD:** Refreshing the page preserves all active filters; back/forward buttons work; "load more" appends rows without losing scroll position.

**Decision callout:** the `facets` field is v1.1-only. If your backend is still on v1, the filter pills show without counts. Hide the count badges entirely or show a `?` — your call.

### 3.3 Report detail route + headline/stat sections

**Output:**

- `src/app/reports/[runId]/page.tsx` route
- `src/hooks/useReportHeadline.ts`
- `src/components/sections/HeadlineKpis.tsx` — 4-column grid of `<Kpi>` populated from headline
- `src/components/sections/StatGrid.tsx` — 5-column grid of `<Stat>` populated from headline + drawdown sections

**DoD:** Visiting `/reports/<real-run-id>` shows the KPI strip and stat grid filled with real data; loading state shows skeletons; 404 shows a clean error page.

### 3.4 TradeTable + RiskEventFeed

**Output:**

- `src/hooks/useReportTrades.ts` with filter params (since, until, pnl_min, pnl_max, side)
- `src/hooks/useReportRiskEvents.ts`
- `TradeTable` using shadcn `Table` with custom row using `font-mono`, positive/negative coloring
- `RiskEventFeed` using shadcn `ScrollArea` containing a stack of `RiskEventRow`

**DoD:** Both sections render real data; Trade table summary stats (avg win, avg loss, largest win/loss) display correctly; Risk Event Feed scrolls smoothly.

### 3.5 Chart wrappers

**Output:**

- `src/components/charts/BaseLineChart.tsx` — Recharts `LineChart` wrapper reading colors from `useThemeColors()` hook
- `src/components/charts/BaseBarChart.tsx` — Recharts `BarChart` (24 bars or fewer) or Chart.js (histograms)
- `src/components/charts/useThemeColors.ts` — subscribes to next-themes, re-reads CSS variables on theme change
- `src/components/charts/chart-theme.ts` — standard axis/grid/tooltip styling constants

**DoD:** A dev-only chart on `/dev` renders correctly in both themes; toggling theme re-paints chart colors within one frame.

**Notes:** The `useThemeColors` hook is the integration point — Chart.js can't read CSS variables, so this hook handles `getComputedStyle()` + a re-render trigger on theme change.

### 3.6 EquityChart + DrawdownChart + RangeChips

**Output:**

- `src/hooks/useReportEquity.ts` and `useReportDrawdown.ts` with `since`/`until`/`downsample` query params
- `EquityChart` overlays model + buy-and-hold + momentum baselines (three series)
- `DrawdownChart` filled area below zero, red color
- `RangeChips` wired to URL query param `range=7d|30d|90d|all` — drives `since` on both charts

**DoD:** Equity chart shows three series with correct legends; drawdown chart sits below it with shared x-axis; clicking range chips updates both charts; URL updates accordingly.

### 3.7 Remaining sections

**Output:**

- `HourOfDayChart` — Chart.js bar chart of `pnl_by_hour_utc`, colored by sign
- `CostAttributionDonut` — Chart.js doughnut with three slices (fees, slippage, funding) + legend below
- `ForecastDiagnostics` — stack of `KvRow` from `useReportForecast`

**DoD:** All three sections render; hour-of-day chart shows positive bars green, negative bars red; donut center is transparent (68% cutout) per the mockup.

### Phase 3 acceptance gate

- [ ] `/reports` lists every persisted report from the backend
- [ ] Clicking any report opens its detail page with all 8 sections rendering correctly
- [ ] Refreshing any route preserves filters and selection state via URL
- [ ] Theme toggle updates every chart correctly
- [ ] No section blanks the page on error — `<ErrorBoundary>` catches each independently

**At this point, the dashboard is shippable as a backtest-review tool.** Stop here if that's your primary need; otherwise proceed.

---

## Phase 4 — Compare tab (Day 6, ~6 hours)

| Task | Goal                                                 | Est. |
| ---- | ---------------------------------------------------- | ---- |
| 4.1  | `useCompare` hook + 409 handling                     | 1h   |
| 4.2  | Run pickers (search + selection)                     | 2h   |
| 4.3  | CompareGrid (A \| label \| B headline diff)          | 1h   |
| 4.4  | EquityOverlay + DrawdownOverlay + ReturnDistribution | 1.5h |
| 4.5  | Statistical evidence card + verdict banner           | 0.5h |

### 4.1 useCompare + 409 handling

**Output:** `src/hooks/useCompare.ts`; `<RunPeriodMismatch>` component shown when API returns 409 `report-period-mismatch`.

**DoD:** Hitting `/compare?a=X&b=Y` with two valid runs renders data; with two runs that don't overlap, shows the clean mismatch UI rather than a generic error.

### 4.2 Run pickers

**Output:**

- shadcn `Command` (combobox) inside each `RunPick` for search
- `useReportSearch` hook (v1.1) or `useReportList` fallback (v1)
- Selected run IDs synced to URL query params (`?a=...&b=...`)
- A/B accent colors (blue/amber border-left) per spec A.5

**DoD:** Typing in either picker shows matching runs; selecting updates the URL; pasting a `/compare?a=...&b=...` URL pre-fills both pickers.

**Decision callout:** v1.1's `/reports/search` is purpose-built for this UI. v1 requires using `/reports` list endpoint with text-match in the client. Performance difference is meaningful at 100+ reports. If you can't adopt v1.1, accept the latency.

### 4.3 CompareGrid

**Output:** `src/components/sections/CompareGrid.tsx` using CSS Grid `display: contents` per spec A.5 — A column right-aligned, label centered between borders, B column left-aligned.

**DoD:** Headline metrics render in `A | label | B` rows; deltas in the label cell show `+`/`-` correctly.

**Notes:** `display: contents` is the load-bearing CSS trick here. Don't refactor to nested grids — they break the row borders.

### 4.4 Overlay charts

**Output:**

- `EquityOverlay` — `<BaseLineChart>` with two series (A blue, B amber)
- `DrawdownOverlay` — two filled area series, semi-transparent
- `ReturnDistribution` — Chart.js grouped bar chart from `return_distribution_overlay` (v1.1)

**DoD:** All three charts render with the correct A/B colors matching the run picker accents.

**Notes:** Return distribution is v1.1-only. If on v1, hide the section entirely (don't show "missing data" UI — it's not missing, it's not available, which is a different thing).

### 4.5 Statistical evidence + verdict banner

**Output:**

- `VerdictBanner` at top — green-tinted background, displays `verdict.summary`
- `StatisticalEvidence` card at bottom — `KvRow` stack showing DM test, bootstrap CI, period overlap

**DoD:** Banner color matches verdict (green for `promote_b`, amber for ambiguous, red for `keep_a`); evidence card values are formatted correctly.

### Phase 4 acceptance gate

- [ ] Visiting `/compare?a=X&b=Y` renders a full comparison
- [ ] Run pickers work via search; URL stays in sync
- [ ] 409 mismatch case shows a meaningful error
- [ ] A/B color identity is consistent across pickers and charts

---

## Phase 5 — Decisions tab (Day 7, ~4 hours)

| Task | Goal                                              | Est. |
| ---- | ------------------------------------------------- | ---- |
| 5.1  | `useDecisions` list + verdict filter pills        | 1.5h |
| 5.2  | DecisionCard with TriggerList + DecisionStatsGrid | 2h   |
| 5.3  | Decision detail route + MinIntervalGuard display  | 0.5h |

### 5.1 useDecisions + filter pills

**Output:** `src/hooks/useDecisions.ts`; `/decisions` page with verdict filter pills using `facets.by_verdict` counts (v1.1) or unfiltered (v1).

**DoD:** Filter pills show counts (or no counts on v1); selecting filters the visible decision cards.

### 5.2 DecisionCard

**Output:** `src/components/sections/DecisionCard.tsx` with:

- Head: date (left), verdict summary (center), `VerdictBadge` (right)
- Body: TriggerList (left half) + DecisionStatsGrid (right half, 2×2)
- TriggerList: 9 `TriggerChip` items, colored by fire status

**DoD:** Each decision renders correctly; soft fires render amber, hard fires render red, no-fires render neutral; days-since-train and forward IC display correctly.

### 5.3 Decision detail route

**Output:** `src/app/decisions/[decisionId]/page.tsx` showing full decision report including `min_interval_guard` block.

**DoD:** Clicking a decision card opens the detail page; "Min interval guard" status displays prominently when blocking a retrain.

### Phase 5 acceptance gate

- [ ] Decisions list filters correctly by verdict
- [ ] Each card surfaces the right triggers with correct fire colors
- [ ] `embedded_report_run_id` is a clickable link to the underlying report

---

## Phase 6 — Live tab + WebSocket (Days 8–9, ~12 hours)

Saved for last because it's the most complex _and_ it reuses everything built in Phase 3. The Live tab's chart sections are literally `<EquityChart>` / `<DrawdownChart>` / `<HourOfDayChart>` etc. pointed at a different data source.

| Task | Goal                                             | Est. |
| ---- | ------------------------------------------------ | ---- |
| 6.1  | `useLiveStatus` polling + LiveStatusPill wiring  | 1h   |
| 6.2  | Live section hooks (v1.1 vs v1 routing)          | 2h   |
| 6.3  | WebSocket client core (state machine, reconnect) | 3h   |
| 6.4  | Subscriber API + ring buffer                     | 2h   |
| 6.5  | WS reconnection tests (Playwright)               | 2h   |
| 6.6  | Live tab composition + real-time appends         | 2h   |

### 6.1 useLiveStatus + LiveStatusPill

**Output:**

- `src/hooks/useLiveStatus.ts` — `useQuery` with `refetchInterval: 1000`, paused when document is hidden
- LiveStatusPill in TopBar reads from this hook — green when fresh, amber when `lag_seconds > 30`, red when 503

**DoD:** Killing the backend turns the pill red within 5 seconds; restarting turns it green within 2 seconds.

### 6.2 Live section hooks

**Decision callout (important):** v1.1 lets you call `/reports/live/<section>` for every section endpoint. v1 requires separate `/live/equity` etc. endpoints. **If you can adopt v1.1, you save substantial code here** — the Live tab page literally reuses `<EquityChart>` etc. with `runId="live"`.

**Output (v1.1 path):**

- The existing `useReportEquity`, `useReportDrawdown`, etc. hooks accept `runId="live"` transparently — no new code needed

**Output (v1 path):**

- `useLiveEquity`, `useLiveFills`, `useLiveRiskEvents`, etc. with the same return shape as their report-mode siblings

**DoD:** Section components render with live data, with 60-second polling for non-volatile sections (equity, attribution) and 1-second for status.

### 6.3 WebSocket client core

**Output:** `src/lib/ws-client.ts` implementing the state machine from spec §"WebSocket client":

- `idle` → `connecting` → `open` → `reconnecting` → `attempting` → `open` (loop)
- Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
- Give up after 10 attempts → `disconnected` (requires user action to retry)
- Send `subscribe` on every (re)connect
- Heartbeat timer: no heartbeat in 60s → force reconnect

**DoD:** Unit tests with mocked WebSocket verify state transitions on every event combination.

**Notes:** This is the hardest single piece in the project. Budget the full 3 hours. Don't skip the unit tests — they catch the off-by-one bugs that only surface in production.

### 6.4 Subscriber API + ring buffer

**Output:**

- `wsClient.subscribe(['fill', 'equity'], handler)` returning an unsubscribe function
- Ring buffer of last 1000 messages so late subscribers don't miss recent events
- `useLiveStream(types)` React hook wrapping the subscribe API

**DoD:** Subscribing late (after a few messages have arrived) replays the buffer correctly; unsubscribing on unmount works without leaking handlers.

### 6.5 WS reconnection tests

**Output:** Playwright E2E test scenarios:

- Connection drops mid-session → UI shows "Reconnecting..." → backend restored → UI recovers without reload
- Heartbeat timeout (simulated by blocking server-sent pings) → reconnect triggers within 60s

**DoD:** Both scenarios pass in CI.

### 6.6 Live tab composition

**Output:** `src/app/live/page.tsx` composes:

- KPI strip (Equity, Position, 24h P&L, Forecast) from `useLiveStatus`
- Equity chart with real-time appending: refetch every 60s + WS `equity` events append between refetches
- Fills tape: subscribes to WS `fill` events, prepends to the table
- Risk Event Feed: subscribes to WS `risk_event` events

**DoD:** Live tab updates in real time when the backend is running; killing the backend triggers a clean reconnect; the dashboard never goes "stale" without surfacing the connection state.

### Phase 6 acceptance gate

- [ ] Live tab updates in real time
- [ ] Killing & restarting the backend recovers without page reload
- [ ] WebSocket disconnection is visible to the user (top bar pill + sonner toast)
- [ ] No memory leaks: subscribing and unsubscribing 1000 times leaves no dangling handlers

---

## Phase 7 — Polish + deployment (Day 10, ~6 hours)

| Task | Goal                                   | Est. |
| ---- | -------------------------------------- | ---- |
| 7.1  | Skeleton + empty state audit           | 1h   |
| 7.2  | Error boundary coverage audit          | 0.5h |
| 7.3  | Pixel-parity Playwright tests          | 2h   |
| 7.4  | Lighthouse audit + accessibility fixes | 1h   |
| 7.5  | Deployment docs + Rust integration     | 1.5h |

### 7.1 Skeleton + empty state audit

**Output:** Every `useQuery` site has a `<Skeleton>` while loading and an empty state component for `data.length === 0`. Specific empty states:

- `/reports` with no matches: "No reports match these filters"
- `/live` when backend is down: "Paper trader not running" + recovery hint
- `/decisions` with no records: "No decision reports yet"
- `/compare` with no selections: "Pick two reports to compare"

**DoD:** Visiting every route with no data shows a clean empty state, not a spinner or blank page.

### 7.2 Error boundary coverage

**Output:** Every chart and table is wrapped in an `<ErrorBoundary>` that catches and displays a clean error message; failure in one section does not blank the page.

**DoD:** Inject a fake 500 error into one section's hook; verify the section shows an error but the rest of the page renders normally.

### 7.3 Pixel-parity Playwright tests

**Output:** `tests/visual.spec.ts` taking screenshots of every primary page at 1440×900 in both themes, comparing against reference images generated from `perps_dashboard.html`.

```ts
await page.goto('/live')
await page.emulateMedia({ colorScheme: 'dark' })
await expect(page).toHaveScreenshot('live-dark.png', { maxDiffPixelRatio: 0.02 })
```

**DoD:** All page screenshots match within 2% pixel difference (5% for chart-heavy regions).

**Notes:** This is where the spec Appendix A pays off. If you've followed the tokens strictly, this test passes on the first try.

### 7.4 Lighthouse audit + a11y fixes

**Output:** Lighthouse run via Playwright + `@lhci/cli` in CI. Targets:

- Performance > 90
- Accessibility > 95
- Best Practices > 95
- SEO > 90

Common fixes likely needed: ARIA labels on icon-only buttons, color contrast on muted text, focus rings on custom interactive elements.

**DoD:** Lighthouse scores meet targets; CI step runs and fails if any score drops > 5 points.

### 7.5 Deployment docs + Rust integration

**Output:**

- `README.md` section on production deployment (already covered in `dashboard_README.md`)
- Rust backend embeds the dashboard via `tower-http::services::ServeDir::new("dashboard/out")`
- Build script that runs `pnpm build` then copies `out/` into the Rust crate's static directory

**DoD:** Single command on the Rust side (`cargo run --release --bin serve`) serves both the API and the dashboard; visiting `http://127.0.0.1:8787/` loads the dashboard.

### Phase 7 acceptance gate

- [ ] Every route has a working empty state
- [ ] Every section has working error containment
- [ ] All pixel-parity tests pass
- [ ] Lighthouse scores meet targets
- [ ] Single Rust binary serves the full stack

---

## Total estimate

| Phase                | Days        | Hours        |
| -------------------- | ----------- | ------------ |
| Pre-flight           | 0.5         | 2            |
| 1 — Scaffold         | 1           | 6            |
| 2 — Foundation       | 2           | 12           |
| 3 — Reports tab      | 2           | 14           |
| 4 — Compare tab      | 1           | 6            |
| 5 — Decisions tab    | 0.5         | 4            |
| 6 — Live + WebSocket | 2           | 12           |
| 7 — Polish + deploy  | 1           | 6            |
| **Total**            | **10 days** | **62 hours** |

For an experienced React/Next.js developer with the backend already running. Add 30–50% buffer for less experienced developers, surprises in the codegen-API integration, or design tweaks during build. Realistic ship window: **2–3 weeks of focused work**.

---

## Decisions to make during the build

These come up at specific points and the right answer depends on your situation. Flagging them so you decide deliberately, not by accident.

| Decision                                            | When            | Options                                                                                                                                                                               |
| --------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adopt v1.1 API features?                            | Phase 2 onwards | v1.1 saves real code in Phase 4 (search endpoint) and Phase 6 (`/reports/live` routing). If you control the backend, adopt. If not, accept the workarounds.                           |
| Storybook or `/dev` showcase?                       | Phase 2.5       | Spec says `/dev`. Stick with it unless your team needs the Storybook plugin ecosystem.                                                                                                |
| Light theme as default or dark?                     | Phase 2.4       | Dark matches the mockup. If your operator works in daylight, light may be the right call. `next-themes` lets the user override either way.                                            |
| Single time-zone (UTC) or operator-local?           | Phase 2.4       | Spec says UTC-only. This is the right call for forensic clarity even if your operator is in a non-UTC time zone.                                                                      |
| Embed dashboard in Rust binary or serve separately? | Phase 7.5       | Embed (single process, single binary) is recommended for the personal-use case. Separate (proxy + static server) is cleaner if you ever want hot-reload deploys of just the frontend. |
| Adopt champion/challenger mode for Compare?         | Phase 4         | Out of scope for v1; flag for v2 if you start running A/B paper-trading.                                                                                                              |

---

## Execution risks

These are _operational_ risks (things that can derail the build), not architectural risks (which are covered in the spec).

| Risk                                              | Where it bites | Mitigation                                                                                                            |
| ------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------- |
| OpenAPI codegen produces broken types             | Phase 2.1      | Run codegen against a clean backend build first; if types are off, fix the Rust handler annotations before generating |
| shadcn updates conflict with custom modifications | Phase 7+       | Commit shadcn-generated files; review every `shadcn add` PR; keep diffs small                                         |
| WebSocket timing differs in dev vs prod           | Phase 6.3      | Test against `cargo run --release`, not just dev mode; latencies differ                                               |
| Chart re-renders cause jank on theme toggle       | Phase 3.5      | Use `key` prop on chart wrappers to force unmount/remount on theme change                                             |
| Bundle bloats past budget unexpectedly            | Phase 7.5      | Run `next build` after every dependency addition; check the bundle-analyzer output                                    |
| Recharts SSR errors during static export          | Phase 3.5      | Mark every chart wrapper with `"use client"`; never import Recharts in a server component                             |
| Stale TanStack Query cache after backend restart  | Phase 6.6      | Set `staleTime` carefully; on WS reconnect, invalidate all live queries                                               |

---

## Parallelization opportunities

If you have two developers, here's where work splits cleanly:

- **Phases 1 + 2 must be sequential** (scaffold blocks foundation, foundation blocks everything else)
- **Phases 3, 4, 5 can run in parallel** after Phase 2 ships — they share primitives but build independent routes
- **Phase 6 must come after Phase 3** because Live tab reuses Reports section components (or after Phase 2 if you're willing to use mock section components and refactor later)
- **Phase 7 is sequential at the end** — pixel-parity tests need every route built

Two developers can ship in ~6–7 calendar days instead of 10.

---

## Appendix A — Command cheatsheet

In the order you'll run them:

```bash
# Phase 1
pnpm dlx create-next-app@latest dashboard --typescript --tailwind --app --src-dir --import-alias '@/*' --use-pnpm --no-eslint
cd dashboard
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card badge input progress skeleton table tabs tooltip dropdown-menu popover command alert separator scroll-area toggle-group sonner sheet
pnpm add @tanstack/react-query@^5 zustand@^5 next-themes recharts@^2 chart.js@^4 react-chartjs-2@^5 date-fns date-fns-tz lucide-react
pnpm add -D @playwright/test vitest @testing-library/react @testing-library/jest-dom jsdom openapi-typescript-codegen prettier eslint-config-prettier

# Phase 2
bash scripts/codegen.sh  # or pnpm codegen

# Routine
pnpm dev
pnpm test
pnpm test:e2e
pnpm build
pnpm typecheck
pnpm lint
pnpm format

# CI verification
pnpm codegen && git diff --exit-code src/api-client/
```

---

## Appendix B — What this plan deliberately omits

- **Specific code samples beyond the bare minimum** — those live in the spec or in shadcn / TanStack Query docs
- **Component visual design** — that's spec Appendix A
- **API contract details** — that's `api_reference.md`
- **A reference implementation repo** — every team's needs differ; this plan tells you what to build, not exactly how
- **Time estimates for less experienced developers** — too much variance to be useful; double the numbers if you've never built a Next.js app
- **A user training plan** — the dashboard is for one operator who already understands the system
