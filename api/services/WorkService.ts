import { DbStore } from '../data/db.js'
import type { Work, Chapter, Page } from '../../shared/types.js'

export interface WorkWithStats extends Work {
  feedbackCount: number
}

export interface WorkDetail extends Work {
  chapters: (Chapter & { pages: Page[] })[]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export class WorkService {
  private db: DbStore

  constructor() {
    this.db = DbStore.getInstance()
  }

  list(): WorkWithStats[] {
    const works = this.db.works
    const feedbacks = this.db.feedbacks
    return works.map((work) => ({
      ...work,
      feedbackCount: feedbacks.filter((f) => f.workId === work.id).length,
    }))
  }

  create(data: Omit<Work, 'id' | 'createdAt'>): Work {
    const work: Work = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    this.db.works = [...this.db.works, work]
    return work
  }

  getById(id: string): WorkDetail | null {
    const work = this.db.works.find((w) => w.id === id)
    if (!work) return null

    const chapters = this.db.chapters
      .filter((c) => c.workId === id)
      .map((chapter) => ({
        ...chapter,
        pages: this.db.pages.filter((p) => p.chapterId === chapter.id),
      }))

    return { ...work, chapters }
  }
}
