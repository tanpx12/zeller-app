'use client'

import { useQuery } from '@tanstack/react-query'
import { ModelsService, type ModelListResponse } from '@/api-client'
import '@/lib/client'

export function useModels() {
  return useQuery<ModelListResponse>({
    queryKey: ['models', 'list'],
    queryFn: () => ModelsService.listModels(),
    staleTime: 60_000,
  })
}
