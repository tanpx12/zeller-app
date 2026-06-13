'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { FileWarning } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'
import { ReportTable } from '@/components/sections/ReportTable'
import { ReportFilters } from '@/components/sections/ReportFilters'
import { useReportListInfinite } from '@/hooks/useReportListInfinite'

// Normalize URL params to API filter values. Critical: empty strings get
// coerced to `undefined` so a stray `?mode=` (e.g. from a prior "Reset"
// half-applied) doesn't ship `mode=""` to the backend, which now strictly
// 400s on an empty mode string.
function nonEmpty(raw: string | null): string | undefined {
  if (raw == null) return undefined
  const trimmed = raw.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

function maybeNumber(raw: string | null): number | undefined {
  const s = nonEmpty(raw)
  if (s == null) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

function ReportsBody() {
  const params = useSearchParams()
  const filters = {
    mode: nonEmpty(params.get('mode')),
    asset: nonEmpty(params.get('asset')),
    minSharpe: maybeNumber(params.get('min_sharpe')),
    limit: 50,
  }

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReportListInfinite(filters)

  const rows = data?.pages.flatMap((p) => p.data) ?? []
  const facets = data?.pages[0]?.facets
  const totalEstimate = data?.pages[0]?.total_count_estimate ?? 0

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports"
        meta={
          data
            ? `${rows.length.toLocaleString('en-US')} of ~${totalEstimate.toLocaleString('en-US')} indexed`
            : 'Persisted backtest reports'
        }
      />

      <ReportFilters facets={facets} totalCount={totalEstimate} />

      <ErrorBoundary label="Reports list">
        {error ? (
          <EmptyState
            icon={FileWarning}
            title="Backend unreachable"
            description={error instanceof Error ? error.message : String(error)}
          />
        ) : (
          <>
            <ReportTable rows={rows} loading={isLoading} />
            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </ErrorBoundary>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsBody />
    </Suspense>
  )
}
