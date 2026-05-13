import Link from 'next/link'
import { FileWarning } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'

export default function DecisionNotFound() {
  return (
    <EmptyState
      icon={FileWarning}
      title="Decision not found"
      description="No decision report is indexed for this date."
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/decisions">Back to decisions</Link>
        </Button>
      }
    />
  )
}
