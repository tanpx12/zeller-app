import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type RunPickVariant = 'a' | 'b'

const variantBorder: Record<RunPickVariant, string> = {
  a: 'border-l-primary',
  b: 'border-l-warning',
}

const variantLabelColor: Record<RunPickVariant, string> = {
  a: 'text-primary',
  b: 'text-warning',
}

export interface RunPickProps {
  variant: RunPickVariant
  /** Display name of the selected run (or null for empty state). */
  name?: React.ReactNode
  meta?: React.ReactNode
  /** Slot for the typeahead trigger / button. */
  children?: React.ReactNode
  className?: string
}

export function RunPick({ variant, name, meta, children, className }: RunPickProps) {
  return (
    <Card
      data-slot="run-pick"
      data-variant={variant}
      className={cn(
        'rounded-lg border-l-2 p-4 flex flex-col gap-2',
        variantBorder[variant],
        className,
      )}
    >
      <div
        className={cn(
          'text-[10px] font-medium uppercase tracking-[0.06em]',
          variantLabelColor[variant],
        )}
      >
        Run {variant.toUpperCase()}
      </div>
      {name != null && (
        <div className="text-base font-medium font-mono text-foreground">{name}</div>
      )}
      {meta != null && <div className="text-xs font-mono text-muted-foreground">{meta}</div>}
      {children}
    </Card>
  )
}
