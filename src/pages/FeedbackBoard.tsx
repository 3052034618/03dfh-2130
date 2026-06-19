import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, SlidersHorizontal, Eye, GitCompare, Download, LayoutGrid, List, ChevronDown, ChevronUp, ChevronRight, CheckCircle2, XCircle, CheckSquare, Square, MoreHorizontal } from 'lucide-react'
import type { Feedback, FeedbackType, FeedbackStatus, ReaderRole } from '@shared/types'
import { FEEDBACK_TYPE_META, ROLE_META, STATUS_META } from '@/utils/constants'
import { cn, formatDate } from '@/utils/helpers'
import FeedbackBadge from '@/components/FeedbackBadge'
import RoleBadge from '@/components/RoleBadge'
import StatusBadge from '@/components/StatusBadge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { useAppStore } from '@/store/app'

const FEEDBACK_TYPES: FeedbackType[] = ['confusing', 'slow', 'funny', 'cute', 'detail']
const STATUSES: FeedbackStatus[] = ['pending', 'resolved', 'ignored']
const ROLES: ReaderRole[] = ['editor', 'assistant', 'fan']

const FEEDBACK_RING_COLORS: Record<FeedbackType, string> = {
  confusing: '#f59e0b',
  slow: '#3b82f6',
  funny: '#f97316',
  cute: '#ec4899',
  detail: '#8b5cf6',
}

const FEEDBACK_BG_COLORS: Record<FeedbackType, string> = {
  confusing: 'rgba(245, 158, 11, 0.1)',
  slow: 'rgba(59, 130, 246, 0.1)',
  funny: 'rgba(249, 115, 22, 0.1)',
  cute: 'rgba(236, 72, 153, 0.1)',
  detail: 'rgba(139, 92, 246, 0.1)',
}

