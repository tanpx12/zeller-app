import { render } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { AdapterTrajectoryChart } from '@/components/sections/AdapterTrajectoryChart'

beforeAll(() => {
  // jsdom has no ResizeObserver; Recharts' ResponsiveContainer requires one.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

describe('AdapterTrajectoryChart', () => {
  it('renders empty state on empty arrays', () => {
    const { container } = render(<AdapterTrajectoryChart alpha={[]} beta={[]} ic={[]} />)
    expect(container.textContent).toMatch(/no trajectory data/i)
  })

  it('renders a chart container with data', () => {
    const n = 50
    const alpha = Array.from({ length: n }, (_, i) => i * 1e-6)
    const beta = Array.from({ length: n }, (_, i) => i / n)
    const ic = Array.from({ length: n }, (_, i) => 0.05 * Math.sin(i / 5))
    const { container } = render(<AdapterTrajectoryChart alpha={alpha} beta={beta} ic={ic} />)
    expect(container.querySelector('.recharts-responsive-container')).toBeTruthy()
  })
})
