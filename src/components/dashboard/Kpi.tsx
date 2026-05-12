import { cn } from '@/lib/utils'

export interface KpiProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  tone?: 'default' | 'positive' | 'negative' | 'warning'
  className?: string
}

const toneClass: Record<NonNullable<KpiProps['tone']>, string> = {
  default: 'text-foreground',
  positive: 'text-positive',
  negative: 'text-negative',
  warning: 'text-warning',
}

export function Kpi({ label, value, sub, tone = 'default', className }: KpiProps) {
  return (
    <div
      data-slot="kpi"
      className={cn(
        'flex flex-col gap-1 rounded-lg bg-surface border border-border px-4 py-3.5',
        className,
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className={cn('text-[26px] font-medium tracking-[-0.02em] font-mono', toneClass[tone])}>
        {value}
      </div>
      {sub != null && <div className="text-xs font-mono text-muted-foreground">{sub}</div>}
    </div>
  )
}
