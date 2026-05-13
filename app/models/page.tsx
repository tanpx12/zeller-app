'use client'

import { FileWarning } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { ModelCard } from '@/components/sections/ModelCard'
import { useModels } from '@/hooks/useModels'

export default function ModelsPage() {
  const { data, isLoading, error } = useModels()
  const entries = data?.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title="Models"
        meta={
          data
            ? `${entries.length} named ${entries.length === 1 ? 'model' : 'models'} in catalog`
            : 'Strategy catalog'
        }
      />

      <ErrorBoundary label="Models list">
        {error ? (
          <EmptyState
            icon={FileWarning}
            title="Failed to load model catalog"
            description={String(error)}
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[92px] w-full rounded-lg" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={FileWarning}
            title="No models in catalog"
            description="Add entries to ./models.json on the backend and restart the serve binary to populate this list."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <ModelCard key={entry.name} entry={entry} />
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}
