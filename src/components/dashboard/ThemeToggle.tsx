'use client'

import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

/**
 * Mockup `.theme-toggle` (`index.html:86-91, 331`) — a small bordered button
 * whose label is the *target* theme ("light" when dark is active). No icon,
 * no current-state indicator.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme !== 'light'
  const target = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(target)}
      aria-label={`Switch to ${target} theme`}
      className={cn(
        'rounded-md border border-border bg-transparent px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors',
        'hover:border-border-strong hover:text-foreground',
        className,
      )}
    >
      {target}
    </button>
  )
}
