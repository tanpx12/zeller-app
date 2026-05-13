'use client'

import { useMemo } from 'react'
import type { Fill, LiveFillsDto } from '@/api-client'
import type { LiveMessage } from '@/lib/ws-client'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { decimals, money } from '@/lib/format'
import { formatUtc } from '@/lib/time'
import { cn } from '@/lib/utils'

export interface LiveFillsTapeProps {
  polled?: LiveFillsDto
  /** WS-pushed fills, newest-first per `useLiveStream`. */
  streamed: LiveMessage[]
  loading?: boolean
}

/**
 * Merges the polled snapshot with WS-pushed fill events so the tape stays
 * fresh between polls. We dedupe on `timestamp` — the WS frame and the
 * polled snapshot will eventually agree, and the polled response is
 * authoritative on conflict.
 */
export function LiveFillsTape({ polled, streamed, loading }: LiveFillsTapeProps) {
  const merged = useMemo<Fill[]>(() => {
    const out: Map<number, Fill> = new Map()
    // Polled comes first so its values win on conflict.
    for (const f of polled?.fills ?? []) out.set(f.timestamp, f)
    for (const msg of streamed) {
      if (msg.type !== 'fill') continue
      const f = msg.payload as Fill | undefined
      if (!f || typeof f.timestamp !== 'number') continue
      if (!out.has(f.timestamp)) out.set(f.timestamp, f)
    }
    return Array.from(out.values()).sort((a, b) => b.timestamp - a.timestamp)
  }, [polled, streamed])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    )
  }

  if (merged.length === 0) {
    return <div className="px-3 py-6 text-center text-xs text-muted-foreground">No fills yet.</div>
  }

  return (
    <ScrollArea className="h-[260px]">
      <div className="grid grid-cols-[60px_60px_1fr_90px] gap-2 px-1 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        <span>Time</span>
        <span>Side</span>
        <span>Notional</span>
        <span className="text-right">Price</span>
      </div>
      <ul className="divide-y divide-border">
        {merged.slice(0, 80).map((f) => (
          <FillRow key={f.timestamp} fill={f} />
        ))}
      </ul>
    </ScrollArea>
  )
}

function FillRow({ fill }: { fill: Fill }) {
  const side = fill.notional > 0 ? 'LONG' : fill.notional < 0 ? 'SHORT' : 'FLAT'
  const sideClass =
    side === 'LONG' ? 'text-positive' : side === 'SHORT' ? 'text-negative' : 'text-muted-foreground'
  return (
    <li className="grid grid-cols-[60px_60px_1fr_90px] gap-2 px-1 py-2 font-mono text-xs">
      <span className="text-muted-foreground">{formatUtc(fill.timestamp).slice(11, 16)}</span>
      <span className={cn('uppercase tracking-[0.06em]', sideClass)}>{side}</span>
      <span className="text-foreground">{money(Math.abs(fill.notional))}</span>
      <span className="text-right text-foreground">{decimals(fill.price, 2)}</span>
    </li>
  )
}
