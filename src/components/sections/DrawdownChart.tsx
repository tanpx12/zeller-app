'use client'

import { useMemo } from 'react'
import type { DrawdownDto } from '@/api-client'
import { BaseAreaChart } from '@/components/charts/BaseAreaChart'
import { Skeleton } from '@/components/ui/skeleton'
import { percent } from '@/lib/format'
import { formatUtc } from '@/lib/time'

export interface DrawdownChartProps {
  data?: DrawdownDto
  loading?: boolean
}

interface DrawdownPoint extends Record<string, unknown> {
  t: number
  dd: number
}

export function DrawdownChart({ data, loading }: DrawdownChartProps) {
  const points = useMemo<DrawdownPoint[]>(() => {
    if (!data?.drawdown_curve) return []
    const { timestamps, values } = data.drawdown_curve
    const len = Math.min(timestamps.length, values.length)
    const out: DrawdownPoint[] = new Array(len)
    for (let i = 0; i < len; i++) {
      // Display drawdown as negative percentage so the area fills below zero.
      out[i] = { t: timestamps[i]!, dd: -Math.abs(values[i]!) }
    }
    return out
  }, [data])

  if (loading) return <Skeleton className="h-[200px] w-full rounded-lg" />

  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No drawdown data.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <BaseAreaChart
        data={points}
        xKey="t"
        dataKey="dd"
        color="--negative"
        yFormatter={(v) => percent(v)}
        xFormatter={(v) => formatUtc(v).slice(0, 10)}
        height={200}
        yDomain={['dataMin', 0]}
        referenceY={0}
      />
    </div>
  )
}
