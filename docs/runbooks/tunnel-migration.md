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
