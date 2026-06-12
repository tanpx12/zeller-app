import { AdapterKpis } from './AdapterKpis'
import { AdapterTrajectoryChart } from './AdapterTrajectoryChart'
import type { AdapterReport } from '@/api-client'

export function AdapterSection({ adapter }: { adapter: AdapterReport | null | undefined }) {
  if (!adapter) return null
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Signal adapter
        </h2>
        <code className="font-mono text-xs text-muted-foreground">
          authoritative: {adapter.authoritative_id}
        </code>
      </div>
      <AdapterKpis adapter={adapter} />
      <AdapterTrajectoryChart
        alpha={adapter.alpha_trajectory}
        beta={adapter.beta_trajectory}
        ic={adapter.ewma_ic_trajectory}
      />
    </section>
  )
}
