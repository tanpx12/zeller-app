import type { Mode } from '@/components/dashboard/ModeBadge'

/**
 * Normalize the backend's mode field. `IndexedReportDto.mode` is documented as
 * lowercase, but `RunMode` (used elsewhere in the OpenAPI) is PascalCase. We
 * always render lowercase + map any unknown value to `batch` defensively so
 * a new backend mode never throws in the UI.
 */
export function toMode(raw: string): Mode {
  const v = raw.toLowerCase()
  switch (v) {
    case 'batch':
    case 'holdout':
    case 'live':
    case 'decision':
      return v
    case 'reconciliation':
      return 'decision'
    default:
      return 'batch'
  }
}
