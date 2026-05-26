'use client'

import Link from 'next/link'
import type { ModelTypeEntry } from '@/api-client'
import { KvRow } from '@/components/dashboard/KvRow'
import { decimals } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface ModelCardProps {
  entry: ModelTypeEntry
}

export function ModelCard({ entry }: ModelCardProps) {
  const href = `/models/${encodeURIComponent(entry.id)}`

  return (
    <Link
      href={href}
      className={cn(
        'block rounded-lg border border-border bg-surface px-[18px] py-4 transition-colors',
        'hover:border-border-strong hover:bg-elevated',
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-base font-medium text-foreground">{entry.name}</span>
        <span className="font-mono text-[11px] text-faint-foreground">{entry.architecture}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
      <div className="mt-3 grid grid-cols-4 gap-x-4 gap-y-1 text-[11px]">
        <KvRow keyLabel="Features" value={String(entry.n_features)} />
        <KvRow keyLabel="Leaves" value={String(entry.num_leaves)} />
        <KvRow keyLabel="Threshold" value={decimals(entry.threshold, 5)} />
        <KvRow keyLabel="Stop loss" value={decimals(entry.stop_loss_pct, 4)} />
      </div>
    </Link>
  )
}
