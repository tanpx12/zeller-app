'use client'

import { useRouter } from 'next/navigation'
import type { IndexedReportDto } from '@/api-client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ModeBadge } from '@/components/dashboard/ModeBadge'
import { SharpeBar } from '@/components/dashboard/SharpeBar'
import { toMode } from '@/lib/mode'
import { decimals, money, percent } from '@/lib/format'
import { formatUtc } from '@/lib/time'
import { cn } from '@/lib/utils'

export interface ReportTableProps {
  rows: IndexedReportDto[]
  loading?: boolean
}

const columns = [
  { key: 'mode', label: 'Mode', width: 'w-[90px]' },
  { key: 'asset', label: 'Asset', width: 'w-[110px]' },
  { key: 'period', label: 'Period (UTC)', width: 'w-[240px]' },
  { key: 'sharpe', label: 'Sharpe', width: 'w-[120px]' },
  { key: 'maxdd', label: 'Max DD', width: 'w-[90px]', align: 'right' as const },
  { key: 'equity', label: 'Terminal', width: 'w-[120px]', align: 'right' as const },
  { key: 'run', label: 'Run ID', width: '' },
]

export function ReportTable({ rows, loading = false }: ReportTableProps) {
  return (
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
            ? Array.from({ length: 6 }).map((_, i) => <ReportRowSkeleton key={i} />)
            : rows.map((r) => <ReportRow key={r.run_id} row={r} />)}
        </TableBody>
      </Table>
      {!loading && rows.length === 0 && (
        <div className="px-4 py-8 text-center text-xs text-muted-foreground">
          No reports match these filters.
        </div>
      )}
    </div>
  )
}

function ReportRow({ row }: { row: IndexedReportDto }) {
  const router = useRouter()
  const sharpe = row.sharpe ?? 0
  const ddPct = row.max_drawdown_pct
  const href = `/reports/${row.run_id}`
  return (
    <TableRow
      className="border-border cursor-pointer hover:bg-elevated"
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(href)
      }}
      tabIndex={0}
      role="link"
      aria-label={`Open report ${row.run_id}`}
    >
      <TableCell className="py-2.5">
        <ModeBadge mode={toMode(row.mode)} />
      </TableCell>
      <TableCell className="py-2.5 text-xs font-mono text-foreground">
        {row.asset} · {row.interval}
      </TableCell>
      <TableCell className="py-2.5 text-xs font-mono text-muted-foreground">
        {formatUtc(row.period_start_ms).slice(0, 16)} → {formatUtc(row.period_end_ms).slice(0, 16)}
      </TableCell>
      <TableCell className="py-2.5">
        {row.sharpe == null ? (
          <span className="text-xs font-mono text-faint-foreground">—</span>
        ) : (
          <SharpeBar value={sharpe} />
        )}
      </TableCell>
      <TableCell
        className={cn(
          'py-2.5 text-right text-xs font-mono',
          ddPct > 0.1 ? 'text-negative' : 'text-foreground',
        )}
      >
        {percent(-ddPct)}
      </TableCell>
      <TableCell className="py-2.5 text-right text-xs font-mono text-foreground">
        {money(row.terminal_equity)}
      </TableCell>
      <TableCell className="py-2.5 text-xs font-mono text-muted-foreground">{row.run_id}</TableCell>
    </TableRow>
  )
}

function ReportRowSkeleton() {
  return (
    <TableRow className="border-border">
      {columns.map((c) => (
        <TableCell key={c.key} className="py-2.5">
          <Skeleton className="h-4 w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  )
}

// Avoid unused-import warning on shadcn's tighter type rules.
void decimals
