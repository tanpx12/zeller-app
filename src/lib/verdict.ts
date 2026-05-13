import type { Verdict } from '@/api-client'
import type { Verdict as BadgeVerdict } from '@/components/dashboard/VerdictBadge'

/** Stable identifier for the verdict variant — used for filtering + colouring. */
export type VerdictKind = 'no_retrain' | 'monitor' | 'recommend' | 'strongly_recommend'

const labels: Record<VerdictKind, string> = {
  no_retrain: 'No action',
  monitor: 'Monitor',
  recommend: 'Retrain',
  strongly_recommend: 'Retrain (strong)',
}

const badgeCodes: Record<VerdictKind, BadgeVerdict> = {
  no_retrain: 'ok',
  monitor: 'monitor',
  recommend: 'retrain',
  strongly_recommend: 'retrain',
}

export function verdictKind(v: Verdict): VerdictKind {
  if (typeof v === 'string') {
    if (v === 'NoRetrainNeeded') return 'no_retrain'
    // Defensive fallback for unanticipated string variants.
    return 'no_retrain'
  }
  if ('Monitor' in v) return 'monitor'
  if ('Recommend' in v) return 'recommend'
  if ('StronglyRecommend' in v) return 'strongly_recommend'
  return 'no_retrain'
}

export function verdictReason(v: Verdict): string | null {
  if (typeof v === 'string') return null
  if ('Monitor' in v) return v.Monitor.reason
  if ('Recommend' in v) return v.Recommend.reason
  if ('StronglyRecommend' in v) return v.StronglyRecommend.reason
  return null
}

export function verdictLabel(kind: VerdictKind): string {
  return labels[kind]
}

export function verdictBadgeCode(kind: VerdictKind): BadgeVerdict {
  return badgeCodes[kind]
}

/**
 * Map a backend label string (from `DecisionListEntry.verdict_label` or the
 * facets keys) to our VerdictKind. The backend's labels can be any of the
 * Rust enum variant names (PascalCase) or pre-formatted human strings — we
 * accept both.
 */
export function verdictKindFromLabel(label: string): VerdictKind {
  const k = label.toLowerCase()
  if (k.includes('strong')) return 'strongly_recommend'
  if (k.includes('recommend') || k.includes('retrain')) return 'recommend'
  if (k.includes('monitor')) return 'monitor'
  return 'no_retrain'
}
