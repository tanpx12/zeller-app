'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

export type RangeValue = '7d' | '30d' | '90d' | 'all'

const options: { value: RangeValue; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: 'all', label: 'All' },
]

export interface RangeChipsProps {
  value: RangeValue
  onValueChange: (value: RangeValue) => void
  className?: string
}

export function RangeChips({ value, onValueChange, className }: RangeChipsProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v: string) => {
        if (v) onValueChange(v as RangeValue)
      }}
      data-slot="range-chips"
      className={cn('gap-1', className)}
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className={cn(
            'h-7 rounded-[4px] border border-border bg-surface px-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground',
            'data-[state=on]:bg-elevated data-[state=on]:text-foreground data-[state=on]:border-border-strong',
          )}
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
