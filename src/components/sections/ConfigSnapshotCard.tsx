'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { KvRow } from '@/components/dashboard/KvRow'
import { decimals, percent } from '@/lib/format'

export interface ConfigSnapshotCardProps {
  /** `RunMetadata.config_snapshot` — typed `any` from the wire, since the
   *  backend keeps it free-form. We pluck a fixed set of fields out of it
   *  rather than rendering the whole tree. */
  data?: unknown
  loading?: boolean
}

interface PickedConfig {
  sizerKind: string | null
  leverage: number | null
  stopLossPct: number | null
  slippageBps: number | null
}

/**
 * Pulls the four operator-facing config fields out of the free-form snapshot:
 * sizer type, leverage, stop loss, slippage. Every step narrows via runtime
 * `typeof` checks so a missing / renamed field renders as `—` rather than
 * crashing.
 *
 * Leverage falls back through `max_leverage → target_leverage →
 * base_leverage` to handle both scaled (max-capped) and fixed (target-pinned)
 * sizers without branching on `kind` in the UI.
 */
function pickConfig(data: unknown): PickedConfig {
  const root = isObject(data) ? data : null
  const sizer = root && isObject(root.sizer) ? (root.sizer as Record<string, unknown>) : null
  const risk = root && isObject(root.risk) ? (root.risk as Record<string, unknown>) : null

  return {
    sizerKind: sizer && typeof sizer.kind === 'string' ? sizer.kind : null,
    leverage:
      pickNumber(sizer, 'max_leverage') ??
      pickNumber(sizer, 'target_leverage') ??
      pickNumber(sizer, 'base_leverage'),
    stopLossPct: pickNumber(risk, 'stop_loss_pct'),
    slippageBps: pickNumber(risk, 'stop_slippage_bps'),
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

function pickNumber(o: Record<string, unknown> | null, key: string): number | null {
  if (!o) return null
  const v = o[key]
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

const missing = <span className="text-faint-foreground">—</span>

export function ConfigSnapshotCard({ data, loading }: ConfigSnapshotCardProps) {
  if (loading) {
    return (
      <div className="space-y-2 rounded-lg border border-border bg-surface px-[18px] py-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    )
  }

  if (!isObject(data)) {
    return (
      <div className="rounded-lg border border-border bg-surface px-[18px] py-4 text-xs text-muted-foreground">
        No config snapshot recorded for this run.
      </div>
    )
  }

  const c = pickConfig(data)

  return (
    <div className="rounded-lg border border-border bg-surface px-[18px] py-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-foreground">Configuration</span>
        <span className="font-mono text-[11px] text-muted-foreground">meta.config_snapshot</span>
      </div>

      <KvRow
        keyLabel="Sizer type"
        value={
          c.sizerKind ? <span className="uppercase tracking-[0.04em]">{c.sizerKind}</span> : missing
        }
      />
      <KvRow
        keyLabel="Leverage"
        value={c.leverage != null ? `${decimals(c.leverage, 2)}×` : missing}
      />
      <KvRow
        keyLabel="Stop loss"
        value={c.stopLossPct != null ? percent(c.stopLossPct) : missing}
      />
      <KvRow
        keyLabel="Slippage"
        value={c.slippageBps != null ? `${decimals(c.slippageBps, 1)} bps` : missing}
        last
      />
    </div>
  )
}
