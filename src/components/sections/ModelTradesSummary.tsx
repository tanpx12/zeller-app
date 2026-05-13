'use client'

import { useMemo } from 'react'
import type { ModelTradeDto } from '@/api-client'
import { Stat } from '@/components/dashboard/Stat'
import { decimals, money, percent } from '@/lib/format'

export interface ModelTradesSummaryProps {
  /** Rows from currently-loaded pages. Stats are computed client-side and
   *  refresh as more pages load — surfaced via `loaded` label. */
  rows: ModelTradeDto[]
  totalEstimate?: number
}

/**
 * Summary stats for `/models/{name}/trades`. Computed client-side over
 * the loaded pages — the label makes it explicit that this is *not*
 * the all-time aggregate when pagination hasn't completed.
 */
export function ModelTradesSummary({ rows, totalEstimate }: ModelTradesSummaryProps) {
  const stats = useMemo(() => {
    if (rows.length === 0) return null
    let pnlSum = 0
    let wins = 0
    let losses = 0
    let winSum = 0
    let lossSum = 0
    let holdSum = 0
    for (const t of rows) {
      pnlSum += t.pnl_usd
      holdSum += t.hold_bars
      if (t.pnl_usd > 0) {
        wins++
        winSum += t.pnl_usd
      } else if (t.pnl_usd < 0) {
        losses++
        lossSum += t.pnl_usd
      }
    }
    const traded = wins + losses
    return {
      pnlSum,
      winRate: traded > 0 ? wins / traded : 0,
      avgWin: wins > 0 ? winSum / wins : 0,
      avgLoss: losses > 0 ? lossSum / losses : 0,
      avgHold: rows.length > 0 ? holdSum / rows.length : 0,
      n: rows.length,
    }
  }, [rows])

  if (!stats) return null

  const partial = totalEstimate != null && totalEstimate > stats.n
  const subLabel = partial
    ? `loaded ${stats.n.toLocaleString('en-US')} of ~${totalEstimate!.toLocaleString('en-US')}`
    : `${stats.n.toLocaleString('en-US')} trades`

  return (
    <div className="grid grid-cols-5 gap-2.5">
      <Stat
        label="Net P&L"
        value={money(stats.pnlSum)}
        sub={subLabel}
        tone={stats.pnlSum > 0 ? 'positive' : stats.pnlSum < 0 ? 'negative' : 'default'}
      />
      <Stat
        label="Win rate"
        value={percent(stats.winRate)}
        sub={`${stats.n.toLocaleString('en-US')} trades`}
      />
      <Stat label="Avg win" value={money(stats.avgWin)} tone="positive" />
      <Stat label="Avg loss" value={money(stats.avgLoss)} tone="negative" />
      <Stat label="Avg hold" value={`${decimals(stats.avgHold, 1)} bars`} />
    </div>
  )
}
