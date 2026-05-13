import { Suspense } from 'react'
import { ModelDetailBody } from './_body'
import type { ModelListResponse } from '@/api-client'

// Static-export requires every dynamic segment's params be enumerable at
// build time. We fetch the catalog and emit one shell per model. If the
// backend is unreachable or the catalog is empty we emit a `_placeholder`
// (same trick as /decisions/[date]) so the build still succeeds.
const PLACEHOLDER = '_placeholder'
export const dynamicParams = false

export async function generateStaticParams() {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8787/api/v1'
  try {
    const res = await fetch(`${base}/models`, { cache: 'no-store' })
    if (!res.ok) return [{ name: PLACEHOLDER }]
    const json = (await res.json()) as ModelListResponse
    const params = json.data.map((m) => ({ name: encodeURIComponent(m.name) }))
    return params.length > 0 ? params : [{ name: PLACEHOLDER }]
  } catch {
    return [{ name: PLACEHOLDER }]
  }
}

export default async function ModelDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (name === PLACEHOLDER) {
    const NotFound = (await import('./not-found')).default
    return <NotFound />
  }
  const decoded = decodeURIComponent(name)
  return (
    <Suspense fallback={null}>
      <ModelDetailBody name={decoded} />
    </Suspense>
  )
}
