'use client'

import { useQuery } from '@tanstack/react-query'
import { ReportsService, type ReportSearchResponse } from '@/api-client'
import '@/lib/client'

export interface ReportSearchParams {
  q?: string
  mode?: string
  limit?: number
}

export function useReportSearch(params: ReportSearchParams) {
  return useQuery<ReportSearchResponse>({
    queryKey: ['reports', 'search', params],
    queryFn: () => ReportsService.searchReports(params),
    staleTime: 30_000,
  })
}
