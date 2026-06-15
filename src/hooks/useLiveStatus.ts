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
 * The live runner persists one state snapshot per bar *close*, so
 * `age_seconds` legitimately sweeps up to one bar interval in perfect
 * health — a hardcoded wall-clock threshold (the old `age > 120`) would
 * report "offline" for ~58 minutes of every healthy hour.
 *
 * `down` is now driven off the backend's authoritative `is_stale` flag
 * (`age_seconds > stale_threshold_secs`, the server's configured ceiling)
 * — the frontend no longer assumes a cadence. `lagging` is a soft warning
 * tier at half the server ceiling, i.e. a bar close looks overdue.
 *
 * `DOWN_AGE_SECS_FALLBACK` is used only if a (pre-`is_stale`) server omits
 * the flag — it mirrors the backend default of two bar intervals.
 */
const DOWN_AGE_SECS_FALLBACK = 7200 // two 1h bars; matches backend default

/**
 * Pure offline/health decision, extracted for unit testing. Drives the
 * dashboard's runner indicator. `pollingEnabled=false` → `paused`.
 *
 * Exported so the exact rule that caused the "offline for 58 min/hour"
 * bug is locked in by a test rather than living only inside a hook.
 */
export function deriveLiveHealth(
  data: LiveStatusDto | undefined,
  pollingEnabled: boolean,
): LiveHealth {
  if (!pollingEnabled) return 'paused'
  if (data == null) return 'down'
  const age = data.age_seconds
  if (age == null) return 'down'
  // Prefer the backend's authoritative staleness flag; fall back to the
  // ceiling default only if an older server omitted it.
  const ceiling = data.stale_threshold_secs ?? DOWN_AGE_SECS_FALLBACK
  const isStale = data.is_stale ?? age > ceiling
  if (isStale) return 'down'
  if (age > ceiling / 2) return 'lagging'
  return 'healthy'
}

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
 * Polls `/live/status` every 1s while the document is visible, and pauses
 * (no requests) when the tab is hidden to save fetch traffic. A stale
 * snapshot returns 200 with `is_stale=true` (not 503), so polling a stale
 * runner is harmless — `deriveLiveHealth` maps it to `down`.
 *
 * Status semantics (driven by backend-provided fields — see above):
 *  - `down`    → no successful response yet, OR the backend flagged the
 *                snapshot `is_stale` (age past the server's ceiling)
 *  - `lagging` → not stale, but older than half the server ceiling (a bar
 *                close looks overdue)
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

  const status: LiveHealth = useMemo(() => deriveLiveHealth(data, LIVE_POLLING_ENABLED), [data])

  return {
    status,
    data,
    error: q.error,
    isLoading: q.isLoading,
    refetch: () => void q.refetch(),
  }
}
