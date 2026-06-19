import { Router, type Request, type Response } from 'express'
import { FeedbackService } from '../services/FeedbackService.js'
import type { FeedbackStatus } from '../../shared/types.js'

const router = Router()
const feedbackService = new FeedbackService()

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const body = req.body as { status: FeedbackStatus }
    const updated = feedbackService.updateStatus(id, body.status)
    if (!updated) {
      res.status(404).json({ error: 'Feedback not found' })
      return
    }
    res.status(200).json(updated)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
