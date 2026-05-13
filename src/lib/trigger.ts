import type { TriggerEntry, TriggerOutcome } from '@/api-client'
import type { TriggerOutcome as ChipOutcome } from '@/components/dashboard/TriggerChip'

export interface DecodedTrigger {
  name: string
  outcome: ChipOutcome
  metric?: string
  value?: number
  threshold?: number
  evidence?: string
}

export function decodeTrigger(entry: TriggerEntry): DecodedTrigger {
  const o = entry.outcome
  if ('NoFire' in o) {
    return {
      name: entry.name,
      outcome: 'no_fire',
      metric: o.NoFire.metric,
      value: o.NoFire.value,
    }
  }
  if ('SoftFire' in o) {
    return {
      name: entry.name,
      outcome: 'fire_soft',
      metric: o.SoftFire.metric,
      value: o.SoftFire.value,
      threshold: o.SoftFire.threshold,
      evidence: o.SoftFire.evidence,
    }
  }
  return {
    name: entry.name,
    outcome: 'fire_hard',
    metric: o.HardFire.metric,
    value: o.HardFire.value,
    threshold: o.HardFire.threshold,
    evidence: o.HardFire.evidence,
  }
}

export function chipLabel(t: DecodedTrigger): string {
  if (t.outcome === 'no_fire') return t.name
  return t.evidence ? `${t.name} · ${t.evidence}` : t.name
}

/** Pull a typed outcome out of a TriggerOutcome regardless of variant. */
export function triggerVariantKey(o: TriggerOutcome): 'NoFire' | 'SoftFire' | 'HardFire' {
  if ('NoFire' in o) return 'NoFire'
  if ('SoftFire' in o) return 'SoftFire'
  return 'HardFire'
}
