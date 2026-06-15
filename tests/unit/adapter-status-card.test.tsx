import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AdapterStatus } from '@/api-client'
import { AdapterStatusCard } from '@/components/sections/AdapterStatusCard'

describe('AdapterStatusCard', () => {
  it('renders fallback when no adapter status', () => {
    render(<AdapterStatusCard status={undefined} />)
    expect(screen.getByText(/not available/i)).toBeInTheDocument()
  })

  it('renders status fields when present', () => {
    const status: AdapterStatus = {
      enabled: true,
      authoritative_id: 'kalman_a',
      instance_count: 4,
    }
    render(<AdapterStatusCard status={status} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText(/kalman_a/)).toBeInTheDocument()
    expect(screen.getByText(/4 instances/)).toBeInTheDocument()
  })

  it('renders disabled badge', () => {
    render(
      <AdapterStatusCard
        status={{ enabled: false, authoritative_id: 'identity', instance_count: 1 }}
      />,
    )
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })
})
