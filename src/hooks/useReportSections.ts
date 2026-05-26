'use client'

import { useQueries, useQuery } from '@tanstack/react-query'
import {
  ReportsService,
  type AttributionDto,
  type DrawdownDto,
  type ForecastDto,
  type HeadlineSection,
  type PerformanceReport,
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

/**
 * Batched parallel fetch of `HeadlineSection` for every run in `runIds`.
 * Used by `/reports` to drive client-side sort by Net PnL / Trades / Win
 * Rate (none of which are on the list endpoint today — see the comment in
 * `ReportTable.tsx`). Each individual query shares its cache with the
 * single-row `useReportHeadline` hook, so navigating to a detail page
 * after the list loads is free.
 */
export function useReportHeadlines(runIds: readonly string[]) {
  return useQueries({
    queries: runIds.map((runId) => ({
      queryKey: ['reports', runId, 'headline'] as const,
      queryFn: () => ReportsService.getHeadline({ runId }),
      staleTime: SECTION_STALE_TIME,
    })),
    combine: (results) => ({
      /** Map of `run_id → HeadlineSection | undefined`. */
      byRunId: new Map(
        runIds.map((id, i) => [id, results[i]?.data as HeadlineSection | undefined]),
      ),
      isLoading: results.some((r) => r.isLoading),
    }),
  })
}

/**
 * Full canonical `PerformanceReport`. Use sparingly — the per-section
 * hooks below are cheaper. Needed only when surfacing `meta.config_snapshot`
 * or `meta.lineage`, which aren't exposed by any section endpoint.
 */
export function useReportFull(runId: string | undefined) {
  return useQuery<PerformanceReport>({
    queryKey: ['reports', runId, 'full'],
    queryFn: () => ReportsService.getReport({ runId: runId! }),
    enabled: !!runId,
    staleTime: 60 * 60 * 1000,
  })
}

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
