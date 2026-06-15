'use client'

import { useQuery } from '@tanstack/react-query'
import {
  LiveService,
  type LiveFillsDto,
  type LiveRiskEventsDto,
  type TimeSeriesEnvelope,
} from '@/api-client'
import {
  getModelEquity,
  getModelFills,
  getModelRiskEvents,
  type LiveModelName,
} from '@/lib/live-model-client'
import '@/lib/client'

const SIXTY_SECONDS = 60_000

export interface LiveEquityParams {
  since?: number
  model?: LiveModelName
}

export function useLiveEquity(params: LiveEquityParams = {}) {
  const { model, ...rest } = params
  return useQuery<TimeSeriesEnvelope>({
    queryKey: ['live', 'equity', model ?? 'default', rest],
    queryFn: () => (model ? getModelEquity(model, rest) : LiveService.getEquity(rest)),
    refetchInterval: SIXTY_SECONDS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: false,
  })
}

export interface LiveFillsParams {
  since?: number
  model?: LiveModelName
}

export function useLiveFills(params: LiveFillsParams = {}) {
  const { model, ...rest } = params
  return useQuery<LiveFillsDto>({
    queryKey: ['live', 'fills', model ?? 'default', rest],
    queryFn: () => (model ? getModelFills(model, rest) : LiveService.getFills(rest)),
    refetchInterval: SIXTY_SECONDS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: false,
  })
}

export interface LiveRiskEventsParams {
  since?: number | null
  limit?: number | null
  model?: LiveModelName
}

export function useLiveRiskEvents(params: LiveRiskEventsParams = {}) {
  const { model, ...rest } = params
  return useQuery<LiveRiskEventsDto>({
    queryKey: ['live', 'risk_events', model ?? 'default', rest],
    queryFn: () => (model ? getModelRiskEvents(model, rest) : LiveService.getRiskEvents(rest)),
    refetchInterval: SIXTY_SECONDS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: false,
  })
}
