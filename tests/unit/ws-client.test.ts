import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WsClient, type WebSocketLike } from '@/lib/ws-client'

/**
 * Mock WebSocket that lets the test drive open/close/message events
 * synchronously. Each instance is captured by the factory so tests can
 * advance the timeline without real network.
 */
class MockSocket implements WebSocketLike {
  static instances: MockSocket[] = []
  readyState = 0 // CONNECTING
  closeArgs: { code?: number; reason?: string } | null = null
  private listeners = new Map<string, Set<(ev: unknown) => void>>()

  constructor(public url: string) {
    MockSocket.instances.push(this)
  }

  static reset() {
    MockSocket.instances = []
  }

  static last() {
    return MockSocket.instances[MockSocket.instances.length - 1]!
  }

  addEventListener(type: string, fn: (ev: unknown) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(fn)
  }

  removeEventListener(type: string, fn: (ev: unknown) => void) {
    this.listeners.get(type)?.delete(fn)
  }

  send() {
    /* not used in these tests */
  }

  close(code?: number, reason?: string) {
    this.closeArgs = { code, reason }
    this.readyState = 3 // CLOSED
    this.emit('close', { code, reason })
  }

  // ──────────── test API ────────────
  opens() {
    this.readyState = 1 // OPEN
    this.emit('open', {})
  }

  emitsMessage(data: unknown) {
    this.emit('message', { data: JSON.stringify(data) })
  }

  emitsRawMessage(data: string) {
    this.emit('message', { data })
  }

  closesAbnormally() {
    this.readyState = 3
    this.emit('close', { code: 1006 })
  }

  private emit(type: string, ev: unknown) {
    for (const fn of this.listeners.get(type) ?? []) fn(ev)
  }
}

function makeClient(overrides: Partial<ConstructorParameters<typeof WsClient>[0]> = {}) {
  return new WsClient({
    url: 'ws://test/stream',
    initialDelayMs: 100,
    maxDelayMs: 1600,
    maxRetries: 4,
    heartbeatMs: 5000,
    bufferSize: 5,
    socketFactory: (url) => new MockSocket(url),
    ...overrides,
  })
}

