'use client'

import type { DrawdownDto, TimeSeriesEnvelope } from '@/api-client'
import { RangeChips, type RangeValue } from '@/components/dashboard/RangeChips'
import { DrawdownChart } from './DrawdownChart'
import { EquityChart } from './EquityChart'
import { percent } from '@/lib/format'

/**
 * Matches the mockup's combined Equity-curve card (index.html:372-395) —
 * card with title + range chips, equity line, hairline divider, then a
 * short drawdown sparkline labelled with the max-DD summary.
 */
export interface EquityCardProps {
  equity?: TimeSeriesEnvelope
  drawdown?: DrawdownDto
  equityLoading?: boolean
  drawdownLoading?: boolean
  range: RangeValue
  onRangeChange: (next: RangeValue) => void
}

export function EquityCard({
  equity,
  drawdown,
  equityLoading,
  drawdownLoading,
  range,
  onRangeChange,
}: EquityCardProps) {
  const ddLabel = drawdown
    ? `Drawdown · max ${percent(-drawdown.max_dd_depth_pct)} over ${drawdown.max_dd_duration_bars} bars${
        drawdown.max_dd_recovery_bars != null
          ? ` · recovered in ${drawdown.max_dd_recovery_bars} bars`
          : ''
      }`
    : 'Drawdown'

  return (
    <div className="rounded-lg border border-border bg-surface px-[18px] py-4">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground">
          Equity curve{' '}
          <span className="ml-1 font-mono text-[11px] text-muted-foreground">
            net of fees + slippage + funding
          </span>
        </span>
        <RangeChips value={range} onValueChange={onRangeChange} />
      </div>

      <EquityChart data={equity} loading={equityLoading} bare height={220} />

      <div className="my-4 h-px bg-border" aria-hidden />

      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {ddLabel}
      </div>
      <DrawdownChart data={drawdown} loading={drawdownLoading} bare height={70} />
    </div>
  )
}
