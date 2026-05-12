import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

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
  RangeChips,
  RunPick,
  VerdictBanner,
  ErrorBoundary,
  EmptyState,
} from '@/components/dashboard'

describe('dashboard primitives — smoke', () => {
  it('Kpi renders label, value, sub', () => {
    const { getByText } = render(<Kpi label="Equity" value="$1,234.56" sub="+0.42%" />)
    expect(getByText('Equity')).toBeInTheDocument()
    expect(getByText('$1,234.56')).toBeInTheDocument()
    expect(getByText('+0.42%')).toBeInTheDocument()
  })

  it('Stat renders label, value, sub', () => {
    const { getByText } = render(<Stat label="Sharpe" value="1.42" sub="trailing 30d" />)
    expect(getByText('Sharpe')).toBeInTheDocument()
    expect(getByText('1.42')).toBeInTheDocument()
  })

  it('KvRow renders key and value', () => {
    const { getByText } = render(<KvRow keyLabel="Trades" value="138" />)
    expect(getByText('Trades')).toBeInTheDocument()
    expect(getByText('138')).toBeInTheDocument()
  })

  it('PageHeader renders title and optional meta', () => {
    const { getByText } = render(<PageHeader title="Reports" meta="Last 30 days · UTC" />)
    expect(getByText('Reports')).toBeInTheDocument()
    expect(getByText('Last 30 days · UTC')).toBeInTheDocument()
  })

  it('VsDivider renders the text VS', () => {
    const { getByText } = render(<VsDivider />)
    expect(getByText('VS')).toBeInTheDocument()
  })

  it.each(['batch', 'holdout', 'live', 'decision'] as const)('ModeBadge[%s] renders', (mode) => {
    const { container } = render(<ModeBadge mode={mode} />)
    expect(container.querySelector(`[data-mode="${mode}"]`)).not.toBeNull()
  })

  it.each(['ok', 'monitor', 'retrain'] as const)('VerdictBadge[%s] renders', (code) => {
    const { container } = render(<VerdictBadge code={code} />)
    expect(container.querySelector(`[data-verdict="${code}"]`)).not.toBeNull()
  })

  it.each(['no_fire', 'fire_soft', 'fire_hard'] as const)('TriggerChip[%s] renders', (outcome) => {
    const { container } = render(<TriggerChip outcome={outcome} label="ic_drop" />)
    expect(container.querySelector(`[data-outcome="${outcome}"]`)).not.toBeNull()
  })

  it('LiveDot renders the breathing dot', () => {
    const { container } = render(<LiveDot color="positive" />)
    expect(container.querySelector('[data-slot="live-dot"]')).not.toBeNull()
  })

  it('LiveIndicator renders status + label', () => {
    const { getByText } = render(<LiveIndicator status="healthy" label="Live · BTC 1h" />)
    expect(getByText('Live · BTC 1h')).toBeInTheDocument()
  })

  it('SharpeBar renders value, red below threshold', () => {
    const { getByText, container } = render(<SharpeBar value={0.4} />)
    expect(getByText('0.40')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="sharpe-bar"][data-negative]')).not.toBeNull()
  })

  it('RangeChips renders all four options', () => {
    const { getByText } = render(<RangeChips value="30d" onValueChange={() => {}} />)
    for (const label of ['7D', '30D', '90D', 'All']) {
      expect(getByText(label)).toBeInTheDocument()
    }
  })

  it.each(['a', 'b'] as const)('RunPick[%s] renders accent variant', (variant) => {
    const { container } = render(
      <RunPick variant={variant} name="20251210_a3f2c1d" meta="BTC · 1h" />,
    )
    expect(container.querySelector(`[data-variant="${variant}"]`)).not.toBeNull()
  })

  it.each(['promote', 'monitor', 'reject'] as const)(
    'VerdictBanner[%s] renders title/description',
    (tone) => {
      const { getByText, container } = render(
        <VerdictBanner tone={tone} title="Decision" description="Body" />,
      )
      expect(getByText('Decision')).toBeInTheDocument()
      expect(container.querySelector(`[data-tone="${tone}"]`)).not.toBeNull()
    },
  )

  it('EmptyState renders title and description', () => {
    const { getByText } = render(
      <EmptyState title="No reports yet" description="Run a backtest first." />,
    )
    expect(getByText('No reports yet')).toBeInTheDocument()
  })

  it('ErrorBoundary renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary label="Trades">
        <div>ok</div>
      </ErrorBoundary>,
    )
    expect(getByText('ok')).toBeInTheDocument()
  })

  it('ErrorBoundary renders fallback when child throws', () => {
    const Boom = () => {
      throw new Error('boom')
    }
    // Silence React's expected error log for this case.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getByText } = render(
      <ErrorBoundary label="Trades">
        <Boom />
      </ErrorBoundary>,
    )
    expect(getByText('Trades failed')).toBeInTheDocument()
    spy.mockRestore()
  })
})
