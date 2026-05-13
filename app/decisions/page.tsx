'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileWarning } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { DecisionFilters } from '@/components/sections/DecisionFilters'
import { DecisionRow } from '@/components/sections/DecisionRow'
import { useDecisions } from '@/hooks/useDecisions'
import { verdictKindFromLabel, type VerdictKind } from '@/lib/verdict'

function DecisionsBody() {
  const params = useSearchParams()
  const verdictFilter = (params.get('verdict') as VerdictKind | null) ?? null

  const { data, isLoading, error } = useDecisions()

  const filtered = useMemo(() => {
    if (!data) return []
    if (!verdictFilter) return data.data
    return data.data.filter((entry) => {
      const k = verdictKindFromLabel(entry.verdict_label)
      // "Retrain" filter covers both Recommend + StronglyRecommend.
      if (verdictFilter === 'recommend') return k === 'recommend' || k === 'strongly_recommend'
      return k === verdictFilter
    })
  }, [data, verdictFilter])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Retrain decisions"
        meta={
          data
            ? `Weekly evaluator · ${data.data.length} report${data.data.length === 1 ? '' : 's'}`
            : 'Weekly evaluator'
        }
      />

      <DecisionFilters facets={data?.facets} totalCount={data?.data.length} />

      <ErrorBoundary label="Decisions list">
        {error ? (
          <EmptyState
            icon={FileWarning}
            title="Failed to load decisions"
            description={String(error)}
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileWarning}
            title={
              data && data.data.length === 0
                ? 'No decision reports yet'
                : 'No decisions match this filter'
            }
            description={
              data && data.data.length === 0
                ? 'Run the weekly evaluator (cargo run --bin weekly_evaluator) to generate the first report.'
                : 'Loosen the verdict filter or pick "All".'
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((entry) => (
              <DecisionRow key={entry.date} entry={entry} />
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}

export default function DecisionsPage() {
  return (
    <Suspense fallback={null}>
      <DecisionsBody />
    </Suspense>
  )
}
