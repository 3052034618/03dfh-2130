import { Router, type Request, type Response } from 'express'
import { WorkService } from '../services/WorkService.js'
import { FeedbackService } from '../services/FeedbackService.js'
import { LinkService } from '../services/LinkService.js'
import { DbStore } from '../data/db.js'
import type { Work, ReaderRole, Chapter, Page } from '../../shared/types.js'

const router = Router()
const workService = new WorkService()
const feedbackService = new FeedbackService()
const linkService = new LinkService()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const works = workService.list()
    res.status(200).json({ data: works })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Omit<Work, 'id' | 'createdAt'>
    const work = await workService.create(body)
    res.status(201).json({ data: work })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const workDetail = workService.getById(id)
    if (!workDetail) {
      res.status(404).json({ error: 'Work not found' })
      return
    }
    const { chapters: chaptersWithPages, ...work } = workDetail
    const chapters = chaptersWithPages.map(({ pages: _pages, ...chapter }) => chapter)
    const workChapterIds = chapters.map((c) => c.id)
    const db = DbStore.getInstance()
    const pages = db.pages.filter((p) => workChapterIds.includes(p.chapterId))
    res.status(200).json({ data: { work, chapters, pages } })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.get('/:id/feedbacks', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { role, type, status } = req.query as {
      role?: ReaderRole
      type?: 'confusing' | 'slow' | 'funny' | 'cute' | 'detail'
      status?: 'pending' | 'resolved' | 'ignored'
    }
    const feedbacks = feedbackService.list({ workId: id, role, type, status })
    res.status(200).json({ data: feedbacks })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.get('/:id/links', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const links = linkService.getByWorkId(id)
    res.status(200).json({ data: links })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.post('/:id/links', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const body = req.body as {
      role: ReaderRole
      chapterId: string
      expiresAt?: string
    }
    const link = await linkService.create({
      workId: id,
      chapterId: body.chapterId,
      role: body.role,
      expiresAt: body.expiresAt,
    })
    res.status(201).json({ data: link })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.post('/:id/chapters', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const body = req.body as {
      title: string
      images: { imageUrl: string; width?: number; height?: number }[]
    }
    const chapter = await workService.createChapter(id, body.title)
    const pages: Page[] = []
    for (let i = 0; i < body.images.length; i++) {
      const img = body.images[i]
      const page = await workService.createPage(
        chapter.id,
        img.imageUrl,
        i,
        img.width ?? 800,
        img.height ?? 1200,
      )
      pages.push(page)
    }
    res.status(201).json({ data: { chapter, pages } })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
