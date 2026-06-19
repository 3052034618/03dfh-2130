import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface EmptyProps {
  icon?: ReactNode
  title: string
  description?: string
}

export default function Empty({ icon, title, description }: EmptyProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center'
    )}>
      <div className="mb-4 text-ink-500">
        {icon ?? <Inbox className="h-16 w-16" strokeWidth={1.25} />}
      </div>
      <h3 className="text-lg font-semibold text-paper-100 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 max-w-sm">{description}</p>
      )}
    </div>
  )
}
