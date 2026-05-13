'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ReportsService,
  type AttributionDto,
  type DrawdownDto,
  type ForecastDto,
  type HeadlineSection,
  type RiskEventsDto,
  type TimeAnalysisSection,
  type TimeSeriesEnvelope,
  type TradesPageDto,
} from '@/api-client'
import '@/lib/client'

/**
 * Per-section hooks. Each report section endpoint returns an `immutable`
 * cache-control header, so a long staleTime is safe. We use 1 hour to match
 * what the spec specifies.
 */
const SECTION_STALE_TIME = 60 * 60 * 1000

export function useReportHeadline(runId: string | undefined) {
  return useQuery<HeadlineSection>({
    queryKey: ['reports', runId, 'headline'],
    queryFn: () => ReportsService.getHeadline({ runId: runId! }),
    enabled: !!runId,
    staleTime: SECTION_STALE_TIME,
  })
}

export interface EquityQueryParams {
  since?: number
  until?: number
  downsample?: string
}

export function useReportEquity(runId: string | undefined, params: EquityQueryParams = {}) {
  return useQuery<TimeSeriesEnvelope>({
    queryKey: ['reports', runId, 'equity', params],
    queryFn: () => ReportsService.getEquity({ runId: runId!, ...params }),
    enabled: !!runId,
    staleTime: SECTION_STALE_TIME,
  })
}

export function useReportDrawdown(runId: string | undefined) {
  return useQuery<DrawdownDto>({
    queryKey: ['reports', runId, 'drawdown'],
    queryFn: () => ReportsService.getDrawdown({ runId: runId! }),
    enabled: !!runId,
    staleTime: SECTION_STALE_TIME,
  })
}

export interface TradesQueryParams {
  limit?: number
  cursor?: string
}

export function useReportTrades(runId: string | undefined, params: TradesQueryParams = {}) {
  return useQuery<TradesPageDto>({
    queryKey: ['reports', runId, 'trades', params],
    queryFn: () => ReportsService.getTrades({ runId: runId!, ...params }),
    enabled: !!runId,
    staleTime: SECTION_STALE_TIME,
  })
}

export function useReportRiskEvents(runId: string | undefined) {
  return useQuery<RiskEventsDto>({
    queryKey: ['reports', runId, 'risk_events'],
    queryFn: () => ReportsService.getRiskEvents({ runId: runId! }),
    enabled: !!runId,
    staleTime: SECTION_STALE_TIME,
  })
}

export function useReportTimeAnalysis(runId: string | undefined) {
  return useQuery<TimeAnalysisSection>({
    queryKey: ['reports', runId, 'time_analysis'],
    queryFn: () => ReportsService.getTimeAnalysis({ runId: runId! }),
    enabled: !!runId,
    staleTime: SECTION_STALE_TIME,
  })
}

export function useReportAttribution(runId: string | undefined) {
  return useQuery<AttributionDto>({
    queryKey: ['reports', runId, 'attribution'],
    queryFn: () => ReportsService.getAttribution({ runId: runId! }),
    enabled: !!runId,
    staleTime: SECTION_STALE_TIME,
  })
}

export function useReportForecast(runId: string | undefined) {
  return useQuery<ForecastDto>({
    queryKey: ['reports', runId, 'forecast'],
    queryFn: () => ReportsService.getForecast({ runId: runId! }),
    enabled: !!runId,
    staleTime: SECTION_STALE_TIME,
  })
}
