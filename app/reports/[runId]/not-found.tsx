import Link from 'next/link'
import { FileWarning } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'

export default function ReportNotFound() {
  return (
    <EmptyState
      icon={FileWarning}
      title="Report not found"
      description="No report is indexed for this run_id. It may have been pruned or never persisted."
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/reports">Back to reports</Link>
        </Button>
      }
    />
  )
}
