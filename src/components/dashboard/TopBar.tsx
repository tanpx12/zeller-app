'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LiveIndicator } from './LiveIndicator'
import { ThemeToggle } from './ThemeToggle'

const tabs = [
  { href: '/live', label: 'Live' },
  { href: '/reports', label: 'Reports' },
  { href: '/compare', label: 'Compare' },
  { href: '/decisions', label: 'Decisions' },
] as const

export function TopBar() {
  const pathname = usePathname()

  return (
    <header
      data-slot="top-bar"
      className="sticky top-0 z-30 flex h-[52px] items-center gap-6 border-b border-border bg-background/85 px-4 backdrop-blur"
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-[13px] font-medium tracking-[-0.02em] text-foreground"
      >
        <span className="text-primary" aria-hidden>
          ◐
        </span>
        <span>perps_model</span>
      </Link>

      <nav className="flex items-center gap-1" aria-label="Main">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href) ?? false
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-active={active ? '' : undefined}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground transition-colors',
                'hover:text-foreground',
                'data-[active]:bg-elevated data-[active]:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <LiveIndicator status="healthy" label="Live · BTC 1h" />
        <ThemeToggle />
      </div>
    </header>
  )
}
