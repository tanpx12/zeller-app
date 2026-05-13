'use client'

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useThemeColors, type ThemeTokenName } from './useThemeColors'
import { rechartsTheme } from './chart-theme'

export interface BaseBarChartProps<T extends Record<string, unknown>> {
  data: T[]
  dataKey: keyof T & string
  xKey: keyof T & string
  /** Default bar color (overridden by colorBy if provided). */
  color?: ThemeTokenName
  /** Per-bar coloring: positive → green, negative → red. */
  colorBySign?: boolean
  height?: number
  yFormatter?: (value: number) => string
  xFormatter?: (value: number) => string
  className?: string
}

export function BaseBarChart<T extends Record<string, unknown>>({
  data,
  dataKey,
  xKey,
  color = '--primary',
  colorBySign = false,
  height = 200,
  yFormatter,
  xFormatter,
  className,
}: BaseBarChartProps<T>) {
  const colors = useThemeColors()
  const theme = rechartsTheme(colors)

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid {...theme.grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={xFormatter}
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={yFormatter}
            stroke={theme.axis.stroke}
            tick={theme.axis.tick}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={theme.tooltip.contentStyle}
            cursor={{ fill: colors['--elevated'] }}
            formatter={
              yFormatter
                ? (v: unknown) => (typeof v === 'number' ? yFormatter(v) : String(v))
                : undefined
            }
          />
          <ReferenceLine y={0} stroke={colors['--border-strong']} strokeDasharray="2 2" />
          <Bar dataKey={dataKey as string} radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {data.map((row, idx) => {
              const v = row[dataKey] as number
              const fill = colorBySign
                ? v >= 0
                  ? colors['--positive']
                  : colors['--negative']
                : colors[color]
              return <Cell key={idx} fill={fill} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
