import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { AdapterSection } from '@/components/sections/AdapterSection'
import type { AdapterReport } from '@/api-client'

beforeAll(() => {
  // Recharts needs ResizeObserver; same stub as adapter-trajectory-chart.test.tsx
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

const adapter: AdapterReport = {
  authoritative_id: 'kalman_a',
  alpha_trajectory: [0, 0.00001],
  beta_trajectory: [0, 0.42],
  ewma_ic_trajectory: [0, 0.06],
  final_alpha: 0.00001,
  final_beta: 0.42,
  final_beta_stdev: 0.08,
  final_r_hat: 0.000012,
  dropped_stale: 0,
}

describe('AdapterSection', () => {
  it('returns null when adapter is undefined', () => {
    const { container } = render(<AdapterSection adapter={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when adapter is null', () => {
    const { container } = render(<AdapterSection adapter={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders heading and authoritative id when adapter present', () => {
    render(<AdapterSection adapter={adapter} />)
    expect(screen.getByText('Signal adapter')).toBeInTheDocument()
    expect(screen.getByText(/kalman_a/)).toBeInTheDocument()
  })
})
