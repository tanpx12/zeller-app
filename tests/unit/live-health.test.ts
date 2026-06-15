import { describe, expect, it } from 'vitest'
import { deriveLiveHealth } from '@/hooks/useLiveStatus'
import type { LiveStatusDto } from '@/api-client'

/** Minimal LiveStatusDto with overridable freshness fields. */
function dto(over: Partial<LiveStatusDto>): LiveStatusDto {
  return {
    timestamp: 1_700_000_000_000,
    equity: 10_000,
    current_position: 0,
    last_forecast: 0,
    sigma_hat: null,
    n_fills: 0,
    written_at_ms: 1_700_000_000_000,
    age_seconds: 0,
    stale_threshold_secs: 7200,
    is_stale: false,
    recent_pnl: null,
    forecast_diagnostics: {
      forward_ic_7d: null,
      forward_ic_7d_ci: null,
      holdout_ic: null,
      ic_within_tolerance: null,
      hit_rate_7d: null,
    },
    ...over,
  } as LiveStatusDto
}

describe('deriveLiveHealth', () => {
  it('paused when polling disabled', () => {
    expect(deriveLiveHealth(dto({}), false)).toBe('paused')
  })

  it('down when no data or age missing', () => {
    expect(deriveLiveHealth(undefined, true)).toBe('down')
    expect(deriveLiveHealth(dto({ age_seconds: null as unknown as number }), true)).toBe('down')
  })

  // The reported bug: a healthy hourly runner sits ~20-58 min past its last
  // persist. With the old `age > 120` rule this read "offline"; with is_stale
  // it must read healthy.
  it('healthy when age is well past 120s but under the server ceiling', () => {
    expect(deriveLiveHealth(dto({ age_seconds: 1315, is_stale: false }), true)).toBe('healthy')
  })

  it('down only when the backend flags is_stale', () => {
    expect(deriveLiveHealth(dto({ age_seconds: 8000, is_stale: true }), true)).toBe('down')
  })

  it('lagging when older than half the ceiling but not stale', () => {
    // ceiling 7200 → half 3600; age 4000 not stale → lagging
    expect(deriveLiveHealth(dto({ age_seconds: 4000, is_stale: false }), true)).toBe('lagging')
  })

  it('falls back to the ceiling default when is_stale is absent (old server)', () => {
    const noFlag = dto({ age_seconds: 8000 })
    // simulate a pre-is_stale server response
    delete (noFlag as { is_stale?: boolean }).is_stale
    delete (noFlag as { stale_threshold_secs?: number }).stale_threshold_secs
    expect(deriveLiveHealth(noFlag, true)).toBe('down') // 8000 > 7200 fallback
  })
})
