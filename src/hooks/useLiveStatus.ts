'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LiveService, type LiveStatusDto } from '@/api-client'
import { getModelStatus, type LiveModelName } from '@/lib/live-model-client'
import '@/lib/client'

export type LiveHealth = 'healthy' | 'lagging' | 'down' | 'paused'

/**
 * Kill-switch for /live/status polling. Defaults to on; set
 * `NEXT_PUBLIC_LIVE_POLLING=off` to disable without a code change.
 */
const LIVE_POLLING_ENABLED = process.env.NEXT_PUBLIC_LIVE_POLLING !== 'off'

/**
 * The live runner persists one state snapshot per bar *close*, and bars are
 * hourly — so `age_seconds` legitimately sweeps from ~1s (just after a
 * close) up to ~3600s (just before the next close) in perfect health. The
 * staleness thresholds must therefore be expressed in bar intervals, not
 * the wall-clock seconds that would suit a sub-minute persist cadence.
 *
 * `DOWN` mirrors the backend's `--live-stale-threshold-secs` default of two
 * bar intervals (the backend already moved its own 503-stale ceiling from
 * 120s → 7200s for exactly this reason). `LAGGING` trips one bar interval
 * plus a grace window, i.e. when a bar close looks overdue.
 */
const BAR_INTERVAL_SECS = 3600
const DOWN_AGE_SECS = BAR_INTERVAL_SECS * 2 // 7200 — matches backend ceiling
const LAGGING_AGE_SECS = BAR_INTERVAL_SECS + 300 // one bar + 5 min grace

export interface LiveStatusResult {
  status: LiveHealth
  /** Most recent successful response, or undefined if we've never had one. */
  data: LiveStatusDto | undefined
  /** Last error from the polling call, if any. */
  error: unknown
  /** True while the first request is in flight. */
  isLoading: boolean
  /** Refresh now. */
  refetch: () => void
}

/**
 * Polls `/live/status` every 1s while the document is visible. The hook
 * is paused (no requests) when the tab is hidden — both to save fetch
 * traffic and because the backend rejects /live/status with 503 when no
 * snapshot has been written in 2 minutes, which would otherwise spam the
 * console.
 *
 * Status semantics (thresholds are in bar intervals — see above):
 *  - `down`    → last response was 503 (or no successful response yet AND
 *                a fetch errored), OR `age_seconds > DOWN_AGE_SECS` (2 bars)
 *  - `lagging` → `age_seconds > LAGGING_AGE_SECS` (a bar close is overdue)
 *  - `healthy` → otherwise
 */
export function useLiveStatus(model?: LiveModelName): LiveStatusResult {
  const [docVisible, setDocVisible] = useState(true)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const handler = () => setDocVisible(document.visibilityState === 'visible')
    handler()
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  const lastGood = useRef<LiveStatusDto | undefined>(undefined)

  const queryFn = useCallback(async () => {
    const res = model ? await getModelStatus(model) : await LiveService.getStatus()
    lastGood.current = res
    return res
  }, [model])

  const q = useQuery<LiveStatusDto>({
    queryKey: ['live', 'status', model ?? 'default'],
    queryFn,
    refetchInterval: docVisible && LIVE_POLLING_ENABLED ? 1000 : false,
    refetchIntervalInBackground: false,
    staleTime: 500,
    retry: 2,
    retryDelay: 1000,
    enabled: docVisible && LIVE_POLLING_ENABLED,
  })

  const data = q.data ?? lastGood.current

  const status: LiveHealth = useMemo(() => {
    if (!LIVE_POLLING_ENABLED) return 'paused'
    const age = data?.age_seconds
    if (age == null) return 'down'
    if (age > DOWN_AGE_SECS) return 'down'
    if (age > LAGGING_AGE_SECS) return 'lagging'
    return 'healthy'
  }, [data])

  return {
    status,
    data,
    error: q.error,
    isLoading: q.isLoading,
    refetch: () => void q.refetch(),
  }
}
