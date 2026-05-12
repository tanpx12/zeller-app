import { PageHeader } from '@/components/dashboard/PageHeader'

export default function LivePage() {
  return (
    <div>
      <PageHeader title="Live paper trading" meta="BTC · 1h · UTC" />
      <p className="text-sm text-muted-foreground">
        Live tab — populated in Phase 6 (polling + WebSocket).
      </p>
    </div>
  )
}
