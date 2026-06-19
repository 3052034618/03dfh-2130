import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/helpers'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export default function Card({ children, className, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-ink-900 border border-ink-800 rounded-xl p-5',
        hover && 'transition hover:bg-ink-800/50 hover:border-ink-700 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
