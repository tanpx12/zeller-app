'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme !== 'light'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'h-7 gap-2 rounded-md border border-border bg-surface px-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground',
        className,
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span
        aria-hidden
        className={cn('inline-block size-2 rounded-full', isDark ? 'bg-foreground' : 'bg-warning')}
      />
      <span>{isDark ? 'dark' : 'light'}</span>
    </Button>
  )
}
