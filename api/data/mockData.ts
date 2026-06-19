import type { Work, Chapter, Page, Feedback, ShareLink, FeedbackType, ReaderRole } from '../../shared/types'

export function generateMockData(): {
  works: Work[]
  chapters: Chapter[]
  pages: Page[]
  feedbacks: Feedback[]
  links: ShareLink[]
} {
  const now = new Date().toISOString()

  const works: Work[] = [
    {
      id: 'work-1',
      title: '星轨前夜',
      description: '一部关于星际冒险的科幻漫画',
      coverUrl: 'https://picsum.photos/seed/xinggui/400/600',
      createdAt: now,
    },
  ]

  const chapters: Chapter[] = [
    {
      id: 'chapter-1',
      workId: 'work-1',
      title: '第1话：相遇',
      createdAt: now,
    },
  ]

  const pages: Page[] = [
    {
      id: 'page-1',
      chapterId: 'chapter-1',
      imageUrl: 'https://picsum.photos/seed/comic1/800/1200',
      version: 1,
      pageIndex: 0,
      width: 800,
      height: 1200,
      createdAt: now,
    },
    {
      id: 'page-2',
      chapterId: 'chapter-1',
      imageUrl: 'https://picsum.photos/seed/comic2/800/1200',
      version: 1,
      pageIndex: 1,
      width: 800,
      height: 1200,
      createdAt: now,
    },
    {
      id: 'page-3',
      chapterId: 'chapter-1',
      imageUrl: 'https://picsum.photos/seed/comic3/800/1200',
      version: 1,
      pageIndex: 2,
      width: 800,
      height: 1200,
      createdAt: now,
    },
    {
      id: 'page-4',
      chapterId: 'chapter-1',
      imageUrl: 'https://picsum.photos/seed/comic4/800/1200',
      version: 1,
      pageIndex: 3,
      width: 800,
      height: 1200,
      createdAt: now,
    },
  ]

  const feedbacks: Feedback[] = [
    {
      id: 'feedback-1',
      pageId: 'page-1',
      workId: 'work-1',
      type: 'confusing',
      role: 'editor',
      content: '这里的对话逻辑有点混乱，建议调整一下顺序',
      region: { x: 0.15, y: 0.2, width: 0.3, height: 0.15 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '林编辑',
    },
    {
      id: 'feedback-2',
      pageId: 'page-1',
      workId: 'work-1',
      type: 'slow',
      role: 'assistant',
      content: '这一页的节奏有点慢，可以考虑加快',
      region: { x: 0.5, y: 0.3, width: 0.25, height: 0.2 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '小星助手',
    },
    {
      id: 'feedback-3',
      pageId: 'page-2',
      workId: 'work-1',
      type: 'funny',
      role: 'fan',
      content: '哈哈哈这个表情太搞笑了！',
      region: { x: 0.2, y: 0.4, width: 0.2, height: 0.25 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '漫画迷阿凯',
    },
    {
      id: 'feedback-4',
      pageId: 'page-2',
      workId: 'work-1',
      type: 'cute',
      role: 'fan',
      content: '这个角色好可爱啊！',
      region: { x: 0.6, y: 0.5, width: 0.18, height: 0.22 },
      status: 'resolved',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '星空下的猫',
    },
    {
      id: 'feedback-5',
      pageId: 'page-3',
      workId: 'work-1',
      type: 'detail',
      role: 'editor',
      content: '背景细节处理得很好，继续保持',
      region: { x: 0.1, y: 0.15, width: 0.35, height: 0.3 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '林编辑',
    },
    {
      id: 'feedback-6',
      pageId: 'page-3',
      workId: 'work-1',
      type: 'confusing',
      role: 'assistant',
      content: '这个分镜的转场有点突兀',
      region: { x: 0.55, y: 0.25, width: 0.3, height: 0.2 },
      status: 'ignored',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '助手小陈',
    },
    {
      id: 'feedback-7',
      pageId: 'page-4',
      workId: 'work-1',
      type: 'slow',
      role: 'fan',
      content: '结尾的悬念设置得不错，但节奏可以再紧凑些',
      region: { x: 0.25, y: 0.6, width: 0.4, height: 0.15 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '漫画迷阿凯',
    },
    {
      id: 'feedback-8',
      pageId: 'page-4',
      workId: 'work-1',
      type: 'detail',
      role: 'assistant',
      content: '光影效果处理得很细腻',
      region: { x: 0.65, y: 0.45, width: 0.2, height: 0.25 },
      status: 'resolved',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '小星助手',
    },
  ]

  const links: ShareLink[] = [
    {
      id: 'link-1',
      workId: 'work-1',
      chapterId: 'chapter-1',
      token: 'token-editor-123',
      role: 'editor',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
    },
    {
      id: 'link-2',
      workId: 'work-1',
      chapterId: 'chapter-1',
      token: 'token-assistant-456',
      role: 'assistant',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
    },
    {
      id: 'link-3',
      workId: 'work-1',
      chapterId: 'chapter-1',
      token: 'token-fan-789',
      role: 'fan',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
    },
  ]

  return { works, chapters, pages, feedbacks, links }
}
