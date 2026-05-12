import { notFound } from 'next/navigation'
import { Activity, FileWarning } from 'lucide-react'
import {
  Kpi,
  Stat,
  KvRow,
  PageHeader,
  VsDivider,
  ModeBadge,
  VerdictBadge,
  TriggerChip,
  LiveDot,
  LiveIndicator,
  SharpeBar,
  RunPick,
  VerdictBanner,
  EmptyState,
} from '@/components/dashboard'
import { RangeChipsDemo } from './_range-chips-demo'

const showcaseGate = process.env.NODE_ENV !== 'production'

export default function DevShowcase() {
  if (!showcaseGate) notFound()

  return (
    <div className="space-y-10">
      <PageHeader
        title="Primitives showcase"
        meta="Every primitive rendered with sample data — visual reference for Phases 3–6"
      />

      <Section title="Kpi">
        <div className="grid grid-cols-4 gap-3">
          <Kpi label="Equity" value="$12,438.21" sub="+0.42% · 24h" tone="positive" />
          <Kpi label="Position" value="0.024 BTC" sub="Long · 1.4x" />
          <Kpi label="24h P&L" value="-$214.08" sub="-1.70%" tone="negative" />
          <Kpi label="Forecast" value="+0.18%" sub="next bar · 14:00 UTC" tone="warning" />
        </div>
      </Section>

      <Section title="Stat">
        <div className="grid grid-cols-5 gap-2.5">
          <Stat label="Sharpe" value="1.42" sub="30d trailing" tone="positive" />
          <Stat label="Max DD" value="-8.4%" sub="2025-04-12" tone="negative" />
          <Stat label="Trades" value="138" sub="last 30d" />
          <Stat label="Win rate" value="58%" sub="80 / 138" />
          <Stat label="Avg hold" value="2.3h" sub="median" />
        </div>
      </Section>

      <Section title="KvRow stack">
        <div className="max-w-md rounded-lg border border-border bg-surface p-4">
          <KvRow keyLabel="Strategy" value="momentum_v3" />
          <KvRow keyLabel="Period" value="2025-04-01 → 2025-04-30" />
          <KvRow keyLabel="Lookback" value="120 bars" />
          <KvRow keyLabel="Threshold" value="0.0035" last />
        </div>
      </Section>

      <Section title="Badges and chips">
        <div className="flex flex-wrap items-center gap-3">
          <ModeBadge mode="batch" />
          <ModeBadge mode="holdout" />
          <ModeBadge mode="live" />
          <ModeBadge mode="decision" />
          <span className="mx-2 h-4 w-px bg-border" />
          <VerdictBadge code="ok" />
          <VerdictBadge code="monitor" />
          <VerdictBadge code="retrain" />
          <span className="mx-2 h-4 w-px bg-border" />
          <TriggerChip outcome="no_fire" label="ic_drop" />
          <TriggerChip outcome="fire_soft" label="ic_drop · 0.4σ" />
          <TriggerChip outcome="fire_hard" label="sharpe_drop · 2.1σ" />
        </div>
      </Section>

      <Section title="Live indicators">
        <div className="flex items-center gap-4">
          <LiveDot color="positive" />
          <LiveDot color="warning" />
          <LiveDot color="negative" />
          <LiveDot color="muted" />
          <span className="mx-2 h-4 w-px bg-border" />
          <LiveIndicator status="healthy" label="Live · BTC 1h · 14:00 UTC" />
          <LiveIndicator status="lagging" label="Lag 42s" />
          <LiveIndicator status="down" label="Backend unreachable" />
        </div>
      </Section>

      <Section title="SharpeBar (negative below 0.7)">
        <div className="flex flex-col gap-2">
          <SharpeBar value={2.1} />
          <SharpeBar value={1.0} />
          <SharpeBar value={0.4} />
          <SharpeBar value={-0.2} />
        </div>
      </Section>

      <Section title="RangeChips">
        <RangeChipsDemo />
      </Section>

      <Section title="RunPick (Compare tab accent identity)">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <RunPick variant="a" name="20251210_a3f2c1d" meta="BTC · 1h · momentum_v3" />
          <VsDivider />
          <RunPick variant="b" name="20251211_b9e8f00" meta="BTC · 1h · momentum_v4" />
        </div>
      </Section>

      <Section title="VerdictBanner">
        <div className="flex flex-col gap-3">
          <VerdictBanner
            tone="promote"
            title="Promote B"
            description="Sharpe 1.42 → 1.78 over identical 30d period. Bootstrap CI excludes zero."
          />
          <VerdictBanner
            tone="monitor"
            title="Monitor"
            description="Improvement within noise. Re-evaluate after another 30 days."
          />
          <VerdictBanner
            tone="reject"
            title="Keep A"
            description="B underperforms by 0.32 Sharpe. DM test p=0.012."
          />
        </div>
      </Section>

      <Section title="EmptyState">
        <div className="grid grid-cols-2 gap-4">
          <EmptyState
            icon={FileWarning}
            title="No reports match these filters"
            description="Loosen the asset, mode, or period filters."
          />
          <EmptyState
            icon={Activity}
            title="Paper trader not running"
            description="Start it with `cargo run --release --bin paper_trade`."
          />
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}