describe('WsClient state machine', () => {
  beforeEach(() => {
    MockSocket.reset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('transitions connecting → open on socket open', () => {
    const c = makeClient()
    const states: string[] = []
    c.onStateChange((s) => states.push(s))

    c.connect()
    expect(c.getState()).toBe('connecting')

    MockSocket.last().opens()
    expect(c.getState()).toBe('open')
    expect(states).toEqual(['idle', 'connecting', 'open'])
  })

  it('dispatches typed messages to filtered subscribers', () => {
    const c = makeClient()
    c.connect()
    MockSocket.last().opens()

    const fillHandler = vi.fn()
    const equityHandler = vi.fn()
    const allHandler = vi.fn()
    c.subscribe(['fill'], fillHandler)
    c.subscribe(['equity'], equityHandler)
    c.subscribe('*', allHandler)

    MockSocket.last().emitsMessage({ type: 'fill', payload: { px: 100 } })
    MockSocket.last().emitsMessage({ type: 'equity', payload: { eq: 10500 } })

    expect(fillHandler).toHaveBeenCalledTimes(1)
    expect(equityHandler).toHaveBeenCalledTimes(1)
    expect(allHandler).toHaveBeenCalledTimes(2)
  })

  it('replays buffered messages to late subscribers in order', () => {
    const c = makeClient()
    c.connect()
    MockSocket.last().opens()

    MockSocket.last().emitsMessage({ type: 'fill', payload: 1 })
    MockSocket.last().emitsMessage({ type: 'equity', payload: 2 })
    MockSocket.last().emitsMessage({ type: 'fill', payload: 3 })

    const seen: number[] = []
    c.subscribe(['fill'], (m) => seen.push((m.payload as number) ?? -1))

    expect(seen).toEqual([1, 3])
  })

  it('caps the ring buffer at bufferSize', () => {
    const c = makeClient({ bufferSize: 3 })
    c.connect()
    MockSocket.last().opens()

    for (let i = 0; i < 10; i++) {
      MockSocket.last().emitsMessage({ type: 'fill', payload: i })
    }
    expect(c.getBuffer().length).toBe(3)
    // Should keep the latest three.
    expect(c.getBuffer().map((m) => m.payload as number)).toEqual([7, 8, 9])
  })

  it('reconnects with exponential backoff and gives up after maxRetries', () => {
    const c = makeClient({ initialDelayMs: 100, maxDelayMs: 800, maxRetries: 3 })
    const states: string[] = []
    c.onStateChange((s) => states.push(s))

    c.connect()
    MockSocket.last().opens()
    // First failure
    MockSocket.last().closesAbnormally()
    expect(c.getState()).toBe('reconnecting')

    // Advance through retry 1 (100ms)
    vi.advanceTimersByTime(100)
    expect(c.getState()).toBe('attempting')
    MockSocket.last().closesAbnormally()
    expect(c.getState()).toBe('reconnecting')

    // Retry 2 (200ms)
    vi.advanceTimersByTime(200)
    MockSocket.last().closesAbnormally()
    expect(c.getState()).toBe('reconnecting')

    // Retry 3 (400ms) — last allowed
    vi.advanceTimersByTime(400)
    MockSocket.last().closesAbnormally()

    // Should now be disconnected (exhausted).
    expect(c.getState()).toBe('disconnected')
  })

  it('caps backoff at maxDelayMs', () => {
    const c = makeClient({ initialDelayMs: 100, maxDelayMs: 250, maxRetries: 10 })
    c.connect()
    MockSocket.last().opens()
    MockSocket.last().closesAbnormally()

    // Capacity check: after enough retries the delay should be 250ms,
    // not 100 * 2^n. Drain a few cycles and confirm `attempting` lands
    // at most every 250ms.
    vi.advanceTimersByTime(100) // first retry
    MockSocket.last().closesAbnormally()
    vi.advanceTimersByTime(200) // second
    MockSocket.last().closesAbnormally()
    vi.advanceTimersByTime(250) // capped
    expect(c.getState()).toBe('attempting')
  })

  it('manual retry() resets retries from disconnected', () => {
    const c = makeClient({ initialDelayMs: 10, maxRetries: 1 })
    c.connect()
    MockSocket.last().opens()
    MockSocket.last().closesAbnormally()
    vi.advanceTimersByTime(10)
    MockSocket.last().closesAbnormally()
    expect(c.getState()).toBe('disconnected')

    c.retry()
    expect(c.getState()).toBe('connecting')
  })

  it('force-closes the socket on heartbeat timeout', () => {
    const c = makeClient({ heartbeatMs: 1000 })
    c.connect()
    const sock = MockSocket.last()
    sock.opens()
    sock.emitsMessage({ type: 'ping' }) // arm/re-arm

    vi.advanceTimersByTime(1001)
    expect(sock.closeArgs).toEqual({ code: 4000, reason: 'heartbeat_timeout' })
  })

  it('disconnect() does not schedule a reconnect', () => {
    const c = makeClient()
    const states: string[] = []
    c.onStateChange((s) => states.push(s))

    c.connect()
    MockSocket.last().opens()
    c.disconnect()
    // The close-handler then fires synchronously via mock.close()
    expect(c.getState()).toBe('idle')

    vi.advanceTimersByTime(10_000)
    // No new sockets created.
    expect(MockSocket.instances.length).toBe(1)
  })

  it('unsubscribe removes the handler — no leak', () => {
    const c = makeClient()
    c.connect()
    MockSocket.last().opens()

    const handler = vi.fn()
    const off = c.subscribe(['fill'], handler)

    MockSocket.last().emitsMessage({ type: 'fill' })
    expect(handler).toHaveBeenCalledTimes(1)

    off()
    MockSocket.last().emitsMessage({ type: 'fill' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('silently drops non-JSON frames', () => {
    const c = makeClient()
    c.connect()
    MockSocket.last().opens()

    const handler = vi.fn()
    c.subscribe('*', handler)

    MockSocket.last().emitsRawMessage('not json')
    MockSocket.last().emitsRawMessage(JSON.stringify({ notType: 1 }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('1000 subscribe/unsubscribe cycles leaves no dangling handlers', () => {
    const c = makeClient()
    c.connect()
    MockSocket.last().opens()

    for (let i = 0; i < 1000; i++) {
      const off = c.subscribe(['fill'], () => {})
      off()
    }

    const onlyHandler = vi.fn()
    c.subscribe(['fill'], onlyHandler)
    MockSocket.last().emitsMessage({ type: 'fill' })
    expect(onlyHandler).toHaveBeenCalledTimes(1)
  })
})
