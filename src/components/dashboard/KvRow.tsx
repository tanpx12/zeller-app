import { cn } from '@/lib/utils'

export interface KvRowProps {
  keyLabel: React.ReactNode
  value: React.ReactNode
  className?: string
  /** Drop the bottom border (use on the last row of a stack). */
  last?: boolean
}

export function KvRow({ keyLabel, value, className, last = false }: KvRowProps) {
  return (
    <div
      data-slot="kv-row"
      className={cn(
        'flex items-center justify-between gap-3 py-2 text-xs',
        !last && 'border-b border-border',
        className,
      )}
    >
      <span className="text-muted-foreground">{keyLabel}</span>
      <span className="font-mono font-medium text-foreground">{value}</span>
    </div>
  )
}
