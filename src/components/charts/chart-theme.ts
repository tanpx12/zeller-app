import type { ThemeColors } from './useThemeColors'

export const axisFont = {
  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
  fontSize: 10,
} as const

export interface RechartsTheme {
  axis: { stroke: string; tick: { fill: string; fontSize: number } }
  grid: { stroke: string }
  tooltip: {
    contentStyle: React.CSSProperties
    labelStyle: React.CSSProperties
    itemStyle: React.CSSProperties
  }
}

export function rechartsTheme(c: ThemeColors): RechartsTheme {
  return {
    axis: {
      stroke: c['--border'],
      tick: { fill: c['--muted-foreground'], fontSize: 10 },
    },
    grid: { stroke: c['--grid'] },
    tooltip: {
      contentStyle: {
        backgroundColor: c['--surface'],
        border: `1px solid ${c['--border-strong']}`,
        borderRadius: 6,
        fontFamily: axisFont.fontFamily,
        fontSize: 12,
        color: c['--foreground'],
      },
      labelStyle: { color: c['--foreground'] },
      itemStyle: { color: c['--foreground'] },
    },
  }
}
