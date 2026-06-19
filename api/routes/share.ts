import { Router, type Request, type Response } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { DbStore } from '../data/db.js'
import { FeedbackService } from '../services/FeedbackService.js'
import type { Feedback, FeedbackType, Region } from '../../shared/types.js'

const router = Router()
const feedbackService = new FeedbackService()

router.get('/:token', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const link = req.shareLink!
    const db = DbStore.getInstance()

    const work = db.works.find((w) => w.id === link.workId)
    const chapter = db.chapters.find((c) => c.id === link.chapterId)
    if (!work || !chapter) {
      res.status(404).json({ error: 'Work or chapter not found' })
      return
    }

    const pages = db.pages.filter((p) => p.chapterId === chapter.id)
    const feedbacks = db.feedbacks.filter((f) => {
      if (link.role === 'fan') {
        return f.workId === work.id && f.reviewerName === link.role
      }
      return f.workId === work.id && f.role === link.role
    })

    res.status(200).json({
      work,
      chapter,
      pages,
      feedbacks,
      role: link.role,
    })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

router.post('/:token/feedbacks', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const link = req.shareLink!
    const body = req.body as {
      pageId: string
      type: FeedbackType
      content: string
      region: Region
      reviewerName: string
    }

    const feedback: Omit<Feedback, 'id' | 'createdAt' | 'status' | 'pageVersion'> = {
      pageId: body.pageId,
      workId: link.workId,
      type: body.type,
      role: link.role,
      content: body.content,
      region: body.region,
      reviewerName: body.reviewerName,
    }

    const created = feedbackService.create(feedback)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
