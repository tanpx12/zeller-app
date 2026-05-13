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

const SIZERS = ['', 'scaled', 'fixed'] as const
const MODES = ['', 'batch', 'holdout', 'live', 'reconciliation'] as const

export interface ModelTradesFiltersProps {
  /** Total trades currently in view (across loaded pages). */
  visibleCount?: number
  /** Approximate total from `total_count_estimate`. */
  totalEstimate?: number
}

/**
 * URL-synced filter row for `/models/{name}/trades`. Mirrors the
 * `.filter-bar` pattern used on `/reports` (sentence-case pills, count in
 * faint-foreground, 12px sans). All state lives in `useSearchParams`.
 */
export function ModelTradesFilters({ visibleCount, totalEstimate }: ModelTradesFiltersProps) {
  const router = useRouter()
  const params = useSearchParams()

  const mode = params.get('mode') ?? ''
  const sizer = params.get('sizer') ?? ''
  const leverage = params.get('leverage') ?? ''
  const sl = params.get('sl') ?? ''

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

  const anyActive = !!(mode || sizer || leverage || sl)

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Mode pill — dropdown so the bar stays compact */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={pillClass(!!mode)}>
            <span>Mode: {mode || 'all'}</span>
            <span className="text-faint-foreground">▾</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          {MODES.map((m) => (
            <DropdownMenuItem key={m || 'all'} onSelect={() => update({ mode: m || null })}>
              {m || 'all'}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sizer pill */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={pillClass(!!sizer)}>
            <span>Sizer: {sizer || 'any'}</span>
            <span className="text-faint-foreground">▾</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          {SIZERS.map((s) => (
            <DropdownMenuItem key={s || 'any'} onSelect={() => update({ sizer: s || null })}>
              {s || 'any'}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Leverage inline */}
      <label className={cn(pillClass(!!leverage), 'gap-2 pr-2')}>
        <span>Leverage:</span>
        <Input
          type="number"
          step="0.1"
          inputMode="decimal"
          value={leverage}
          onChange={(e) => update({ leverage: e.target.value || null })}
          className="h-5 w-[58px] border-0 bg-transparent p-0 text-[12px] font-mono text-foreground shadow-none focus-visible:ring-0"
          placeholder="any"
        />
      </label>

      {/* Stop-loss inline */}
      <label className={cn(pillClass(!!sl), 'gap-2 pr-2')}>
        <span>Stop loss:</span>
        <Input
          type="number"
          step="0.0005"
          inputMode="decimal"
          value={sl}
          onChange={(e) => update({ sl: e.target.value || null })}
          className="h-5 w-[72px] border-0 bg-transparent p-0 text-[12px] font-mono text-foreground shadow-none focus-visible:ring-0"
          placeholder="any"
        />
      </label>

      <span className="flex-1" aria-hidden />

      {(visibleCount != null || totalEstimate != null) && (
        <span className="font-mono text-[11px] text-muted-foreground">
          {visibleCount?.toLocaleString('en-US') ?? '—'}
          {totalEstimate != null && totalEstimate > (visibleCount ?? 0) && (
            <> of ~{totalEstimate.toLocaleString('en-US')}</>
          )}{' '}
          trades
        </span>
      )}

      {anyActive && (
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

function pillClass(active: boolean) {
  return cn(
    'inline-flex items-center gap-1.5 rounded-md border bg-surface px-3 py-1.5 text-[12px] transition-colors',
    active
      ? 'border-border-strong bg-elevated text-foreground'
      : 'border-border text-muted-foreground hover:text-foreground',
  )
}
