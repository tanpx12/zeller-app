import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type TriggerOutcome = 'no_fire' | 'fire_soft' | 'fire_hard'

const outcomeClass: Record<TriggerOutcome, string> = {
  no_fire: 'bg-elevated text-muted-foreground border-border',
  fire_soft: 'bg-warning-soft text-warning border-transparent',
  fire_hard: 'bg-negative-soft text-negative border-transparent',
}

export interface TriggerChipProps {
  outcome: TriggerOutcome
  label: React.ReactNode
  className?: string
}

export function TriggerChip({ outcome, label, className }: TriggerChipProps) {
  return (
    <Badge
      variant="outline"
      data-slot="trigger-chip"
      data-outcome={outcome}
      className={cn(
        'rounded-[4px] px-2 py-[3px] font-mono text-[11px]',
        outcomeClass[outcome],
        className,
      )}
    >
      {label}
    </Badge>
  )
}
