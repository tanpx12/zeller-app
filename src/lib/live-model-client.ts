import type {
  LiveFillsDto,
  LiveRiskEventsDto,
  LiveStatusDto,
  TimeSeriesEnvelope,
} from '@/api-client'
import { OpenAPI } from '@/api-client'
import { request } from '@/api-client/core/request'

export const LIVE_MODELS = ['euler', 'gauss', 'laplace'] as const
export type LiveModelName = (typeof LIVE_MODELS)[number]

export const DEFAULT_MODEL: LiveModelName = 'euler'

function modelUrl(model: LiveModelName, path: string): string {
  return `/api/v1/live/${model}${path}`
}

export function getModelStatus(model: LiveModelName): Promise<LiveStatusDto> {
  return request(OpenAPI, {
    method: 'GET',
    url: modelUrl(model, '/status'),
    errors: { 503: 'Live runner unavailable' },
  })
}

export function getModelEquity(
  model: LiveModelName,
  params: { since?: number } = {},
): Promise<TimeSeriesEnvelope> {
  return request(OpenAPI, {
    method: 'GET',
    url: modelUrl(model, '/equity'),
    query: { since: params.since },
    errors: { 503: 'Live runner unavailable' },
  })
}

export function getModelFills(
  model: LiveModelName,
  params: { since?: number } = {},
): Promise<LiveFillsDto> {
  return request(OpenAPI, {
    method: 'GET',
    url: modelUrl(model, '/fills'),
    query: { since: params.since },
    errors: { 503: 'Live runner unavailable' },
  })
}

export function getModelRiskEvents(
  model: LiveModelName,
  params: { since?: number | null; limit?: number | null } = {},
): Promise<LiveRiskEventsDto> {
  return request(OpenAPI, {
    method: 'GET',
    url: modelUrl(model, '/risk_events'),
    query: { since: params.since, limit: params.limit },
    errors: { 503: 'Live runner unavailable' },
  })
}
