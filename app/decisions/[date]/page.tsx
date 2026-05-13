import { Suspense } from 'react'
import { DecisionDetailBody } from './_body'
import type { DecisionListResponse } from '@/api-client'

// Static-export needs `dynamicParams=false` when generateStaticParams may
// return [] — otherwise Next falls back to runtime resolution which is
// incompatible with `output: 'export'`. Any date not pre-rendered at build
// time will 404 until a rebuild includes it.
export const dynamicParams = false

/**
 * Fetches the current decisions list and emits one static shell per `date`.
 * If the backend is unreachable or has no decisions, returns an empty list —
 * the route resolves to 404 for any date until a rebuild picks up new entries.
 */
// Next.js + `output: 'export'` requires at least one prerendered path per
// dynamic route. When the backend has no decisions yet we still need to
// instantiate the route shell, so we emit a sentinel `_placeholder` page
// that renders the standard not-found UI. The decisions list won't link to
// it; it just keeps the build valid.
const PLACEHOLDER = '_placeholder'

export async function generateStaticParams() {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8787/api/v1'
  try {
    const res = await fetch(`${base}/decisions`, { cache: 'no-store' })
    if (!res.ok) return [{ date: PLACEHOLDER }]
    const json = (await res.json()) as DecisionListResponse
    const params = json.data.map((entry) => ({ date: encodeURIComponent(entry.date) }))
    return params.length > 0 ? params : [{ date: PLACEHOLDER }]
  } catch {
    return [{ date: PLACEHOLDER }]
  }
}

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  if (date === PLACEHOLDER) {
    const NotFound = (await import('./not-found')).default
    return <NotFound />
  }
  const decoded = decodeURIComponent(date)
  return (
    <Suspense fallback={null}>
      <DecisionDetailBody date={decoded} />
    </Suspense>
  )
}
