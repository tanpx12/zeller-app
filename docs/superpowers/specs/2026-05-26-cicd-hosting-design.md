# CI/CD & Hosting Design — perps-dashboard

**Date:** 2026-05-26
**Status:** Approved
**Approach:** Cloudflare Pages (frontend) + Cloudflare Tunnel (backend) + GitHub Actions (CI/CD)

---

## Context

The perps-dashboard is a statically exported Next.js app (`output: 'export'`). The production artifact is the `out/` directory — pure HTML/CSS/JS with no server runtime. It talks to a Rust backend (separate repo) via `NEXT_PUBLIC_API_BASE` and `NEXT_PUBLIC_WS_BASE`, which are baked into the JS bundle at build time.

**Constraints:**

- Personal dashboard (single user, no auth required)
- Free tier only — zero hosting cost
- Backend runs on a local machine now, migrating to a dedicated Linux laptop server later
- Backend machine runs Docker

## Architecture Overview

```
┌─────────────┐     push to main     ┌──────────────────┐
│  GitHub Repo │ ──────────────────── │  GitHub Actions   │
│  (dashboard) │                      │  CI Pipeline      │
└─────────────┘                      │                    │
                                      │ lint → format →   │
                                      │ typecheck → test → │
                                      │ build → deploy     │
                                      └────────┬───────────┘
                                               │ wrangler pages deploy out/
                                               ▼
                                      ┌──────────────────┐
                                      │ Cloudflare Pages  │
                                      │ (static CDN)      │
                                      │ perps-dashboard   │
                                      │   .pages.dev      │
                                      └────────┬───────────┘
                                               │ HTTPS/WSS requests
                                               ▼
                                      ┌──────────────────┐
                                      │ Cloudflare Edge   │
                                      │ CNAME: api-perps  │
                                      │ → tunnel hostname │
                                      └────────┬───────────┘
                                               │ encrypted tunnel
                                               ▼
                                      ┌──────────────────┐
                                      │ cloudflared       │
                                      │ (laptop/server)   │
                                      │ → localhost:8787  │
                                      │ (Rust backend)    │
                                      └──────────────────┘
```

## 1. CI Pipeline (GitHub Actions)

Extends the existing `.github/workflows/ci.yml`.

**Pipeline flow:**

```
push to main or PR
  ├─ test job: pnpm install → lint → format:check → typecheck → test:run → build
  ├─ e2e job (needs test): Playwright
  └─ deploy job (needs test, only on main):
       → uses out/ artifact from test job's build step
       → wrangler pages deploy out/ --project-name=perps-dashboard
```

**Key details:**

- The `build` step injects production env vars:
  - `NEXT_PUBLIC_API_BASE=https://api-perps.<cf-zone>`
  - `NEXT_PUBLIC_WS_BASE=wss://api-perps.<cf-zone>`
  - `NEXT_PUBLIC_BUILD_SHA=$GITHUB_SHA`
  - `NEXT_PUBLIC_LIVE_POLLING=off`
- Deploy uses `cloudflare/wrangler-action` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` stored as GitHub repo secrets
- PRs run the full test suite but skip deploy
- The `out/` directory is passed between jobs via `actions/upload-artifact` / `actions/download-artifact`

## 2. Frontend Hosting (Cloudflare Pages)

**Provider:** Cloudflare Pages (free tier)

**Setup:**

- Create a Cloudflare Pages project linked to the GitHub repo
- Deployments are driven by CI (not Cloudflare's build system) — CI builds `out/` and pushes it via `wrangler pages deploy`
- This guarantees the same artifact that passed tests is what gets deployed

**What you get:**

- Free subdomain: `perps-dashboard.pages.dev`
- Global CDN with instant cache invalidation on deploy
- Optional: preview deployments on PRs (can enable later)
- No server runtime — just serves the `out/` directory

## 3. Backend Hosting (Cloudflare Tunnel)

**Provider:** Cloudflare Tunnel via `cloudflared` (free)

**How it works:**

- `cloudflared` runs on the backend machine and establishes an outbound-only encrypted tunnel to Cloudflare's edge
- No port forwarding, no static IP, no firewall configuration required
- Cloudflare assigns a public hostname that proxies traffic through the tunnel to `localhost:8787`
- WebSocket connections pass through natively — no extra config

**Setup (one-time):**

1. `cloudflared tunnel create perps-api`
2. Write `config.yml`:
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: /path/to/credentials.json
   ingress:
     - hostname: api-perps.<cf-zone>
       service: http://localhost:8787
     - service: http_status:404
   ```
