import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type Mode = 'batch' | 'holdout' | 'live' | 'decision'

const modeClass: Record<Mode, string> = {
  batch: 'bg-primary-soft text-primary',
  holdout: 'bg-warning-soft text-warning',
  live: 'bg-positive-soft text-positive',
  decision: 'bg-primary-soft text-primary',
}

export interface ModeBadgeProps {
  mode: Mode
  className?: string
}

export function ModeBadge({ mode, className }: ModeBadgeProps) {
  return (
    <Badge
      variant="outline"
      data-slot="mode-badge"
      data-mode={mode}
      className={cn(
        'rounded-[4px] border-transparent px-2 py-[2px] font-sans text-[10px] font-medium uppercase tracking-[0.04em]',
        modeClass[mode],
        className,
      )}
    >
      {mode}
    </Badge>
  )
}
