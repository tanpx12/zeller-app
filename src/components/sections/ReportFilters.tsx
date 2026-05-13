'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ReportFacetsDto } from '@/api-client'

export interface ReportFiltersProps {
  facets?: ReportFacetsDto
  totalCount?: number
}

const modeOptions: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'batch', label: 'Batch' },
  { value: 'holdout', label: 'Holdout' },
  { value: 'live', label: 'Live' },
  { value: 'reconciliation', label: 'Decision' },
]

/**
 * Matches the mockup's `.filter-bar` (index.html:175-191, 498-509). Pills are
 * 12px sans, no uppercase. Counts render as `.count` (text-faint-foreground)
 * inline after the label. Asset/Sharpe live to the right of a `.spacer`.
 */
export function ReportFilters({ facets, totalCount }: ReportFiltersProps) {
  const router = useRouter()
  const params = useSearchParams()

  const mode = params.get('mode') ?? ''
  const asset = params.get('asset') ?? ''
  const minSharpe = params.get('min_sharpe') ?? ''

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === '') next.delete(k)
        else next.set(k, v)
      }
      const qs = next.toString()
      router.replace(qs ? `?${qs}` : '?', { scroll: false })
    },
    [params, router],
  )

  const modeCounts = facets?.by_mode ?? {}
  const assetCounts = facets?.by_asset ?? {}

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <input
        type="search"
        placeholder="Search by run_id, period, config hash..."
        className="min-w-[240px] rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] text-foreground placeholder:text-faint-foreground focus:border-border-strong focus:outline-none"
        // Search is wired to filter state only when the API supports it; for
        // now it's a non-functional placeholder matching the mockup affordance.
        disabled
      />

      {modeOptions.map((opt) => {
        const active = mode === opt.value
        const count = opt.value === '' ? totalCount : modeCounts[opt.value]
        return (
          <FilterPill
            key={opt.value || 'all'}
            active={active}
            count={count}
            onClick={() => update({ mode: opt.value || null })}
          >
            {opt.label}
          </FilterPill>
        )
      })}

      <span className="flex-1" aria-hidden />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={filterPillClass(!!asset)}>
            <span>Asset: {asset || 'All'}</span>
            <span className="text-faint-foreground">▾</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          <DropdownMenuItem onSelect={() => update({ asset: null })}>All assets</DropdownMenuItem>
          {Object.keys(assetCounts).map((a) => (
            <DropdownMenuItem key={a} onSelect={() => update({ asset: a })}>
              <span className="flex-1">{a}</span>
              <span className="font-mono text-faint-foreground">{assetCounts[a]}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <label className={cn(filterPillClass(!!minSharpe), 'gap-2 pr-2')}>
        <span>Min Sharpe:</span>
        <Input
          type="number"
          step="0.1"
          inputMode="decimal"
          value={minSharpe}
          onChange={(e) => update({ min_sharpe: e.target.value || null })}
          className="h-5 w-[58px] border-0 bg-transparent p-0 text-[12px] font-mono text-foreground shadow-none focus-visible:ring-0"
          placeholder="—"
        />
      </label>

      {(mode || asset || minSharpe) && (
        <button
          type="button"
          onClick={() => router.replace('?', { scroll: false })}
          className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset
        </button>
      )}
    </div>
  )
}

function FilterPill({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean
  count?: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      data-active={active ? '' : undefined}
      onClick={onClick}
      className={filterPillClass(active)}
    >
      <span>{children}</span>
      {count != null && <span className="text-faint-foreground">{count}</span>}
    </button>
  )
}

function filterPillClass(active: boolean) {
  return cn(
    'inline-flex items-center gap-1.5 rounded-md border bg-surface px-3 py-1.5 text-[12px] transition-colors',
    active
      ? 'border-border-strong bg-elevated text-foreground'
      : 'border-border text-muted-foreground hover:text-foreground',
  )
}
