'use client'

import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { ApiError } from '@/api-client'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { EmptyState } from '@/components/dashboard/EmptyState'
import type { RangeValue } from '@/components/dashboard/RangeChips'
import { HeadlineKpis } from '@/components/sections/HeadlineKpis'
import { StatGrid } from '@/components/sections/StatGrid'
import { TradeTable } from '@/components/sections/TradeTable'
import { RiskEventFeed } from '@/components/sections/RiskEventFeed'
import { EquityCard } from '@/components/sections/EquityCard'
import { HourOfDayChart } from '@/components/sections/HourOfDayChart'
import { CostAttributionDonut } from '@/components/sections/CostAttributionDonut'
import { ForecastDiagnostics } from '@/components/sections/ForecastDiagnostics'
import { ConfigSnapshotCard } from '@/components/sections/ConfigSnapshotCard'
import { AdapterSection } from '@/components/sections/AdapterSection'
import {
  useReportAttribution,
  useReportDrawdown,
  useReportEquity,
  useReportForecast,
  useReportFull,
  useReportHeadline,
  useReportRiskEvents,
  useReportTimeAnalysis,
  useReportTrades,
} from '@/hooks/useReportSections'
import { parseRange, rangeToSinceMs } from '@/lib/range'
import { FileWarning } from 'lucide-react'

export function ReportDetailBody({ runId }: { runId: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const range = parseRange(params.get('range'))
  const since = rangeToSinceMs(range)

  const setRange = (next: RangeValue) => {
    const sp = new URLSearchParams(params.toString())
    if (next === 'all') sp.delete('range')
    else sp.set('range', next)
    const qs = sp.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }

  const headline = useReportHeadline(runId)
  const equity = useReportEquity(runId, { since, downsample: 'hourly' })
  const drawdown = useReportDrawdown(runId)
  const trades = useReportTrades(runId, { limit: 50 })
  const riskEvents = useReportRiskEvents(runId)
  const timeAnalysis = useReportTimeAnalysis(runId)
  const attribution = useReportAttribution(runId)
  const forecast = useReportForecast(runId)
  const full = useReportFull(runId)

  if (headline.error instanceof ApiError && headline.error.status === 404) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Report" meta={<code className="font-mono text-xs">{runId}</code>} />

      <ErrorBoundary label="Headline">
        {headline.error &&
        !(headline.error instanceof ApiError && headline.error.status === 404) ? (
          <EmptyState
            icon={FileWarning}
            title="Failed to load headline"
            description={String(headline.error)}
          />
        ) : (
          <>
            <HeadlineKpis headline={headline.data} loading={headline.isLoading} />
            <StatGrid headline={headline.data} loading={headline.isLoading} />
          </>
        )}
      </ErrorBoundary>

      <ErrorBoundary label="Config snapshot">
        <ConfigSnapshotCard data={full.data?.meta.config_snapshot} loading={full.isLoading} />
      </ErrorBoundary>

      <ErrorBoundary label="Equity curve">
        <EquityCard
          equity={equity.data}
          drawdown={drawdown.data}
          equityLoading={equity.isLoading}
          drawdownLoading={drawdown.isLoading}
          range={range}
          onRangeChange={setRange}
        />
      </ErrorBoundary>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ErrorBoundary label="P&L by hour (UTC)">
          <section className="space-y-2 lg:col-span-1">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              P&L by hour (UTC)
            </h2>
            <HourOfDayChart data={timeAnalysis.data} loading={timeAnalysis.isLoading} />
          </section>
        </ErrorBoundary>

        <ErrorBoundary label="Cost attribution">
          <section className="space-y-2 lg:col-span-1">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Cost attribution
            </h2>
            <CostAttributionDonut data={attribution.data} loading={attribution.isLoading} />
          </section>
        </ErrorBoundary>

        <ErrorBoundary label="Forecast diagnostics">
          <section className="space-y-2 lg:col-span-1">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Forecast diagnostics
            </h2>
            <ForecastDiagnostics data={forecast.data} loading={forecast.isLoading} />
          </section>
        </ErrorBoundary>
      </div>

      <ErrorBoundary label="Signal adapter">
        <AdapterSection adapter={full.data?.adapter} />
      </ErrorBoundary>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <ErrorBoundary label="Trades">
          <section className="space-y-2">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Trades
            </h2>
            <TradeTable page={trades.data} loading={trades.isLoading} />
          </section>
        </ErrorBoundary>

        <ErrorBoundary label="Risk events">
          <section className="space-y-2">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Risk events
            </h2>
            <RiskEventFeed data={riskEvents.data} loading={riskEvents.isLoading} />
          </section>
        </ErrorBoundary>
      </div>
    </div>
  )
}
