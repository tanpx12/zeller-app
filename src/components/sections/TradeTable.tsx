'use client'

import type { TradesPageDto, TradeDto } from '@/api-client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { decimals, money, percent } from '@/lib/format'
import { formatUtc } from '@/lib/time'
import { cn } from '@/lib/utils'

export interface TradeTableProps {
  page?: TradesPageDto
  loading?: boolean
  onLoadMore?: () => void
  isFetchingMore?: boolean
}

const columns = [
  { key: 'entry', label: 'Entry (UTC)' },
  { key: 'side', label: 'Side', width: 'w-[60px]' },
  { key: 'entry_price', label: 'Entry', align: 'right' as const },
  { key: 'exit_price', label: 'Exit', align: 'right' as const },
  { key: 'pnl_pct', label: 'P&L %', align: 'right' as const },
  { key: 'pnl_usd', label: 'P&L $', align: 'right' as const },
  { key: 'hold', label: 'Bars', align: 'right' as const, width: 'w-[60px]' },
]

export function TradeTable({ page, loading, onLoadMore, isFetchingMore }: TradeTableProps) {
  const rows = page?.data ?? []
  const summary = page?.summary

  return (
    <div className="space-y-3">
      {summary && (
        <Card className="rounded-lg border-border bg-surface p-3">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs font-mono md:grid-cols-4">
            <SummaryRow label="Avg win" value={money(summary.avg_win_usd)} tone="positive" />
            <SummaryRow label="Avg loss" value={money(summary.avg_loss_usd)} tone="negative" />
            <SummaryRow
              label="Largest win"
              value={summary.largest_win ? money(summary.largest_win.pnl_usd) : '—'}
              tone="positive"
            />
            <SummaryRow
              label="Largest loss"
              value={summary.largest_loss ? money(summary.largest_loss.pnl_usd) : '—'}
              tone="negative"
            />
            <SummaryRow label="Avg hold" value={`${decimals(summary.avg_hold_bars, 1)} bars`} />
            <SummaryRow
              label="Trades"
              value={`${page!.total_count_estimate.toLocaleString('en-US')}`}
            />
          </div>
        </Card>
      )}

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  className={cn(
                    'h-9 text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground',
                    c.width,
                    c.align === 'right' && 'text-right',
                  )}
                >
                  {c.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <TradeRowSkeleton key={i} />)
              : rows.map((r) => <TradeRow key={r.trade_id} row={r} />)}
          </TableBody>
        </Table>
        {!loading && rows.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            No trades recorded for this report.
          </div>
        )}
      </div>

      {onLoadMore && page?.next_cursor && (
        <div className="flex justify-center">
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

function SummaryRow({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  tone?: 'default' | 'positive' | 'negative'
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'font-mono font-medium',
          tone === 'positive' && 'text-positive',
          tone === 'negative' && 'text-negative',
          tone === 'default' && 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function TradeRow({ row }: { row: TradeDto }) {
  const side = row.side.toLowerCase()
  const pnlTone = row.pnl_usd > 0 ? 'positive' : row.pnl_usd < 0 ? 'negative' : 'default'
  return (
    <TableRow className="border-border hover:bg-elevated/50">
      <TableCell className="py-2 text-xs font-mono text-muted-foreground">
        {formatUtc(row.entry_ts).slice(0, 16)}
      </TableCell>
      <TableCell className="py-2 text-xs font-mono">
        <span
          className={cn(
            'inline-block uppercase tracking-[0.06em]',
            side === 'short' ? 'text-warning' : 'text-primary',
          )}
        >
          {row.side}
        </span>
      </TableCell>
      <TableCell className="py-2 text-right text-xs font-mono text-foreground">
        {decimals(row.entry_price, 2)}
      </TableCell>
      <TableCell className="py-2 text-right text-xs font-mono text-foreground">
        {decimals(row.exit_price, 2)}
      </TableCell>
      <TableCell
        className={cn(
          'py-2 text-right text-xs font-mono',
          pnlTone === 'positive' && 'text-positive',
          pnlTone === 'negative' && 'text-negative',
        )}
      >
        {percent(row.pnl_pct)}
      </TableCell>
      <TableCell
        className={cn(
          'py-2 text-right text-xs font-mono',
          pnlTone === 'positive' && 'text-positive',
          pnlTone === 'negative' && 'text-negative',
        )}
      >
        {money(row.pnl_usd)}
      </TableCell>
      <TableCell className="py-2 text-right text-xs font-mono text-muted-foreground">
        {row.hold_bars}
      </TableCell>
    </TableRow>
  )
}

function TradeRowSkeleton() {
  return (
    <TableRow className="border-border">
      {columns.map((c) => (
        <TableCell key={c.key} className="py-2">
          <Skeleton className="h-3.5 w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  )
}
