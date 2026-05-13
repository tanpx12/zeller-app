'use client'

import type { ForecastDto } from '@/api-client'
import { KvRow } from '@/components/dashboard/KvRow'
import { Skeleton } from '@/components/ui/skeleton'
import { decimals, percent } from '@/lib/format'

export interface ForecastDiagnosticsProps {
  data?: ForecastDto
  loading?: boolean
}

export function ForecastDiagnostics({ data, loading }: ForecastDiagnosticsProps) {
  if (loading) return <Skeleton className="h-[200px] w-full rounded-lg" />

  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No forecast diagnostics.
      </div>
    )
  }

  const ic = data.ic_overall

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-1">
      <KvRow keyLabel="IC overall" value={decimals(ic.value, 4)} />
      <KvRow
        keyLabel="IC CI"
        value={`[${decimals(ic.ci_lower, 4)}, ${decimals(ic.ci_upper, 4)}]`}
      />
      <KvRow keyLabel="Calibration slope" value={decimals(data.calibration_slope, 4)} />
      <KvRow keyLabel="Calibration intercept" value={decimals(data.calibration_intercept, 4)} />
      <KvRow
        keyLabel="Forecast distribution bins"
        value={data.forecast_distribution.counts?.length?.toString() ?? '—'}
        last
      />
      {data.sign_accuracy_by_magnitude.length > 0 && (
        <div className="pt-2 space-y-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Sign accuracy by magnitude
          </div>
          {data.sign_accuracy_by_magnitude.map((b, i) => (
            <KvRow
              key={i}
              keyLabel={`|y| ≈ ${decimals(b.abs_y_bucket_mean, 4)}`}
              value={`${percent(b.hit_rate)} · n=${b.n}`}
              last={i === data.sign_accuracy_by_magnitude.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
