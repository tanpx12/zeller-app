# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Models tab** — new `/models` surface against the backend's `/api/v1/models`
  + `/api/v1/models/{name}/trades` endpoints. Strategy catalog with three seeded
  entries (`euler`, `scaled_family`, `fixed_family`) maps human-readable names to
  config templates that match across runs.
  - `src/hooks/useModels.ts` — `useModels()` (catalog) + `useModelTrades(name)`
    (cursor-paginated infinite query)
  - `app/models/page.tsx` — index of clickable `ModelCard`s with description,
    n_runs, mode pills (collapsed `backtest` label from the backend)
  - `app/models/[name]/page.tsx` — static-export shell with
    `generateStaticParams` over the live catalog. Detail body:
    `PageHeader` with mode mix + latest run date, `ModelTradesFilters`
    (URL-synced mode/sizer/leverage/sl), `ModelTradesSummary` (client-side
    aggregation over loaded pages), `ModelTradesTable` with grid columns
    matching the mockup convention (`Entry · Side · Mode · P&L% · P&L$ ·
    Bars · Run ID · Exit`) and per-row navigation to `/reports/[runId]`.
  - 5th tab in `TopBar`: `Live · Reports · Models · Compare · Decisions`.
- **`ConfigSnapshotCard` on `/reports/[runId]`** — surfaces the new
  `RunMetadata.config_snapshot` blob (free-form JSON, typed `any` from the
  wire) as a collapsible KV tree. Top-level keys expanded by default; nested
  objects (e.g. `lgbm` hyperparameters) collapsed so the card stays compact.
  Uses `useReportFull` (new hook in `useReportSections.ts`) since
  `config_snapshot` isn't surfaced by any per-section endpoint.
- **`Mode` taxonomy extension** — `ModeBadge`'s `Mode` type adds
  `'backtest'` (collapsed batch+holdout label from `/models` endpoints).
  `toMode()` documents the three vocabularies it accepts (single-run lowercase,
  PascalCase RunMode, collapsed model-level). Same `--primary-soft` color as
  `batch` since they're semantically related.

### Added

- **Phase 1 — Scaffold:** Next.js 15 (App Router, static export), TypeScript strict,
  Tailwind CSS 4, shadcn/ui with Nova preset (Lucide + Geist), 22 shadcn primitives
  installed, TanStack Query + Zustand + next-themes wired, Vitest + Playwright config.
- **Phase 2.1 — API client:** `scripts/codegen.sh` generating `src/api-client/` from
  the backend's `openapi.json`. `src/lib/client.ts` wraps `OpenAPI.BASE`. `/` smoke-
  tests the path via `SystemService.health()`.
- **Phase 2.2 — Design tokens:** Appendix A.1 ported into `src/styles/globals.css` with
  light + dark themes selected via `data-theme`. Geist Sans + Geist Mono loaded with
  tabular numerals (`tnum`) + Geist's stylistic set (`ss01`). Tailwind v4 `@theme inline`
  maps tokens to utilities (`bg-surface`, `text-positive`, ...).
- **Phase 2.3 — Trading primitives** in `src/components/dashboard/`: `Kpi`, `Stat`,
  `KvRow`, `PageHeader`, `VsDivider`, `ModeBadge`, `VerdictBadge`, `TriggerChip`,
  `LiveDot` (breathing glow), `LiveIndicator`, `SharpeBar`, `RangeChips`, `RunPick`
  (A/B accent), `VerdictBanner`, `ErrorBoundary`, `EmptyState`. 27 snapshot tests.
- **Phase 2.4 — Layout shell:** root layout with `Providers` (ThemeProvider,
  QueryClientProvider, TooltipProvider, Sonner Toaster). Sticky `TopBar` with brand
  mark, 4 tab buttons, `LiveIndicator` placeholder, `ThemeToggle`. Stub routes at
  `/live`, `/reports`, `/compare`, `/decisions`.
- **Phase 2.5 — `/dev` showcase route:** every primitive rendered with sample data,
  gated behind `NODE_ENV !== 'production'`.
- **Phase 3.1 — `useReportList` + `ReportTable`:** TanStack Query hook bound to
  `ReportsService.listReports`; cursor-paginated infinite-query variant in
  `useReportListInfinite`. Row click navigates to `/reports/[runId]`.
- **Phase 3.2 — Filters + URL state + pagination:** mode pills (with facet counts),
  asset dropdown, min-Sharpe input — all state via `useSearchParams` + `router.replace`.
  "Load more" appends pages via the cursor.
- **Phase 3.3 — Detail route + headline/stats:** `app/reports/[runId]/page.tsx` is a
  server component with `generateStaticParams` that fetches the run list at build
  time and statically prerenders one shell per `run_id` (201 pages this build).
  `HeadlineKpis` (4-col) + `StatGrid` (5-col) render from `useReportHeadline`.
  `not-found.tsx` renders cleanly on 404.
- **Phase 3.4 — Trades + risk events:** `TradeTable` with `TradesSummaryDto` summary
  row (avg win/loss, largest, avg hold), positive/negative coloring on P&L.
  `RiskEventFeed` in a `ScrollArea` with guard-keyed tone coloring.
