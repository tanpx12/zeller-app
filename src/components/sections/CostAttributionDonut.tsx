'use client'

import { useMemo } from 'react'
import type { AttributionDto } from '@/api-client'
import { BaseDonut, type DonutSlice } from '@/components/charts/BaseDonut'
import { Skeleton } from '@/components/ui/skeleton'
import { money, percent } from '@/lib/format'

export interface CostAttributionDonutProps {
  data?: AttributionDto
  loading?: boolean
}

export function CostAttributionDonut({ data, loading }: CostAttributionDonutProps) {
  const slices = useMemo<DonutSlice[]>(() => {
    if (!data) return []
    const candidates: DonutSlice[] = [
      { name: 'Trade costs', value: Math.abs(data.trade_costs_usd), color: '--negative' },
      { name: 'Slippage', value: Math.abs(data.slippage_usd), color: '--warning' },
      { name: 'Funding', value: Math.abs(data.funding_pnl_usd), color: '--primary' },
    ]
    return candidates.filter((s) => s.value > 0)
  }, [data])

  if (loading) return <Skeleton className="h-[200px] w-full rounded-lg" />

  if (!data || slices.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No cost attribution data.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3 space-y-3">
      <BaseDonut slices={slices} valueFormatter={(v) => money(v)} height={180} />
      <div className="flex flex-col gap-1.5 px-1">
        {slices.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="inline-block size-2 rounded-sm"
                style={{ background: `var(${s.color})` }}
                aria-hidden
              />
              {s.name}
            </span>
            <span className="font-mono text-foreground">{money(s.value)}</span>
          </div>
        ))}
        <div className="mt-1 border-t border-border pt-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Net P&L</span>
          <span className="font-mono text-foreground">{money(data.net_pnl_usd)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Costs as % of gross</span>
          <span className="font-mono text-foreground">{percent(data.costs_pct_of_gross)}</span>
        </div>
      </div>
    </div>
  )
}
