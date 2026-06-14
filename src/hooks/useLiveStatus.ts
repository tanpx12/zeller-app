'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LiveService, type LiveStatusDto } from '@/api-client'
import '@/lib/client'

export type LiveHealth = 'healthy' | 'lagging' | 'down' | 'paused'

/**
 * Kill-switch for /live/status polling. Defaults to on; set
 * `NEXT_PUBLIC_LIVE_POLLING=off` to disable without a code change.
 */
const LIVE_POLLING_ENABLED = process.env.NEXT_PUBLIC_LIVE_POLLING !== 'off'

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
 * Status semantics:
 *  - `down`    → last response was 503 (or no successful response yet AND
 *                a fetch errored), OR `age_seconds > 120s`
 *  - `lagging` → `age_seconds > 30s` (live runner is behind real-time)
 *  - `healthy` → otherwise
 */
export function useLiveStatus(): LiveStatusResult {
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
    const res = await LiveService.getStatus()
    lastGood.current = res
    return res
  }, [])

  const q = useQuery<LiveStatusDto>({
    queryKey: ['live', 'status'],
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
    if (age > 120) return 'down'
    if (age > 30) return 'lagging'
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
