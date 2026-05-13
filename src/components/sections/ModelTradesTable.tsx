'use client'

import { useRouter } from 'next/navigation'
import type { ModelTradeDto } from '@/api-client'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ModeBadge } from '@/components/dashboard/ModeBadge'
import { toMode } from '@/lib/mode'
import { decimals, money, percent } from '@/lib/format'
import { formatUtc } from '@/lib/time'
import { cn } from '@/lib/utils'

export interface ModelTradesTableProps {
  rows: ModelTradeDto[]
  loading?: boolean
  isFetchingMore?: boolean
  onLoadMore?: () => void
  hasNextPage?: boolean
}

const GRID_COLS =
  'grid-cols-[140px_80px_60px_90px_90px_70px_140px_70px] max-[1100px]:grid-cols-[110px_70px_50px_80px_80px_60px_120px]'
const RUN_COL_HIDE = 'max-[1100px]:hidden'

const HEAD = [
  { key: 'time', label: 'Entry (UTC)' },
  { key: 'side', label: 'Side' },
  { key: 'mode', label: 'Mode' },
  { key: 'pnl_pct', label: 'P&L %', align: 'right' as const },
  { key: 'pnl_usd', label: 'P&L $', align: 'right' as const },
  { key: 'hold', label: 'Bars', align: 'right' as const },
  { key: 'run', label: 'Run ID', hideUnder1100: true },
  { key: 'price', label: 'Exit', align: 'right' as const },
]

export function ModelTradesTable({
  rows,
  loading,
  isFetchingMore,
  onLoadMore,
  hasNextPage,
}: ModelTradesTableProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div
          className={cn(
            'grid items-center gap-3 bg-background px-[18px] py-[11px] text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground',
            GRID_COLS,
          )}
        >
          {HEAD.map((c) => (
            <span
              key={c.key}
              className={cn(c.align === 'right' && 'text-right', c.hideUnder1100 && RUN_COL_HIDE)}
            >
              {c.label}
            </span>
          ))}
        </div>

        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
        ) : rows.length === 0 ? (
          <div className="px-[18px] py-8 text-center text-xs text-muted-foreground">
            No trades match these filters.
          </div>
        ) : (
          rows.map((row, idx) => (
            <TradeRow key={`${row.run_id}-${row.trade_id ?? idx}`} row={row} />
          ))
        )}
      </div>

      {hasNextPage && onLoadMore && (
        <div className="flex justify-center pt-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={isFetchingMore}
            onClick={onLoadMore}
            className="h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
          >
            {isFetchingMore ? 'Loading…' : 'Load more trades'}
          </Button>
        </div>
      )}
    </div>
  )
}

function TradeRow({ row }: { row: ModelTradeDto }) {
  const router = useRouter()
  const pnlTone = row.pnl_usd > 0 ? 'positive' : row.pnl_usd < 0 ? 'negative' : 'default'
  const side = row.side.toLowerCase()
  const runHref = `/reports/${encodeURIComponent(row.run_id)}`

  return (
    <div
      className={cn(
        'grid items-center gap-3 border-t border-border px-[18px] py-[12px] font-mono text-xs',
        GRID_COLS,
      )}
    >
      <span className="text-muted-foreground">{formatUtc(row.entry_ts).slice(0, 16)}</span>
      <span
        className={cn(
          'uppercase tracking-[0.06em]',
          side === 'short' ? 'text-warning' : 'text-primary',
        )}
      >
        {row.side}
      </span>
      <span>
        <ModeBadge mode={toMode(row.mode)} />
      </span>
      <span
        className={cn(
          'text-right',
          pnlTone === 'positive' && 'text-positive',
          pnlTone === 'negative' && 'text-negative',
        )}
      >
        {percent(row.pnl_pct)}
      </span>
      <span
        className={cn(
          'text-right',
          pnlTone === 'positive' && 'text-positive',
          pnlTone === 'negative' && 'text-negative',
        )}
      >
        {money(row.pnl_usd)}
      </span>
      <span className="text-right text-muted-foreground">{row.hold_bars}</span>
      <button
        type="button"
        onClick={() => router.push(runHref)}
        className={cn(
          'truncate text-left text-muted-foreground transition-colors hover:text-foreground',
          RUN_COL_HIDE,
        )}
        title={row.run_id}
      >
        {row.run_id}
      </button>
      <span className="text-right text-foreground">{decimals(row.exit_price, 2)}</span>
    </div>
  )
}

function RowSkeleton() {
  return (
    <div
      className={cn(
        'grid items-center gap-3 border-t border-border px-[18px] py-[12px]',
        GRID_COLS,
      )}
    >
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-3.5 w-12" />
      <Skeleton className="h-4 w-14" />
      <Skeleton className="ml-auto h-3.5 w-12" />
      <Skeleton className="ml-auto h-3.5 w-16" />
      <Skeleton className="ml-auto h-3.5 w-6" />
      <Skeleton className={cn('h-3.5 w-32', RUN_COL_HIDE)} />
      <Skeleton className="ml-auto h-3.5 w-14" />
    </div>
  )
}
