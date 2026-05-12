import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface SharpeBarProps {
  value: number
  /** The reference value that maps to 100% fill. Defaults to 2.5 — a Sharpe of 2.5+ saturates. */
  max?: number
  /** Threshold below which the fill renders in `--negative` instead of `--positive`. */
  redBelow?: number
  className?: string
}

export function SharpeBar({ value, max = 2.5, redBelow = 0.7, className }: SharpeBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const negative = value < redBelow

  return (
    <div
      data-slot="sharpe-bar"
      data-negative={negative ? '' : undefined}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <Progress
        value={pct}
        className={cn(
          'h-1 w-[60px] rounded-[2px] bg-elevated',
          '[&>[data-slot=progress-indicator]]:rounded-[2px]',
          negative
            ? '[&>[data-slot=progress-indicator]]:bg-negative'
            : '[&>[data-slot=progress-indicator]]:bg-positive',
        )}
      />
      <span className="font-mono text-[11px] font-medium tabular-nums text-foreground">
        {value.toFixed(2)}
      </span>
    </div>
  )
}
