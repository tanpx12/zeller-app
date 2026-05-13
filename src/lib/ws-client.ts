/**
 * WebSocket client for `/live/stream`.
 *
 * State machine (spec / implplan §6.3):
 *
 *   idle ─→ connecting ─→ open ─┬─→ closing ─→ idle (user disconnect)
 *                               │
 *                               └─→ reconnecting ─→ attempting ─→ open
 *                                                              │
 *                                                              └─→ disconnected
 *                                                                  (after 10 retries)
 *
 * Reconnect backoff: 1s, 2s, 4s, 8s, 16s — capped at 30s — give up after 10 attempts.
 * Heartbeat: if no message is received in 60s, force a reconnect.
 *
 * The client is a single shared instance per base URL — multiple React
 * subscribers share the same socket via the subscriber API. A ring buffer
 * of the last 1000 messages backs late subscribers so they don't miss
 * events that arrived during their render cycle.
 *
 * Message shape: we assume each frame is JSON with a string `type`. Any
 * unknown shape is silently dropped (logged in dev) — the backend may add
 * new message types over time and the client should be forward-compatible.
 */

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'attempting'
  | 'closing'
  | 'disconnected'

export interface LiveMessage<TType extends string = string, TPayload = unknown> {
  type: TType
  payload?: TPayload
  /** Server-emitted timestamp in ms, if present. */
  ts?: number
  /** Locally-assigned id for ring-buffer ordering. */
  _seq?: number
}

export type MessageHandler = (msg: LiveMessage) => void
export type ConnectionStateHandler = (state: ConnectionState) => void

export interface WsClientOptions {
  url: string
  /** Initial reconnect delay (ms). Doubles each attempt, capped at `maxDelayMs`. */
  initialDelayMs?: number
  /** Cap for exponential backoff. */
  maxDelayMs?: number
  /** Give up after this many reconnect attempts. */
  maxRetries?: number
  /** Force reconnect if no message arrives within this window. */
  heartbeatMs?: number
  /** Capacity of the recent-message ring buffer. */
  bufferSize?: number
  /** Injected socket factory — overridable for tests. */
  socketFactory?: (url: string) => WebSocketLike
}

