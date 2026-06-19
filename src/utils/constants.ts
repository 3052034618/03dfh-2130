import type { FeedbackType, FeedbackStatus, ReaderRole } from '@shared/types'

export const FEEDBACK_TYPE_META: Record<FeedbackType, { label: string; color: string; emoji: string }> = {
  confusing: { label: '看不懂', color: 'text-blue-600 bg-blue-50 border-blue-200', emoji: '❓' },
  slow: { label: '节奏慢', color: 'text-purple-600 bg-purple-50 border-purple-200', emoji: '🐢' },
  funny: { label: '笑点有效', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', emoji: '😂' },
  cute: { label: '角色可爱', color: 'text-pink-600 bg-pink-50 border-pink-200', emoji: '🥰' },
  detail: { label: '画面细节问题', color: 'text-red-600 bg-red-50 border-red-200', emoji: '🔍' },
}

export const ROLE_META: Record<ReaderRole, { label: string; color: string }> = {
  editor: { label: '编辑', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  assistant: { label: '助手', color: 'text-green-600 bg-green-50 border-green-200' },
  fan: { label: '粉丝', color: 'text-amber-600 bg-amber-50 border-amber-200' },
}

export const STATUS_META: Record<FeedbackStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  resolved: { label: '已处理', color: 'text-green-600 bg-green-50 border-green-200' },
  ignored: { label: '暂不改', color: 'text-gray-600 bg-gray-50 border-gray-200' },
}
