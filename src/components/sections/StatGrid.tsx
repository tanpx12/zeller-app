'use client'

import type { HeadlineSection } from '@/api-client'
import { Stat } from '@/components/dashboard/Stat'
import { Skeleton } from '@/components/ui/skeleton'
import { decimals, percent } from '@/lib/format'

export interface StatGridProps {
  headline?: HeadlineSection
  loading?: boolean
}

export function StatGrid({ headline, loading }: StatGridProps) {
  if (loading || !headline) {
    return (
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-5 gap-2.5">
      <Stat
        label="Annualized"
        value={percent(headline.annualized_return_pct)}
        tone={headline.annualized_return_pct >= 0 ? 'positive' : 'negative'}
      />
      <Stat
        label="Calmar"
        value={decimals(headline.calmar)}
        tone={headline.calmar >= 1 ? 'positive' : 'default'}
      />
      <Stat
        label="Profit factor"
        value={decimals(headline.profit_factor)}
        tone={headline.profit_factor >= 1 ? 'positive' : 'default'}
      />
      <Stat
        label="Win rate"
        value={percent(headline.win_rate)}
        sub={`${headline.n_trades.toLocaleString('en-US')} trades`}
      />
      <Stat label="Time in market" value={percent(headline.time_in_market_pct)} />
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-surface border border-border px-3 py-2.5">
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-5 w-20" />
    </div>
  )
}