/**
 * Subset of WebSocket we use. The event-listener signature is intentionally
 * loose — the real browser WebSocket has typed event maps, but mocks in
 * tests (and React-Native-ish polyfills) often don't, and we never actually
 * depend on the typed event object beyond the `data` field on messages
 * (narrowed at the call site).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEventHandler = (ev: any) => void

export interface WebSocketLike {
  readyState: number
  send(data: string): void
  close(code?: number, reason?: string): void
  addEventListener(type: string, listener: AnyEventHandler): void
  removeEventListener(type: string, listener: AnyEventHandler): void
}

export class WsClient {
  private opts: Required<Omit<WsClientOptions, 'socketFactory' | 'url'>> & {
    socketFactory: (url: string) => WebSocketLike
    url: string
  }
  private socket: WebSocketLike | null = null
  private state: ConnectionState = 'idle'
  private retries = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null
  private subscribers = new Set<MessageHandler>()
  private stateSubscribers = new Set<ConnectionStateHandler>()
  /** Filter map: handler → set of types it wants ('*' for all). */
  private filters = new Map<MessageHandler, Set<string>>()
  private buffer: LiveMessage[] = []
  private seq = 0
  private explicitClose = false

  constructor(options: WsClientOptions) {
    this.opts = {
      url: options.url,
      initialDelayMs: options.initialDelayMs ?? 1000,
      maxDelayMs: options.maxDelayMs ?? 30_000,
      maxRetries: options.maxRetries ?? 10,
      heartbeatMs: options.heartbeatMs ?? 60_000,
      bufferSize: options.bufferSize ?? 1000,
      socketFactory:
        options.socketFactory ?? ((url) => new WebSocket(url) as unknown as WebSocketLike),
    }
  }

  /** Start (or restart) the connection. Safe to call multiple times. */
  connect(): void {
    if (this.state === 'open' || this.state === 'connecting' || this.state === 'attempting') {
      return
    }
    this.explicitClose = false
    this.setState('connecting')
    this.openSocket()
  }

  /** Permanently close. Cancels timers and tears down listeners. */
  disconnect(): void {
    this.explicitClose = true
    this.clearReconnectTimer()
    this.clearHeartbeat()
    if (this.socket) {
      this.setState('closing')
      try {
        this.socket.close(1000, 'client_disconnect')
      } catch {
        // Sockets can throw if already closed; swallow.
      }
    } else {
      this.setState('idle')
    }
  }

  /**
   * Manually retry after a `disconnected` (give-up) state. No-op otherwise.
   */
  retry(): void {
    if (this.state !== 'disconnected') return
    this.retries = 0
    this.connect()
  }

  /**
   * Subscribe to messages. `types` of `'*'` (or empty array) receives every
   * frame. Returns an unsubscribe function. Newly-subscribed handlers replay
   * any matching frames currently in the ring buffer in chronological order.
   */
  subscribe(types: readonly string[] | '*', handler: MessageHandler): () => void {
    const filter = new Set<string>(types === '*' ? ['*'] : types.length === 0 ? ['*'] : types)
    this.subscribers.add(handler)
    this.filters.set(handler, filter)

    // Replay recent matching messages so late subscribers don't miss them.
    for (const msg of this.buffer) {
      if (this.matches(filter, msg.type)) {
        try {
          handler(msg)
        } catch {
          // Don't let a single bad handler take down the dispatch loop.
        }
      }
    }

    return () => {
      this.subscribers.delete(handler)
      this.filters.delete(handler)
    }
  }

  /** Subscribe to connection-state changes. */
  onStateChange(handler: ConnectionStateHandler): () => void {
    this.stateSubscribers.add(handler)
    // Emit current state synchronously so subscribers don't see `idle` first.
    try {
      handler(this.state)
    } catch {
      /* swallow */
    }
    return () => {
      this.stateSubscribers.delete(handler)
    }
  }

  /** Current state — synchronous read for diagnostics / tests. */
  getState(): ConnectionState {
    return this.state
  }

  /** Snapshot of the ring buffer (read-only). */
  getBuffer(): readonly LiveMessage[] {
    return this.buffer
  }

  /** Reset all in-memory state — only meant for tests. */
  __reset(): void {
    this.disconnect()
    this.subscribers.clear()
    this.stateSubscribers.clear()
    this.filters.clear()
    this.buffer = []
    this.seq = 0
    this.retries = 0
  }

  // ───────────────── internal ─────────────────

  private openSocket(): void {
    try {
      this.socket = this.opts.socketFactory(this.opts.url)
    } catch (err) {
      this.scheduleReconnect(err)
      return
    }

    this.socket.addEventListener('open', this.handleOpen)
    this.socket.addEventListener('message', this.handleMessage)
    this.socket.addEventListener('close', this.handleClose)
    this.socket.addEventListener('error', this.handleError)
  }

  private handleOpen = (): void => {
    this.retries = 0
    this.setState('open')
    this.armHeartbeat()
  }

  private handleMessage = (ev: { data: unknown }): void => {
    this.armHeartbeat()
    let parsed: LiveMessage | null = null
    try {
      const raw = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data))
      if (raw && typeof raw === 'object' && typeof raw.type === 'string') {
        parsed = raw as LiveMessage
      }
    } catch {
      // Non-JSON frame — drop silently.
    }
    if (!parsed) return

    parsed._seq = ++this.seq
    this.pushToBuffer(parsed)
    this.dispatch(parsed)
  }

  private handleClose = (): void => {
    this.detachSocket()
    this.clearHeartbeat()
    if (this.explicitClose) {
      this.setState('idle')
      return
    }
    this.scheduleReconnect()
  }

  private handleError = (): void => {
    // Errors precede `close` on real sockets; the close handler does the
    // reconnect bookkeeping. We just clear the heartbeat early so we don't
    // run the timer against a doomed socket.
    this.clearHeartbeat()
  }

  private detachSocket(): void {
    if (!this.socket) return
    this.socket.removeEventListener('open', this.handleOpen)
    this.socket.removeEventListener('message', this.handleMessage)
    this.socket.removeEventListener('close', this.handleClose)
    this.socket.removeEventListener('error', this.handleError)
    this.socket = null
  }

  private scheduleReconnect(_err?: unknown): void {
    void _err
    if (this.explicitClose) return
    if (this.retries >= this.opts.maxRetries) {
      this.setState('disconnected')
      return
    }
    this.setState('reconnecting')
    const delay = Math.min(this.opts.initialDelayMs * 2 ** this.retries, this.opts.maxDelayMs)
    this.retries++
    this.clearReconnectTimer()
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.setState('attempting')
      this.openSocket()
    }, delay)
  }

  private armHeartbeat(): void {
    this.clearHeartbeat()
    this.heartbeatTimer = setTimeout(() => {
      this.heartbeatTimer = null
      // No frame in heartbeatMs — force a reconnect.
      if (this.socket) {
        try {
          this.socket.close(4000, 'heartbeat_timeout')
        } catch {
          /* swallow */
        }
      }
    }, this.opts.heartbeatMs)
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer != null) {
      clearTimeout(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private setState(next: ConnectionState): void {
    if (next === this.state) return
    this.state = next
    for (const handler of this.stateSubscribers) {
      try {
        handler(next)
      } catch {
        /* swallow */
      }
    }
  }

  private pushToBuffer(msg: LiveMessage): void {
    this.buffer.push(msg)
    if (this.buffer.length > this.opts.bufferSize) {
      this.buffer.splice(0, this.buffer.length - this.opts.bufferSize)
    }
  }

  private dispatch(msg: LiveMessage): void {
    for (const handler of this.subscribers) {
      const filter = this.filters.get(handler)
      if (!filter || !this.matches(filter, msg.type)) continue
      try {
        handler(msg)
      } catch {
        /* swallow */
      }
    }
  }

  private matches(filter: Set<string>, type: string): boolean {
    return filter.has('*') || filter.has(type)
  }
}

// ───────────────── singleton wrapper ─────────────────

let singleton: WsClient | null = null

/**
 * Returns the shared WsClient for the configured base URL. Creates and
 * connects on first use. Subsequent calls return the same instance.
 *
 * The base URL is read from `NEXT_PUBLIC_WS_BASE` (set at build time);
 * for tests, pass an explicit client via `setSharedWsClient`.
 */
export function getSharedWsClient(): WsClient {
  if (singleton) return singleton
  const base = process.env.NEXT_PUBLIC_WS_BASE ?? 'ws://127.0.0.1:8787/api/v1'
  singleton = new WsClient({ url: `${base}/live/stream` })
  singleton.connect()
  return singleton
}

/** Test seam: swap in a custom client (or null to reset). */
export function setSharedWsClient(client: WsClient | null): void {
  if (singleton && singleton !== client) {
    singleton.disconnect()
  }
  singleton = client
}