export default function FeedbackBoard() {
  const { workId } = useParams<{ workId: string }>()
  const navigate = useNavigate()
  const {
    currentWork,
    chapters,
    pages,
    feedbacks: allFeedbacks,
    fetchWorkDetail,
    fetchFeedbacks,
    updateFeedbackStatus,
    updateFeedbacksBatch,
  } = useAppStore()

  useEffect(() => {
    if (workId) {
      fetchWorkDetail(workId)
      fetchFeedbacks(workId)
    }
  }, [workId, fetchWorkDetail, fetchFeedbacks])

  const work = currentWork

  const [selectedRole, setSelectedRole] = useState<ReaderRole | 'all'>('all')
  const [selectedTypes, setSelectedTypes] = useState<Set<FeedbackType>>(new Set(FEEDBACK_TYPES))
  const [selectedStatuses, setSelectedStatuses] = useState<Set<FeedbackStatus>>(new Set(STATUSES))
  const [viewMode, setViewMode] = useState<'list' | 'aggregate'>('list')
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null)
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement>(null)
  const [highlightedFeedbackId, setHighlightedFeedbackId] = useState<string | null>(null)

  const filteredFeedbacks = useMemo(() => {
    return allFeedbacks.filter((fb) => {
      if (selectedRole !== 'all' && fb.role !== selectedRole) return false
      if (!selectedTypes.has(fb.type)) return false
      if (!selectedStatuses.has(fb.status)) return false
      return true
    })
  }, [allFeedbacks, selectedRole, selectedTypes, selectedStatuses])

  const typeStats = useMemo(() => {
    const stats: Record<FeedbackType, number> = {
      confusing: 0,
      slow: 0,
      funny: 0,
      cute: 0,
      detail: 0,
    }
    filteredFeedbacks.forEach((fb) => {
      stats[fb.type]++
    })
    return stats
  }, [filteredFeedbacks])

  const totalFeedbacks = filteredFeedbacks.length

  const toggleType = (type: FeedbackType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const toggleStatus = (status: FeedbackStatus) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  const getPageForFeedback = (feedback: Feedback) => {
    return pages.find((p) => p.id === feedback.pageId)
  }

  const handleFeedbackClick = (feedback: Feedback) => {
    const page = getPageForFeedback(feedback)
    if (page) {
      navigate(`/work/${workId}/compare/${page.pageIndex}?feedbackId=${feedback.id}`)
    }
  }

  const handleStatusChange = async (feedbackId: string, newStatus?: FeedbackStatus) => {
    if (!newStatus) return
    await updateFeedbackStatus(feedbackId, newStatus)
  }

  const toggleSelectFeedback = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAllFiltered = () => {
    const ids = filteredFeedbacks.map((fb) => fb.id)
    setSelectedIds(new Set(ids))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleBatchUpdate = async (status: FeedbackStatus) => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    await updateFeedbacksBatch(ids, status)
    clearSelection()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterId((prev) => (prev === chapterId ? null : chapterId))
  }

  const chapterPageGroups = useMemo(() => {
    const pageFeedbackMap = new Map<string, Feedback[]>()
    filteredFeedbacks.forEach((fb) => {
      const list = pageFeedbackMap.get(fb.pageId) || []
      list.push(fb)
      pageFeedbackMap.set(fb.pageId, list)
    })

    return chapters.map((chapter) => {
      const chapterPages = pages
        .filter((p) => p.chapterId === chapter.id)
        .sort((a, b) => a.pageIndex - b.pageIndex)
        .map((page) => ({
          page,
          feedbacks: pageFeedbackMap.get(page.id) || [],
        }))
      return { chapter, pages: chapterPages }
    })
  }, [chapters, pages, filteredFeedbacks])

  const getFeedbacksForExport = (scope: 'all' | 'chapter' | 'page'): Feedback[] => {
    if (scope === 'all') {
      return filteredFeedbacks
    }
    if (scope === 'chapter' && expandedChapterId) {
      return filteredFeedbacks.filter((fb) => {
        const p = pages.find((p) => p.id === fb.pageId)
        return p?.chapterId === expandedChapterId
      })
    }
    if (scope === 'page' && expandedPageId) {
      return filteredFeedbacks.filter((fb) => fb.pageId === expandedPageId)
    }
    return filteredFeedbacks
  }

  const getExportFileName = (scope: 'all' | 'chapter' | 'page'): string => {
    const base = `反馈导出_${work?.title || '未知'}`
    const date = new Date().toISOString().slice(0, 10)
    if (scope === 'chapter' && expandedChapterId) {
      const chapter = chapters.find((c) => c.id === expandedChapterId)
      if (chapter) {
        return `${base}_${chapter.title}_${date}.csv`
      }
    }
    if (scope === 'page' && expandedPageId) {
      const page = pages.find((p) => p.id === expandedPageId)
      if (page) {
        const chapter = chapters.find((c) => c.id === page.chapterId)
        const chapterPart = chapter ? `${chapter.title}_` : ''
        return `${base}_${chapterPart}P${page.pageIndex + 1}_${date}.csv`
      }
    }
    return `${base}_${date}.csv`
  }

  const exportCSV = (scope: 'all' | 'chapter' | 'page' = 'all') => {
    const feedbacksToExport = getFeedbacksForExport(scope)
    if (feedbacksToExport.length === 0) return

    const BOM = '\uFEFF'
    const header = '序号,作品名,章节名,页码,反馈类型,反馈内容,评论者,角色,状态,区域(x,y,w,h),提交时间'
    const rows = feedbacksToExport.map((fb, i) => {
      const page = pages.find((p) => p.id === fb.pageId)
      const chapter = page ? chapters.find((c) => c.id === page.chapterId) : undefined
      return [
        i + 1,
        work?.title || '',
        chapter?.title || '',
        page ? `P${page.pageIndex + 1}` : '',
        FEEDBACK_TYPE_META[fb.type].label,
        `"${fb.content.replace(/"/g, '""')}"`,
        fb.reviewerName,
        ROLE_META[fb.role].label,
        STATUS_META[fb.status].label,
        `(${fb.region.x},${fb.region.y},${fb.region.width},${fb.region.height})`,
        formatDate(fb.createdAt),
      ].join(',')
    })
    const csv = BOM + header + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getExportFileName(scope)
    a.click()
    URL.revokeObjectURL(url)
    setExportDropdownOpen(false)
  }

  const getCountColor = (count: number) => {
    if (count === 0) return 'bg-gray-500'
    if (count <= 2) return 'bg-green-500'
    if (count <= 4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex min-h-screen bg-ink-950 text-paper-100">
      <aside className="fixed left-0 top-0 h-screen w-64 overflow-y-auto border-r border-ink-800 bg-ink-900">
        <div className="flex items-center gap-2 p-5 border-b border-ink-800">
          <SlidersHorizontal className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-bold font-display">筛选条件</h2>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-paper-200 mb-3">角色筛选</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRole('all')}
                className={cn(
                  'rounded-full px-3 py-1 text-sm transition-colors',
                  selectedRole === 'all'
                    ? 'bg-accent text-white'
                    : 'bg-ink-800 text-paper-100 hover:bg-ink-700'
                )}
              >
                全部
              </button>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    'rounded-full px-3 py-1 text-sm transition-colors',
                    selectedRole === role
                      ? 'bg-accent text-white'
                      : 'bg-ink-800 text-paper-100 hover:bg-ink-700'
                  )}
                >
                  {ROLE_META[role].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-paper-200 mb-3">反馈类型</h3>
            <div className="space-y-2">
              {FEEDBACK_TYPES.map((type) => {
                const meta = FEEDBACK_TYPE_META[type]
                const checked = selectedTypes.has(type)
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer hover:bg-ink-800/50 p-1.5 rounded-md transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleType(type)}
                      className="h-4 w-4 rounded border-ink-600 bg-ink-800 text-accent focus:ring-accent"
                    />
                    <span className="text-sm">{meta.emoji}</span>
                    <span className="text-sm">{meta.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-paper-200 mb-3">状态筛选</h3>
            <div className="space-y-2">
              {STATUSES.map((status) => {
                const meta = STATUS_META[status]
                const checked = selectedStatuses.has(status)
                return (
                  <label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer hover:bg-ink-800/50 p-1.5 rounded-md transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStatus(status)}
                      className="h-4 w-4 rounded border-ink-600 bg-ink-800 text-accent focus:ring-accent"
                    />
                    <span
                      className={cn('w-2 h-2 rounded-full', {
                        'bg-orange-500': status === 'pending',
                        'bg-green-500': status === 'resolved',
                        'bg-gray-500': status === 'ignored',
                      })}
                    />
                    <span className="text-sm">{meta.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-paper-200 mb-3">统计面板</h3>
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-paper-200">总反馈数</span>
                <span className="text-lg font-bold">{totalFeedbacks}</span>
              </div>
              <div className="space-y-2.5">
                {FEEDBACK_TYPES.map((type) => {
                  const count = typeStats[type]
                  const percent = totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0
                  const colorClass = {
                    confusing: 'bg-feedback-confusing',
                    slow: 'bg-feedback-slow',
                    funny: 'bg-feedback-funny',
                    cute: 'bg-feedback-cute',
                    detail: 'bg-feedback-detail',
                  }[type]
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{FEEDBACK_TYPE_META[type].emoji}</span>
                          <span className="text-xs text-paper-200">{FEEDBACK_TYPE_META[type].label}</span>
                        </div>
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-ink-800 bg-ink-900/95 backdrop-blur px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-paper-100 hover:bg-ink-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            返回
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-display">{work?.title || '作品'}</h1>
            <p className="text-sm text-paper-200">反馈看板 · 共 {filteredFeedbacks.length} 条反馈</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 mr-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30">
                <span className="text-sm text-accent font-medium">已选 {selectedIds.size} 条</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBatchUpdate('resolved')}
                  className="!py-1 !px-2 text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  标记已解决
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBatchUpdate('ignored')}
                  className="!py-1 !px-2 text-xs"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  标记忽略
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllFiltered}
                  className="!py-1 !px-2 text-xs"
                >
                  <CheckSquare className="h-3.5 w-3.5 mr-1" />
                  全选当前筛选
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="!py-1 !px-2 text-xs"
                >
                  清空选择
                </Button>
              </div>
            )}
            <div className="flex items-center rounded-lg border border-ink-700 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1.5 text-sm transition-colors',
                  viewMode === 'list' ? 'bg-accent text-white' : 'text-paper-200 hover:bg-ink-800'
                )}
              >
                <List className="h-3.5 w-3.5" />
                列表
              </button>
              <button
                onClick={() => setViewMode('aggregate')}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1.5 text-sm transition-colors',
                  viewMode === 'aggregate' ? 'bg-accent text-white' : 'text-paper-200 hover:bg-ink-800'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                聚合
              </button>
            </div>
            <div className="relative" ref={exportDropdownRef}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              >
                <Download className="h-4 w-4 mr-1.5" />
                导出 CSV
                <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
              </Button>
              {exportDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-ink-700 bg-ink-900 shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => exportCSV('all')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-ink-800 transition-colors flex items-center gap-2"
                  >
                    <Download className="h-3.5 w-3.5 text-paper-200" />
                    导出全部（当前筛选）
                  </button>
                  <button
                    onClick={() => viewMode === 'aggregate' && expandedChapterId && exportCSV('chapter')}
                    disabled={!(viewMode === 'aggregate' && expandedChapterId)}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2',
                      viewMode === 'aggregate' && expandedChapterId
                        ? 'hover:bg-ink-800'
                        : 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Download className="h-3.5 w-3.5 text-paper-200" />
                    导出当前章节
                  </button>
                  <button
                    onClick={() => expandedPageId && exportCSV('page')}
                    disabled={!expandedPageId}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2',
                      expandedPageId ? 'hover:bg-ink-800' : 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Download className="h-3.5 w-3.5 text-paper-200" />
                    导出当前页面
                  </button>
                </div>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              <Eye className="h-4 w-4 mr-1.5" />
              浏览阅读
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/work/${workId}/compare/0`)}
            >
              <GitCompare className="h-4 w-4 mr-1.5" />
              版本对照
            </Button>
          </div>
        </header>

        <div className="p-6">
          {filteredFeedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-paper-200">暂无符合条件的反馈</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-3">
              {filteredFeedbacks.map((feedback) => {
                const page = getPageForFeedback(feedback)
                const isSelected = selectedIds.has(feedback.id)
                return (
                  <Card
                    key={feedback.id}
                    hover
                    className={cn('cursor-pointer', isSelected && 'ring-2 ring-accent')}
                    onClick={() => handleFeedbackClick(feedback)}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-24 h-36 flex-shrink-0 overflow-hidden rounded-lg border border-ink-700 bg-ink-800">
                        <div
                          className="absolute top-1 left-1 z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelectFeedback(feedback.id)
                          }}
                        >
                          <button className="p-0.5 rounded bg-black/40 hover:bg-black/60 transition-colors">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-accent" />
                            ) : (
                              <Square className="h-4 w-4 text-paper-100/80" />
                            )}
                          </button>
                        </div>
                        {page && (
                          <>
                            <img
                              src={page.imageUrl}
                              alt={`第 ${page.pageIndex + 1} 页`}
                              className="w-full h-full object-cover"
                            />
                            <div
                              className="absolute border-2 border-accent rounded-sm pointer-events-none"
                              style={{
                                left: `${feedback.region.x * 100}%`,
                                top: `${feedback.region.y * 100}%`,
                                width: `${feedback.region.width * 100}%`,
                                height: `${feedback.region.height * 100}%`,
                              }}
                            />
                          </>
                        )}
                        <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs">
                          P{(page?.pageIndex ?? 0) + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <FeedbackBadge type={feedback.type} size="sm" />
                          <div
                            className="flex items-center gap-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <RoleBadge role={feedback.role} size="sm" />
                            <span className="text-xs text-ink-500">
                              {formatDate(feedback.createdAt)}
                            </span>
                            <StatusBadge
                              status={feedback.status}
                              showDropdown
                              onClick={(newStatus) => handleStatusChange(feedback.id, newStatus)}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-paper-100 line-clamp-2 leading-relaxed">
                          {feedback.content}
                        </p>
                        <p className="mt-2 text-xs text-ink-500">
                          — {feedback.reviewerName}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {chapterPageGroups.map(({ chapter, pages: chapterPages }) => {
                const isChapterExpanded = expandedChapterId === chapter.id || expandedChapterId === null
                return (
                  <div key={chapter.id}>
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="p-1 rounded hover:bg-ink-800 transition-colors"
                      >
                        {isChapterExpanded ? (
                          <ChevronDown className="h-4 w-4 text-paper-200" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-paper-200" />
                        )}
                      </button>
                      <h2 className="text-lg font-bold font-display">{chapter.title}</h2>
                      <span className="text-xs text-ink-500">
                        ({chapterPages.reduce((sum, cp) => sum + cp.feedbacks.length, 0)} 条反馈)
                      </span>
                    </div>
                    {isChapterExpanded && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ml-6">
                    {chapterPages.map(({ page, feedbacks: pageFeedbacks }) => {
                      const count = pageFeedbacks.length
                      const isExpanded = expandedPageId === page.id
                      const typeDist: Record<FeedbackType, number> = {
                        confusing: 0, slow: 0, funny: 0, cute: 0, detail: 0,
                      }
                      pageFeedbacks.forEach((fb) => { typeDist[fb.type]++ })

                      return (
                        <div key={page.id}>
                          <button
                            onClick={() => setExpandedPageId(isExpanded ? null : page.id)}
                            className="w-full text-left"
                          >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-ink-700 bg-ink-800">
                              <img
                                src={page.imageUrl}
                                alt={`第 ${page.pageIndex + 1} 页`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs">
                                P{page.pageIndex + 1}
                              </div>
                              <div
                                className={cn(
                                  'absolute top-1 right-1 rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 text-xs font-bold text-white',
                                  getCountColor(count)
                                )}
                              >
                                {count}
                              </div>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs text-paper-200">P{page.pageIndex + 1}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5 text-paper-200" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-paper-200" />
                              )}
                            </div>
                          </button>

                          <div className="h-1.5 mt-1.5 rounded-full bg-ink-800 overflow-hidden flex">
                            {count > 0 && FEEDBACK_TYPES.map((type) => {
                              const typeCount = typeDist[type]
                              if (typeCount === 0) return null
                              const colorClass = {
                                confusing: 'bg-feedback-confusing',
                                slow: 'bg-feedback-slow',
                                funny: 'bg-feedback-funny',
                                cute: 'bg-feedback-cute',
                                detail: 'bg-feedback-detail',
                              }[type]
                              return (
                                <div
                                  key={type}
                                  className={cn('h-full', colorClass)}
                                  style={{ width: `${(typeCount / count) * 100}%` }}
                                />
                              )
                            })}
                          </div>

                          {isExpanded && pageFeedbacks.length > 0 && (
                            <div className="mt-2 flex flex-col gap-2">
                              <div className="relative aspect-[3/4] max-w-md mx-auto border-2 border-ink-700 rounded-lg overflow-hidden">
                                <img
                                  src={page.imageUrl}
                                  alt={`第 ${page.pageIndex + 1} 页`}
                                  className="w-full h-full object-cover"
                                />
                                {pageFeedbacks.map((fb, idx) => {
                                  const isHighlighted = highlightedFeedbackId === fb.id
                                  const ringColor = FEEDBACK_RING_COLORS[fb.type]
                                  const bgColor = FEEDBACK_BG_COLORS[fb.type]
                                  return (
                                    <div
                                      key={fb.id}
                                      className={cn(
                                        'absolute border-2 rounded-md transition-all duration-200 cursor-pointer',
                                        isHighlighted && 'z-10 scale-[1.02]'
                                      )}
                                      style={{
                                        left: `${fb.region.x * 100}%`,
                                        top: `${fb.region.y * 100}%`,
                                        width: `${fb.region.width * 100}%`,
                                        height: `${fb.region.height * 100}%`,
                                        borderColor: ringColor,
                                        borderWidth: isHighlighted ? '3px' : '2px',
                                        backgroundColor: bgColor,
                                        boxShadow: isHighlighted ? `0 0 12px ${ringColor}` : undefined,
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setHighlightedFeedbackId(
                                          highlightedFeedbackId === fb.id ? null : fb.id
                                        )
                                      }}
                                    >
                                      <span
                                        className="absolute -top-2 -left-2 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                                        style={{ backgroundColor: ringColor }}
                                      >
                                        {idx + 1}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>

                              {pageFeedbacks.map((feedback, idx) => {
                                const isHighlighted = highlightedFeedbackId === feedback.id
                                const isSelected = selectedIds.has(feedback.id)
                                const ringColor = FEEDBACK_RING_COLORS[feedback.type]
                                return (
                                  <Card
                                    key={feedback.id}
                                    hover
                                    className={cn(
                                      'cursor-pointer !p-2.5 transition-all duration-200',
                                      isHighlighted && 'ring-2',
                                      isSelected && 'ring-2 ring-accent'
                                    )}
                                    style={{
                                      boxShadow: isHighlighted ? `0 0 0 2px ${ringColor}` : undefined,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setHighlightedFeedbackId(
                                        highlightedFeedbackId === feedback.id ? null : feedback.id
                                      )
                                    }}
                                    onDoubleClick={() => handleFeedbackClick(feedback)}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleSelectFeedback(feedback.id)
                                        }}
                                      >
                                        <button className="p-0.5 rounded hover:bg-ink-800 transition-colors mt-0.5">
                                          {isSelected ? (
                                            <CheckSquare className="h-4 w-4 text-accent" />
                                          ) : (
                                            <Square className="h-4 w-4 text-paper-100/80" />
                                          )}
                                        </button>
                                      </div>
                                      <span
                                        className="flex-shrink-0 mt-0.5 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                        style={{ backgroundColor: ringColor }}
                                      >
                                        {idx + 1}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <FeedbackBadge type={feedback.type} size="sm" />
                                          <div
                                            className="flex items-center gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <RoleBadge role={feedback.role} size="sm" />
                                            <StatusBadge
                                              status={feedback.status}
                                              showDropdown
                                              onClick={(newStatus) => handleStatusChange(feedback.id, newStatus)}
                                            />
                                          </div>
                                        </div>
                                        <p className="text-xs text-paper-100 line-clamp-2 leading-relaxed">
                                          {feedback.content}
                                        </p>
                                        <p className="mt-1 text-xs text-ink-500">
                                          — {feedback.reviewerName} · {formatDate(feedback.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                  </Card>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  )}
                </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
