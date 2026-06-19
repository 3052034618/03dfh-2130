import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import type { FeedbackType, Feedback, Region } from '@shared/types'
import { FEEDBACK_TYPE_META } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import { useReaderStore } from '@/store/reader'
import FeedbackBadge from '@/components/FeedbackBadge'
import RoleBadge from '@/components/RoleBadge'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Empty from '@/components/Empty'

const FEEDBACK_TYPES: FeedbackType[] = ['confusing', 'slow', 'funny', 'cute', 'detail']

const FEEDBACK_COLOR_MAP: Record<FeedbackType, { dot: string; bg: string; text: string; ring: string; overlay: string }> = {
  confusing: {
    dot: 'bg-feedback-confusing',
    bg: 'bg-feedback-confusing/20',
    text: 'text-feedback-confusing',
    ring: 'ring-feedback-confusing',
    overlay: 'bg-feedback-confusing/30 border-feedback-confusing',
  },
  slow: {
    dot: 'bg-feedback-slow',
    bg: 'bg-feedback-slow/20',
    text: 'text-feedback-slow',
    ring: 'ring-feedback-slow',
    overlay: 'bg-feedback-slow/30 border-feedback-slow',
  },
  funny: {
    dot: 'bg-feedback-funny',
    bg: 'bg-feedback-funny/20',
    text: 'text-feedback-funny',
    ring: 'ring-feedback-funny',
    overlay: 'bg-feedback-funny/30 border-feedback-funny',
  },
  cute: {
    dot: 'bg-feedback-cute',
    bg: 'bg-feedback-cute/20',
    text: 'text-feedback-cute',
    ring: 'ring-feedback-cute',
    overlay: 'bg-feedback-cute/30 border-feedback-cute',
  },
  detail: {
    dot: 'bg-feedback-detail',
    bg: 'bg-feedback-detail/20',
    text: 'text-feedback-detail',
    ring: 'ring-feedback-detail',
    overlay: 'bg-feedback-detail/30 border-feedback-detail',
  },
}

interface SelectingState {
  pageId: string
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export default function Reader() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const {
    fetchShareData,
    pages,
    feedbacks,
    activeFeedbackType,
    setActiveFeedbackType,
    setSelectedRegion,
    submitFeedback,
    role,
    chapter,
    expandedFeedbackId,
    setExpandedFeedbackId,
  } = useReaderStore()

  const [selecting, setSelecting] = useState<SelectingState | null>(null)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [submitPageId, setSubmitPageId] = useState<string | null>(null)
  const [submitRegion, setSubmitRegion] = useState<Region | null>(null)
  const [reviewerName, setReviewerName] = useState('')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [hoveredFeedbackId, setHoveredFeedbackId] = useState<string | null>(null)
  const [workTitle, setWorkTitle] = useState('')

  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const selectingRef = useRef<SelectingState | null>(null)
  const activeFeedbackTypeRef = useRef<FeedbackType | null>(null)

  useEffect(() => {
    selectingRef.current = selecting
  }, [selecting])

  useEffect(() => {
    activeFeedbackTypeRef.current = activeFeedbackType
  }, [activeFeedbackType])

  useEffect(() => {
    if (token) {
      fetchShareData(token).catch(() => {})
    }
    return () => {
      setActiveFeedbackType(null)
      setSelectedRegion(null)
      setExpandedFeedbackId(null)
    }
  }, [token, fetchShareData, setActiveFeedbackType, setSelectedRegion, setExpandedFeedbackId])

  useEffect(() => {
    if (chapter) {
      setWorkTitle('星轨前夜')
    }
  }, [chapter])

  const getFeedbackColor = (type: FeedbackType) => FEEDBACK_COLOR_MAP[type]

  const getClientRelativePos = (e: React.MouseEvent | MouseEvent, pageId: string) => {
    const pageEl = pageRefs.current.get(pageId)
    if (!pageEl) return null
    const rect = pageEl.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
  }

  const normalizeRegion = (x1: number, y1: number, x2: number, y2: number): Region => {
    const x = Math.min(x1, x2)
    const y = Math.min(y1, y2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)
    return { x, y, width, height }
  }

