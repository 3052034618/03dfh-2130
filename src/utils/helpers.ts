import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(date: string): string {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}
