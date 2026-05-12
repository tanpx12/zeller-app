import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-10 text-center',
        className,
      )}
    >
      {Icon && <Icon className="size-6 text-faint-foreground" />}
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description != null && (
        <div className="max-w-prose text-xs text-muted-foreground">{description}</div>
      )}
      {action != null && <div className="pt-1">{action}</div>}
    </div>
  )
}
