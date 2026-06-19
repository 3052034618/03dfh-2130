import fs from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Work, Chapter, Page, Feedback, ShareLink } from '../../shared/types';
import { generateMockData } from './mockData';

export class DbStore {
  private static instance: DbStore | null = null;

  works: Work[] = [];
  chapters: Chapter[] = [];
  pages: Page[] = [];
  feedbacks: Feedback[] = [];
  links: ShareLink[] = [];

  private constructor() {}

  static getInstance(): DbStore {
    if (!DbStore.instance) {
      DbStore.instance = new DbStore();
    }
    return DbStore.instance;
  }

  private getDataPath(filename: string): string {
    return resolve(process.cwd(), 'api/data', filename);
  }

  private async readFile<T>(filename: string): Promise<T[]> {
    const filePath = this.getDataPath(filename);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T[];
    } catch {
      return [];
    }
  }

  private async writeFile<T>(filename: string, data: T[]): Promise<void> {
    const filePath = this.getDataPath(filename);
    await fs.mkdir(resolve(process.cwd(), 'api/data'), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async load(): Promise<void> {
    const [works, chapters, pages, feedbacks, links] = await Promise.all([
      this.readFile<Work>('works.json'),
      this.readFile<Chapter>('chapters.json'),
      this.readFile<Page>('pages.json'),
      this.readFile<Feedback>('feedbacks.json'),
      this.readFile<ShareLink>('links.json'),
    ]);

    if (
      works.length === 0 &&
      chapters.length === 0 &&
      pages.length === 0 &&
      feedbacks.length === 0 &&
      links.length === 0
    ) {
      const mockData = generateMockData();
      this.works = mockData.works;
      this.chapters = mockData.chapters;
      this.pages = mockData.pages;
      this.feedbacks = mockData.feedbacks;
      this.links = mockData.links;
      await this.save();
    } else {
      this.works = works;
      this.chapters = chapters;
      this.pages = pages;
      this.feedbacks = feedbacks;
      this.links = links;
    }
  }

  async save(): Promise<void> {
    await Promise.all([
      this.writeFile('works.json', this.works),
      this.writeFile('chapters.json', this.chapters),
      this.writeFile('pages.json', this.pages),
      this.writeFile('feedbacks.json', this.feedbacks),
      this.writeFile('links.json', this.links),
    ]);
  }
}
