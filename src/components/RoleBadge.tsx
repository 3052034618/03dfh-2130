import type { ReaderRole } from '@shared/types'
import { ROLE_META } from '@/utils/constants'
import { cn } from '@/utils/helpers'

interface RoleBadgeProps {
  role: ReaderRole
  size?: 'sm' | 'md'
}

export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const meta = ROLE_META[role]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        sizeClasses,
        meta.color
      )}
    >
      {meta.label}
    </span>
  )
}