3. `cloudflared tunnel run perps-api`

**Running as a service (Linux + Docker):**

```bash
docker run -d \
  --name cloudflared \
  --restart=unless-stopped \
  --network=host \
  cloudflare/cloudflared:latest \
  tunnel run --token <TUNNEL_TOKEN>
```

**Migration to laptop server:**

- Copy credentials file + config.yml to the new machine
- Run `cloudflared tunnel run` there
- Public hostname stays the same — zero changes to the dashboard or DNS

**Limitation:** If the machine or backend process is down, the API returns 502. Acceptable for a personal dashboard.

## 4. Connecting Frontend to Backend

**Cross-origin solution: CORS on the Rust backend.**

The dashboard (on `perps-dashboard.pages.dev`) makes cross-origin requests to the backend (on `api-perps.<cf-zone>`). The Rust backend adds a `CorsLayer` via `tower-http`:

```rust
CorsLayer::new()
    .allow_origin(["https://perps-dashboard.pages.dev".parse().unwrap()])
    .allow_methods([Method::GET])
    .allow_headers([CONTENT_TYPE])
```

**Stable API hostname via CNAME:**

- A CNAME record in Cloudflare DNS: `api-perps.<cf-zone>` → `<tunnel-id>.cfargotunnel.com`
- The dashboard is always built with `NEXT_PUBLIC_API_BASE=https://api-perps.<cf-zone>`
- If the tunnel moves machines, update the CNAME target — no dashboard rebuild needed

**Why not a Workers proxy?**
A Cloudflare Workers reverse proxy would avoid CORS by making everything same-origin, but it adds complexity and consumes Workers free-tier requests (100k/day). CORS on the backend is simpler for a single-user dashboard.

## 5. Deployment Workflow

**Day-to-day (dashboard changes):**

```
Push to main
  → GitHub Actions: lint → test → build → deploy to Cloudflare Pages
  → Live at perps-dashboard.pages.dev within ~60s
```

**Backend updates (separate repo):**

- Build/restart the Rust binary on the backend machine
- `cloudflared` tunnel is always running — backend is reachable the moment the process starts
- No CI/CD for the backend in this design (can add later)

**Environment variables:**

| Variable                   | Where set          | Value                         |
| -------------------------- | ------------------ | ----------------------------- |
| `NEXT_PUBLIC_API_BASE`     | GitHub Actions env | `https://api-perps.<cf-zone>` |
| `NEXT_PUBLIC_WS_BASE`      | GitHub Actions env | `wss://api-perps.<cf-zone>`   |
| `NEXT_PUBLIC_BUILD_SHA`    | GitHub Actions env | `$GITHUB_SHA`                 |
| `NEXT_PUBLIC_LIVE_POLLING` | GitHub Actions env | `off`                         |
| `CLOUDFLARE_API_TOKEN`     | GitHub repo secret | Cloudflare API token          |
| `CLOUDFLARE_ACCOUNT_ID`    | GitHub repo secret | Cloudflare account ID         |

## 6. One-Time Setup Checklist

1. Create a Cloudflare account (free)
2. Create a Cloudflare Pages project (connect to GitHub repo)
3. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repo secrets
4. Run `cloudflared tunnel create perps-api` on backend machine
5. Add CNAME record: `api-perps.<cf-zone>` → `<tunnel-id>.cfargotunnel.com`
6. Add CORS header on the Rust backend allowing `https://perps-dashboard.pages.dev`
7. Update `ci.yml` with the deploy job and production env vars
8. First push to `main` triggers the full pipeline

## 7. Future Considerations

- **Backend CI/CD:** Add a GitHub Actions workflow to the backend repo that builds a Docker image, pushes to GHCR, and triggers a `docker pull` + restart on the laptop server (via webhook or SSH)
- **Preview deployments:** Enable Cloudflare Pages preview deployments for PRs
- **Custom domain:** Add a custom domain to Cloudflare Pages when/if you buy one
- **Monitoring:** Cloudflare analytics (free) gives request/error metrics; add health checks via UptimeRobot (free) if you want alerts when the tunnel goes down
- **Auth:** If the dashboard ever needs to be locked down, Cloudflare Access (free for up to 50 users) can gate both the Pages site and the tunnel
