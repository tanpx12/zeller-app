'use client'

import type { DecisionReport } from '@/api-client'
import { VerdictBadge } from '@/components/dashboard/VerdictBadge'
import { TriggerChip } from '@/components/dashboard/TriggerChip'
import { decodeTrigger, chipLabel } from '@/lib/trigger'
import { verdictBadgeCode, verdictKind, verdictReason } from '@/lib/verdict'
import { cn } from '@/lib/utils'
import { decimals, percent } from '@/lib/format'

export interface DecisionCardProps {
  date: string
  decision: DecisionReport
}

/**
 * Mockup `.decision-card` (index.html:256-288, 750-887):
 *  head: grid 110px 1fr auto — date | verdict sentence | VerdictBadge
 *  body: grid 1fr 1fr 24px gap — TriggerList (left) | DecisionStatsGrid 2x2 (right)
 *
 * Triggers map from `TriggerEntry.outcome` tagged union → TriggerChip outcome:
 *   NoFire   → neutral chip
 *   SoftFire → amber chip
 *   HardFire → red chip
 */
export function DecisionCard({ date, decision }: DecisionCardProps) {
  const kind = verdictKind(decision.verdict)
  const reason = verdictReason(decision.verdict)
  const triggers = decision.triggers.map(decodeTrigger)
  const firedCount = triggers.filter((t) => t.outcome !== 'no_fire').length
  const softCount = triggers.filter((t) => t.outcome === 'fire_soft').length
  const hardCount = triggers.filter((t) => t.outcome === 'fire_hard').length

  const summary =
    kind === 'no_retrain'
      ? 'No retrain needed — all triggers within tolerance'
      : (reason ?? 'See trigger list and statistics below')

  const firedLabel =
    firedCount === 0
      ? `Triggers (0 of ${triggers.length} fired)`
      : firedCount === 1
        ? `Triggers (1 ${softCount ? 'soft' : 'hard'} fire)`
        : `Triggers (${softCount} soft · ${hardCount} hard)`

  const perf = decision.performance_summary

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface">
      {/* Head */}
      <div className="grid grid-cols-[110px_1fr_auto] items-center gap-[18px] border-b border-border px-5 py-4">
        <span className="font-mono text-[13px] text-muted-foreground">{date}</span>
        <span className="text-sm font-medium text-foreground">{summary}</span>
        <VerdictBadge code={verdictBadgeCode(kind)} />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 px-5 py-4 lg:grid-cols-2">
        {/* Trigger list */}
        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {firedLabel}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {triggers.map((t) => (
              <TriggerChip key={t.name} outcome={t.outcome} label={chipLabel(t)} />
            ))}
          </div>
        </div>

        {/* Decision stats 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <DecisionStat
            label="Live IC"
            value={signed(perf.live_ic, 4)}
            sub={`vs holdout ${signed(perf.holdout_ic, 4)}`}
            tone={tone(perf.live_ic, perf.holdout_ic)}
          />
          <DecisionStat
            label="Live Sharpe"
            value={decimals(perf.live_sharpe, 2)}
            sub={`vs holdout ${decimals(perf.holdout_sharpe, 2)} · ${pctDelta(perf.live_sharpe, perf.holdout_sharpe)}`}
            tone={tone(perf.live_sharpe, perf.holdout_sharpe)}
          />
          <DecisionStat
            label="Live hit rate"
            value={percent(perf.live_hit_rate)}
            sub={`vs holdout ${percent(perf.holdout_hit_rate)}`}
          />
          <DecisionStat
            label="Days since train"
            value={decision.days_since_last_train.toString()}
            sub={`${decision.n_bars} bars in window`}
          />
        </div>
      </div>
    </article>
  )
}

function DecisionStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  tone?: 'positive' | 'negative' | 'default'
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          'font-mono text-sm font-medium',
          tone === 'positive' && 'text-positive',
          tone === 'negative' && 'text-negative',
          (!tone || tone === 'default') && 'text-foreground',
        )}
      >
        {value}
      </div>
      {sub != null && (
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  )
}

function tone(live: number, holdout: number): 'positive' | 'negative' | 'default' {
  if (!Number.isFinite(live) || !Number.isFinite(holdout)) return 'default'
  // Treat a > 20% relative drop as a negative signal worth coloring.
  if (holdout === 0) return live >= 0 ? 'positive' : 'negative'
  const rel = (live - holdout) / Math.abs(holdout)
  if (rel <= -0.2) return 'negative'
  if (rel >= 0) return 'positive'
  return 'default'
}

function signed(v: number, digits = 4): string {
  return (v >= 0 ? '+' : '') + decimals(v, digits)
}

function pctDelta(live: number, holdout: number): string {
  if (!Number.isFinite(live) || !Number.isFinite(holdout) || holdout === 0) return ''
  const rel = ((live - holdout) / Math.abs(holdout)) * 100
  const sign = rel >= 0 ? '+' : ''
  return `${sign}${rel.toFixed(0)}%`
}
