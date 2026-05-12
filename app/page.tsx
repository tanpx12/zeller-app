'use client'

import { useEffect, useState } from 'react'
import { SystemService, type HealthResponse } from '@/api-client'
import '@/lib/client'

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    SystemService.health()
      .then(setHealth)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  return (
    <main className="min-h-screen p-8 space-y-4">
      <h1 className="text-2xl font-semibold">perps-dashboard</h1>

      {error && (
        <div className="text-[var(--negative)]">
          Backend unreachable: <code className="font-mono">{error}</code>
        </div>
      )}

      {health && (
        <div className="space-y-1 text-sm">
          <div>
            Backend version: <code className="font-mono">{health.version}</code>
          </div>
          <div>
            Uptime: <code className="font-mono">{health.uptime_secs}s</code>
          </div>
        </div>
      )}

      <p className="text-[var(--muted-foreground)] pt-4">
        Routes: <code className="font-mono">/live</code> ·{' '}
        <code className="font-mono">/reports</code> · <code className="font-mono">/compare</code> ·{' '}
        <code className="font-mono">/decisions</code> · <code className="font-mono">/dev</code>
      </p>
    </main>
  )
}
