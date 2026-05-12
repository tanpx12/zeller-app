import { cn } from '@/lib/utils'
import { LiveDot, type LiveDotColor } from './LiveDot'

export type LiveStatus = 'healthy' | 'lagging' | 'down'

const statusToColor: Record<LiveStatus, LiveDotColor> = {
  healthy: 'positive',
  lagging: 'warning',
  down: 'negative',
}

export interface LiveIndicatorProps {
  status: LiveStatus
  label: React.ReactNode
  className?: string
}

export function LiveIndicator({ status, label, className }: LiveIndicatorProps) {
  return (
    <span
      data-slot="live-indicator"
      data-status={status}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground',
        className,
      )}
    >
      <LiveDot color={statusToColor[status]} />
      <span>{label}</span>
    </span>
  )
}
