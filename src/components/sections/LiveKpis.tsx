'use client'

import type { LiveStatusDto } from '@/api-client'
import { Kpi } from '@/components/dashboard/Kpi'
import { Skeleton } from '@/components/ui/skeleton'
import { decimals, money, percent } from '@/lib/format'

export interface LiveKpisProps {
  data?: LiveStatusDto
  loading?: boolean
}

/** Four hero KPIs: Equity, Position, 24h P&L, Forecast (ŷ). */
export function LiveKpis({ data, loading }: LiveKpisProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-lg" />
        ))}
      </div>
    )
  }

  const pos = data.current_position
  const positionLabel =
    pos === 0
      ? 'FLAT'
      : pos > 0
        ? `LONG · ${decimals(Math.abs(pos), 4)}`
        : `SHORT · ${decimals(Math.abs(pos), 4)}`

  const pnl24 = data.recent_pnl?.pnl_24h_usd ?? 0
  const trades24 = data.recent_pnl?.trades_24h ?? 0
  const forecast = data.last_forecast
  const sigma = data.sigma_hat ?? null

  return (
    <div className="grid grid-cols-4 gap-3">
      <Kpi
        label="Equity"
        value={money(data.equity)}
        sub={`${data.n_fills.toLocaleString('en-US')} fills`}
      />
      <Kpi
        label="Position"
        value={positionLabel}
        sub={`updated ${data.age_seconds}s ago`}
        tone={pos === 0 ? 'default' : 'default'}
      />
      <Kpi
        label="24h P&L"
        value={money(pnl24)}
        sub={`${trades24} trades · ${pnl24 >= 0 ? '+' : ''}${decimals((pnl24 / Math.max(data.equity, 1)) * 100, 2)}%`}
        tone={pnl24 > 0 ? 'positive' : pnl24 < 0 ? 'negative' : 'default'}
      />
      <Kpi
        label="Forecast (ŷ)"
        value={signed(forecast, 4)}
        sub={sigma != null ? `σ̂=${decimals(sigma, 4)}` : '—'}
        tone={forecast > 0 ? 'positive' : forecast < 0 ? 'negative' : 'default'}
      />
    </div>
  )
}

function signed(v: number, digits: number): string {
  return (v >= 0 ? '+' : '') + decimals(v, digits)
}

// Reserve the `percent` import for future use (24h P&L pct shown directly above).
void percent
