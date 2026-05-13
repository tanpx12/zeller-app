'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReportFacetsDto } from '@/api-client'

export interface ReportFiltersProps {
  facets?: ReportFacetsDto
}

const modeOptions: { value: string; label: string }[] = [
  { value: '', label: 'All modes' },
  { value: 'batch', label: 'Batch' },
  { value: 'holdout', label: 'Holdout' },
  { value: 'live', label: 'Live' },
  { value: 'reconciliation', label: 'Reconciliation' },
]

export function ReportFilters({ facets }: ReportFiltersProps) {
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
    <div className="flex flex-wrap items-center gap-2">
      {/* Mode pills */}
      {modeOptions.map((opt) => {
        const active = mode === opt.value
        const count = opt.value ? modeCounts[opt.value] : undefined
        return (
          <button
            key={opt.value || 'all'}
            type="button"
            data-active={active ? '' : undefined}
            onClick={() => update({ mode: opt.value || null })}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground transition-colors',
              'hover:text-foreground',
              'data-[active]:bg-elevated data-[active]:text-foreground data-[active]:border-border-strong',
            )}
          >
            <span>{opt.label}</span>
            {count != null && (
              <Badge
                variant="outline"
                className="h-4 rounded-sm border-transparent bg-elevated px-1.5 text-[10px] font-mono text-faint-foreground"
              >
                {count}
              </Badge>
            )}
          </button>
        )
      })}

      <span className="mx-1 h-4 w-px bg-border" aria-hidden />

      {/* Asset picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-md border border-border bg-surface px-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
          >
            {asset || 'All assets'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          <DropdownMenuItem onSelect={() => update({ asset: null })}>All assets</DropdownMenuItem>
          {Object.keys(assetCounts).map((a) => (
            <DropdownMenuItem key={a} onSelect={() => update({ asset: a })}>
              <span className="flex-1">{a}</span>
              <span className="font-mono text-faint-foreground">{assetCounts[a]}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Min Sharpe */}
      <div className="inline-flex items-center gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Min Sharpe
        </span>
        <Input
          type="number"
          step="0.1"
          inputMode="decimal"
          value={minSharpe}
          onChange={(e) => update({ min_sharpe: e.target.value || null })}
          className="h-7 w-[80px] rounded-md border-border bg-surface px-2 text-xs font-mono"
          placeholder="—"
        />
      </div>

      {/* Reset */}
      {(mode || asset || minSharpe) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.replace('?', { scroll: false })}
          className="h-7 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
        >
          Reset
        </Button>
      )}
    </div>
  )
}
