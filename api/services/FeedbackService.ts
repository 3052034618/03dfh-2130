import { DbStore } from '../data/db.js'
import type { Feedback, FeedbackStatus, ReaderRole, FeedbackType } from '../../shared/types.js'

export interface FeedbackFilter {
  workId?: string
  role?: ReaderRole
  type?: FeedbackType
  status?: FeedbackStatus
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export class FeedbackService {
  private db: DbStore

  constructor() {
    this.db = DbStore.getInstance()
  }

  list(filter: FeedbackFilter = {}): Feedback[] {
    let result = [...this.db.feedbacks]
    if (filter.workId) {
      result = result.filter((f) => f.workId === filter.workId)
    }
    if (filter.role) {
      result = result.filter((f) => f.role === filter.role)
    }
    if (filter.type) {
      result = result.filter((f) => f.type === filter.type)
    }
    if (filter.status) {
      result = result.filter((f) => f.status === filter.status)
    }
    return result
  }

  async create(data: Omit<Feedback, 'id' | 'createdAt' | 'status' | 'pageVersion'> & { pageVersion?: number }): Promise<Feedback> {
    const page = this.db.pages.find((p) => p.id === data.pageId)
    const feedback: Feedback = {
      ...data,
      id: generateId(),
      status: 'pending',
      pageVersion: data.pageVersion ?? page?.version ?? 1,
      createdAt: new Date().toISOString(),
    }
    this.db.feedbacks = [...this.db.feedbacks, feedback]
    await this.db.save()
    return feedback
  }

  async updateStatus(id: string, status: FeedbackStatus): Promise<Feedback | null> {
    const index = this.db.feedbacks.findIndex((f) => f.id === id)
    if (index === -1) return null
    const updated = { ...this.db.feedbacks[index], status }
    const list = [...this.db.feedbacks]
    list[index] = updated
    this.db.feedbacks = list
    await this.db.save()
    return updated
  }

  getById(id: string): Feedback | null {
    return this.db.feedbacks.find((f) => f.id === id) ?? null
  }

  async delete(id: string): Promise<boolean> {
    const index = this.db.feedbacks.findIndex((f) => f.id === id)
    if (index === -1) return false
    const list = [...this.db.feedbacks]
    list.splice(index, 1)
    this.db.feedbacks = list
    await this.db.save()
    return true
  }
}
