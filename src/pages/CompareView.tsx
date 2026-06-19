import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, SlidersHorizontal, Eye, GitCompare } from 'lucide-react'
import type { Feedback, FeedbackType, Page as PageType } from '@shared/types'
import { FEEDBACK_TYPE_META } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import Button from '@/components/Button'
import { generateMockData } from '../../api/data/mockData'

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
  const mockData = useMemo(() => generateMockData(), [])

  const work = mockData.works.find((w) => w.id === workId) || mockData.works[0]
  const chapters = mockData.chapters.filter((c) => c.workId === (work?.id || ''))
  const currentChapter = chapters[0]

  const allPages = mockData.pages.filter((p) => p.chapterId === currentChapter?.id)
  const currentIdx = Math.min(
    Math.max(parseInt(pageIndex || '0', 10), 0),
    allPages.length - 1
  )
  const currentPage = allPages[currentIdx]

  const oldVersionPages = useMemo(() => {
    return allPages.filter((p) => p.version === 1)
  }, [allPages])

  const newVersionPages = useMemo(() => {
    const result: PageType[] = []
    allPages.forEach((p) => {
      if (p.version === 1) {
        result.push({
          ...p,
          id: `${p.id}-v2`,
          version: 2,
          imageUrl: p.imageUrl.replace(/seed\/comic(\d+)/, 'seed/comic$1-v2'),
          createdAt: new Date(Date.now() + 86400000).toISOString(),
        })
      }
    })
    return result
  }, [allPages])

  const oldPage = oldVersionPages[currentIdx]
  const newPage = newVersionPages[currentIdx]
  const hasNewVersion = newVersionPages.length > 0

  const pageFeedbacks = useMemo(() => {
    return mockData.feedbacks.filter(
      (f) => f.pageId === currentPage?.id || f.pageId === oldPage?.id
    )
  }, [mockData.feedbacks, currentPage, oldPage])

  const [leftFlex, setLeftFlex] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

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
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
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
              {oldPage ? (
                <>
                  <img
                    src={oldPage.imageUrl}
                    alt="旧版本"
                    className="w-full rounded-lg shadow-2xl"
                    draggable={false}
                  />
                  {pageFeedbacks.map((fb) => {
                    const color = FEEDBACK_COLORS[fb.type]
                    const isHighlighted = fb.id === feedbackId
                    return (
                      <div
                        key={fb.id}
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
                        <div
                          className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white shadow-lg"
                          style={{ backgroundColor: color }}
                          title={`${FEEDBACK_TYPE_META[fb.type].label} - ${fb.reviewerName}`}
                        >
                          {FEEDBACK_TYPE_META[fb.type].emoji}
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className="flex items-center justify-center py-24 text-paper-200">
                  暂无旧版本页面
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
              {!hasNewVersion && (
                <span className="text-xs text-ink-500">(预览版)</span>
              )}
            </div>
            <span className="text-xs text-ink-500">显示原反馈位置映射</span>
          </div>
          <div className="flex-1 overflow-auto bg-ink-950 p-8">
            <div className="relative mx-auto max-w-[500px]">
              {newPage ? (
                <>
                  <img
                    src={newPage.imageUrl}
                    alt="新版本"
                    className="w-full rounded-lg shadow-2xl"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = oldPage?.imageUrl || ''
                    }}
                  />
                  {pageFeedbacks.map((fb) => {
                    const color = FEEDBACK_COLORS[fb.type]
                    const isHighlighted = fb.id === feedbackId
                    return (
                      <div
                        key={fb.id}
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
                          }}
                        />
                        <div
                          className="absolute -top-2 -left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-white shadow-lg whitespace-nowrap"
                          style={{ backgroundColor: color }}
                        >
                          <span>{FEEDBACK_TYPE_META[fb.type].emoji}</span>
                          <span>原反馈位置</span>
                        </div>
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
