import { Router, type Request, type Response } from 'express'
import { WorkService } from '../services/WorkService.js'
import { FeedbackService } from '../services/FeedbackService.js'
import { LinkService } from '../services/LinkService.js'
import type { Work, ReaderRole } from '../../shared/types.js'

const router = Router()
const workService = new WorkService()
const feedbackService = new FeedbackService()
const linkService = new LinkService()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const works = workService.list()
    res.status(200).json(works)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Omit<Work, 'id' | 'createdAt'>
    const work = workService.create(body)
    res.status(201).json(work)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const work = workService.getById(id)
    if (!work) {
      res.status(404).json({ error: 'Work not found' })
      return
    }
    res.status(200).json(work)
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
    res.status(200).json(feedbacks)
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
    const link = linkService.create({
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

export default router
