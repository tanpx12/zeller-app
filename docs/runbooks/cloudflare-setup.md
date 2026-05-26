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
pnpm dlx wrangler pages project create perps-dashboard --production-branch=main
```

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
