import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, meta, actions, className }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn('mb-5 flex items-start justify-between gap-4', className)}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-[18px] font-medium tracking-[-0.02em] text-foreground">{title}</h1>
        {meta != null && <div className="text-xs font-mono text-muted-foreground">{meta}</div>}
      </div>
      {actions != null && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
