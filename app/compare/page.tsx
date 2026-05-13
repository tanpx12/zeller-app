'use client'

import { Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileWarning } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { VsDivider } from '@/components/dashboard/VsDivider'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { RunPicker } from '@/components/sections/RunPicker'
import { CompareGrid } from '@/components/sections/CompareGrid'
import { CompareVerdictBanner } from '@/components/sections/CompareVerdictBanner'
import { EquityOverlay } from '@/components/sections/EquityOverlay'
import { DrawdownOverlay } from '@/components/sections/DrawdownOverlay'
import { ReturnDistribution } from '@/components/sections/ReturnDistribution'
import { StatisticalEvidence } from '@/components/sections/StatisticalEvidence'
import { useCompare } from '@/hooks/useCompare'

function CompareBody() {
  const router = useRouter()
  const params = useSearchParams()
  const a = params.get('a') ?? undefined
  const b = params.get('b') ?? undefined

  const setRun = useCallback(
    (slot: 'a' | 'b', value: string | undefined) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(slot, value)
      else next.delete(slot)
      const qs = next.toString()
      router.replace(qs ? `?${qs}` : '?', { scroll: false })
    },
    [params, router],
  )

  const compare = useCompare(a, b)
  const status = (compare.error as { status?: number } | undefined)?.status

  return (
    <div className="space-y-5">
      <PageHeader title="Compare" meta="Side-by-side comparison of two runs" />

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-6">
        <RunPicker variant="a" runId={a} onChange={(v) => setRun('a', v)} />
        <div className="flex items-center">
          <VsDivider />
        </div>
        <RunPicker variant="b" runId={b} onChange={(v) => setRun('b', v)} />
      </div>

      {!a || !b ? (
        <EmptyState
          title="Pick two runs to compare"
          description="Type a run_id, asset, or mode into either picker above. Comparisons are bound by the shared period — non-overlapping ranges show a mismatch banner."
        />
      ) : status === 409 ? (
        <EmptyState
          icon={FileWarning}
          title="Periods do not overlap"
          description={
            <>
              The selected runs cover entirely different time ranges. Pick two runs with at least
              some overlapping bars to compare them statistically.
            </>
          }
        />
      ) : status === 404 ? (
        <EmptyState
          icon={FileWarning}
          title="Run not found"
          description="One or both of the selected run_ids is not indexed by the backend."
        />
      ) : compare.error ? (
        <EmptyState icon={FileWarning} title="Compare failed" description={String(compare.error)} />
      ) : (
        <>
          {compare.data && (
            <ErrorBoundary label="Verdict">
              <CompareVerdictBanner verdict={compare.data.verdict} />
            </ErrorBoundary>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <ErrorBoundary label="Equity overlay">
              <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
                <div className="mb-3 flex items-center justify-between text-[13px] font-medium text-foreground">
                  <span>Equity overlay</span>
                  {compare.data && (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {compare.data.headline_diff.find((m) => m.name === 'terminal_equity')
                        ? 'shared period'
                        : null}
                    </span>
                  )}
                </div>
                <Legend />
                {compare.isLoading ? (
                  <Skeleton className="h-[280px] w-full rounded-md" />
                ) : (
                  <EquityOverlay
                    a={compare.data?.equity_overlay.a}
                    b={compare.data?.equity_overlay.b}
                  />
                )}
              </section>
            </ErrorBoundary>

            <ErrorBoundary label="Headline metrics">
              <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
                <div className="mb-3 text-[13px] font-medium text-foreground">Headline metrics</div>
                {compare.isLoading ? (
                  <Skeleton className="h-[280px] w-full rounded-md" />
                ) : compare.data ? (
                  <CompareGrid rows={compare.data.headline_diff} />
                ) : null}
              </section>
            </ErrorBoundary>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ErrorBoundary label="Drawdown overlay">
              <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
                <div className="mb-3 text-[13px] font-medium text-foreground">Drawdown overlay</div>
                {compare.isLoading ? <Skeleton className="h-[200px] w-full rounded-md" /> : null}
                {compare.data && (
                  <DrawdownOverlay
                    a={compare.data.equity_overlay.a}
                    b={compare.data.equity_overlay.b}
                  />
                )}
              </section>
            </ErrorBoundary>

            <ErrorBoundary label="Return distribution">
              <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
                <div className="mb-3 text-[13px] font-medium text-foreground">
                  Return distribution
                </div>
                {compare.isLoading ? (
                  <Skeleton className="h-[200px] w-full rounded-md" />
                ) : (
                  <ReturnDistribution data={compare.data?.return_distribution_overlay} />
                )}
              </section>
            </ErrorBoundary>
          </div>

          {compare.data && (
            <ErrorBoundary label="Statistical evidence">
              <StatisticalEvidence data={compare.data} />
            </ErrorBoundary>
          )}
        </>
      )}
    </div>
  )
}

function Legend() {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-0.5 w-3 bg-primary" aria-hidden />
        Run A
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-0.5 w-3 bg-warning" aria-hidden />
        Run B
      </span>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareBody />
    </Suspense>
  )
}
