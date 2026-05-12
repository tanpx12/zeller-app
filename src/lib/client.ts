import { OpenAPI } from '@/api-client'

OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8787/api/v1'

export { OpenAPI }
