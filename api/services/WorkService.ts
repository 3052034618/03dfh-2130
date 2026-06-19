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

  async create(data: Omit<Work, 'id' | 'createdAt'>): Promise<Work> {
    const work: Work = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    this.db.works = [...this.db.works, work]
    await this.db.save()
    return work
  }

  async createChapter(workId: string, title: string): Promise<Chapter> {
    const chapter: Chapter = {
      id: generateId(),
      workId,
      title,
      createdAt: new Date().toISOString(),
    }
    this.db.chapters = [...this.db.chapters, chapter]
    await this.db.save()
    return chapter
  }

  async createPage(
    chapterId: string,
    imageUrl: string,
    pageIndex: number,
    width = 800,
    height = 1200,
  ): Promise<Page> {
    const page: Page = {
      id: generateId(),
      chapterId,
      imageUrl,
      version: 1,
      pageIndex,
      width,
      height,
      createdAt: new Date().toISOString(),
    }
    this.db.pages = [...this.db.pages, page]
    await this.db.save()
    return page
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
