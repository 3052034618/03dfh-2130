import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, SlidersHorizontal, Eye, GitCompare, Download, LayoutGrid, List, ChevronDown, ChevronUp } from 'lucide-react'
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

  const exportCSV = () => {
    const BOM = '\uFEFF'
    const header = '序号,反馈类型,反馈内容,评论者,角色,状态,页码,区域(x,y,w,h),提交时间'
    const rows = filteredFeedbacks.map((fb, i) => {
      const page = pages.find(p => p.id === fb.pageId)
      return [
        i + 1,
        FEEDBACK_TYPE_META[fb.type].label,
        `"${fb.content.replace(/"/g, '""')}"`,
        fb.reviewerName,
        ROLE_META[fb.role].label,
        STATUS_META[fb.status].label,
        page ? `P${page.pageIndex + 1}` : '',
        `(${fb.region.x},${fb.region.y},${fb.region.width},${fb.region.height})`,
        formatDate(fb.createdAt),
      ].join(',')
    })
    const csv = BOM + header + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `反馈导出_${work?.title || '未知'}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
            <Button variant="secondary" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-1.5" />
              导出 CSV
            </Button>
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
                return (
                  <Card
                    key={feedback.id}
                    hover
                    className="cursor-pointer"
                    onClick={() => handleFeedbackClick(feedback)}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-24 h-36 flex-shrink-0 overflow-hidden rounded-lg border border-ink-700 bg-ink-800">
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
              {chapterPageGroups.map(({ chapter, pages: chapterPages }) => (
                <div key={chapter.id}>
                  <h2 className="text-lg font-bold font-display mb-4">{chapter.title}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                              {pageFeedbacks.map((feedback) => (
                                <Card
                                  key={feedback.id}
                                  hover
                                  className="cursor-pointer !p-2.5"
                                  onClick={() => handleFeedbackClick(feedback)}
                                >
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
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
