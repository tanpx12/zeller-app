# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project scaffold: Next.js 15 (App Router, static export), TypeScript strict,
  Tailwind CSS 4, shadcn/ui directory layout, TanStack Query + Zustand wiring,
  Recharts + Chart.js placeholder space, Vitest + Playwright config.
- `.claude/` workspace: CLAUDE.md, settings.json with pnpm-aware permissions and hooks,
  `software-development` skill copied into the repo.
- Pre-commit hook running `pnpm lint` and `prettier --check`.
- CI workflow (`.github/workflows/ci.yml`): lint, typecheck, unit, build,
  Playwright e2e, codegen drift check.
- `docs/architecture.md` derived from `README.md`; `docs/tspec.md` preserved.
