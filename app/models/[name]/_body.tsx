'use client'

import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { KvRow } from '@/components/dashboard/KvRow'
import { useModels } from '@/hooks/useModels'
import { decimals } from '@/lib/format'

export function ModelDetailBody({ name }: { name: string }) {
  const models = useModels()
  const entry = models.data?.data.find((m) => m.id === name)

  if (models.data && !entry) {
    notFound()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Model"
        meta={
          entry ? (
            <span className="flex items-baseline gap-3">
              <span className="font-mono text-foreground">{entry.name}</span>
              <span className="text-muted-foreground">{entry.architecture}</span>
            </span>
          ) : (
            <span className="font-mono text-foreground">{name}</span>
          )
        }
      />

      {entry?.description && <p className="text-sm text-muted-foreground">{entry.description}</p>}

      {entry && (
        <div className="rounded-lg border border-border bg-surface px-[18px] py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            <KvRow keyLabel="Features" value={String(entry.n_features)} />
            <KvRow keyLabel="Leaves" value={String(entry.num_leaves)} />
            <KvRow keyLabel="Threshold" value={decimals(entry.threshold, 5)} />
            <KvRow keyLabel="Stop loss" value={decimals(entry.stop_loss_pct, 4)} />
            <KvRow keyLabel="ID" value={entry.id} />
          </div>
        </div>
      )}
    </div>
  )
}
