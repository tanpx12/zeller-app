'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LiveIndicator } from './LiveIndicator'
import { ThemeToggle } from './ThemeToggle'
import { useLiveStatus } from '@/hooks/useLiveStatus'
import { formatUtc } from '@/lib/time'

const tabs = [
  { href: '/live', label: 'Live' },
  { href: '/reports', label: 'Reports' },
  { href: '/models', label: 'Models' },
  { href: '/compare', label: 'Compare' },
  { href: '/decisions', label: 'Decisions' },
] as const

export function TopBar() {
  const pathname = usePathname()
  const live = useLiveStatus()
  const liveLabel =
    live.status === 'down'
      ? 'Live runner offline'
      : live.data
        ? `BTC · last bar ${formatUtc(live.data.timestamp).slice(11, 16)} UTC`
        : 'Connecting…'

  return (
    <header
      data-slot="top-bar"
      className="sticky top-0 z-50 flex h-[52px] items-center gap-8 border-b border-border bg-background px-6"
    >
      <Link
        href="/"
        className="flex h-full items-center gap-1 font-mono text-[13px] font-medium tracking-[-0.02em] text-foreground"
      >
        <span className="text-positive" aria-hidden>
          ◐
        </span>
        <span>perps_model</span>
      </Link>

      <nav className="flex h-full items-stretch gap-0.5" aria-label="Main">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href) ?? false
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-active={active ? '' : undefined}
              className={cn(
                'inline-flex h-full items-center border-b-2 border-transparent px-3.5 text-[13px] font-medium text-muted-foreground transition-colors',
                'hover:text-foreground',
                'data-[active]:border-foreground data-[active]:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-4">
        <LiveIndicator status={live.status} label={liveLabel} />
        <ThemeToggle />
      </div>
    </header>
  )
}
