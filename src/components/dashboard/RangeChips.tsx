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
            // Inactive: 4px 10px padding, no border, plain text-muted.
            'h-auto rounded-[4px] border border-transparent bg-transparent px-2.5 py-1 font-mono text-[11px] text-muted-foreground',
            // Active: 1px border, elevated bg, foreground text. Compensated
            // padding (3px 9px) so the chip doesn't shift when toggled.
            'data-[state=on]:border-border data-[state=on]:bg-elevated data-[state=on]:px-[9px] data-[state=on]:py-[3px] data-[state=on]:text-foreground',
            'hover:bg-transparent hover:text-foreground',
          )}
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
