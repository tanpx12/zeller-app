'use client'

import { useQuery } from '@tanstack/react-query'
import { ReportsService, type ListReportsResponse } from '@/api-client'
import '@/lib/client'

export interface ReportListFilters {
  mode?: string
  asset?: string
  since?: string
  until?: string
  minSharpe?: number
  maxDrawdownPct?: number
  limit?: number
  cursor?: string
}

export function useReportList(filters: ReportListFilters = {}) {
  return useQuery<ListReportsResponse>({
    queryKey: ['reports', 'list', filters],
    queryFn: () => ReportsService.listReports(filters),
    staleTime: 30_000,
  })
}
