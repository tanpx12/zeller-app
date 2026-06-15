'use client'

import { LIVE_MODELS, type LiveModelName } from '@/lib/live-model-client'
import { cn } from '@/lib/utils'

export interface LiveModelSelectorProps {
  value: LiveModelName
  onChange: (model: LiveModelName) => void
}

export function LiveModelSelector({ value, onChange }: LiveModelSelectorProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Model">
      {LIVE_MODELS.map((m) => {
        const active = m === value
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
              active
                ? 'border-border-strong bg-elevated text-foreground'
                : 'border-border bg-surface text-muted-foreground hover:text-foreground',
            )}
          >
            {m}
          </button>
        )
      })}
    </div>
  )
}
