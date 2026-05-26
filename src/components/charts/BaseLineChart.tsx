'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useThemeColors, type ThemeTokenName } from './useThemeColors'
import { rechartsTheme } from './chart-theme'

export interface LineSeries {
  dataKey: string
  name: string
  color: ThemeTokenName
  strokeDasharray?: string
  strokeWidth?: number
}

export interface BaseLineChartProps<T extends Record<string, unknown>> {
  data: T[]
  series: LineSeries[]
  xKey: keyof T & string
  height?: number
  yFormatter?: (value: number) => string
  xFormatter?: (value: number) => string
  yDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax']
  referenceY?: number
  className?: string
}

export function BaseLineChart<T extends Record<string, unknown>>({
  data,
  series,
  xKey,
  height = 240,
  yFormatter,
  xFormatter,
  yDomain,
  referenceY,
  className,
}: BaseLineChartProps<T>) {
  const colors = useThemeColors()
  const theme = rechartsTheme(colors)

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              fontSize: 11,
              color: colors['--muted-foreground'],
            }}
            iconType="plainline"
            iconSize={14}
          />
          {referenceY != null && (
            <ReferenceLine
              y={referenceY}
              stroke={colors['--border-strong']}
              strokeDasharray="2 2"
            />
          )}
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={colors[s.color]}
              strokeWidth={s.strokeWidth ?? 1.5}
              strokeDasharray={s.strokeDasharray}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
