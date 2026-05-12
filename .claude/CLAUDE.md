# perps-dashboard

## What this is

A single-page web dashboard for the `perps_model` trading system. It visualizes live paper trading, persisted reports, side-by-side strategy comparisons, and weekly retrain decisions through the backend's read-only HTTP API. The dashboard is statically exported — there is no Node.js runtime in production, only a compiled bundle of HTML/CSS/JS that the Rust backend (or any static server) serves.

## Stack

- **Language:** TypeScript 5 (strict mode, zero `any`)
- **Framework:** Next.js 15 (App Router) with `output: 'export'`
- **UI primitives:** shadcn/ui (Radix underneath) — components copied into `src/components/ui/`
- **Styling:** Tailwind CSS 4 with CSS-variable theme tokens
- **State:** TanStack Query (server state) + Zustand (live WS + ephemeral runtime state) + URL (filters/selection)
- **Charts:** Recharts (line/area) + Chart.js + react-chartjs-2 (bar/donut/histogram)
- **Realtime:** native WebSocket via `src/lib/ws-client.ts`
- **Tests:** Vitest + @testing-library/react (unit/component); Playwright (e2e, including WS reconnect)
- **Codegen:** `openapi-typescript-codegen` against the backend `openapi.json`
- **Package manager:** pnpm (never `npm install` — incompatible lockfile)
- **Build runtime:** Node.js 20

## Project type

Statically exported single-page web app. Production artifact is the `out/` directory produced by `pnpm build`. No route handlers, no Server Actions, no middleware — these silently fail under `output: 'export'`.

## Directory layout

```
app/                       Next.js App Router pages
  layout.tsx               Root layout: ThemeProvider, QueryClientProvider, WS bootstrap
  live/                    Live paper-trading view (polling + WS)
  reports/                 Persisted report list
  reports/[runId]/         Single-report detail
  compare/                 A/B comparison of two runs (selection mirrored in URL)
  decisions/               Weekly retrain decisions

src/
  components/
    ui/                    shadcn primitives — owned, not imported from npm
    dashboard/             Trading-specific composites (Kpi, KvRow, SharpeBar, ...)
    sections/              Section-level views mapping 1:1 to PerformanceReport sections
    charts/                Theme-aware Recharts + Chart.js wrappers
  hooks/                   TanStack Query bindings + WS subscription hook
  lib/                     client.ts, ws-client.ts, format.ts, time.ts, colors.ts, utils.ts
  store/                   Zustand stores: live (WS state), compare (selected runs)
  api-client/              GENERATED from openapi.json — never hand-edit
  styles/                  globals.css with Tailwind + CSS variable tokens

tests/                     Unit + integration tests (Vitest); e2e tests (Playwright)
docs/                      tspec.md (technical spec), architecture.md
```

## Dev commands

- Install: `pnpm install`
- Codegen: `pnpm codegen` (REQUIRED if backend API changed)
- Run: `pnpm dev` (HMR on http://localhost:3000)
- Typecheck: `pnpm typecheck`
- Test: `pnpm test` (watch) — `pnpm test --run` for one-shot
- E2E: `pnpm test:e2e` (needs backend + paper_trade running)
- Lint: `pnpm lint`
- Format: `pnpm format`
- Build: `pnpm build` (produces ./out/)
- Sync check: `pnpm codegen && git diff --exit-code src/api-client/`

## Commit convention

Conventional Commits 1.0.0. Use `/checkpoint` to commit.

## Important conventions

- **The generated API client is the source of truth for types.** Import from `@/api-client/models/`. Never hand-write request/response interfaces. Wrong type ⇒ fix the spec, regenerate.
- **No `fetch` inside components.** Always go through a hook in `src/hooks/`, which goes through the generated client. This is what makes the codegen-check meaningful.
- **Server state → TanStack Query. Client state → Zustand or URL. Never React Context for app state.**
- **URL is source of truth for filter/selection state.** Filters on `/reports`, selected runs on `/compare`, range chip on a chart — all in query parameters via `useSearchParams()` + `router.replace()`.
- **Default to Server Components.** Add `"use client"` only when state/effects/browser APIs are actually used.
- **All numbers render via `lib/format.ts`** (Intl.NumberFormat, explicit precision). No `.toFixed()` scattered. No `.toLocaleString()` without `{ timeZone: 'UTC' }`.
- **All numeric text is `font-mono`** — Geist Mono with `font-feature-settings: "tnum" 1, "ss01" 1`. P&L columns must align by decimal.
- **Theme tokens are CSS variables, mapped to Tailwind utilities.** Charts read raw values via `getComputedStyle()` where libraries can't consume CSS vars.
- **shadcn components are checked into the repo.** Edits are allowed but intentional.
- **Every chart and table is wrapped in an error boundary.** A 404 on `/reports/{id}/trades` fails that section, not the page.
- **Functional components only.** Class components only where required (custom error boundaries).
- **Strict TypeScript, zero `any`.** Use `unknown` + narrowing when type is genuinely unknown.
- **Time is UTC end-to-end.** Backend is UTC, dashboard is UTC — never use locale-default time formatting.

## Things to avoid

- **Never edit `src/api-client/`** — regenerated on every codegen; hand-edits are silently lost.
- **Never put filter or selection state in `useState`** — breaks refresh, sharing, and the back button.
- **Never use `Date.now().toLocaleString()`** — always go through `src/lib/time.ts` or pass `{ timeZone: 'UTC' }`.
- **Never use server-only Next.js features** — no `route.ts`, no Server Actions, no middleware. They fail silently under `output: 'export'`.
- **Never use `next/image` for runtime sources** — `images.unoptimized` is set; use plain `<img>`.
- **Never add a third charting library.** Recharts + Chart.js already cover every needed chart type.
- **Never call `fetch` directly from a component.** Use a hook → generated client.
- **Never use `localStorage` for server data.** `next-themes` uses it for theme (correct); Zustand stores are in-memory only by design.
- **Never disable an ErrorBoundary** because something seems edge-case unlikely.
- **Never add a write endpoint client method.** Dashboard is read-only by architectural commitment.
- **Never embed credentials, API keys, or tokens in `NEXT_PUBLIC_*` variables** — these ship to the client.
- **Never `npm install`** — pnpm only; lockfiles are incompatible.
