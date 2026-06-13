import { Suspense } from 'react'
import { ReportDetailBody } from './_body'
import type { ListReportsResponse } from '@/api-client'

const PLACEHOLDER = '_placeholder'

export async function generateStaticParams(): Promise<Array<{ runId: string }>> {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8787'
  try {
    const res = await fetch(`${base}/api/v1/reports?limit=500`, { cache: 'no-store' })
    if (!res.ok) return [{ runId: PLACEHOLDER }]
    const json = (await res.json()) as ListReportsResponse
    const params = json.data.map((r) => ({ runId: encodeURIComponent(r.run_id) }))
    return params.length > 0 ? params : [{ runId: PLACEHOLDER }]
  } catch {
    return [{ runId: PLACEHOLDER }]
  }
}

export default async function ReportDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  if (runId === PLACEHOLDER) {
    const NotFound = (await import('./not-found')).default
    return <NotFound />
  }
  const decoded = decodeURIComponent(runId)
  return (
    <Suspense fallback={null}>
      <ReportDetailBody runId={decoded} />
    </Suspense>
  )
}
