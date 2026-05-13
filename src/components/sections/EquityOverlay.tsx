'use client'

import { useMemo } from 'react'
import type { TimeSeries } from '@/api-client'
import { BaseLineChart } from '@/components/charts/BaseLineChart'
import { Skeleton } from '@/components/ui/skeleton'
import { money } from '@/lib/format'
import { formatUtc } from '@/lib/time'

export interface EquityOverlayProps {
  a?: TimeSeries
  b?: TimeSeries
  loading?: boolean
  height?: number
}

interface OverlayPoint extends Record<string, unknown> {
  t: number
  a?: number
  b?: number
}

/**
 * Two equity series rendered on a shared x-axis. Each timestamp gets its own
 * row, with `a` and `b` keys present when the respective series has a sample
 * at (or near) that bar. Recharts handles gaps natively when a value is
 * undefined.
 */
export function EquityOverlay({ a, b, loading, height = 280 }: EquityOverlayProps) {
  const data = useMemo<OverlayPoint[]>(() => mergeSeries(a, b), [a, b])

  if (loading) return <Skeleton className="w-full rounded-md" style={{ height }} />

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No overlapping equity data.
      </div>
    )
  }

  return (
    <BaseLineChart
      data={data}
      xKey="t"
      series={[
        { dataKey: 'a', name: 'Run A', color: '--primary' },
        { dataKey: 'b', name: 'Run B', color: '--warning' },
      ]}
      yFormatter={(v) => money(v)}
      xFormatter={(v) => formatUtc(v).slice(0, 10)}
      height={height}
    />
  )
}

/** Merge two parallel TimeSeries on shared timestamps. */
function mergeSeries(a?: TimeSeries, b?: TimeSeries): OverlayPoint[] {
  const points = new Map<number, OverlayPoint>()

  if (a) {
    const len = Math.min(a.timestamps.length, a.values.length)
    for (let i = 0; i < len; i++) {
      const t = a.timestamps[i]!
      points.set(t, { t, a: a.values[i] })
    }
  }
  if (b) {
    const len = Math.min(b.timestamps.length, b.values.length)
    for (let i = 0; i < len; i++) {
      const t = b.timestamps[i]!
      const existing = points.get(t)
      if (existing) existing.b = b.values[i]
      else points.set(t, { t, b: b.values[i] })
    }
  }
  return Array.from(points.values()).sort((p, q) => p.t - q.t)
}
