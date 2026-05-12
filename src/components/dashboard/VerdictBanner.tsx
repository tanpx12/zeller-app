import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

export type VerdictTone = 'promote' | 'monitor' | 'reject'

const toneClass: Record<VerdictTone, string> = {
  promote: 'bg-positive-soft text-positive border-transparent',
  monitor: 'bg-warning-soft text-warning border-transparent',
  reject: 'bg-negative-soft text-negative border-transparent',
}

export interface VerdictBannerProps {
  tone: VerdictTone
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
}

export function VerdictBanner({ tone, title, description, className }: VerdictBannerProps) {
  return (
    <Alert
      data-slot="verdict-banner"
      data-tone={tone}
      className={cn('rounded-lg [&_*]:!text-current', toneClass[tone], className)}
    >
      <AlertTitle className="text-sm font-medium">{title}</AlertTitle>
      {description != null && (
        <AlertDescription className="text-xs">{description}</AlertDescription>
      )}
    </Alert>
  )
}
