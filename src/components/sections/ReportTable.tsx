'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { HeadlineSection, IndexedReportDto } from '@/api-client'
import { Skeleton } from '@/components/ui/skeleton'
import { ModeBadge } from '@/components/dashboard/ModeBadge'
import { SharpeBar } from '@/components/dashboard/SharpeBar'
import { useReportHeadlines } from '@/hooks/useReportSections'
import { toMode } from '@/lib/mode'
import { money, percent } from '@/lib/format'
import { formatUtc } from '@/lib/time'
import { cn } from '@/lib/utils'

export type SortKey = 'net_pnl' | 'trades' | 'win_rate'
export type SortDir = 'asc' | 'desc'

export interface ReportTableProps {
  rows: IndexedReportDto[]
  loading?: boolean
}

const GRID_COLS =
  'grid-cols-[110px_130px_90px_180px_1fr_110px_70px_80px_24px] max-[1100px]:grid-cols-[90px_100px_80px_140px_1fr_90px_60px_24px]'

const TRADES_COL_HIDE = 'max-[1100px]:hidden'

export function ReportTable({ rows, loading = false }: ReportTableProps) {
  const router = useRouter()
  const params = useSearchParams()
  const sort = (params.get('sort') as SortKey | null) ?? null
  const dir = (params.get('dir') as SortDir | null) ?? 'desc'

  const runIds = useMemo(() => rows.map((r) => r.run_id), [rows])
  const headlines = useReportHeadlines(runIds)

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const keyFn = sortKeyFor(sort, headlines.byRunId)
    const sign = dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = keyFn(a)
      const bv = keyFn(b)
      // Missing values sink to the bottom regardless of direction.
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      return (av - bv) * sign
    })
  }, [rows, sort, dir, headlines.byRunId])

  const onSort = (key: SortKey) => {
    const next = new URLSearchParams(params.toString())
    if (sort === key) {
      // Cycle: desc → asc → off
      if (dir === 'desc') {
        next.set('sort', key)
        next.set('dir', 'asc')
      } else {
        next.delete('sort')
        next.delete('dir')
      }
    } else {
      next.set('sort', key)
      next.set('dir', 'desc')
    }
    const qs = next.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {/* Head */}
      <div
        className={cn(
          'grid items-center gap-4 bg-background px-[18px] py-[11px] text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground',
          GRID_COLS,
        )}
      >
        <span>Model</span>
        <span>Run ID</span>
        <span>Mode</span>
        <span>Period</span>
        <span>Sharpe</span>
        <SortHeader
          align="right"
          active={sort === 'net_pnl'}
          dir={dir}
          onClick={() => onSort('net_pnl')}
        >
          Net P&amp;L
        </SortHeader>
        <SortHeader
          align="right"
          className={TRADES_COL_HIDE}
          active={sort === 'trades'}
          dir={dir}
          onClick={() => onSort('trades')}
        >
          Trades
        </SortHeader>
        <SortHeader
          align="right"
          active={sort === 'win_rate'}
          dir={dir}
          onClick={() => onSort('win_rate')}
        >
          Win rate
        </SortHeader>
        <span />
      </div>

      {/* Body */}
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <ReportRowSkeleton key={i} />)
      ) : sortedRows.length === 0 ? (
        <div className="px-[18px] py-8 text-center text-xs text-muted-foreground">
          No reports match these filters.
        </div>
      ) : (
        sortedRows.map((r) => (
          <ReportRow key={r.run_id} row={r} headline={headlines.byRunId.get(r.run_id)} />
        ))
      )}
    </div>
  )
}

function SortHeader({
  children,
  align = 'left',
  className,
  active,
  dir,
  onClick,
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-baseline gap-1 transition-colors hover:text-foreground',
        align === 'right' && 'justify-end',
        active && 'text-foreground',
        className,
      )}
    >
      <span>{children}</span>
      <span
        aria-hidden
        className={cn(
          'text-[9px] leading-none',
          active ? 'text-foreground' : 'text-faint-foreground',
        )}
      >
        {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </button>
  )
}

function sortKeyFor(
  sort: SortKey,
  byRunId: Map<string, HeadlineSection | undefined>,
): (row: IndexedReportDto) => number | null {
  switch (sort) {
    case 'net_pnl':
      return (row) => row.terminal_equity - row.initial_equity
    case 'trades':
      return (row) => byRunId.get(row.run_id)?.n_trades ?? null
    case 'win_rate':
      return (row) => byRunId.get(row.run_id)?.win_rate ?? null
  }
}

function ReportRow({
  row,
  headline,
}: {
  row: IndexedReportDto
  headline: HeadlineSection | undefined
}) {
  const router = useRouter()
  const href = `/reports/${encodeURIComponent(row.run_id)}`
  const ddPct = row.max_drawdown_pct
  const netPnl = row.terminal_equity - row.initial_equity
  const pnlTone = netPnl > 0 ? 'text-positive' : netPnl < 0 ? 'text-negative' : 'text-foreground'

  const winRate = headline?.win_rate
  const winTone =
    winRate == null
      ? 'text-faint-foreground'
      : winRate >= 0.55
        ? 'text-positive'
        : winRate < 0.45
          ? 'text-negative'
          : 'text-foreground'
  const loadingHeadline = headline === undefined

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
      <span className="truncate">
        {row.model_name ? (
          <Link
            href={`/models/${encodeURIComponent(row.model_name)}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-foreground transition-colors hover:text-primary"
            title={`View all runs of ${row.model_name}`}
          >
            {row.model_name}
          </Link>
        ) : (
          <span className="text-faint-foreground">—</span>
        )}
      </span>
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
      <span
        className={cn('text-right', pnlTone)}
        title={`Terminal ${money(row.terminal_equity)} · Initial ${money(row.initial_equity)} · Max DD ${percent(-ddPct)}`}
      >
        {netPnl > 0 ? '+' : ''}
        {money(netPnl)}
      </span>
      <span className={cn('text-right', TRADES_COL_HIDE)}>
        {loadingHeadline ? (
          <Skeleton className="ml-auto h-3 w-10" />
        ) : headline ? (
          <span className="text-foreground">{headline.n_trades.toLocaleString('en-US')}</span>
        ) : (
          <span className="text-faint-foreground">—</span>
        )}
      </span>
      <span className={cn('text-right', winTone)}>
        {loadingHeadline ? (
          <Skeleton className="ml-auto h-3 w-10" />
        ) : winRate != null ? (
          percent(winRate)
        ) : (
          <span className="text-faint-foreground">—</span>
        )}
      </span>
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
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="ml-auto h-3.5 w-14" />
      <Skeleton className={cn('ml-auto h-3.5 w-10', TRADES_COL_HIDE)} />
      <Skeleton className="ml-auto h-3.5 w-12" />
      <span />
    </div>
  )
}
