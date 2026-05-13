'use client'

import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface ConfigSnapshotCardProps {
  /** `RunMetadata.config_snapshot` — typed `any` from the wire, since the
   *  backend deliberately keeps it free-form. */
  data?: unknown
  loading?: boolean
}

/**
 * Hierarchical KV tree for the new `RunMetadata.config_snapshot` blob.
 * Renders the snapshot as expandable rows — primitives inline, objects
 * collapsible. Top-level keys expanded by default; nested objects start
 * collapsed since the LightGBM hyperparameters block is large.
 */
export function ConfigSnapshotCard({ data, loading }: ConfigSnapshotCardProps) {
  if (loading) {
    return (
      <div className="space-y-2 rounded-lg border border-border bg-surface px-[18px] py-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    )
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <div className="rounded-lg border border-border bg-surface px-[18px] py-4 text-xs text-muted-foreground">
        No config snapshot recorded for this run.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface px-[18px] py-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-foreground">Config snapshot</span>
        <span className="font-mono text-[11px] text-muted-foreground">meta.config_snapshot</span>
      </div>
      <div className="font-mono text-xs">
        <Tree value={data as Record<string, unknown>} depth={0} defaultOpen />
      </div>
    </div>
  )
}

function Tree({
  value,
  depth,
  defaultOpen = false,
}: {
  value: Record<string, unknown>
  depth: number
  defaultOpen?: boolean
}) {
  const entries = useMemo(() => Object.entries(value), [value])
  return (
    <ul className="space-y-1">
      {entries.map(([key, v]) => (
        <Row key={key} k={key} v={v} depth={depth} defaultOpen={defaultOpen && depth === 0} />
      ))}
    </ul>
  )
}

function Row({
  k,
  v,
  depth,
  defaultOpen,
}: {
  k: string
  v: unknown
  depth: number
  defaultOpen: boolean
}) {
  const isObject = v != null && typeof v === 'object' && !Array.isArray(v)
  const [open, setOpen] = useState(defaultOpen && isObject)
  const indent = { paddingLeft: depth * 12 }

  if (!isObject) {
    return (
      <li className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-border py-1 last:border-b-0">
        <span className="truncate text-muted-foreground" style={indent}>
          {k}
        </span>
        <span className="text-right text-foreground">{renderPrimitive(v)}</span>
      </li>
    )
  }

  const obj = v as Record<string, unknown>
  return (
    <li className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-baseline gap-2 border-b border-border py-1 text-left transition-colors hover:text-foreground"
        style={indent}
      >
        <ChevronRight
          className={cn(
            'size-3 shrink-0 text-faint-foreground transition-transform',
            open && 'rotate-90',
          )}
        />
        <span className="text-muted-foreground">{k}</span>
        <span className="ml-auto text-faint-foreground">
          {Object.keys(obj).length} {Object.keys(obj).length === 1 ? 'field' : 'fields'}
        </span>
      </button>
      {open && <Tree value={obj} depth={depth + 1} />}
    </li>
  )
}

function renderPrimitive(v: unknown): React.ReactNode {
  if (v === null || v === undefined) return <span className="text-faint-foreground">null</span>
  if (typeof v === 'boolean')
    return <span className={v ? 'text-positive' : 'text-faint-foreground'}>{String(v)}</span>
  if (typeof v === 'number') return <span>{formatNumber(v)}</span>
  if (typeof v === 'string') return <span className="truncate">{v}</span>
  if (Array.isArray(v)) {
    return (
      <span className="text-faint-foreground">
        [{v.length} {v.length === 1 ? 'item' : 'items'}]
      </span>
    )
  }
  return <span className="text-faint-foreground">{typeof v}</span>
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  if (Number.isInteger(n)) return n.toLocaleString('en-US')
  if (Math.abs(n) >= 1) return n.toLocaleString('en-US', { maximumFractionDigits: 4 })
  return n.toString()
}
