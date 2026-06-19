import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, Plus, ChevronRight, BookOpen, MessageSquare, User } from 'lucide-react'
import { useAppStore } from '@/store/app'
import { ROLE_META } from '@/utils/constants'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Modal from '@/components/Modal'
import Empty from '@/components/Empty'
import { cn } from '@/utils/helpers'
import type { ReaderRole, Work } from '@shared/types'

interface WorkWithStats extends Work {
  chapterCount: number
  feedbackCount: number
  roleCounts: Record<ReaderRole, number>
}

function WorkSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-ink-800 rounded-lg mb-4" />
      <div className="h-5 bg-ink-800 rounded w-3/4 mb-2" />
      <div className="h-4 bg-ink-800 rounded w-1/2 mb-3" />
      <div className="h-2 bg-ink-800 rounded-full w-full" />
    </div>
  )
}

function WorkCard({ work, onClick }: { work: WorkWithStats; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  const totalRoleCount = work.roleCounts.editor + work.roleCounts.assistant + work.roleCounts.fan

  const rolePercentages = useMemo(() => {
    if (totalRoleCount === 0) return { editor: 0, assistant: 0, fan: 0 }
    return {
      editor: (work.roleCounts.editor / totalRoleCount) * 100,
      assistant: (work.roleCounts.assistant / totalRoleCount) * 100,
      fan: (work.roleCounts.fan / totalRoleCount) * 100,
    }
  }, [work.roleCounts, totalRoleCount])

  return (
    <Card
      hover
      className={cn(
        'cursor-pointer relative overflow-hidden group',
        'transition-all duration-300'
      )}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg">
        <img
          src={work.coverUrl}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
          className={cn(
            'absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300',
            hovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Button size="sm" className="gap-2">
            查看详情
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h3 className="font-display text-lg font-bold text-paper-100 mb-2">{work.title}</h3>

      <div className="flex items-center gap-4 mb-3 text-sm text-ink-500">
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          {work.chapterCount} 章
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          {work.feedbackCount} 反馈
        </span>
      </div>

      <div className="h-2 rounded-full bg-ink-800 overflow-hidden flex">
        <div
          className="h-full bg-role-editor transition-all duration-500"
          style={{ width: `${rolePercentages.editor}%` }}
        />
        <div
          className="h-full bg-role-assistant transition-all duration-500"
          style={{ width: `${rolePercentages.assistant}%` }}
        />
        <div
          className="h-full bg-role-fan transition-all duration-500"
          style={{ width: `${rolePercentages.fan}%` }}
        />
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-role-editor" />
          <span className="text-ink-500">{ROLE_META.editor.label}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-role-assistant" />
          <span className="text-ink-500">{ROLE_META.assistant.label}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-role-fan" />
          <span className="text-ink-500">{ROLE_META.fan.label}</span>
        </span>
      </div>
    </Card>
  )
}

export default function Workbench() {
  const navigate = useNavigate()
  const { works, feedbacks, chapters, loading, fetchWorks, createWork } = useAppStore()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  useEffect(() => {
    fetchWorks()
  }, [fetchWorks])

  const worksWithStats: WorkWithStats[] = useMemo(() => {
    return works.map((work) => {
      const workChapters = chapters.filter((c) => c.workId === work.id)
      const workFeedbacks = feedbacks.filter((f) => f.workId === work.id)
      const roleCounts: Record<ReaderRole, number> = {
        editor: workFeedbacks.filter((f) => f.role === 'editor').length,
        assistant: workFeedbacks.filter((f) => f.role === 'assistant').length,
        fan: workFeedbacks.filter((f) => f.role === 'fan').length,
      }
      return {
        ...work,
        chapterCount: workChapters.length,
        feedbackCount: workFeedbacks.length,
        roleCounts,
      }
    })
  }, [works, chapters, feedbacks])

  const handleCreateWork = async () => {
    if (!newTitle.trim()) return
    await createWork({
      title: newTitle.trim(),
      description: newDescription.trim(),
      coverUrl: `https://picsum.photos/seed/${Date.now()}/400/600`,
    })
    setNewTitle('')
    setNewDescription('')
    setCreateModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-ink-950">
      <aside className="fixed w-64 h-screen bg-ink-900 border-r border-ink-800 flex flex-col">
        <div className="p-5 border-b border-ink-800">
          <div className="flex items-center gap-2">
            <PenTool className="h-6 w-6 text-accent" />
            <h1 className="font-display text-xl text-accent font-bold">漫评 · 弹幕反馈工作台</h1>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-ink-800 text-paper-100 font-medium"
              >
                <span>🏠</span>
                我的作品
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-ink-500 hover:text-paper-100 hover:bg-ink-800 transition-colors"
              >
                <span>📊</span>
                数据统计
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-ink-500 hover:text-paper-100 hover:bg-ink-800 transition-colors"
              >
                <span>⚙️</span>
                设置
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-ink-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center">
              <User className="h-5 w-5 text-ink-500" />
            </div>
            <div>
              <p className="text-sm text-ink-500">当前用户</p>
              <p className="text-paper-100 font-medium">漫画作者</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-ink-800 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <span>首页</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-paper-100">我的作品</span>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              创建作品
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <WorkSkeleton key={i} />
              ))}
            </div>
          ) : worksWithStats.length === 0 ? (
            <Empty
              title="还没有作品"
              description="创建你的第一部漫画作品，开始收集弹幕反馈吧"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {worksWithStats.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  onClick={() => navigate(`/work/${work.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="创建新作品"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-paper-100 mb-2">作品标题</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="请输入作品标题"
              className="w-full px-4 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-paper-100 placeholder-ink-500 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-paper-100 mb-2">作品描述</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="请输入作品描述（可选）"
              rows={4}
              className="w-full px-4 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-paper-100 placeholder-ink-500 focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateWork}
              disabled={!newTitle.trim()}
            >
              创建
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
