'use client'

import type { HeadlineSection } from '@/api-client'
import { Kpi } from '@/components/dashboard/Kpi'
import { Skeleton } from '@/components/ui/skeleton'
import { decimals, money, percent } from '@/lib/format'

export interface HeadlineKpisProps {
  headline?: HeadlineSection
  loading?: boolean
}

export function HeadlineKpis({ headline, loading }: HeadlineKpisProps) {
  if (loading || !headline) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    )
  }

  const totalReturnTone =
    headline.total_return_pct > 0
      ? 'positive'
      : headline.total_return_pct < 0
        ? 'negative'
        : 'default'

  return (
    <div className="grid grid-cols-4 gap-3">
      <Kpi
        label="Terminal equity"
        value={money(headline.terminal_equity)}
        sub={`${percent(headline.total_return_pct)} from ${money(headline.initial_equity)}`}
        tone={totalReturnTone}
      />
      <Kpi
        label="Sharpe"
        value={decimals(headline.sharpe.value)}
        sub={`CI [${decimals(headline.sharpe.ci_lower)}, ${decimals(headline.sharpe.ci_upper)}]`}
        tone={headline.sharpe.value >= 1 ? 'positive' : 'default'}
      />
      <Kpi
        label="Sortino"
        value={decimals(headline.sortino.value)}
        sub={`CI [${decimals(headline.sortino.ci_lower)}, ${decimals(headline.sortino.ci_upper)}]`}
        tone={headline.sortino.value >= 1 ? 'positive' : 'default'}
      />
      <Kpi
        label="Max drawdown"
        value={percent(-headline.max_drawdown_pct)}
        sub={`${headline.n_trades.toLocaleString('en-US')} trades`}
        tone="negative"
      />
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface border border-border px-4 py-3.5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}
