'use client'

import type { CompareResponseDto } from '@/api-client'
import { KvRow } from '@/components/dashboard/KvRow'
import { decimals, percent } from '@/lib/format'

export interface StatisticalEvidenceProps {
  data: CompareResponseDto
}

/**
 * The mockup's "Statistical evidence" card (index.html:719-726). Lists
 * Diebold-Mariano, period overlap, config/model hash agreement, and a
 * recommendation derived from the verdict variant.
 */
export function StatisticalEvidence({ data }: StatisticalEvidenceProps) {
  const sig = data.significance
  const meta = data.meta_diff
  const overlapPct = data.period_overlap_pct

  // The meta_diff arrays are `any[]` in the generated client — narrow via
  // runtime checks rather than blanket casts.
  const runIds = Array.isArray(meta.run_ids) ? (meta.run_ids as string[]) : []
  const configHashes = Array.isArray(meta.modes)
    ? extractHashes(meta as MetadataDiffLoose)
    : { a: null, b: null }

  return (
    <div className="rounded-lg border border-border bg-surface px-[18px] pt-3.5 pb-1">
      <div className="mb-3 text-[13px] font-medium text-foreground">Statistical evidence</div>

      {sig ? (
        <KvRow
          keyLabel="Diebold-Mariano test (squared errors)"
          value={
            <>
              DM stat = <span className="text-foreground">{decimals(sig.dm_stat, 2)}</span>, p ={' '}
              <span className="text-foreground">{decimals(sig.p_value, 3)}</span> · n={sig.n}
            </>
          }
        />
      ) : (
        <KvRow
          keyLabel="Diebold-Mariano test"
          value={<span className="text-faint-foreground">unavailable (insufficient overlap)</span>}
        />
      )}

      <KvRow
        keyLabel="Period overlap"
        value={
          <span className={overlapPct >= 80 ? 'text-positive' : 'text-warning'}>
            {percent(overlapPct / 100)}
          </span>
        }
      />

      <KvRow
        keyLabel="Run IDs"
        value={
          runIds.length === 2 ? (
            <span className="truncate text-faint-foreground">
              {runIds[0]} · {runIds[1]}
            </span>
          ) : (
            '—'
          )
        }
      />

      <KvRow
        keyLabel="Config hash match"
        value={
          meta.config_hashes_match ? (
            <span className="text-positive">identical</span>
          ) : (
            <span className="text-muted-foreground">
              different
              {configHashes.a && configHashes.b && (
                <>
                  {' '}
                  <span className="font-mono text-faint-foreground">
                    {short(configHashes.a)} · {short(configHashes.b)}
                  </span>
                </>
              )}
            </span>
          )
        }
      />

      <KvRow
        keyLabel="Model hash match"
        value={
          meta.model_hashes_match ? (
            <span className="text-positive">identical</span>
          ) : (
            <span className="text-muted-foreground">different</span>
          )
        }
        last
      />
    </div>
  )
}

interface MetadataDiffLoose {
  config_hashes?: unknown[]
}

function extractHashes(loose: MetadataDiffLoose): { a: string | null; b: string | null } {
  const arr = loose.config_hashes
  if (!Array.isArray(arr) || arr.length < 2) return { a: null, b: null }
  return {
    a: typeof arr[0] === 'string' ? arr[0] : null,
    b: typeof arr[1] === 'string' ? arr[1] : null,
  }
}

function short(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : hash
}
