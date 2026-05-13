'use client'

import { useRouter } from 'next/navigation'
import type { DecisionListEntry } from '@/api-client'
import { VerdictBadge } from '@/components/dashboard/VerdictBadge'
import { verdictBadgeCode, verdictKindFromLabel, verdictLabel } from '@/lib/verdict'
import { cn } from '@/lib/utils'

export interface DecisionRowProps {
  entry: DecisionListEntry
}

/**
 * Compact list row for `/decisions`. The list endpoint only returns
 * `date`, `verdict_label`, `n_triggers_fired`, so the full trigger list +
 * stats grid lives on the detail page at `/decisions/[date]`.
 */
export function DecisionRow({ entry }: DecisionRowProps) {
  const router = useRouter()
  const kind = verdictKindFromLabel(entry.verdict_label)
  const href = `/decisions/${encodeURIComponent(entry.date)}`

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={cn(
        'grid w-full grid-cols-[110px_1fr_auto_auto] items-center gap-4 rounded-lg border border-border bg-surface px-5 py-4 text-left transition-colors',
        'hover:border-border-strong hover:bg-elevated',
      )}
    >
      <span className="font-mono text-[13px] text-muted-foreground">{entry.date}</span>
      <span className="truncate text-sm text-foreground">{verdictLabel(kind)}</span>
      <span className="font-mono text-[11px] text-muted-foreground">
        {entry.n_triggers_fired === 0
          ? '0 fired'
          : `${entry.n_triggers_fired} ${entry.n_triggers_fired === 1 ? 'fire' : 'fires'}`}
      </span>
      <VerdictBadge code={verdictBadgeCode(kind)} />
    </button>
  )
}
