'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Activity } from 'lucide-react'
import type { RiskEventsDto } from '@/api-client'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { LiveKpis } from '@/components/sections/LiveKpis'
import { LiveFillsTape } from '@/components/sections/LiveFillsTape'
import { LiveForecastDiagnostics } from '@/components/sections/LiveForecastDiagnostics'
import { AdapterStatusCard } from '@/components/sections/AdapterStatusCard'
import { EquityChart } from '@/components/sections/EquityChart'
import { RiskEventFeed } from '@/components/sections/RiskEventFeed'
import { LiveModelSelector } from '@/components/dashboard/LiveModelSelector'
import { useLiveStatus } from '@/hooks/useLiveStatus'
import { useLiveEquity, useLiveFills, useLiveRiskEvents } from '@/hooks/useLiveSections'
import { useLiveStream } from '@/hooks/useLiveStream'
import { LIVE_MODELS, DEFAULT_MODEL, type LiveModelName } from '@/lib/live-model-client'
import type { ConnectionState } from '@/lib/ws-client'

// Memoise the type filter so useLiveStream sees a stable reference.
const STREAM_TYPES = ['fill', 'equity', 'risk_event'] as const

function useSelectedModel(): [LiveModelName, (m: LiveModelName) => void] {
  const params = useSearchParams()
  const router = useRouter()
  const raw = params.get('model')
  const model: LiveModelName =
    raw && (LIVE_MODELS as readonly string[]).includes(raw) ? (raw as LiveModelName) : DEFAULT_MODEL

  const setModel = useCallback(
    (next: LiveModelName) => {
      const sp = new URLSearchParams(params.toString())
      if (next === DEFAULT_MODEL) sp.delete('model')
      else sp.set('model', next)
      const qs = sp.toString()
      router.replace(qs ? `?${qs}` : '?', { scroll: false })
    },
    [params, router],
  )

  return [model, setModel]
}

function LiveBody() {
  const [model, setModel] = useSelectedModel()
  const status = useLiveStatus(model)
  const equity = useLiveEquity({ model })
  const fills = useLiveFills({ model })
  const riskEvents = useLiveRiskEvents({ model })
  const stream = useLiveStream({ types: STREAM_TYPES, bufferSize: 200 })

  useConnectionToasts(stream.state)

  const fillEvents = useMemo(() => stream.events.filter((m) => m.type === 'fill'), [stream.events])

  // Live risk events use `timestamp_ms: number`; report-level RiskEventFeed
  // expects `timestamp: string`. Adapt at the boundary.
  const riskEventsAdapted = useMemo<RiskEventsDto | undefined>(() => {
    if (!riskEvents.data) return undefined
    return {
      events: riskEvents.data.data.map((ev) => ({
        action: ev.action,
        context: ev.context,
        guard: ev.guard,
        timestamp: new Date(ev.timestamp_ms).toISOString(),
      })),
    }
  }, [riskEvents.data])

  // When the live runner is offline (initial /live/status 503) AND there are
  // no fills yet, render the explicit "not running" empty state. Otherwise
  // we render the dashboard with skeletons / muted values.
  const offline = status.status === 'down' && !status.data

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          title="Live paper trading"
          meta={
            status.data
              ? `Position updated ${status.data.age_seconds}s ago · ${stream.state}`
              : 'Live runner status: ' + status.status
          }
        />
        <LiveModelSelector value={model} onChange={setModel} />
      </div>

      {offline ? (
        <EmptyState
          icon={Activity}
          title="Paper trader not running"
          description="Start it with `cargo run --release --bin paper_trade`. The dashboard reconnects automatically — no reload needed."
        />
      ) : (
        <>
          <ErrorBoundary label="Hero KPIs">
            <LiveKpis data={status.data} loading={status.isLoading} />
          </ErrorBoundary>

          <ErrorBoundary label="Equity curve">
            <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
              <div className="mb-3 flex items-center justify-between text-[13px] font-medium text-foreground">
                <span>
                  Equity curve{' '}
                  <span className="ml-1 font-mono text-[11px] text-muted-foreground">
                    net of fees + slippage + funding
                  </span>
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  60s poll · WS appends
                </span>
              </div>
              <EquityChart data={equity.data} loading={equity.isLoading} bare height={220} />
            </section>
          </ErrorBoundary>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
            <ErrorBoundary label="Recent fills">
              <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
                <div className="mb-3 flex items-center justify-between text-[13px] font-medium text-foreground">
                  <span>Recent fills</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {fillEvents.length} via WS
                  </span>
                </div>
                <LiveFillsTape
                  polled={fills.data}
                  streamed={stream.events}
                  loading={fills.isLoading}
                />
              </section>
            </ErrorBoundary>

            <ErrorBoundary label="Risk events">
              <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
                <div className="mb-3 text-[13px] font-medium text-foreground">Risk events</div>
                <RiskEventFeed data={riskEventsAdapted} loading={riskEvents.isLoading} />
              </section>
            </ErrorBoundary>

            <div className="flex flex-col gap-4">
              <ErrorBoundary label="Forecast diagnostics">
                <section className="rounded-lg border border-border bg-surface px-[18px] py-4">
                  <div className="mb-3 text-[13px] font-medium text-foreground">
                    Forecast diagnostics
                  </div>
                  <LiveForecastDiagnostics data={status.data} />
                </section>
              </ErrorBoundary>

              <ErrorBoundary label="Signal adapter">
                <AdapterStatusCard status={status.data?.adapter} />
              </ErrorBoundary>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function LivePage() {
  return (
    <Suspense fallback={null}>
      <LiveBody />
    </Suspense>
  )
}

/**
 * Show a sonner toast on WS connection state changes — gives the operator
 * an explicit signal that something happened to the live link.
 */
function useConnectionToasts(state: ConnectionState) {
  const prevRef = useRef<ConnectionState | null>(null)
  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = state
    if (prev == null) return // first render — no toast on initial state

    if (
      state === 'open' &&
      (prev === 'reconnecting' || prev === 'attempting' || prev === 'disconnected')
    ) {
      toast.success('Live stream connected', { duration: 2000 })
    } else if (state === 'reconnecting' && prev === 'open') {
      toast.warning('Live stream lost — reconnecting…', { duration: 3000 })
    } else if (state === 'disconnected') {
      toast.error('Live stream disconnected — retries exhausted', { duration: 8000 })
    }
  }, [state])
}
