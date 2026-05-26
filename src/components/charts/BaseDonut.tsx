'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useThemeColors, type ThemeTokenName } from './useThemeColors'
import { rechartsTheme } from './chart-theme'

export interface DonutSlice {
  name: string
  value: number
  color: ThemeTokenName
}

export interface BaseDonutProps {
  slices: DonutSlice[]
  height?: number
  innerRadiusPct?: number
  valueFormatter?: (value: number) => string
  className?: string
}

export function BaseDonut({
  slices,
  height = 200,
  innerRadiusPct = 60,
  valueFormatter,
  className,
}: BaseDonutProps) {
  const colors = useThemeColors()
  const theme = rechartsTheme(colors)

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={`${innerRadiusPct}%`}
            outerRadius="90%"
            stroke={colors['--surface']}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {slices.map((s) => (
              <Cell key={s.name} fill={colors[s.color]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={theme.tooltip.contentStyle}
            labelStyle={theme.tooltip.labelStyle}
            itemStyle={theme.tooltip.itemStyle}
            formatter={
              valueFormatter
                ? (v: unknown) => (typeof v === 'number' ? valueFormatter(v) : String(v))
                : undefined
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
