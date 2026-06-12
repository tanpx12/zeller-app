import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Gauge } from 'lucide-react'

/**
 * Live adapter status. Mirrors the backend `AdapterStatus` struct.
 * Local type until the backend wires AdapterStatus into LiveStatusDto —
 * then replace with the generated type from @/api-client.
 */
export interface AdapterLiveStatus {
  enabled: boolean
  authoritative_id: string
  instance_count: number
}

export function AdapterStatusCard({ status }: { status: AdapterLiveStatus | undefined }) {
  if (!status) {
    return (
      <EmptyState
        icon={Gauge}
        title="Adapter status not available"
        description="The live runner is not reporting adapter state."
      />
    )
  }

  const shadows = Math.max(0, status.instance_count - 1)
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Signal adapter
        </span>
        <Badge variant={status.enabled ? 'default' : 'secondary'}>
          {status.enabled ? 'Active' : 'Disabled'}
        </Badge>
      </div>
      <div className="font-mono text-sm text-foreground">{status.authoritative_id}</div>
      <div className="text-xs text-muted-foreground">
        {status.instance_count} instances ({shadows} shadow)
      </div>
    </div>
  )
}
