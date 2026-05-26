'use client'

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
import { useThemeColors, type ThemeTokenName } from './useThemeColors'
import { rechartsTheme } from './chart-theme'

export interface BaseAreaChartProps<T extends Record<string, unknown>> {
  data: T[]
  dataKey: keyof T & string
  xKey: keyof T & string
  color: ThemeTokenName
  height?: number
  yFormatter?: (value: number) => string
  xFormatter?: (value: number) => string
  yDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax']
  referenceY?: number
  className?: string
}

export function BaseAreaChart<T extends Record<string, unknown>>({
  data,
  dataKey,
  xKey,
  color,
  height = 200,
  yFormatter,
  xFormatter,
  yDomain,
  referenceY = 0,
  className,
}: BaseAreaChartProps<T>) {
  const colors = useThemeColors()
  const theme = rechartsTheme(colors)
  const fillId = `fill-${String(dataKey)}-${color}`

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[color]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colors[color]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...theme.grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={xFormatter}
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={yFormatter}
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            domain={yDomain ?? ['auto', 'auto']}
            width={56}
          />
          <Tooltip
            contentStyle={theme.tooltip.contentStyle}
            labelStyle={theme.tooltip.labelStyle}
            itemStyle={theme.tooltip.itemStyle}
            cursor={{ stroke: colors['--border-strong'], strokeWidth: 1 }}
            formatter={
              yFormatter
                ? (v: unknown) => (typeof v === 'number' ? yFormatter(v) : String(v))
                : undefined
            }
            labelFormatter={
              xFormatter
                ? (v: unknown) => (typeof v === 'number' ? xFormatter(v) : String(v))
                : undefined
            }
          />
          {referenceY != null && (
            <ReferenceLine
              y={referenceY}
              stroke={colors['--border-strong']}
              strokeDasharray="2 2"
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey as string}
            stroke={colors[color]}
            strokeWidth={1.5}
            fill={`url(#${fillId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
