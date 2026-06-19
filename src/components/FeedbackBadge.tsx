import type { FeedbackType } from '@shared/types'
import { FEEDBACK_TYPE_META } from '@/utils/constants'
import { cn } from '@/utils/helpers'

interface FeedbackBadgeProps {
  type: FeedbackType
  size?: 'sm' | 'md'
}

export default function FeedbackBadge({ type, size = 'md' }: FeedbackBadgeProps) {
  const meta = FEEDBACK_TYPE_META[type]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium',
        sizeClasses,
        meta.color
      )}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  )
}
