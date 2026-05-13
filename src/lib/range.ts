import type { RangeValue } from '@/components/dashboard/RangeChips'

/**
 * Convert a range chip to a `since` cutoff in unix-ms. `all` returns undefined
 * so the API call omits the filter.
 */
export function rangeToSinceMs(range: RangeValue, now = Date.now()): number | undefined {
  switch (range) {
    case '7d':
      return now - 7 * 24 * 60 * 60 * 1000
    case '30d':
      return now - 30 * 24 * 60 * 60 * 1000
    case '90d':
      return now - 90 * 24 * 60 * 60 * 1000
    case 'all':
      return undefined
  }
}

export function parseRange(raw: string | null | undefined): RangeValue {
  switch (raw) {
    case '7d':
    case '30d':
    case '90d':
    case 'all':
      return raw
    default:
      return 'all'
  }
}
