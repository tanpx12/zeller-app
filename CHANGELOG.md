# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Notes

- `/reports/[runId]` first-load JS is 265 KB (Recharts dominates) — 15 KB over the
  Phase-7 250 KB budget. Deferred to Phase 7.5 (dynamic-import the chart wrappers).
- `generateStaticParams` requires the backend reachable at `NEXT_PUBLIC_API_BASE`
  during `pnpm build`. Falls back to an empty list (only the `/reports` index works)
  if unreachable. New runs added after a build aren't navigable until the next build.

- **Workspace plumbing:** `.claude/` (CLAUDE.md, settings.json with pnpm-aware
  permissions and hooks, `software-development` skill copied into the repo),
  pre-commit hook (`pnpm lint` + `prettier --check`), CI workflow (lint, format check,
  typecheck, unit tests, static build, Playwright e2e). `docs/architecture.md` derived
  from `README.md`; `docs/tspec.md` and `docs/implplan.md` preserved.
