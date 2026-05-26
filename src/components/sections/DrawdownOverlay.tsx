'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TimeSeries } from '@/api-client'
import { useThemeColors } from '@/components/charts/useThemeColors'
import { rechartsTheme } from '@/components/charts/chart-theme'
import { Skeleton } from '@/components/ui/skeleton'
import { percent } from '@/lib/format'
import { formatUtc } from '@/lib/time'

export interface DrawdownOverlayProps {
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
 * Two drawdown curves stacked on a shared axis, both filled and semi-
 * transparent. We render both Areas in one AreaChart so the tooltip can
 * report A and B at the hovered bar simultaneously.
 */
export function DrawdownOverlay({ a, b, loading, height = 200 }: DrawdownOverlayProps) {
  const colors = useThemeColors()
  const theme = rechartsTheme(colors)

  const data = useMemo<OverlayPoint[]>(() => mergeSigned(a, b), [a, b])

  if (loading) return <Skeleton className="w-full rounded-md" style={{ height }} />

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No overlapping drawdown data.
      </div>
    )
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dd-a" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors['--primary']} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors['--primary']} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="dd-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors['--warning']} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors['--warning']} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...theme.grid} vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => formatUtc(Number(v)).slice(0, 10)}
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={(v) => percent(v)}
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            domain={['dataMin', 0]}
            width={56}
          />
          <Tooltip
            contentStyle={theme.tooltip.contentStyle}
            labelStyle={theme.tooltip.labelStyle}
            itemStyle={theme.tooltip.itemStyle}
            cursor={{ stroke: colors['--border-strong'], strokeWidth: 1 }}
            formatter={(v: unknown) => (typeof v === 'number' ? percent(v) : String(v))}
            labelFormatter={(v: unknown) =>
              typeof v === 'number' ? formatUtc(v).slice(0, 16) : String(v)
            }
          />
          <ReferenceLine y={0} stroke={colors['--border-strong']} strokeDasharray="2 2" />
          <Area
            type="monotone"
            dataKey="a"
            name="Run A"
            stroke={colors['--primary']}
            strokeWidth={1.5}
            fill="url(#dd-a)"
            isAnimationActive={false}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="b"
            name="Run B"
            stroke={colors['--warning']}
            strokeWidth={1.5}
            fill="url(#dd-b)"
            isAnimationActive={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Merge two signed-as-negative drawdown curves on shared timestamps. */
function mergeSigned(a?: TimeSeries, b?: TimeSeries): OverlayPoint[] {
  const points = new Map<number, OverlayPoint>()
  const ingest = (series: TimeSeries | undefined, key: 'a' | 'b') => {
    if (!series) return
    const len = Math.min(series.timestamps.length, series.values.length)
    for (let i = 0; i < len; i++) {
      const t = series.timestamps[i]!
      const v = -Math.abs(series.values[i]!)
      const existing = points.get(t)
      if (existing) existing[key] = v
      else points.set(t, { t, [key]: v } as OverlayPoint)
    }
  }
  ingest(a, 'a')
  ingest(b, 'b')
  return Array.from(points.values()).sort((p, q) => p.t - q.t)
}
