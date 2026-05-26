# CI/CD & Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the perps-dashboard to Cloudflare Pages via GitHub Actions, with the Rust backend exposed through a Cloudflare Tunnel.

**Architecture:** Extend the existing CI workflow with a deploy job that uploads the `out/` artifact to Cloudflare Pages. The backend is exposed via `cloudflared` tunnel, reached through a stable CNAME. Production env vars are injected at build time in CI.

**Tech Stack:** GitHub Actions, Cloudflare Pages (wrangler CLI), Cloudflare Tunnel (cloudflared), pnpm, Next.js static export

---

## File Map

| Action | File                                | Responsibility                                                                      |
| ------ | ----------------------------------- | ----------------------------------------------------------------------------------- |
| Modify | `.github/workflows/ci.yml`          | Add deploy job, artifact passing, production env vars                               |
| Create | `docs/runbooks/cloudflare-setup.md` | Step-by-step manual setup: CF account, Pages project, tunnel, CNAME, GitHub secrets |
| Create | `docs/runbooks/tunnel-migration.md` | How to move the tunnel to a new machine                                             |

---

### Task 1: Update CI workflow — split build into artifact-producing job

The existing `test` job runs lint, format, typecheck, tests, AND build. We need the `out/` directory to survive across jobs so the deploy job can use it. We'll upload it as a GitHub Actions artifact.

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add artifact upload after the build step**

In `.github/workflows/ci.yml`, add these lines after the existing "Build (static export)" step inside the `test` job:

```yaml
- name: Upload build artifact
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  uses: actions/upload-artifact@v4
  with:
    name: static-export
    path: out/
    retention-days: 1
```

This uploads `out/` only on pushes to `main` (not on PRs — no deploy needed there).

- [ ] **Step 2: Update build step env vars for production**

Replace the existing build step's `env` block:

```yaml
- name: Build (static export)
  run: pnpm build
  env:
    NEXT_PUBLIC_API_BASE: ${{ vars.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8787' }}
    NEXT_PUBLIC_WS_BASE: ${{ vars.NEXT_PUBLIC_WS_BASE || 'ws://127.0.0.1:8787' }}
    NEXT_PUBLIC_BUILD_SHA: ${{ github.sha }}
    NEXT_PUBLIC_LIVE_POLLING: 'off'
```

This uses GitHub Actions repository variables for production URLs (set during Cloudflare setup), falling back to localhost for PR builds. `NEXT_PUBLIC_BUILD_SHA` is injected from the commit SHA.

- [ ] **Step 3: Verify the workflow YAML is valid**

Run:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: upload build artifact and inject production env vars"
```

---

### Task 2: Add the deploy job to CI

Add a new `deploy` job that downloads the `out/` artifact and pushes it to Cloudflare Pages via `wrangler`.

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add the deploy job**

Append this job after the existing `e2e` job in `.github/workflows/ci.yml`:

```yaml
deploy:
  name: Deploy to Cloudflare Pages
  runs-on: ubuntu-latest
  needs: test
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  permissions:
    contents: read
    deployments: write
  steps:
    - name: Download build artifact
      uses: actions/download-artifact@v4
      with:
        name: static-export
        path: out/

    - name: Deploy to Cloudflare Pages
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
        command: pages deploy out/ --project-name=perps-dashboard
```

Key points:

- `needs: test` — only runs after lint/typecheck/test/build pass
- `if:` guard — only on pushes to `main`, never on PRs
- Downloads the `out/` artifact uploaded by the `test` job
- Uses `cloudflare/wrangler-action@v3` which bundles the wrangler CLI
- `CLOUDFLARE_API_TOKEN` is a GitHub repo secret; `CLOUDFLARE_ACCOUNT_ID` is a GitHub repo variable (non-sensitive)

- [ ] **Step 2: Verify YAML validity**

Run:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add Cloudflare Pages deploy job"
```

---

### Task 3: Write the Cloudflare setup runbook

Document every manual step the user needs to perform outside the repo: creating the Cloudflare account, Pages project, tunnel, CNAME record, and GitHub secrets.

**Files:**

- Create: `docs/runbooks/cloudflare-setup.md`

- [ ] **Step 1: Write the runbook**

Create `docs/runbooks/cloudflare-setup.md` with this content:

````markdown
# Cloudflare Setup Runbook

One-time setup for deploying perps-dashboard to Cloudflare Pages with a Cloudflare Tunnel for the backend.

## Prerequisites

- A GitHub repository for perps-dashboard (you have this)
- A machine running the Rust backend on port 8787
- Docker installed on the backend machine (for running cloudflared)

## 1. Create a Cloudflare account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with email — free plan is sufficient
3. Note your **Account ID** from the dashboard URL or the sidebar (Overview → right side)

