'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { ReportsService, type ListReportsResponse } from '@/api-client'
import '@/lib/client'
import type { ReportListFilters } from './useReportList'

/**
 * Cursor-paginated reports list. The "Load more" button calls fetchNextPage.
 * Filters reset the query key, so changing a filter starts a fresh page chain.
 */
export function useReportListInfinite(filters: Omit<ReportListFilters, 'cursor'> = {}) {
  return useInfiniteQuery<ListReportsResponse>({
    queryKey: ['reports', 'list', 'infinite', filters],
    queryFn: ({ pageParam }) =>
      ReportsService.listReports({
        ...filters,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 30_000,
  })
}
