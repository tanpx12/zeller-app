import Link from 'next/link'
import { FileWarning } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'

export default function ModelNotFound() {
  return (
    <EmptyState
      icon={FileWarning}
      title="Model not in catalog"
      description="No entry by that name in ./models.json. Check /models for the available names."
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/models">Back to models</Link>
        </Button>
      }
    />
  )
}
