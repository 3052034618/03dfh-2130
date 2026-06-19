import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  BookOpen,
  Link as LinkIcon,
  Upload,
  Copy,
  Plus,
  Check,
  FileImage,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { useAppStore } from '@/store/app'
import { ROLE_META } from '@/utils/constants'
import { formatDate, cn } from '@/utils/helpers'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Modal from '@/components/Modal'
import Empty from '@/components/Empty'
import RoleBadge from '@/components/RoleBadge'
import FeedbackBadge from '@/components/FeedbackBadge'
import type { ReaderRole, FeedbackType } from '@shared/types'

type TabKey = 'chapters' | 'links'

function ChapterSkeleton() {
  return (
    <div className="animate-pulse p-4 bg-ink-800/50 rounded-lg">
      <div className="h-5 bg-ink-700 rounded w-1/3 mb-2" />
      <div className="h-4 bg-ink-700 rounded w-1/4" />
    </div>
  )
}

function LinkCard({
  role,
  linkUrl,
  expiresAt,
  onGenerate,
}: {
  role: ReaderRole
  linkUrl?: string
  expiresAt?: string
  onGenerate: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!linkUrl) return
    await navigator.clipboard.writeText(linkUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const roleColorMap: Record<ReaderRole, string> = {
    editor: 'border-role-editor/30 bg-role-editor/5',
    assistant: 'border-role-assistant/30 bg-role-assistant/5',
    fan: 'border-role-fan/30 bg-role-fan/5',
  }

  const roleDotMap: Record<ReaderRole, string> = {
    editor: 'bg-role-editor',
    assistant: 'bg-role-assistant',
    fan: 'bg-role-fan',
  }

  const roleIconColorMap: Record<ReaderRole, string> = {
    editor: 'text-cyan-500',
    assistant: 'text-green-500',
    fan: 'text-amber-500',
  }

  return (
    <Card className={cn('border', roleColorMap[role])}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', roleDotMap[role] + '/20')}>
            <LinkIcon className={cn('h-5 w-5', roleIconColorMap[role])} />
          </div>
          <div>
            <RoleBadge role={role} />
          </div>
        </div>
      </div>

      {linkUrl ? (
        <>
          <div className="mb-4">
            <p className="text-xs text-ink-500 mb-1">分享链接</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-ink-900 rounded-lg text-sm text-paper-100 truncate">
                {linkUrl}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </>
                )}
              </Button>
            </div>
          </div>

          {expiresAt && (
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Calendar className="h-4 w-4" />
              有效期至：{formatDate(expiresAt)}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-ink-500 mb-3">暂无生成的链接</p>
          <Button variant="secondary" size="sm" onClick={onGenerate} className="gap-1">
            <Plus className="h-4 w-4" />
            生成链接
          </Button>
        </div>
      )}

      {linkUrl && (
        <div className="mt-4 pt-4 border-t border-ink-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGenerate}
            className="w-full gap-1 text-ink-500 hover:text-paper-100"
          >
            <Plus className="h-4 w-4" />
            重新生成
          </Button>
        </div>
      )}
    </Card>
  )
}

export default function WorkDetail() {
  const { workId } = useParams<{ workId: string }>()
  const navigate = useNavigate()
  const {
    currentWork,
    chapters,
    pages,
    feedbacks,
    links,
    loading,
    fetchWorkDetail,
    fetchFeedbacks,
    fetchLinks,
    createLink,
    createChapter,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<TabKey>('chapters')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [chapterTitle, setChapterTitle] = useState('')

  useEffect(() => {
    if (workId) {
      fetchWorkDetail(workId)
      fetchFeedbacks(workId)
      fetchLinks(workId)
    }
  }, [workId, fetchWorkDetail, fetchFeedbacks, fetchLinks])

  const chaptersWithPageCount = useMemo(() => {
    return chapters.map((chapter) => ({
      ...chapter,
      pageCount: pages.filter((p) => p.chapterId === chapter.id).length,
    }))
  }, [chapters, pages])

  const feedbackStats = useMemo(() => {
    const byType: Record<FeedbackType, number> = {
      confusing: 0,
      slow: 0,
      funny: 0,
      cute: 0,
      detail: 0,
    }
    const byRole: Record<ReaderRole, number> = {
      editor: 0,
      assistant: 0,
      fan: 0,
    }
    feedbacks.forEach((f) => {
      byType[f.type]++
      byRole[f.role]++
    })
    return { byType, byRole, total: feedbacks.length }
  }, [feedbacks])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files)
      setPreviewUrls(files.map((f) => URL.createObjectURL(f)))
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleUpload = async () => {
    if (!workId || !chapterTitle.trim() || selectedFiles.length === 0) return
    const sortedFiles = [...selectedFiles].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    const base64Images = await Promise.all(sortedFiles.map(fileToBase64))
    await createChapter(workId, chapterTitle.trim(), base64Images)
    setUploadModalOpen(false)
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setSelectedFiles([])
    setPreviewUrls([])
    setChapterTitle('')
  }

  const handleGenerateLink = async (role: ReaderRole) => {
    if (!workId || chapters.length === 0) return
    await createLink(workId, {
      role,
      chapterId: chapters[0].id,
    })
  }

  const getLinkForRole = (role: ReaderRole) => {
    return links.find((l) => l.role === role)
  }

  const buildShareUrl = (token: string) => {
    return `${window.location.origin}/read/${token}`
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'chapters', label: '章节管理', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'links', label: '链接管理', icon: <LinkIcon className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-ink-800 bg-ink-900">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-ink-500 mb-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 hover:text-paper-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            <ChevronRight className="h-4 w-4" />
            <span>我的作品</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-paper-100">{currentWork?.title ?? '加载中...'}</span>
          </div>

          {currentWork && (
            <div className="flex items-start gap-6">
              <img
                src={currentWork.coverUrl}
                alt={currentWork.title}
                className="w-24 h-32 object-cover rounded-lg border border-ink-700"
              />
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-paper-100 mb-2">
                  {currentWork.title}
                </h1>
                <p className="text-sm text-ink-500 mb-4">{currentWork.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-ink-500" />
                    <span className="text-paper-100">{chapters.length}</span>
                    <span className="text-ink-500">章节</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-paper-100">{feedbackStats.total}</span>
                    <span className="text-ink-500">条反馈</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(Object.keys(feedbackStats.byRole) as ReaderRole[]).map((role) => (
                      <span key={role} className="flex items-center gap-1">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            role === 'editor'
                              ? 'bg-role-editor'
                              : role === 'assistant'
                              ? 'bg-role-assistant'
                              : 'bg-role-fan'
                          )}
                        />
                        <span className="text-ink-500">
                          {ROLE_META[role].label}: {feedbackStats.byRole[role]}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {feedbackStats.total > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.keys(feedbackStats.byType) as FeedbackType[]).map((type) =>
                      feedbackStats.byType[type] > 0 ? (
                        <FeedbackBadge key={type} type={type} size="sm" />
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-6 border-b border-ink-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === tab.key
                  ? 'text-accent border-accent'
                  : 'text-ink-500 border-transparent hover:text-paper-100'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'chapters' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-paper-100">章节列表</h2>
              <Button onClick={() => setUploadModalOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                上传章节
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ChapterSkeleton key={i} />
                ))}
              </div>
            ) : chaptersWithPageCount.length === 0 ? (
              <Empty
                title="还没有章节"
                description="上传你的第一章漫画，开始收集反馈吧"
              />
            ) : (
              <div className="space-y-3">
                {chaptersWithPageCount.map((chapter) => (
                  <Card
                    key={chapter.id}
                    hover
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-ink-800 flex items-center justify-center">
                        <FileImage className="h-6 w-6 text-ink-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-paper-100">{chapter.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-ink-500 mt-1">
                          <span className="flex items-center gap-1">
                            <FileImage className="h-3.5 w-3.5" />
                            {chapter.pageCount} 页
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(chapter.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-ink-500" />
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-paper-100">分享链接管理</h2>
              <p className="text-sm text-ink-500">
                为不同角色生成专属反馈链接
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['editor', 'assistant', 'fan'] as ReaderRole[]).map((role) => {
                const link = getLinkForRole(role)
                return (
                  <LinkCard
                    key={role}
                    role={role}
                    linkUrl={link ? buildShareUrl(link.token) : undefined}
                    expiresAt={link?.expiresAt}
                    onGenerate={() => handleGenerateLink(role)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="上传新章节"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-paper-100 mb-2">章节标题</label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="请输入章节标题，如：第1话 相遇"
              className="w-full px-4 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-paper-100 placeholder-ink-500 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-paper-100 mb-2">
              上传漫画页面
              <span className="text-ink-500 font-normal ml-2">（支持多选，按文件名排序）</span>
            </label>
            <label className="block">
              <div className="border-2 border-dashed border-ink-700 rounded-lg p-8 text-center cursor-pointer hover:border-ink-600 hover:bg-ink-800/30 transition-colors">
                <Upload className="h-8 w-8 text-ink-500 mx-auto mb-2" />
                <p className="text-paper-100 font-medium mb-1">
                  {selectedFiles.length > 0
                    ? `已选择 ${selectedFiles.length} 个文件`
                    : '点击选择图片文件'}
                </p>
                <p className="text-sm text-ink-500">支持 JPG、PNG、WebP 格式</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {selectedFiles.length > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group bg-ink-800 rounded-lg overflow-hidden"
                    >
                      <img
                        src={previewUrls[index]}
                        alt={file.name}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        <span className="text-xs text-paper-100 truncate w-full text-center">{file.name}</span>
                        <span className="text-xs text-ink-500">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-paper-100 hover:bg-red-500 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`list-${index}`}
                      className="flex items-center justify-between px-3 py-2 bg-ink-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileImage className="h-4 w-4 text-ink-500 shrink-0" />
                        <span className="text-sm text-paper-100 truncate">{file.name}</span>
                        <span className="text-xs text-ink-500 shrink-0">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-ink-500 hover:text-paper-100 text-sm shrink-0 ml-2"
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!chapterTitle.trim() || selectedFiles.length === 0}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              上传
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
