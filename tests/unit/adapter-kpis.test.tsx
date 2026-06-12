import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AdapterKpis } from '@/components/sections/AdapterKpis'
import type { AdapterReport } from '@/api-client'

const adapter: AdapterReport = {
  authoritative_id: 'kalman_a',
  alpha_trajectory: [0.0, 0.00001],
  beta_trajectory: [0.0, 0.42],
  ewma_ic_trajectory: [0.0, 0.06],
  final_alpha: 0.00001,
  final_beta: 0.42,
  final_beta_stdev: 0.08,
  final_r_hat: 0.000012,
  dropped_stale: 0,
}

describe('AdapterKpis', () => {
  it('renders all six KPIs', () => {
    render(<AdapterKpis adapter={adapter} />)
    expect(screen.getByText('Final α')).toBeInTheDocument()
    expect(screen.getByText('Final β')).toBeInTheDocument()
    expect(screen.getByText('β stdev')).toBeInTheDocument()
    expect(screen.getByText('R̂')).toBeInTheDocument()
    expect(screen.getByText('EWMA IC')).toBeInTheDocument()
    expect(screen.getByText('Dropped stale')).toBeInTheDocument()
  })

  it('uses warning tone when dropped_stale > 0', () => {
    render(<AdapterKpis adapter={{ ...adapter, dropped_stale: 3 }} />)
    expect(screen.getByText('3')).toHaveClass('text-warning')
  })
})
