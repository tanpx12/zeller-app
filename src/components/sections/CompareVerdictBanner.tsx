'use client'

import type { ComparisonVerdict } from '@/api-client'
import { cn } from '@/lib/utils'
import { decimals } from '@/lib/format'

export interface CompareVerdictBannerProps {
  verdict: ComparisonVerdict
}

const toneClass = {
  promote: 'bg-positive-soft text-positive border-positive/40',
  reject: 'bg-negative-soft text-negative border-negative/40',
  inconclusive: 'bg-warning-soft text-warning border-warning/40',
} as const

/**
 * The mockup's `.verdict-banner` (index.html:236-242, 643-646) — a tinted
 * banner at the top of the Compare tab. `<span class="badge">VERDICT</span>`
 * label + a sentence summarising the outcome.
 *
 * Tone derived from `ComparisonVerdict` tagged-union variant:
 *   BImproves   → promote (green)
 *   BWorse      → reject  (red)
 *   Inconclusive → inconclusive (amber)
 */
export function CompareVerdictBanner({ verdict }: CompareVerdictBannerProps) {
  const decoded = decodeVerdict(verdict)

  return (
    <div
      data-slot="verdict-banner"
      data-tone={decoded.tone}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-surface px-[18px] py-3.5 text-sm',
        toneClass[decoded.tone],
      )}
    >
      <span className="rounded bg-[rgba(255,255,255,0.08)] px-2 py-0.5 font-mono text-[11px] font-medium">
        VERDICT
      </span>
      <span className="leading-snug">{decoded.message}</span>
    </div>
  )
}

function decodeVerdict(v: ComparisonVerdict): {
  tone: keyof typeof toneClass
  message: React.ReactNode
} {
  if ('BImproves' in v) {
    const { sharpe_delta, dm_p_value } = v.BImproves
    return {
      tone: 'promote',
      message: (
        <>
          Candidate B improves Sharpe by{' '}
          <span className="font-mono font-medium">+{decimals(sharpe_delta, 2)}</span>
          {dm_p_value != null && (
            <>
              {' · Diebold-Mariano '}
              <span className="font-mono font-medium">p={decimals(dm_p_value, 3)}</span>
            </>
          )}
        </>
      ),
    }
  }
  if ('BWorse' in v) {
    const { sharpe_delta, dm_p_value } = v.BWorse
    return {
      tone: 'reject',
      message: (
        <>
          Candidate B underperforms — Sharpe Δ{' '}
          <span className="font-mono font-medium">{decimals(sharpe_delta, 2)}</span>
          {dm_p_value != null && (
            <>
              {' · DM '}
              <span className="font-mono font-medium">p={decimals(dm_p_value, 3)}</span>
            </>
          )}
          . Keep Run A.
        </>
      ),
    }
  }
  return {
    tone: 'inconclusive',
    message: <>Inconclusive — {v.Inconclusive.reason}.</>,
  }
}