- **Phase 3.5 — Chart wrappers:** `useThemeColors` reads CSS vars on theme change
  via `next-themes`' `resolvedTheme`. `BaseLineChart`, `BaseAreaChart`, `BaseBarChart`,
  `BaseDonut` (Recharts) all consume the hook for theme-aware rendering.
- **Phase 3.6 — `EquityChart` + `DrawdownChart` + RangeChips wiring:** equity series
  from `TimeSeriesEnvelope.points`, drawdown as a filled area below zero. `RangeChips`
  state lives at `?range=7d|30d|90d|all` and drives the `since` query on the equity
  endpoint.
- **Phase 3.7 — `HourOfDayChart` + `CostAttributionDonut` + `ForecastDiagnostics`:**
  hour-of-day bar chart with sign-based coloring; donut with legend + cost-as-%-of-
  gross summary; KvRow stack for IC / calibration / sign-accuracy buckets.
- **Detail page composition:** every section wrapped in an `ErrorBoundary` so a 404
  on `/reports/{id}/trades` fails only that section, not the page.

- **Phase 4.1 — `useCompare` + `useReportSearch`:** typed query hooks bound to
  `CompareService.compareHandler` and `ReportsService.searchReports`. Non-retried
  errors on 404 / 409 / 400 so deterministic failures surface immediately.
- **Phase 4.2 — `RunPicker`:** combobox using shadcn `Popover` + `Command` with
  live typeahead, A/B accent left border (primary / warning). Selected `run_id`
  syncs to `?a=&b=` in the URL so comparison links are shareable.
- **Phase 4.3 — `CompareGrid`:** 3-col `1fr 88px 1fr` headline-diff grid, A right-
  aligned with right border, label centered (`%` delta below), B left-aligned with
  left border. Per-metric formatter dispatches money / percent / decimals.
- **Phase 4.4 — Overlay charts:** `EquityOverlay` (BaseLineChart two series),
  `DrawdownOverlay` (two filled Areas, semi-transparent), `ReturnDistribution`
  (grouped bars from `return_distribution_overlay`).
- **Phase 4.5 — `CompareVerdictBanner` + `StatisticalEvidence`:** decodes the
  `ComparisonVerdict` tagged union (`BImproves` / `BWorse` / `Inconclusive`) into
  promote / reject / inconclusive tones. Evidence card surfaces DM stat + p-value,
  period overlap, config / model hash agreement.
- **Compare page:** `/compare?a=X&b=Y` composes everything end-to-end. 409 →
  clean "no overlap" empty state; 404 → "run not found"; missing slot → "Pick
  two runs". Every section wrapped in `ErrorBoundary`.
- **Phase 5.1 — `useDecisions` + filter pills:** typed list hook + verdict-
  filter pills using `DecisionFacetsDto.by_verdict`. Backend variant labels
  ("NoRetrainNeeded" / "Monitor" / "Recommend") rolled into our four
  `VerdictKind`s, with the `Retrain` pill covering both `Recommend` and
  `StronglyRecommend`.
- **Phase 5.2 — `DecisionCard` + `DecisionRow`:** card head matches mockup
  grid `110px 1fr auto` (date · verdict sentence · `VerdictBadge`). Body
  grid 1fr/1fr with trigger list (`TriggerChip` with outcome decoded from
  the `NoFire`/`SoftFire`/`HardFire` tagged union) + 2x2 decision stats
  comparing live vs holdout IC/Sharpe/hit rate with relative-delta tone
  coloring. Compact `DecisionRow` for the list page.
- **Phase 5.3 — Decision detail route:** `/decisions/[date]/` with
  `generateStaticParams` enumerating the current decisions list at build
  time. Falls back to a `_placeholder` shell when the list is empty (Next
  requires ≥1 prerendered path under `output: 'export'`). Body shows the
  full `DecisionCard` + window/generation timestamps + feature-drift KV
  table (PSI per feature, color-coded ≥0.1 amber / ≥0.25 red) +
  recommended-next-steps list.
- **Helpers:** `src/lib/verdict.ts` and `src/lib/trigger.ts` decode the
  tagged-union DTOs into stable identifiers + display strings the
  components can render without re-implementing the union logic.

### Notes

- `/reports/[runId]` first-load JS is 268 KB and `/compare` is 278 KB (both
  Recharts-bound) — over the 250 KB Phase-7 budget. Deferred to Phase 7.5
  (dynamic-import the chart wrappers).
- `generateStaticParams` requires the backend reachable at `NEXT_PUBLIC_API_BASE`
  during `pnpm build`. Falls back to an empty list (only the `/reports` index works)
  if unreachable. New runs added after a build aren't navigable until the next build.

- **Workspace plumbing:** `.claude/` (CLAUDE.md, settings.json with pnpm-aware
  permissions and hooks, `software-development` skill copied into the repo),
  pre-commit hook (`pnpm lint` + `prettier --check`), CI workflow (lint, format check,
  typecheck, unit tests, static build, Playwright e2e). `docs/architecture.md` derived
  from `README.md`; `docs/tspec.md` and `docs/implplan.md` preserved.
