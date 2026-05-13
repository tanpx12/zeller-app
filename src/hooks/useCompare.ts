'use client'

import { useQuery } from '@tanstack/react-query'
import { CompareService, type CompareResponseDto } from '@/api-client'
import '@/lib/client'

export function useCompare(a: string | undefined, b: string | undefined) {
  return useQuery<CompareResponseDto>({
    queryKey: ['compare', a, b],
    queryFn: () => CompareService.compareHandler({ a: a!, b: b! }),
    enabled: !!a && !!b,
    staleTime: 60 * 60 * 1000,
    retry: (failureCount, err) => {
      // Don't retry deterministic-failure errors — they won't change with retries.
      const status = (err as { status?: number })?.status
      if (status === 404 || status === 409 || status === 400) return false
      return failureCount < 2
    },
  })
}
