import { useState, useEffect, useRef } from 'react'
import type { FeedbackStatus } from '@shared/types'
import { STATUS_META } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import { ChevronDown } from 'lucide-react'

interface StatusBadgeProps {
  status: FeedbackStatus
  onClick?: (newStatus?: FeedbackStatus) => void
  showDropdown?: boolean
}

const STATUSES: FeedbackStatus[] = ['pending', 'resolved', 'ignored']

export default function StatusBadge({ status, onClick, showDropdown = false }: StatusBadgeProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const meta = STATUS_META[status]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClick = () => {
    if (showDropdown) {
      setOpen(!open)
    } else {
      onClick?.()
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm font-medium transition-colors',
          meta.color,
          showDropdown && 'cursor-pointer hover:opacity-80'
        )}
      >
        <span>{meta.label}</span>
        {showDropdown && <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />}
      </button>
      {showDropdown && open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-xl">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setOpen(false)
                onClick?.(s)
              }}
              className={cn(
                'block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-ink-800',
                s === status && 'bg-ink-800'
              )}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
