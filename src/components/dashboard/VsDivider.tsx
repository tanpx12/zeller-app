import { cn } from '@/lib/utils'

export function VsDivider({ className }: { className?: string }) {
  return (
    <span
      data-slot="vs-divider"
      className={cn(
        'select-none font-mono text-xs uppercase tracking-[0.08em] text-faint-foreground',
        className,
      )}
    >
      VS
    </span>
  )
}
