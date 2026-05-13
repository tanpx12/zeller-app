'use client'

import { useEffect, useRef, useState } from 'react'
import {
  getSharedWsClient,
  type ConnectionState,
  type LiveMessage,
  type WsClient,
} from '@/lib/ws-client'

export interface UseLiveStreamOptions<TType extends string> {
  /** Frame types to receive. Pass `'*'` or omit to receive everything. */
  types?: readonly TType[] | '*'
  /** Maximum number of frames to keep in the returned `events` buffer. */
  bufferSize?: number
  /** Override the shared client (mostly for tests). */
  client?: WsClient
}

export interface UseLiveStreamResult<TType extends string> {
  /** Connection state — drives indicator UI. */
  state: ConnectionState
  /** Most-recent-first list of frames matching the filter. */
  events: LiveMessage<TType>[]
  /** Newest frame matching the filter, or null. */
  last: LiveMessage<TType> | null
  /** Manually reconnect after the client has reached `disconnected`. */
  retry: () => void
}

/**
 * React hook that subscribes to the live WS stream. Re-renders are
 * batched per-frame; subscribers should keep the `bufferSize` modest
 * (default 200) to avoid heavy state churn on hot tabs.
 *
 * Unmount cleans up the subscription. The shared `WsClient` keeps the
 * underlying socket open across hook lifecycles — no socket churn when
 * users navigate between tabs.
 */
export function useLiveStream<TType extends string = string>(
  options: UseLiveStreamOptions<TType> = {},
): UseLiveStreamResult<TType> {
  const { types = '*', bufferSize = 200, client: explicit } = options

  // Stable client reference for the lifetime of the hook instance.
  const clientRef = useRef<WsClient | null>(null)
  if (clientRef.current == null) clientRef.current = explicit ?? getSharedWsClient()

  const [state, setState] = useState<ConnectionState>(() => clientRef.current!.getState())
  const [events, setEvents] = useState<LiveMessage<TType>[]>([])

  // Subscribe to messages.
  useEffect(() => {
    const client = clientRef.current!
    const filter = types === '*' ? '*' : (types as readonly string[])
    const off = client.subscribe(filter, (msg) => {
      setEvents((prev) => {
        const next = [msg as LiveMessage<TType>, ...prev]
        return next.length > bufferSize ? next.slice(0, bufferSize) : next
      })
    })
    return off
    // `types` is intentionally part of the dep array — changing filters
    // should resubscribe. Callers should memoize the types array.
  }, [types, bufferSize])

  // Subscribe to connection state changes.
  useEffect(() => {
    const client = clientRef.current!
    return client.onStateChange(setState)
  }, [])

  return {
    state,
    events,
    last: events[0] ?? null,
    retry: () => clientRef.current?.retry(),
  }
}
