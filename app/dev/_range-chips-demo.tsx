'use client'

import { useState } from 'react'
import { RangeChips, type RangeValue } from '@/components/dashboard/RangeChips'

export function RangeChipsDemo() {
  const [value, setValue] = useState<RangeValue>('30d')
  return (
    <div className="flex items-center gap-4">
      <RangeChips value={value} onValueChange={setValue} />
      <span className="text-xs font-mono text-muted-foreground">selected: {value}</span>
    </div>
  )
}
