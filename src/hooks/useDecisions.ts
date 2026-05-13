'use client'

import { useQuery } from '@tanstack/react-query'
import { DecisionsService, type DecisionListResponse, type DecisionReport } from '@/api-client'
import '@/lib/client'

export function useDecisions() {
  return useQuery<DecisionListResponse>({
    queryKey: ['decisions', 'list'],
    queryFn: () => DecisionsService.listDecisions(),
    staleTime: 60_000,
  })
}

export function useDecision(date: string | undefined) {
  return useQuery<DecisionReport>({
    queryKey: ['decisions', date],
    queryFn: () => DecisionsService.getDecision({ date: date! }),
    enabled: !!date,
    staleTime: 60 * 60 * 1000,
    retry: (failureCount, err) => {
      const status = (err as { status?: number })?.status
      if (status === 404 || status === 400) return false
      return failureCount < 2
    },
  })
}
