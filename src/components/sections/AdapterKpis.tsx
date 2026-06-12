import type { AdapterReport } from '@/api-client'
import { Kpi } from '@/components/dashboard/Kpi'
import { decimals, scientific } from '@/lib/format'

export interface AdapterKpisProps {
  adapter: AdapterReport
}

/** Six-tile KPI strip for online signal adapter diagnostics. */
export function AdapterKpis({ adapter }: AdapterKpisProps) {
  const lastIc = adapter.ewma_ic_trajectory.at(-1) ?? 0
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Kpi label="Final α" value={decimals(adapter.final_alpha, 5)} />
      <Kpi
        label="Final β"
        value={decimals(adapter.final_beta, 3)}
        tone={adapter.final_beta < 0 ? 'negative' : 'default'}
      />
      <Kpi label="β stdev" value={decimals(adapter.final_beta_stdev, 3)} />
      <Kpi label="R̂" value={scientific(adapter.final_r_hat)} />
      <Kpi
        label="EWMA IC"
        value={decimals(lastIc, 3)}
        tone={lastIc < 0 ? 'negative' : lastIc > 0.05 ? 'positive' : 'default'}
      />
      <Kpi
        label="Dropped stale"
        value={String(adapter.dropped_stale)}
        tone={adapter.dropped_stale > 0 ? 'warning' : 'default'}
        sub={adapter.dropped_stale > 0 ? 'data gap detected' : undefined}
      />
    </div>
  )
}
