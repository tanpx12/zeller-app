'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { DecisionFacetsDto } from '@/api-client'
import { verdictKindFromLabel, type VerdictKind } from '@/lib/verdict'

export interface DecisionFiltersProps {
  facets?: DecisionFacetsDto
  totalCount?: number
}

const options: { value: '' | VerdictKind; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'no_retrain', label: 'No action' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'recommend', label: 'Retrain' },
]

/**
 * Mockup `.filter-bar` reused for decisions (index.html:740-747). Counts
 * come from `DecisionFacetsDto.by_verdict` — the backend key could be either
 * the Rust enum variant ("NoRetrainNeeded") or the human label, so we
 * roll up matching keys per VerdictKind.
 */
export function DecisionFilters({ facets, totalCount }: DecisionFiltersProps) {
  const router = useRouter()
  const params = useSearchParams()
  const current = (params.get('verdict') as '' | VerdictKind | null) ?? ''

  const set = useCallback(
    (value: '' | VerdictKind) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set('verdict', value)
      else next.delete('verdict')
      const qs = next.toString()
      router.replace(qs ? `?${qs}` : '?', { scroll: false })
    },
    [params, router],
  )

  const grouped: Record<VerdictKind, number> = {
    no_retrain: 0,
    monitor: 0,
    recommend: 0,
    strongly_recommend: 0,
  }
  if (facets?.by_verdict) {
    for (const [key, count] of Object.entries(facets.by_verdict)) {
      grouped[verdictKindFromLabel(key)] += count
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {options.map((opt) => {
        const active = current === opt.value
        const count =
          opt.value === ''
            ? totalCount
            : opt.value === 'recommend'
              ? grouped.recommend + grouped.strongly_recommend
              : grouped[opt.value]
        return (
          <button
            key={opt.value || 'all'}
            type="button"
            onClick={() => set(opt.value)}
            data-active={active ? '' : undefined}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border bg-surface px-3 py-1.5 text-[12px] transition-colors',
              active
                ? 'border-border-strong bg-elevated text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            <span>{opt.label}</span>
            {count != null && <span className="text-faint-foreground">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
