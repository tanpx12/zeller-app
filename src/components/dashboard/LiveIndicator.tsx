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

/**
 * Plain `dot + mono text`, no enclosing pill — matches the mockup's
 * `.live-indicator` (`index.html:83, 326-330`). The breathing glow on the
 * dot is the only affordance signalling liveness.
 */
export function LiveIndicator({ status, label, className }: LiveIndicatorProps) {
  return (
    <span
      data-slot="live-indicator"
      data-status={status}
      className={cn(
        'inline-flex items-center gap-[7px] font-mono text-xs text-muted-foreground',
        className,
      )}
    >
      <LiveDot color={statusToColor[status]} />
      <span>{label}</span>
    </span>
  )
}
