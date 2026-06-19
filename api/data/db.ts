import type { Work, Chapter, Page, Feedback, ShareLink } from '../../shared/types'
import { generateMockData } from './mockData.js'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'

export class DbStore {
  private static instance: DbStore | null = null

  public works: Work[] = []
  public chapters: Chapter[] = []
  public pages: Page[] = []
  public feedbacks: Feedback[] = []
  public links: ShareLink[] = []

  private dataDir = resolve(process.cwd(), 'api/data')

  private getPath(name: string): string {
    return resolve(this.dataDir, `${name}.json`)
  }

  private async readFile(name: string): Promise<any[]> {
    try {
      const content = await readFile(this.getPath(name), 'utf-8')
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  static getInstance(): DbStore {
    if (!DbStore.instance) {
      DbStore.instance = new DbStore()
    }
    return DbStore.instance
  }

  async load(): Promise<void> {
    const [works, chapters, pages, feedbacks, links] = await Promise.all([
      this.readFile('works'),
      this.readFile('chapters'),
      this.readFile('pages'),
      this.readFile('feedbacks'),
      this.readFile('links'),
    ])

    const allEmpty =
      works.length === 0 &&
      chapters.length === 0 &&
      pages.length === 0 &&
      feedbacks.length === 0 &&
      links.length === 0

    if (allEmpty) {
      const mockData = generateMockData()
      this.works = mockData.works
      this.chapters = mockData.chapters
      this.pages = mockData.pages
      this.feedbacks = mockData.feedbacks
      this.links = mockData.links
      await this.save()
    } else {
      this.works = works as Work[]
      this.chapters = chapters as Chapter[]
      this.pages = pages as Page[]
      this.feedbacks = feedbacks as Feedback[]
      this.links = links as ShareLink[]
    }
  }

  async save(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true })
    await Promise.all([
      writeFile(this.getPath('works'), JSON.stringify(this.works, null, 2), 'utf-8'),
      writeFile(this.getPath('chapters'), JSON.stringify(this.chapters, null, 2), 'utf-8'),
      writeFile(this.getPath('pages'), JSON.stringify(this.pages, null, 2), 'utf-8'),
      writeFile(this.getPath('feedbacks'), JSON.stringify(this.feedbacks, null, 2), 'utf-8'),
      writeFile(this.getPath('links'), JSON.stringify(this.links, null, 2), 'utf-8'),
    ])
  }
}
