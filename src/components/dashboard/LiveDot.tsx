import { cn } from '@/lib/utils'

export type LiveDotColor = 'positive' | 'warning' | 'negative' | 'muted'

const colorClass: Record<LiveDotColor, string> = {
  positive: 'bg-positive text-positive',
  warning: 'bg-warning text-warning',
  negative: 'bg-negative text-negative',
  muted: 'bg-muted-foreground text-muted-foreground',
}

export interface LiveDotProps {
  color?: LiveDotColor
  className?: string
}

/** 7×7 circle with breathing glow — the @keyframes `pulse-glow` is in globals.css.
 *  `text-*` controls the box-shadow color via `currentColor` inside the keyframe. */
export function LiveDot({ color = 'positive', className }: LiveDotProps) {
  return (
    <span
      data-slot="live-dot"
      data-color={color}
      aria-hidden
      className={cn(
        'inline-block size-[7px] rounded-full',
        colorClass[color],
        '[animation:pulse-glow_2s_ease-in-out_infinite]',
        className,
      )}
    />
  )
}
