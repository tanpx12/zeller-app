import { OpenAPI } from '@/api-client'

// Every generated service path already includes the `/api/v1/` prefix, so
// the configured base URL must NOT include it — otherwise URLs come out as
// `http://host/api/v1/api/v1/...` and 404 (the backend's OpenAPI generator
// changed to emit full paths on 2026-05-13). The `NEXT_PUBLIC_API_BASE`
// env var, when set, is normalised below to tolerate either form.
const raw = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8787'
OpenAPI.BASE = raw.replace(/\/api\/v1\/?$/, '')

export { OpenAPI }
