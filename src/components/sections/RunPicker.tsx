'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Card } from '@/components/ui/card'
import { useReportSearch } from '@/hooks/useReportSearch'
import { cn } from '@/lib/utils'
import { decimals } from '@/lib/format'
import { formatUtc } from '@/lib/time'

export type RunPickerVariant = 'a' | 'b'

const variantBorder: Record<RunPickerVariant, string> = {
  a: 'border-l-primary',
  b: 'border-l-warning',
}

const variantLabel: Record<RunPickerVariant, string> = {
  a: 'text-primary',
  b: 'text-warning',
}

export interface RunPickerProps {
  variant: RunPickerVariant
  runId?: string
  onChange: (runId: string | undefined) => void
}

/**
 * Combobox-style run picker for the Compare tab. Wraps `RunPick`'s visual
 * shell (A/B accent left border) around a shadcn Command typeahead. The
 * selected run_id is the picker's single source of truth; metadata is
 * pulled from /reports/search and displayed beneath the heading.
 */
export function RunPicker({ variant, runId, onChange }: RunPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const search = useReportSearch({ q: query || undefined, limit: 20 })

  const hits = search.data?.data ?? []
  const selected = runId ? hits.find((h) => h.run_id === runId) : undefined

  // Render the selected run summary even when not in the search results
  // (search is filtered by `query`, so a previously-selected run can drop out).
  const selectedLabel = selected?.label ?? runId ?? 'Pick a run'

  return (
    <Card
      data-slot="run-picker"
      data-variant={variant}
      className={cn(
        'rounded-lg border border-border border-l-2 bg-surface gap-2 px-[18px] py-[14px]',
        variantBorder[variant],
      )}
    >
      <div
        className={cn('text-[10px] font-medium uppercase tracking-[0.06em]', variantLabel[variant])}
      >
        Run {variant.toUpperCase()}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-md text-left transition-colors hover:text-foreground"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-medium text-foreground">{selectedLabel}</div>
              {selected && (
                <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                  {selected.run_id}
                </div>
              )}
              {selected && (
                <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                  {selected.asset} · {selected.mode}
                  {selected.sharpe != null && <> · Sharpe {decimals(selected.sharpe)}</>} ·{' '}
                  {formatUtc(selected.period_start).slice(0, 10)} →{' '}
                  {formatUtc(selected.period_end).slice(0, 10)}
                </div>
              )}
            </div>
            <ChevronDown className="size-4 shrink-0 text-faint-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start" sideOffset={6}>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by run_id, asset, or mode..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>{search.isLoading ? 'Searching…' : 'No matching runs.'}</CommandEmpty>
              <CommandGroup>
                {hits.map((hit) => {
                  const isSelected = hit.run_id === runId
                  return (
                    <CommandItem
                      key={hit.run_id}
                      value={hit.run_id}
                      onSelect={(value) => {
                        onChange(value)
                        setOpen(false)
                      }}
                      className="flex items-start gap-2"
                    >
                      <Check
                        className={cn(
                          'mt-0.5 size-3.5 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-foreground">{hit.label}</div>
                        <div className="truncate font-mono text-[10px] text-muted-foreground">
                          {hit.run_id}
                        </div>
                      </div>
                      {hit.sharpe != null && (
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {decimals(hit.sharpe)}
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Card>
  )
}
