'use client'

import type { RiskEventsDto, RiskEvent } from '@/api-client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUtc } from '@/lib/time'
import { cn } from '@/lib/utils'

export interface RiskEventFeedProps {
  data?: RiskEventsDto
  loading?: boolean
}

export function RiskEventFeed({ data, loading }: RiskEventFeedProps) {
  const events = data?.events ?? []

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
        No risk events for this report.
      </div>
    )
  }

  return (
    <ScrollArea className="h-[280px] rounded-lg border border-border bg-surface">
      <ul className="divide-y divide-border">
        {events.map((ev, idx) => (
          <RiskEventRow key={`${ev.timestamp}-${idx}`} event={ev} />
        ))}
      </ul>
    </ScrollArea>
  )
}

function RiskEventRow({ event }: { event: RiskEvent }) {
  const tone = guardTone(event.guard)
  return (
    <li className="px-3 py-2 text-xs">
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn('font-medium font-mono uppercase tracking-[0.04em]', tone.text)}>
          {event.guard}
        </span>
        <time className="font-mono text-faint-foreground">{formatUtc(event.timestamp)}</time>
      </div>
      <div className="mt-0.5 truncate font-mono text-muted-foreground">{event.context}</div>
    </li>
  )
}

function guardTone(guard: string): { text: string } {
  const g = guard.toLowerCase()
  if (g.includes('halt') || g.includes('hard') || g.includes('stop'))
    return { text: 'text-negative' }
  if (g.includes('warn') || g.includes('soft')) return { text: 'text-warning' }
  return { text: 'text-foreground' }
}
