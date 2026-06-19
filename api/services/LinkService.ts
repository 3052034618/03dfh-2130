import crypto from 'crypto'
import { DbStore } from '../data/db.js'
import type { ShareLink, ReaderRole } from '../../shared/types.js'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function generateToken(): string {
  return crypto.randomBytes(24).toString('hex')
}

const DEFAULT_EXPIRES_DAYS = 7

export class LinkService {
  private db: DbStore

  constructor() {
    this.db = DbStore.getInstance()
  }

  create(data: {
    workId: string
    chapterId: string
    role: ReaderRole
    expiresAt?: string
  }): ShareLink {
    const expiresAt =
      data.expiresAt ??
      new Date(Date.now() + DEFAULT_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const link: ShareLink = {
      id: generateId(),
      workId: data.workId,
      chapterId: data.chapterId,
      role: data.role,
      token: generateToken(),
      expiresAt,
      createdAt: new Date().toISOString(),
    }
    this.db.links = [...this.db.links, link]
    return link
  }

  validateToken(token: string): ShareLink | null {
    const link = this.db.links.find((l) => l.token === token)
    if (!link) return null
    if (new Date(link.expiresAt) < new Date()) return null
    return link
  }

  getByWorkId(workId: string): ShareLink[] {
    return this.db.links.filter((l) => l.workId === workId)
  }
}
