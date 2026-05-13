'use client'

import { useRouter } from 'next/navigation'
import type { IndexedReportDto } from '@/api-client'
import { Skeleton } from '@/components/ui/skeleton'
import { ModeBadge } from '@/components/dashboard/ModeBadge'
import { SharpeBar } from '@/components/dashboard/SharpeBar'
import { toMode } from '@/lib/mode'
import { money, percent } from '@/lib/format'

// `money` is referenced from a `title` template literal below — keep the import.
import { formatUtc } from '@/lib/time'
import { cn } from '@/lib/utils'

export interface ReportTableProps {
  rows: IndexedReportDto[]
  loading?: boolean
}

/**
 * Matches the mockup's `.reports-table` / `.reports-row` (index.html:193-207).
 * CSS Grid with explicit columns: Run ID | Mode | Period | Sharpe (1fr) | Max DD |
 * Trades | Status | chevron. The "Trades" column collapses below 1100px viewport.
 */
const GRID_COLS =
  'grid-cols-[130px_90px_180px_1fr_90px_90px_70px_24px] max-[1100px]:grid-cols-[100px_80px_140px_1fr_70px_70px_24px]'

const TRADES_COL_HIDE = 'max-[1100px]:hidden'

export function ReportTable({ rows, loading = false }: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {/* Head */}
      <div
        className={cn(
          'grid items-center gap-4 bg-background px-[18px] py-[11px] text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground',
          GRID_COLS,
        )}
      >
        <span>Run ID</span>
        <span>Mode</span>
        <span>Period</span>
        <span>Sharpe</span>
        <span className="text-right">Max DD</span>
        <span className={cn('text-right', TRADES_COL_HIDE)}>Trades</span>
        <span className="text-right">Status</span>
        <span />
      </div>

      {/* Body */}
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <ReportRowSkeleton key={i} />)
      ) : rows.length === 0 ? (
        <div className="px-[18px] py-8 text-center text-xs text-muted-foreground">
          No reports match these filters.
        </div>
      ) : (
        rows.map((r) => <ReportRow key={r.run_id} row={r} />)
      )}
    </div>
  )
}

function ReportRow({ row }: { row: IndexedReportDto }) {
  const router = useRouter()
  const href = `/reports/${encodeURIComponent(row.run_id)}`
  const ddPct = row.max_drawdown_pct
  const isDecision = row.mode.toLowerCase() === 'reconciliation'

  // Status heuristic — matches the mockup's pattern: ✓ for healthy runs, faint
  // dash for runs we can't evaluate (decisions, NaN sharpe).
  const statusLabel = isDecision
    ? '—'
    : row.sharpe == null
      ? '—'
      : row.sharpe > 0 && ddPct < 0.2
        ? '✓'
        : '✗'
  const statusTone =
    isDecision || row.sharpe == null
      ? 'text-faint-foreground'
      : statusLabel === '✓'
        ? 'text-positive'
        : 'text-negative'

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`Open report ${row.run_id}`}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(href)
      }}
      className={cn(
        'grid cursor-pointer items-center gap-4 border-t border-border px-[18px] py-[14px] font-mono text-xs transition-colors hover:bg-elevated',
        GRID_COLS,
      )}
    >
      <span className="truncate text-muted-foreground">{row.run_id}</span>
      <span>
        <ModeBadge mode={toMode(row.mode)} />
      </span>
      <span className="truncate text-muted-foreground">
        {formatUtc(row.period_start_ms).slice(0, 10)} → {formatUtc(row.period_end_ms).slice(0, 10)}
      </span>
      <span>
        {row.sharpe == null ? (
          <span className="text-faint-foreground">—</span>
        ) : (
          <SharpeBar value={row.sharpe} />
        )}
      </span>
      <span className={cn('text-right', ddPct > 0.1 ? 'text-negative' : 'text-foreground')}>
        {percent(-ddPct)}
      </span>
      <span
        className={cn('text-right text-muted-foreground', TRADES_COL_HIDE)}
        title={`Terminal equity: ${money(row.terminal_equity)}`}
      >
        —
      </span>
      <span className={cn('text-right', statusTone)}>{statusLabel}</span>
      <span className="text-base leading-none text-faint-foreground">›</span>
    </div>
  )
}

function ReportRowSkeleton() {
  return (
    <div
      className={cn(
        'grid items-center gap-4 border-t border-border px-[18px] py-[14px]',
        GRID_COLS,
      )}
    >
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="ml-auto h-3.5 w-12" />
      <Skeleton className={cn('ml-auto h-3.5 w-10', TRADES_COL_HIDE)} />
      <Skeleton className="ml-auto h-3.5 w-6" />
      <span />
    </div>
  )
}
