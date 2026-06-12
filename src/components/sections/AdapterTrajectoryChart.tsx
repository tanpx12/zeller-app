'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LineChart as LineChartIcon } from 'lucide-react'
import { useThemeColors } from '@/components/charts/useThemeColors'
import { rechartsTheme } from '@/components/charts/chart-theme'
import { EmptyState } from '@/components/dashboard/EmptyState'

export interface AdapterTrajectoryChartProps {
  /** Online intercept trajectory, return units (~1e-5). Plotted on the right axis. */
  alpha: number[]
  /** Online slope trajectory, ~[-1, 1]. Plotted on the left axis. */
  beta: number[]
  /** EWMA information-coefficient trajectory, ~[-1, 1]. Plotted on the left axis. */
  ic: number[]
  height?: number
  className?: string
}

interface TrajectoryPoint {
  idx: number
  alpha: number | null
  beta: number | null
  ic: number | null
}

/**
 * Dual-Y-axis trajectory chart for the online signal adapter: β and EWMA IC
 * share the left axis (comparable ~[-1, 1] scale) with a dashed β=0 reference
 * line so sign flips are visible; α gets its own right axis because it lives
 * on a return-unit scale several orders of magnitude smaller.
 *
 * Built directly on Recharts `ComposedChart` (BaseLineChart is single-axis),
 * but styled identically via the shared `rechartsTheme` helpers.
 */
export function AdapterTrajectoryChart({
  alpha,
  beta,
  ic,
  height = 280,
  className,
}: AdapterTrajectoryChartProps) {
  const colors = useThemeColors()
  const theme = rechartsTheme(colors)

  const data = useMemo<TrajectoryPoint[]>(() => {
    const n = Math.max(alpha.length, beta.length, ic.length)
    return Array.from({ length: n }, (_, i) => ({
      idx: i,
      alpha: alpha[i] ?? null,
      beta: beta[i] ?? null,
      ic: ic[i] ?? null,
    }))
  }, [alpha, beta, ic])

  if (data.length === 0) {
    return (
      <EmptyState
        icon={LineChartIcon}
        title="No trajectory data"
        description="This report has no adapter trajectory samples."
        className={className}
      />
    )
  }

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...theme.grid} vertical={false} />
          <XAxis
            dataKey="idx"
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
          />
          <YAxis
            yAxisId="left"
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            width={56}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            width={56}
            tickFormatter={(v: number) => (v === 0 ? '0' : v.toExponential(0))}
          />
          <Tooltip
            contentStyle={theme.tooltip.contentStyle}
            labelStyle={theme.tooltip.labelStyle}
            itemStyle={theme.tooltip.itemStyle}
            cursor={{ stroke: colors['--border-strong'], strokeWidth: 1 }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              fontSize: 11,
              color: colors['--muted-foreground'],
            }}
            iconType="plainline"
            iconSize={14}
          />
          <ReferenceLine
            yAxisId="left"
            y={0}
            stroke={colors['--border-strong']}
            strokeDasharray="2 2"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="beta"
            name="β"
            stroke={colors['--positive']}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="ic"
            name="EWMA IC"
            stroke={colors['--warning']}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="alpha"
            name="α"
            stroke={colors['--primary']}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