  const handlePageMouseDown = (e: React.MouseEvent, pageId: string) => {
    if (!activeFeedbackType) return
    e.preventDefault()
    const pos = getClientRelativePos(e, pageId)
    if (!pos) return
    const newSelecting: SelectingState = {
      pageId,
      startX: pos.x,
      startY: pos.y,
      currentX: pos.x,
      currentY: pos.y,
    }
    setSelecting(newSelecting)
    selectingRef.current = newSelecting
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const currentSelecting = selectingRef.current
    if (!currentSelecting) return
    const pos = getClientRelativePos(e, currentSelecting.pageId)
    if (!pos) return
    const updated = { ...currentSelecting, currentX: pos.x, currentY: pos.y }
    selectingRef.current = updated
    setSelecting(updated)
  }, [])

  const handleMouseUp = useCallback(() => {
    const currentSelecting = selectingRef.current
    const currentType = activeFeedbackTypeRef.current
    if (!currentSelecting || !currentType) return
    const region = normalizeRegion(currentSelecting.startX, currentSelecting.startY, currentSelecting.currentX, currentSelecting.currentY)
    if (region.width > 0.02 && region.height > 0.02) {
      setSubmitPageId(currentSelecting.pageId)
      setSubmitRegion(region)
      setSelectedRegion(region)
      setSubmitModalOpen(true)
    }
    setSelecting(null)
    selectingRef.current = null
  }, [setSelectedRegion])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectingRef.current) {
        setSelecting(null)
        selectingRef.current = null
      } else if (activeFeedbackTypeRef.current) {
        setActiveFeedbackType(null)
      }
    }
  }, [setActiveFeedbackType])

  useEffect(() => {
    const shouldBind = !!selecting || !!activeFeedbackType
    if (shouldBind) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selecting, activeFeedbackType, handleMouseMove, handleMouseUp, handleKeyDown])

  const handleSubmitFeedback = async () => {
    if (!submitPageId || !submitRegion || !activeFeedbackType || !reviewerName.trim() || !feedbackContent.trim()) return
    await submitFeedback({
      pageId: submitPageId,
      type: activeFeedbackType,
      content: feedbackContent,
      region: submitRegion,
      reviewerName: reviewerName.trim(),
    })
    setSubmitModalOpen(false)
    setSubmitPageId(null)
    setSubmitRegion(null)
    setSelectedRegion(null)
    setReviewerName('')
    setFeedbackContent('')
    setActiveFeedbackType(null)
  }

  const handleCloseSubmitModal = () => {
    setSubmitModalOpen(false)
    setSubmitPageId(null)
    setSubmitRegion(null)
    setSelectedRegion(null)
    setReviewerName('')
    setFeedbackContent('')
  }

  const getPageFeedbacks = (pageId: string) => feedbacks.filter((f) => f.pageId === pageId)

  const getTempRegion = (): Region | null => {
    if (!selecting) return null
    return normalizeRegion(selecting.startX, selecting.startY, selecting.currentX, selecting.currentY)
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <Empty title="加载中" description="正在加载漫画..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-950 text-paper-100">
      <header className="fixed top-0 w-full h-16 bg-ink-950/90 backdrop-blur border-b border-ink-800 z-30 flex items-center px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-paper-100 hover:bg-ink-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          返回
        </button>
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="text-center min-w-0">
            <h1 className="font-display text-lg truncate px-2">{workTitle || '加载中...'}</h1>
            <p className="text-xs text-paper-200 truncate">{chapter?.title || ''}</p>
          </div>
        </div>
        <div className="w-24 flex justify-end">
          {role && <RoleBadge role={role} size="sm" />}
        </div>
      </header>

      <main className="pt-20 pb-24 px-4 max-w-4xl mx-auto">
        {pages.map((page) => {
          const pageFeedbacks = getPageFeedbacks(page.id)
          const tempRegion = selecting?.pageId === page.id ? getTempRegion() : null
          const isSelectingPage = selecting?.pageId === page.id
          const showCursor = activeFeedbackType !== null

          return (
            <div
              key={page.id}
              ref={(el) => {
                if (el) pageRefs.current.set(page.id, el)
              }}
              className={cn(
                'w-full mb-8 relative rounded-xl overflow-hidden shadow-2xl paper-texture select-none',
                showCursor && 'cursor-crosshair'
              )}
              onMouseDown={(e) => handlePageMouseDown(e, page.id)}
            >
              <img
                src={page.imageUrl}
                alt={`第 ${page.pageIndex + 1} 页`}
                className="w-full h-auto block pointer-events-none"
                draggable={false}
              />

              {pageFeedbacks.map((feedback) => {
                const color = getFeedbackColor(feedback.type)
                const centerX = feedback.region.x + feedback.region.width / 2
                const centerY = feedback.region.y + feedback.region.height / 2
                const isHovered = hoveredFeedbackId === feedback.id
                const isExpanded = expandedFeedbackId === feedback.id

                return (
                  <div key={feedback.id}>
                    <div
                      className={cn(
                        'absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2',
                        'transition-transform duration-150',
                        isHovered && 'scale-125'
                      )}
                      style={{ left: `${centerX * 100}%`, top: `${centerY * 100}%` }}
                      onMouseEnter={() => setHoveredFeedbackId(feedback.id)}
                      onMouseLeave={() => setHoveredFeedbackId(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedFeedbackId(isExpanded ? null : feedback.id)
                      }}
                    >
                      <div className="relative">
                        <span
                          className={cn(
                            'absolute inset-0 rounded-full animate-pulse-ring',
                            color.dot,
                            'opacity-60'
                          )}
                        />
                        <span
                          className={cn(
                            'relative block w-5 h-5 rounded-full',
                            color.dot,
                            'ring-2 ring-white/80 shadow-lg',
                            isHovered && 'ring-4'
                          )}
                        />
                      </div>
                    </div>

                    {isHovered && !isExpanded && (
                      <div
                        className={cn(
                          'absolute z-20 min-w-64 max-w-xs p-3 rounded-lg shadow-xl',
                          'bg-ink-900 border border-ink-700 animate-fade-up',
                          'pointer-events-none'
                        )}
                        style={{
                          left: `${centerX * 100}%`,
                          top: `${centerY * 100}%`,
                          transform: 'translate(-50%, -120%)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FeedbackBadge type={feedback.type} size="sm" />
                          <RoleBadge role={feedback.role} size="sm" />
                        </div>
                        <p className="text-sm text-paper-100 line-clamp-2">{feedback.content}</p>
                        <p className="mt-1 text-xs text-ink-500">— {feedback.reviewerName}</p>
                      </div>
                    )}
                  </div>
                )
              })}

              {isSelectingPage && tempRegion && activeFeedbackType && (
                <div
                  className={cn(
                    'absolute border-2 rounded pointer-events-none',
                    getFeedbackColor(activeFeedbackType).overlay
                  )}
                  style={{
                    left: `${tempRegion.x * 100}%`,
                    top: `${tempRegion.y * 100}%`,
                    width: `${tempRegion.width * 100}%`,
                    height: `${tempRegion.height * 100}%`,
                  }}
                />
              )}

              {submitPageId === page.id && submitRegion && activeFeedbackType && (
                <div
                  className={cn(
                    'absolute border-2 rounded pointer-events-none',
                    getFeedbackColor(activeFeedbackType).overlay
                  )}
                  style={{
                    left: `${submitRegion.x * 100}%`,
                    top: `${submitRegion.y * 100}%`,
                    width: `${submitRegion.width * 100}%`,
                    height: `${submitRegion.height * 100}%`,
                  }}
                />
              )}
            </div>
          )
        })}
      </main>

      <footer className="fixed bottom-0 w-full h-16 bg-ink-950/90 backdrop-blur border-t border-ink-800 z-30 flex justify-center items-center gap-2 px-4">
        {FEEDBACK_TYPES.map((type) => {
          const meta = FEEDBACK_TYPE_META[type]
          const color = getFeedbackColor(type)
          const isActive = activeFeedbackType === type
          return (
            <button
              key={type}
              onClick={() => setActiveFeedbackType(isActive ? null : type)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? cn(color.bg, color.text, 'ring-2 ring-offset-2 ring-offset-ink-950', color.ring)
                  : 'bg-ink-800 text-paper-100 hover:bg-ink-700'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', color.dot)} />
              <span className="text-xs">{meta.emoji}</span>
              <span className="hidden sm:inline">{meta.label}</span>
            </button>
          )
        })}
        <Button
          size="sm"
          disabled={!activeFeedbackType}
          onClick={() => {}}
          className="ml-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          添加反馈
        </Button>
      </footer>

      {activeFeedbackType && !selecting && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 bg-ink-800 text-paper-100 px-4 py-2 rounded-lg text-sm shadow-lg animate-fade-up">
          在漫画页面上拖拽选择区域 · ESC 取消
        </div>
      )}

      <Modal
        open={submitModalOpen && !!activeFeedbackType}
        onClose={handleCloseSubmitModal}
        title="提交反馈"
      >
        <div className="space-y-4">
          {activeFeedbackType && (
            <div className="flex items-center justify-center py-2">
              <FeedbackBadge type={activeFeedbackType} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-paper-200 mb-1.5">您的昵称</label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="请输入昵称"
              className="w-full px-3 py-2 rounded-lg bg-ink-800 border border-ink-700 text-paper-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-paper-200 mb-1.5">反馈内容</label>
            <textarea
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="请描述您的反馈..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-ink-800 border border-ink-700 text-paper-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={handleCloseSubmitModal}>
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitFeedback}
              disabled={!reviewerName.trim() || !feedbackContent.trim()}
            >
              提交
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!expandedFeedbackId}
        onClose={() => setExpandedFeedbackId(null)}
        title="反馈详情"
      >
        {(() => {
          const feedback = feedbacks.find((f) => f.id === expandedFeedbackId) as Feedback | undefined
          if (!feedback) return null
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FeedbackBadge type={feedback.type} />
                <RoleBadge role={feedback.role} size="sm" />
              </div>
              <div className="bg-ink-800 rounded-lg p-4">
                <p className="text-paper-100 leading-relaxed whitespace-pre-wrap">{feedback.content}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">评论者</span>
                <span className="text-paper-200 font-medium">{feedback.reviewerName}</span>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
