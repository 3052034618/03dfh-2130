import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative z-10 w-full max-w-lg mx-4',
        'bg-ink-900 border border-ink-800 rounded-xl shadow-2xl',
        'animate-pop-in'
      )}>
        <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
          <h3 className="text-lg font-semibold text-paper-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-paper-100/60 transition-colors hover:bg-ink-800 hover:text-paper-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
