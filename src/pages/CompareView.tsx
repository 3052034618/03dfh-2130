import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, GitCompare } from 'lucide-react'
import type { Feedback, FeedbackType, Page as PageType } from '@shared/types'
import { FEEDBACK_TYPE_META, ROLE_META } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import { useAppStore } from '@/store/app'
import Button from '@/components/Button'
import FeedbackBadge from '@/components/FeedbackBadge'

const FEEDBACK_COLORS: Record<FeedbackType, string> = {
  confusing: '#2563eb',
  slow: '#7c3aed',
  funny: '#ca8a04',
  cute: '#db2777',
  detail: '#dc2626',
}

export default function CompareView() {
  const { workId, pageIndex } = useParams<{ workId: string; pageIndex: string }>()
  const [searchParams] = useSearchParams()
  const feedbackId = searchParams.get('feedbackId')
  const navigate = useNavigate()

  const {
    currentWork,
    chapters,
    pages,
    feedbacks,
    fetchWorkDetail,
    fetchFeedbacks,
  } = useAppStore()

  useEffect(() => {
    if (workId) {
      fetchWorkDetail(workId)
      fetchFeedbacks(workId)
    }
  }, [workId, fetchWorkDetail, fetchFeedbacks])

  const work = currentWork
  const currentChapter = chapters[0]

  const allPages = useMemo(() => {
    return pages.filter((p) => p.chapterId === currentChapter?.id)
  }, [pages, currentChapter])

  const currentIdx = Math.min(
    Math.max(Number(pageIndex) || 0, 0),
    Math.max(allPages.length - 1, 0)
  )
  const currentPage = allPages[currentIdx]

  const pageFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => f.pageId === currentPage?.id)
  }, [feedbacks, currentPage])

  const [leftFlex, setLeftFlex] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const [hoveredFeedbackId, setHoveredFeedbackId] = useState<string | null>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const totalWidth = rect.width - 4
      const newLeftFlex = Math.max(0.3, Math.min(2.3, (relativeX / totalWidth) * 2))
      setLeftFlex(newLeftFlex)
    },
    []
  )

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const goToPage = (idx: number) => {
    const target = Math.max(0, Math.min(idx, allPages.length - 1))
    navigate(`/work/${workId}/compare/${target}`)
  }

  const rightFlex = 2 - leftFlex + 1

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-paper-100">
      <header className="sticky top-0 z-20 border-b border-ink-800 bg-ink-900/95 backdrop-blur">
        <div className="flex items-center gap-4 px-6 py-3">
          <button
            onClick={() => navigate(`/work/${workId}/feedback`)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-paper-100 hover:bg-ink-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            返回看板
          </button>
          <div className="h-5 w-px bg-ink-700" />
          <div className="flex-1">
            <h1 className="text-base font-bold font-display">{work?.title || '作品'}</h1>
            <p className="text-xs text-paper-200">{currentChapter?.title || '章节'}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-ink-800 px-2 py-1">
            <button
              onClick={() => goToPage(currentIdx - 1)}
              disabled={currentIdx === 0}
              className="rounded p-1 text-paper-100 hover:bg-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[80px] text-center text-sm font-medium">
              第 {currentIdx + 1} / {allPages.length} 页
            </span>
            <button
              onClick={() => goToPage(currentIdx + 1)}
              disabled={currentIdx === allPages.length - 1}
              className="rounded p-1 text-paper-100 hover:bg-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              <Eye className="h-4 w-4 mr-1.5" />
              阅读
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/work/${workId}/feedback`)}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              看板
            </Button>
            <Button variant="primary" size="sm">
              <GitCompare className="h-4 w-4 mr-1.5" />
              对照
            </Button>
          </div>
        </div>
      </header>

      <div
        ref={containerRef}
        className="flex flex-1 min-h-0 overflow-hidden"
      >
        <div
          className="flex flex-col border-r border-ink-800 overflow-hidden"
          style={{ flex: leftFlex }}
        >
          <div className="flex items-center justify-between border-b border-ink-800 bg-ink-900 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-feedback-confusing/20 text-xs font-bold text-feedback-confusing">
                旧
              </span>
              <span className="text-sm font-medium">旧版本 v1</span>
            </div>
            <span className="text-xs text-ink-500">{pageFeedbacks.length} 条反馈</span>
          </div>
          <div className="flex-1 overflow-auto bg-ink-950 p-8">
            <div className="relative mx-auto max-w-[500px]">
              {currentPage ? (
                <>
                  <img
                    src={currentPage.imageUrl}
                    alt="旧版本"
                    className="w-full rounded-lg shadow-2xl"
                    draggable={false}
                  />
                  {pageFeedbacks.map((fb) => {
                    const color = FEEDBACK_COLORS[fb.type]
                    const isHighlighted = fb.id === feedbackId
                    const isHovered = hoveredFeedbackId === fb.id
                    const centerX = fb.region.x + fb.region.width / 2
                    const centerY = fb.region.y + fb.region.height / 2

                    return (
                      <div key={fb.id}>
                        <div
                          className={cn(
                            'absolute transition-all duration-300',
                            isHighlighted && 'z-10'
                          )}
                          style={{
                            left: `${fb.region.x * 100}%`,
                            top: `${fb.region.y * 100}%`,
                            width: `${fb.region.width * 100}%`,
                            height: `${fb.region.height * 100}%`,
                          }}
                        >
                          <div
                            className={cn(
                              'h-full w-full rounded-sm border-2',
                              isHighlighted ? 'animate-pulse-ring' : ''
                            )}
                            style={{
                              borderColor: color,
                              backgroundColor: `${color}22`,
                            }}
                          />
                        </div>
                        <div
                          className={cn(
                            'absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-150',
                            isHovered && 'scale-125'
                          )}
                          style={{ left: `${centerX * 100}%`, top: `${centerY * 100}%` }}
                          onMouseEnter={() => setHoveredFeedbackId(fb.id)}
                          onMouseLeave={() => setHoveredFeedbackId(null)}
                        >
                          <div className="relative">
                            <span
                              className={cn(
                                'absolute inset-0 rounded-full animate-pulse-ring opacity-60'
                              )}
                              style={{ backgroundColor: color }}
                            />
                            <span
                              className="relative block w-5 h-5 rounded-full ring-2 ring-white/80 shadow-lg"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        </div>
                        {isHovered && (
                          <div
                            className="absolute z-20 min-w-64 max-w-xs p-3 rounded-lg shadow-xl bg-ink-900 border border-ink-700 animate-fade-up pointer-events-none"
                            style={{
                              left: `${centerX * 100}%`,
                              top: `${centerY * 100}%`,
                              transform: 'translate(-50%, -120%)',
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <FeedbackBadge type={fb.type} size="sm" />
                              <span className="text-xs text-ink-400">
                                {ROLE_META[fb.role].label}
                              </span>
                            </div>
                            <p className="text-sm text-paper-100 line-clamp-2">{fb.content}</p>
                            <p className="mt-1 text-xs text-ink-500">— {fb.reviewerName}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="flex items-center justify-center py-24 text-paper-200">
                  暂无页面
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="group relative w-1 cursor-col-resize bg-ink-800 hover:bg-accent transition-colors flex-shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-700 px-1.5 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-1">
              <div className="h-0.5 w-4 rounded-full bg-paper-100" />
              <div className="h-0.5 w-4 rounded-full bg-paper-100" />
              <div className="h-0.5 w-4 rounded-full bg-paper-100" />
            </div>
          </div>
        </div>

        <div
          className="flex flex-col overflow-hidden"
          style={{ flex: rightFlex }}
        >
          <div className="flex items-center justify-between border-b border-ink-800 bg-ink-900 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">
                新
              </span>
              <span className="text-sm font-medium">新版本 v2</span>
              <span className="text-xs text-ink-500">(预览版)</span>
            </div>
            <span className="text-xs text-ink-500">显示原反馈位置映射</span>
          </div>
          <div className="flex-1 overflow-auto bg-ink-950 p-8">
            <div className="relative mx-auto max-w-[500px]">
              {currentPage ? (
                <>
                  <div className="relative">
                    <img
                      src={currentPage.imageUrl}
                      alt="新版本"
                      className="w-full rounded-lg shadow-2xl"
                      draggable={false}
                    />
                    <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded font-medium">
                      新版
                    </div>
                  </div>
                  {pageFeedbacks.map((fb) => {
                    const color = FEEDBACK_COLORS[fb.type]
                    const isHighlighted = fb.id === feedbackId
                    const isHovered = hoveredFeedbackId === fb.id
                    const centerX = fb.region.x + fb.region.width / 2
                    const centerY = fb.region.y + fb.region.height / 2

                    return (
                      <div key={fb.id}>
                        <div
                          className={cn(
                            'absolute transition-all duration-300',
                            isHighlighted && 'z-10'
                          )}
                          style={{
                            left: `${fb.region.x * 100}%`,
                            top: `${fb.region.y * 100}%`,
                            width: `${fb.region.width * 100}%`,
                            height: `${fb.region.height * 100}%`,
                          }}
                        >
                          <div
                            className="h-full w-full rounded-sm border-2 border-dashed"
                            style={{
                              borderColor: color,
                              backgroundColor: 'transparent',
                              opacity: 0.6,
                            }}
                          />
                        </div>
                        <div
                          className={cn(
                            'absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-150',
                            isHovered && 'scale-125'
                          )}
                          style={{ left: `${centerX * 100}%`, top: `${centerY * 100}%` }}
                          onMouseEnter={() => setHoveredFeedbackId(fb.id)}
                          onMouseLeave={() => setHoveredFeedbackId(null)}
                        >
                          <div className="relative">
                            <span
                              className="relative block w-5 h-5 rounded-full ring-2 ring-white/50 shadow-lg opacity-60"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        </div>
                        {isHovered && (
                          <div
                            className="absolute z-20 min-w-64 max-w-xs p-3 rounded-lg shadow-xl bg-ink-900/80 border border-ink-700/60 animate-fade-up pointer-events-none backdrop-blur-sm"
                            style={{
                              left: `${centerX * 100}%`,
                              top: `${centerY * 100}%`,
                              transform: 'translate(-50%, -120%)',
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <FeedbackBadge type={fb.type} size="sm" />
                              <span className="text-xs text-ink-400">原反馈位置</span>
                            </div>
                            <p className="text-sm text-paper-100/80 line-clamp-2">{fb.content}</p>
                            <p className="mt-1 text-xs text-ink-500">— {fb.reviewerName}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="flex items-center justify-center py-24 text-paper-200">
                  暂无新版本页面
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-ink-800 bg-ink-900 px-6 py-2">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="text-xs text-paper-200 flex-shrink-0">缩略导航：</span>
          <div className="flex gap-2">
            {allPages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => goToPage(idx)}
                className={cn(
                  'relative flex-shrink-0 rounded-md border-2 overflow-hidden transition-all',
                  idx === currentIdx
                    ? 'border-accent shadow-lg shadow-accent/20'
                    : 'border-ink-800 hover:border-ink-600'
                )}
              >
                <img
                  src={p.imageUrl}
                  alt={`第 ${idx + 1} 页`}
                  className="h-14 w-10 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-[10px] text-center">
                  {idx + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
