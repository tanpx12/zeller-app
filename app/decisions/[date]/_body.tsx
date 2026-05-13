'use client'

import { notFound } from 'next/navigation'
import { ApiError } from '@/api-client'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { KvRow } from '@/components/dashboard/KvRow'
import { Skeleton } from '@/components/ui/skeleton'
import { DecisionCard } from '@/components/sections/DecisionCard'
import { useDecision } from '@/hooks/useDecisions'
import { decimals } from '@/lib/format'
import { FileWarning } from 'lucide-react'

export function DecisionDetailBody({ date }: { date: string }) {
  const { data: decision, isLoading, error } = useDecision(date)

  if (error instanceof ApiError && error.status === 404) {
    notFound()
  }

  const drift = decision?.feature_drift
    ? Object.entries(decision.feature_drift).sort((a, b) => b[1] - a[1])
    : []

  return (
    <div className="space-y-5">
      <PageHeader title="Decision" meta={<code className="font-mono text-xs">{date}</code>} />

      <ErrorBoundary label="Decision card">
        {isLoading ? (
          <Skeleton className="h-[260px] w-full rounded-lg" />
        ) : error ? (
          <EmptyState
            icon={FileWarning}
            title="Failed to load decision"
            description={String(error)}
          />
        ) : decision ? (
          <DecisionCard date={date} decision={decision} />
        ) : null}
      </ErrorBoundary>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <ErrorBoundary label="Window">
          <section className="rounded-lg border border-border bg-surface px-[18px] pt-3.5 pb-1">
            <div className="mb-3 text-[13px] font-medium text-foreground">Window</div>
            {decision && (
              <>
                <KvRow keyLabel="Window start" value={decision.window_start} />
                <KvRow keyLabel="Window end" value={decision.window_end} />
                <KvRow keyLabel="Bars in window" value={decision.n_bars.toString()} />
                <KvRow
                  keyLabel="Generated at"
                  value={<span className="text-muted-foreground">{decision.generated_at}</span>}
                  last
                />
              </>
            )}
          </section>
        </ErrorBoundary>

        <ErrorBoundary label="Feature drift">
          <section className="rounded-lg border border-border bg-surface px-[18px] pt-3.5 pb-1">
            <div className="mb-3 text-[13px] font-medium text-foreground">
              Feature drift{' '}
              <span className="ml-1 font-mono text-[11px] text-muted-foreground">
                PSI per feature
              </span>
            </div>
            {drift.length === 0 ? (
              <div className="pb-3 text-xs text-muted-foreground">No feature-drift signals.</div>
            ) : (
              drift.map(([name, psi], i) => (
                <KvRow
                  key={name}
                  keyLabel={<span className="font-mono">{name}</span>}
                  value={
                    <span
                      className={
                        psi >= 0.25
                          ? 'text-negative'
                          : psi >= 0.1
                            ? 'text-warning'
                            : 'text-foreground'
                      }
                    >
                      {decimals(psi, 3)}
                    </span>
                  }
                  last={i === drift.length - 1}
                />
              ))
            )}
          </section>
        </ErrorBoundary>
      </div>

      {decision && decision.recommended_next_steps.length > 0 && (
        <ErrorBoundary label="Recommended next steps">
          <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
            <div className="mb-3 text-[13px] font-medium text-foreground">
              Recommended next steps
            </div>
            <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground marker:text-faint-foreground">
              {decision.recommended_next_steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </section>
        </ErrorBoundary>
      )}
    </div>
  )
}
