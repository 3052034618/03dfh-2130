import type { Request, Response, NextFunction } from 'express'
import { DbStore } from '../data/db.js'
import type { ShareLink } from '../../shared/types.js'

declare global {
  namespace Express {
    interface Request {
      shareLink?: ShareLink
    }
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const token =
    (req.headers['x-share-token'] as string) ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined) ||
    (req.params.token as string) ||
    (req.query.token as string)

  if (!token) {
    res.status(401).json({ error: 'Token is required' })
    return
  }

  const db = DbStore.getInstance()
  const link = db.links.find((l) => l.token === token)

  if (!link) {
    res.status(401).json({ error: 'Invalid token' })
    return
  }

  if (new Date(link.expiresAt) < new Date()) {
    res.status(401).json({ error: 'Token has expired' })
    return
  }

  req.shareLink = link
  next()
}
