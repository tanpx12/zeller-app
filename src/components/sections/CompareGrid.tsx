'use client'

import type { MetricDiff } from '@/api-client'
import { cn } from '@/lib/utils'
import { decimals, money, percent } from '@/lib/format'

export interface CompareGridProps {
  rows: MetricDiff[]
}

/**
 * Three-column comparison grid using `display: contents` per
 * spec A.5 / mockup index.html:244-253. Each metric renders as three sibling
 * cells (A | label | B) so the row borders are part of the grid itself —
 * `display: contents` would also work via a row wrapper, but flattening is
 * simpler and avoids nested-grid layout quirks.
 *
 * Numbers are rendered through `formatMetricValue` which picks a sensible
 * formatter from the metric name (Sharpe → 2dp, return → percent, equity →
 * money). The middle column carries the friendly label only; the delta lives
 * in the bottom-left of the A or B cell depending on direction.
 */
export function CompareGrid({ rows }: CompareGridProps) {
  return (
    <div className="grid grid-cols-[1fr_88px_1fr] overflow-hidden rounded-lg border border-border bg-surface">
      {rows.map((row, idx) => {
        const isLast = idx === rows.length - 1
        const aBetter = row.delta < 0 // A bigger = positive delta means B<A => delta<0 means B-A<0 i.e. A is bigger
        // For the displayed sign, treat A>B as A-better (negative delta from the
        // backend's perspective `delta = b - a`). Some metrics (max drawdown,
        // costs) are *better when smaller* — caller can flip via name, but for
        // v1 we just colorize by raw sign.
        return <CompareRow key={row.name} row={row} isLast={isLast} aBetter={aBetter} />
      })}
    </div>
  )
}

function CompareRow({ row, isLast }: { row: MetricDiff; isLast: boolean; aBetter: boolean }) {
  const fmt = pickFormatter(row.name)
  const borderBottom = isLast ? '' : 'border-b border-border'

  return (
    <>
      {/* A cell — right-aligned, with right border */}
      <div
        className={cn(
          'border-r border-border px-4.5 py-3 text-right font-mono text-[13px] text-foreground',
          borderBottom,
        )}
      >
        {fmt(row.a)}
      </div>

      {/* Middle label cell */}
      <div
        className={cn(
          'flex flex-col items-center justify-center px-2 py-3 text-[12px] text-muted-foreground',
          borderBottom,
        )}
      >
        <span>{prettyName(row.name)}</span>
        {Number.isFinite(row.pct_change) && row.delta !== 0 && (
          <span
            className={cn(
              'font-mono text-[10px]',
              row.delta > 0 ? 'text-positive' : 'text-negative',
            )}
          >
            {row.delta > 0 ? '+' : ''}
            {decimals(row.pct_change, 1)}%
          </span>
        )}
      </div>

      {/* B cell — left-aligned, with left border */}
      <div
        className={cn(
          'border-l border-border px-4.5 py-3 text-left font-mono text-[13px] text-foreground',
          borderBottom,
        )}
      >
        {fmt(row.b)}
      </div>
    </>
  )
}

const prettyNames: Record<string, string> = {
  terminal_equity: 'Terminal equity',
  total_return_pct: 'Return',
  annualized_return_pct: 'Annualized',
  sharpe: 'Sharpe',
  sortino: 'Sortino',
  max_drawdown_pct: 'Max DD',
  win_rate: 'Win rate',
  profit_factor: 'Profit factor',
  calmar: 'Calmar',
  n_trades: 'Trades',
  time_in_market_pct: 'Time in market',
}

function prettyName(name: string): string {
  return prettyNames[name] ?? name.replace(/_/g, ' ')
}

function pickFormatter(name: string): (v: number) => string {
  if (name === 'terminal_equity') return (v) => money(v)
  if (name === 'n_trades') return (v) => Math.round(v).toLocaleString('en-US')
  if (name.endsWith('_pct') || name === 'win_rate' || name === 'time_in_market_pct')
    return (v) => percent(v)
  if (name === 'sharpe' || name === 'sortino' || name === 'calmar' || name === 'profit_factor')
    return (v) => decimals(v, 2)
  return (v) => decimals(v, 3)
}
