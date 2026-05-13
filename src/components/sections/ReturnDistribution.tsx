'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ReturnDistributionOverlayDto } from '@/api-client'
import { useThemeColors } from '@/components/charts/useThemeColors'
import { rechartsTheme } from '@/components/charts/chart-theme'
import { Skeleton } from '@/components/ui/skeleton'
import { percent } from '@/lib/format'

export interface ReturnDistributionProps {
  data?: ReturnDistributionOverlayDto
  loading?: boolean
  height?: number
}

interface DistBar extends Record<string, unknown> {
  bin: string
  a: number
  b: number
}

/**
 * Grouped bar chart of return distributions, A and B side-by-side per bin.
 * Bin labels are the midpoint of each `bin_edges` pair, formatted as a
 * percent.
 */
export function ReturnDistribution({ data, loading, height = 200 }: ReturnDistributionProps) {
  const colors = useThemeColors()
  const theme = rechartsTheme(colors)

  const bars = useMemo<DistBar[]>(() => {
    if (!data) return []
    const edges = data.bin_edges
    const a = data.a
    const b = data.b
    const nBins = Math.min(a.length, b.length, edges.length - 1)
    const out: DistBar[] = new Array(nBins)
    for (let i = 0; i < nBins; i++) {
      const mid = (edges[i]! + edges[i + 1]!) / 2
      out[i] = { bin: percent(mid), a: a[i]!, b: b[i]! }
    }
    return out
  }, [data])

  if (loading) return <Skeleton className="w-full rounded-md" style={{ height }} />

  if (bars.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No distribution data.
      </div>
    )
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid {...theme.grid} vertical={false} />
          <XAxis
            dataKey="bin"
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            width={48}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={theme.tooltip.contentStyle}
            cursor={{ fill: colors['--elevated'] }}
          />
          <Bar
            dataKey="a"
            name="Run A"
            fill={colors['--primary']}
            isAnimationActive={false}
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="b"
            name="Run B"
            fill={colors['--warning']}
            isAnimationActive={false}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
