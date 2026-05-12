import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type Verdict = 'ok' | 'monitor' | 'retrain'

const verdictClass: Record<Verdict, string> = {
  ok: 'bg-positive-soft text-positive',
  monitor: 'bg-warning-soft text-warning',
  retrain: 'bg-negative-soft text-negative',
}

const verdictLabel: Record<Verdict, string> = {
  ok: 'OK',
  monitor: 'Monitor',
  retrain: 'Retrain',
}

export interface VerdictBadgeProps {
  code: Verdict
  className?: string
}

export function VerdictBadge({ code, className }: VerdictBadgeProps) {
  return (
    <Badge
      variant="outline"
      data-slot="verdict-badge"
      data-verdict={code}
      className={cn(
        'rounded-[4px] border-transparent px-2 text-[11px] font-medium uppercase tracking-[0.06em]',
        verdictClass[code],
        className,
      )}
    >
      {verdictLabel[code]}
    </Badge>
  )
}
