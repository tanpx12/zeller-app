'use client'

import { notFound, useSearchParams } from 'next/navigation'
import { FileWarning } from 'lucide-react'
import { ApiError } from '@/api-client'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { ModeBadge } from '@/components/dashboard/ModeBadge'
import { toMode } from '@/lib/mode'
import { ModelTradesFilters } from '@/components/sections/ModelTradesFilters'
import { ModelTradesSummary } from '@/components/sections/ModelTradesSummary'
import { ModelTradesTable } from '@/components/sections/ModelTradesTable'
import { useModels, useModelTrades } from '@/hooks/useModels'
import { formatUtc } from '@/lib/time'

export function ModelDetailBody({ name }: { name: string }) {
  const params = useSearchParams()

  const models = useModels()
  const entry = models.data?.data.find((m) => m.name === name)

  // Treat "model not in catalog" as not-found — both for unknown names and
  // for cases where the user navigates here after the backend dropped the
  // entry from models.json.
  if (models.data && !entry) {
    notFound()
  }

  const filters = {
    mode: params.get('mode') ?? undefined,
    sizer: params.get('sizer') ?? undefined,
    leverage: params.get('leverage') ? Number(params.get('leverage')) : undefined,
    sl: params.get('sl') ? Number(params.get('sl')) : undefined,
    limit: 200,
  }

  const trades = useModelTrades(name, filters)

  const rows = trades.data?.pages.flatMap((p) => p.data) ?? []
  const firstPage = trades.data?.pages[0]
  const totalEstimate = firstPage?.total_count_estimate

  // Tolerate ApiError on the trades query (e.g. 404 from a model that vanished
  // from the catalog mid-render).
  if (trades.error instanceof ApiError && trades.error.status === 404) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Model"
        meta={
          entry ? (
            <span className="flex items-baseline gap-3">
              <span className="font-mono text-foreground">{name}</span>
              <span>
                {entry.n_runs.toLocaleString('en-US')} {entry.n_runs === 1 ? 'run' : 'runs'}
              </span>
              <span className="flex items-center gap-1.5">
                {entry.modes.map((m) => (
                  <ModeBadge key={m} mode={toMode(m)} />
                ))}
              </span>
              {entry.latest_period_start_ms != null && (
                <span>latest run: {formatUtc(entry.latest_period_start_ms).slice(0, 10)}</span>
              )}
            </span>
          ) : (
            <span className="font-mono text-foreground">{name}</span>
          )
        }
      />

      {entry?.description && <p className="text-sm text-muted-foreground">{entry.description}</p>}

      <ErrorBoundary label="Filters">
        <ModelTradesFilters visibleCount={rows.length} totalEstimate={totalEstimate} />
      </ErrorBoundary>

      <ErrorBoundary label="Summary">
        <ModelTradesSummary rows={rows} totalEstimate={totalEstimate} />
      </ErrorBoundary>

      <ErrorBoundary label="Trades">
        {trades.error && !(trades.error instanceof ApiError && trades.error.status === 404) ? (
          <EmptyState
            icon={FileWarning}
            title="Failed to load model trades"
            description={String(trades.error)}
          />
        ) : (
          <ModelTradesTable
            rows={rows}
            loading={trades.isLoading}
            isFetchingMore={trades.isFetchingNextPage}
            onLoadMore={() => trades.fetchNextPage()}
            hasNextPage={trades.hasNextPage}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}
