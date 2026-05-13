import type { Mode } from '@/components/dashboard/ModeBadge'

/**
 * Normalize the backend's mode field. Three vocabularies in play:
 *
 *  - `IndexedReportDto.mode` / `PerformanceReport.meta.mode` — single-run
 *    lowercase RunMode variant (`batch` | `holdout` | `live` |
 *    `reconciliation`).
 *  - `RunMode` enum in OpenAPI — PascalCase variants of the above.
 *  - `/models` endpoints — collapsed labels (`backtest` = batch+holdout).
 *
 * We accept all three forms and map any unknown value to `batch`
 * defensively, so a new backend mode never throws in the UI.
 */
export function toMode(raw: string): Mode {
  const v = raw.toLowerCase()
  switch (v) {
    case 'batch':
    case 'holdout':
    case 'live':
    case 'decision':
    case 'backtest':
      return v
    case 'reconciliation':
      return 'decision'
    default:
      return 'batch'
  }
}
