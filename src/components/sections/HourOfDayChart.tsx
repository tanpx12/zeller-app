'use client'

import { useMemo } from 'react'
import type { TimeAnalysisSection } from '@/api-client'
import { BaseBarChart } from '@/components/charts/BaseBarChart'
import { Skeleton } from '@/components/ui/skeleton'
import { money } from '@/lib/format'

export interface HourOfDayChartProps {
  data?: TimeAnalysisSection
  loading?: boolean
}

interface HourBar extends Record<string, unknown> {
  hour: string
  pnl: number
}

export function HourOfDayChart({ data, loading }: HourOfDayChartProps) {
  const bars = useMemo<HourBar[]>(() => {
    if (!data?.pnl_by_hour_utc) return []
    return data.pnl_by_hour_utc.map((pnl, h) => ({
      hour: h.toString().padStart(2, '0'),
      pnl,
    }))
  }, [data])

  if (loading) return <Skeleton className="h-[200px] w-full rounded-lg" />

  if (bars.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No time-of-day data.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <BaseBarChart
        data={bars}
        xKey="hour"
        dataKey="pnl"
        colorBySign
        yFormatter={(v) => money(v)}
        height={200}
      />
    </div>
  )
}
