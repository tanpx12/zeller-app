import { cn } from '@/lib/utils'

export interface StatProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  tone?: 'default' | 'positive' | 'negative' | 'warning'
  className?: string
}

const toneClass: Record<NonNullable<StatProps['tone']>, string> = {
  default: 'text-foreground',
  positive: 'text-positive',
  negative: 'text-negative',
  warning: 'text-warning',
}

export function Stat({ label, value, sub, tone = 'default', className }: StatProps) {
  return (
    <div
      data-slot="stat"
      className={cn(
        'flex flex-col gap-0.5 rounded-lg bg-surface border border-border px-3 py-2.5',
        className,
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className={cn('text-[18px] font-medium tracking-[-0.02em] font-mono', toneClass[tone])}>
        {value}
      </div>
      {sub != null && (
        <div className="text-[10px] font-mono text-muted-foreground leading-tight">{sub}</div>
      )}
    </div>
  )
}
