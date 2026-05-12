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
- **Workspace plumbing:** `.claude/` (CLAUDE.md, settings.json with pnpm-aware
  permissions and hooks, `software-development` skill copied into the repo),
  pre-commit hook (`pnpm lint` + `prettier --check`), CI workflow (lint, format check,
  typecheck, unit tests, static build, Playwright e2e). `docs/architecture.md` derived
  from `README.md`; `docs/tspec.md` and `docs/implplan.md` preserved.
