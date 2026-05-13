'use client'

import type { LiveStatusDto } from '@/api-client'
import { KvRow } from '@/components/dashboard/KvRow'
import { decimals, percent } from '@/lib/format'

export interface LiveForecastDiagnosticsProps {
  data?: LiveStatusDto
}

/**
 * Mirrors the mockup's Live-tab "Forecast diagnostics" card
 * (index.html:445-455). Pulls fields from `LiveStatusDto` rather than the
 * report-level `ForecastDto` since these are real-time values.
 */
export function LiveForecastDiagnostics({ data }: LiveForecastDiagnosticsProps) {
  if (!data) {
    return (
      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
        Live forecast diagnostics not yet available.
      </div>
    )
  }

  const fd = data.forecast_diagnostics
  const inTol = fd.ic_within_tolerance

  return (
    <div className="space-y-0">
      <KvRow
        keyLabel="Last forecast"
        value={
          <span className={data.last_forecast >= 0 ? 'text-positive' : 'text-negative'}>
            {data.last_forecast >= 0 ? '+' : ''}
            {decimals(data.last_forecast, 4)}
          </span>
        }
      />
      <KvRow
        keyLabel="Residual σ̂"
        value={data.sigma_hat != null ? decimals(data.sigma_hat, 4) : '—'}
      />
      <KvRow
        keyLabel="Forward IC (7d)"
        value={fd.forward_ic_7d != null ? signed(fd.forward_ic_7d, 4) : '—'}
      />
      <KvRow keyLabel="Holdout IC" value={fd.holdout_ic != null ? signed(fd.holdout_ic, 4) : '—'} />
      <KvRow
        keyLabel="vs holdout"
        value={
          inTol == null ? (
            <span className="text-muted-foreground">—</span>
          ) : inTol ? (
            <span className="text-positive">within tolerance ✓</span>
          ) : (
            <span className="text-negative">out of tolerance ✗</span>
          )
        }
      />
      <KvRow
        keyLabel="Hit rate (7d)"
        value={fd.hit_rate_7d != null ? percent(fd.hit_rate_7d) : '—'}
        last
      />
    </div>
  )
}

function signed(v: number, digits: number): string {
  return (v >= 0 ? '+' : '') + decimals(v, digits)
}
