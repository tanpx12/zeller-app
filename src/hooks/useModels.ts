'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { ModelsService, type ModelListResponse, type ModelTradesResponse } from '@/api-client'
import '@/lib/client'

export function useModels() {
  return useQuery<ModelListResponse>({
    queryKey: ['models', 'list'],
    queryFn: () => ModelsService.listModels(),
    staleTime: 60_000,
  })
}

export interface ModelTradesFilters {
  mode?: string
  sizer?: string
  leverage?: number
  sl?: number
  limit?: number
}

export function useModelTrades(name: string | undefined, filters: ModelTradesFilters = {}) {
  return useInfiniteQuery<ModelTradesResponse>({
    queryKey: ['models', name, 'trades', filters],
    queryFn: ({ pageParam }) =>
      ModelsService.getModelTrades({
        name: name!,
        ...filters,
        cursor: pageParam as string | undefined,
      }),
    enabled: !!name,
    initialPageParam: undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 60_000,
    retry: (failureCount, err) => {
      const status = (err as { status?: number })?.status
      if (status === 404 || status === 400) return false
      return failureCount < 2
    },
  })
}
