import { Suspense } from 'react'
import { ReportDetailBody } from './_body'
import type { ListReportsResponse } from '@/api-client'

/**
 * Static-export requires every dynamic route's params be enumerable at build
 * time. We fetch the current list of indexed reports from the backend (at the
 * URL configured via `NEXT_PUBLIC_API_BASE`) and emit one static shell per
 * `run_id`. All section data is still fetched client-side at view time, so
 * pages stay fresh — the shell is just the routing skeleton.
 *
 * If the backend is unreachable during the build, we fall back to an empty
 * list. Builds still succeed and `/reports` keeps working; only the dynamic
 * detail pages are unavailable until the next backend-reachable rebuild.
 */
export async function generateStaticParams(): Promise<Array<{ runId: string }>> {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8787/api/v1'
  try {
    const res = await fetch(`${base}/reports?limit=500`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = (await res.json()) as ListReportsResponse
    return json.data.map((r) => ({ runId: encodeURIComponent(r.run_id) }))
  } catch {
    return []
  }
}

export default async function ReportDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const decoded = decodeURIComponent(runId)
  return (
    <Suspense fallback={null}>
      <ReportDetailBody runId={decoded} />
    </Suspense>
  )
}
