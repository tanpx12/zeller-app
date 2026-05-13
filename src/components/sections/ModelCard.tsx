'use client'

import Link from 'next/link'
import type { ModelListEntry } from '@/api-client'
import { ModeBadge } from '@/components/dashboard/ModeBadge'
import { toMode } from '@/lib/mode'
import { formatUtc } from '@/lib/time'
import { cn } from '@/lib/utils'

export interface ModelCardProps {
  entry: ModelListEntry
}

/**
 * One row of the `/models` index. Renders as a clickable card linking to
 * `/models/{name}` with the model's run count, latest activity, and mode mix.
 *
 * Visual: same card chrome as the report-detail cards (bg-surface, border,
 * radius-lg, px-[18px] py-4) per [[design-reference-is-index-html]].
 */
export function ModelCard({ entry }: ModelCardProps) {
  const href = `/models/${encodeURIComponent(entry.name)}`
  const ts = entry.latest_period_start_ms
  const period = ts != null ? formatUtc(ts).slice(0, 10) : '—'

  return (
    <Link
      href={href}
      className={cn(
        'block rounded-lg border border-border bg-surface px-[18px] py-4 transition-colors',
        'hover:border-border-strong hover:bg-elevated',
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base font-medium text-foreground">{entry.name}</span>
          <span className="font-mono text-[11px] text-faint-foreground">
            {entry.n_runs.toLocaleString('en-US')} {entry.n_runs === 1 ? 'run' : 'runs'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {entry.modes.length === 0 ? (
            <span className="text-[11px] text-faint-foreground">no runs</span>
          ) : (
            entry.modes.map((m) => <ModeBadge key={m} mode={toMode(m)} />)
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
      <div className="mt-2 font-mono text-[11px] text-faint-foreground">
        latest run: <span className="text-muted-foreground">{period}</span>
        {entry.config_hash && (
          <span className="ml-3">
            config: <span className="text-muted-foreground">{entry.config_hash.slice(0, 8)}…</span>
          </span>
        )}
      </div>
    </Link>
  )
}