## 2. Create a Cloudflare Pages project

You need an empty Pages project that CI will deploy into.

```bash
# Install wrangler locally (one-time)
pnpm dlx wrangler pages project create perps-dashboard --production-branch=main
```
````

When prompted, log in via the browser. This creates the project — CI handles all future deployments.

Your dashboard will be available at: `https://perps-dashboard.pages.dev`

## 3. Create a Cloudflare API token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Custom token" template
4. Permissions:
   - **Account** → Cloudflare Pages → Edit
   - **Account** → Cloudflare Tunnel → Edit (if managing tunnels via API)
   - **Zone** → DNS → Edit (for CNAME management)
5. Save the token — you'll need it for GitHub secrets

## 4. Add GitHub repository secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions.

**Secrets** (sensitive, never logged):

- `CLOUDFLARE_API_TOKEN` → the API token from step 3

**Variables** (non-sensitive, visible in logs):

- `CLOUDFLARE_ACCOUNT_ID` → your Cloudflare account ID from step 1
- `NEXT_PUBLIC_API_BASE` → `https://api-perps.<your-cf-zone>` (fill in after step 6)
- `NEXT_PUBLIC_WS_BASE` → `wss://api-perps.<your-cf-zone>` (fill in after step 6)

## 5. Create the Cloudflare Tunnel

On the machine running the Rust backend:

```bash
# Install cloudflared
# macOS:
brew install cloudflare/cloudflare/cloudflared
# Linux:
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared

# Authenticate (opens browser)
cloudflared tunnel login

# Create the tunnel
cloudflared tunnel create perps-api

# Note the tunnel ID printed (e.g., a1b2c3d4-e5f6-...)
# Credentials file is saved to ~/.cloudflared/<tunnel-id>.json
```

## 6. Configure DNS (CNAME)

You need a Cloudflare-managed zone (domain) to point a CNAME at the tunnel. If you don't have a domain on Cloudflare yet, you can use the tunnel's default hostname instead (`<tunnel-id>.cfargotunnel.com`) and skip this step — but the CNAME gives you a stable, human-readable hostname.

**If you have a zone on Cloudflare:**

```bash
cloudflared tunnel route dns perps-api api-perps.<your-domain.com>
```

This creates a CNAME record: `api-perps.your-domain.com` → `<tunnel-id>.cfargotunnel.com`

**If you don't have a zone:**

Use the tunnel's built-in hostname. Your API base will be `https://<tunnel-id>.cfargotunnel.com`. Set this as `NEXT_PUBLIC_API_BASE` in GitHub Actions variables.

## 7. Write the tunnel config

Create `~/.cloudflared/config.yml` on the backend machine:

```yaml
tunnel: <tunnel-id>
credentials-file: /home/<user>/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: api-perps.<your-domain.com>
    service: http://localhost:8787
  - service: http_status:404
```

Replace `<tunnel-id>` and hostname with your actual values.

## 8. Run the tunnel

**Option A — Direct (for testing):**

```bash
cloudflared tunnel run perps-api
```

**Option B — Docker (for the laptop server):**

```bash
docker run -d \
  --name cloudflared \
  --restart=unless-stopped \
  --network=host \
  -v /home/<user>/.cloudflared:/etc/cloudflared \
  cloudflare/cloudflared:latest \
  tunnel --config /etc/cloudflared/config.yml run perps-api
```

**Option C — systemd (alternative to Docker):**

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## 9. Add CORS to the Rust backend

The dashboard (on `perps-dashboard.pages.dev`) makes cross-origin requests to the backend. Add a CORS layer in the backend's Rust code:

```rust
use tower_http::cors::{CorsLayer, AllowOrigin};
use http::{Method, header::CONTENT_TYPE};

let cors = CorsLayer::new()
    .allow_origin(AllowOrigin::exact(
        "https://perps-dashboard.pages.dev".parse().unwrap(),
    ))
    .allow_methods([Method::GET])
    .allow_headers([CONTENT_TYPE]);

// Add `cors` to your tower service stack
```

## 10. Verify the full pipeline

1. Push a commit to `main`
2. Check GitHub Actions — the `deploy` job should succeed
3. Visit `https://perps-dashboard.pages.dev` — the dashboard should load
4. Open browser DevTools → Network tab — API calls should hit your tunnel hostname and return data
5. Check for CORS errors in the console — there should be none

## Troubleshooting

**Deploy job fails with "project not found":**

- Verify the project name matches: `perps-dashboard`
- Verify `CLOUDFLARE_ACCOUNT_ID` is set correctly in GitHub Actions variables

**API calls fail with CORS error:**

