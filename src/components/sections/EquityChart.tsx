'use client'

import { useMemo } from 'react'
import type { TimeSeriesEnvelope } from '@/api-client'
import { BaseLineChart } from '@/components/charts/BaseLineChart'
import { Skeleton } from '@/components/ui/skeleton'
import { money } from '@/lib/format'
import { formatUtc } from '@/lib/time'

export interface EquityChartProps {
  data?: TimeSeriesEnvelope
  loading?: boolean
  /** Strip the outer card chrome — meant for use inside another card. */
  bare?: boolean
  height?: number
}

interface EquityPoint extends Record<string, unknown> {
  t: number
  equity: number
}

export function EquityChart({ data, loading, bare = false, height = 220 }: EquityChartProps) {
  const points = useMemo<EquityPoint[]>(() => {
    if (!data?.points) return []
    return data.points
      .map((p) => {
        const t = Number(p[0])
        const v = Number(p[1])
        if (!Number.isFinite(t) || !Number.isFinite(v)) return null
        return { t, equity: v }
      })
      .filter((p): p is EquityPoint => p !== null)
  }, [data])

  if (loading) {
    return <Skeleton className="w-full rounded-lg" style={{ height }} />
  }

  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No equity data.
      </div>
    )
  }

  const chart = (
    <BaseLineChart
      data={points}
      xKey="t"
      series={[{ dataKey: 'equity', name: 'Model equity', color: '--primary' }]}
      yFormatter={(v) => money(v)}
      xFormatter={(v) => formatUtc(v).slice(0, 10)}
      height={height}
    />
  )

  if (bare) return chart

  return <div className="rounded-lg border border-border bg-surface p-3">{chart}</div>
}
