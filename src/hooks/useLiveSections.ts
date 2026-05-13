'use client'

import { useQuery } from '@tanstack/react-query'
import {
  LiveService,
  type LiveFillsDto,
  type LiveRiskEventsDto,
  type TimeSeriesEnvelope,
} from '@/api-client'
import '@/lib/client'

const SIXTY_SECONDS = 60_000

export interface LiveEquityParams {
  since?: number
}

export function useLiveEquity(params: LiveEquityParams = {}) {
  return useQuery<TimeSeriesEnvelope>({
    queryKey: ['live', 'equity', params],
    queryFn: () => LiveService.getEquity(params),
    refetchInterval: SIXTY_SECONDS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: false,
  })
}

export interface LiveFillsParams {
  since?: number
}

export function useLiveFills(params: LiveFillsParams = {}) {
  return useQuery<LiveFillsDto>({
    queryKey: ['live', 'fills', params],
    queryFn: () => LiveService.getFills(params),
    refetchInterval: SIXTY_SECONDS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: false,
  })
}

export interface LiveRiskEventsParams {
  since?: number | null
  limit?: number | null
}

export function useLiveRiskEvents(params: LiveRiskEventsParams = {}) {
  return useQuery<LiveRiskEventsDto>({
    queryKey: ['live', 'risk_events', params],
    queryFn: () => LiveService.getRiskEvents(params),
    refetchInterval: SIXTY_SECONDS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: false,
  })
}