- Check the Rust backend's `CorsLayer` allows `https://perps-dashboard.pages.dev`
- Check the `Access-Control-Allow-Origin` response header in DevTools

**Tunnel returns 502:**

- The Rust backend process isn't running on port 8787
- Check: `curl http://localhost:8787/api/v1/health` on the backend machine

**WebSocket fails to connect:**

- Cloudflare Tunnel supports WebSocket natively
- Verify `NEXT_PUBLIC_WS_BASE` uses `wss://` (not `ws://`) in production

````

- [ ] **Step 2: Commit**

```bash
git add docs/runbooks/cloudflare-setup.md
git commit -m "docs: add Cloudflare setup runbook"
````

---

### Task 4: Write the tunnel migration runbook

Document how to move the tunnel from one machine to another (e.g., dev machine → laptop server).

**Files:**

- Create: `docs/runbooks/tunnel-migration.md`

- [ ] **Step 1: Write the migration runbook**

Create `docs/runbooks/tunnel-migration.md` with this content:

````markdown
# Tunnel Migration Runbook

How to move the Cloudflare Tunnel from one machine to another (e.g., dev machine → dedicated laptop server).

## What moves

| Item                 | Location                          | Action                                              |
| -------------------- | --------------------------------- | --------------------------------------------------- |
| Tunnel credentials   | `~/.cloudflared/<tunnel-id>.json` | Copy to new machine                                 |
| Tunnel config        | `~/.cloudflared/config.yml`       | Copy to new machine, update `credentials-file` path |
| `cloudflared` binary | Installed on old machine          | Install on new machine                              |
| Rust backend         | Running on old machine            | Build/run on new machine                            |

## What stays the same

- Tunnel ID and public hostname — unchanged
- CNAME record — unchanged
- Dashboard env vars — unchanged (no rebuild needed)
- Cloudflare Pages config — unchanged

## Steps

### 1. Install cloudflared on the new machine

```bash
# Linux (most likely for laptop server)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared
```
````

### 2. Copy credentials and config

From the old machine:

```bash
scp ~/.cloudflared/<tunnel-id>.json user@new-machine:~/.cloudflared/
scp ~/.cloudflared/config.yml user@new-machine:~/.cloudflared/
```

On the new machine, update the `credentials-file` path in `config.yml` if the username differs.

### 3. Start the Rust backend on the new machine

Build and run the backend so it listens on `localhost:8787`.

### 4. Start the tunnel on the new machine

```bash
cloudflared tunnel run perps-api
```

Or via Docker:

```bash
docker run -d \
  --name cloudflared \
  --restart=unless-stopped \
  --network=host \
  -v /home/<user>/.cloudflared:/etc/cloudflared \
  cloudflare/cloudflared:latest \
  tunnel --config /etc/cloudflared/config.yml run perps-api
```

### 5. Stop the tunnel on the old machine

```bash
# If running directly:
pkill cloudflared

# If running via Docker:
docker stop cloudflared && docker rm cloudflared

# If running via systemd:
sudo systemctl stop cloudflared
sudo systemctl disable cloudflared
```

### 6. Verify

1. `curl https://api-perps.<your-domain>/api/v1/health` — should return 200
2. Open `https://perps-dashboard.pages.dev` — should load data from the new machine
3. Check WebSocket connection in browser DevTools

No dashboard rebuild needed. The CNAME and tunnel hostname are unchanged.

````

- [ ] **Step 2: Commit**

```bash
git add docs/runbooks/tunnel-migration.md
git commit -m "docs: add tunnel migration runbook"
````

---

### Task 5: Final validation

Verify the complete CI workflow file is valid and all docs are consistent.

**Files:**

- Read: `.github/workflows/ci.yml` (final state)
- Read: `docs/runbooks/cloudflare-setup.md`
- Read: `docs/runbooks/tunnel-migration.md`

- [ ] **Step 1: Validate the final ci.yml**

Run:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 2: Verify all referenced GitHub secrets/variables are documented**

Check that the runbook documents every secret/variable used in `ci.yml`:

- `secrets.CLOUDFLARE_API_TOKEN` → Runbook step 3 + 4
- `vars.CLOUDFLARE_ACCOUNT_ID` → Runbook step 1 + 4
- `vars.NEXT_PUBLIC_API_BASE` → Runbook step 4 + 6
- `vars.NEXT_PUBLIC_WS_BASE` → Runbook step 4 + 6

- [ ] **Step 3: Dry-run the workflow change locally (optional)**

If you have `act` installed (GitHub Actions local runner):

```bash
act push --job test --dryrun
```

Otherwise, skip — the first real push to `main` will validate the workflow.

- [ ] **Step 4: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "chore: fixup CI and docs consistency"
```
