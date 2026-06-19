import type { Work, Chapter, Page, Feedback, ShareLink } from '../../shared/types';

export function generateMockData(): {
  works: Work[];
  chapters: Chapter[];
  pages: Page[];
  feedbacks: Feedback[];
  links: ShareLink[];
} {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const works: Work[] = [
    {
      id: 'work-1',
      title: '星轨前夜',
      description: '在遥远的星际时代，少女艾拉与神秘旅行者的相遇，揭开了一段跨越光年的秘密。',
      coverUrl: 'https://picsum.photos/seed/comic-cover/400/600',
      createdAt: now,
    },
  ];

  const chapters: Chapter[] = [
    {
      id: 'chapter-1',
      workId: 'work-1',
      title: '第1话：相遇',
      createdAt: now,
    },
  ];

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
  ];

  const feedbacks: Feedback[] = [
    {
      id: 'fb-1',
      pageId: 'page-1',
      workId: 'work-1',
      type: 'confusing',
      role: 'editor',
      content: '这个分镜的时间跳转有点突兀，读者可能不太理解为什么场景突然切换到了宇宙空间。建议加一格过渡画面。',
      region: { x: 0.2, y: 0.3, width: 0.35, height: 0.25 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '林编辑',
    },
    {
      id: 'fb-2',
      pageId: 'page-1',
      workId: 'work-1',
      type: 'cute',
      role: 'fan',
      content: '艾拉这个表情太可爱了！尤其是眼睛的高光部分画得好棒~',
      region: { x: 0.55, y: 0.15, width: 0.2, height: 0.2 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '小星',
    },
    {
      id: 'fb-3',
      pageId: 'page-2',
      workId: 'work-1',
      type: 'slow',
      role: 'editor',
      content: '这一页的对话有点长，节奏有点拖沓。建议精简一下台词，把重点信息提炼出来。',
      region: { x: 0.1, y: 0.6, width: 0.8, height: 0.3 },
      status: 'resolved',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '林编辑',
    },
    {
      id: 'fb-4',
      pageId: 'page-2',
      workId: 'work-1',
      type: 'detail',
      role: 'assistant',
      content: '左下角飞船的舷窗线条有些模糊，和其他部分的精细度不一致，需要重描一下。',
      region: { x: 0.1, y: 0.75, width: 0.25, height: 0.2 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '助手小陈',
    },
    {
      id: 'fb-5',
      pageId: 'page-3',
      workId: 'work-1',
      type: 'funny',
      role: 'fan',
      content: '哈哈哈哈男主摔下来这个姿势太搞笑了，反差萌！',
      region: { x: 0.3, y: 0.4, width: 0.4, height: 0.35 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '星空下的猫',
    },
    {
      id: 'fb-6',
      pageId: 'page-3',
      workId: 'work-1',
      type: 'detail',
      role: 'assistant',
      content: '背景的星空颗粒感不均匀，右上角比较稀疏，需要补充一些星星。',
      region: { x: 0.6, y: 0.05, width: 0.35, height: 0.3 },
      status: 'ignored',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '助手小陈',
    },
    {
      id: 'fb-7',
      pageId: 'page-4',
      workId: 'work-1',
      type: 'confusing',
      role: 'assistant',
      content: '最后一格神秘人的剪影暗示不太明确，读者可能看不出他手里拿着什么。',
      region: { x: 0.5, y: 0.5, width: 0.4, height: 0.4 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '助手小周',
    },
    {
      id: 'fb-8',
      pageId: 'page-4',
      workId: 'work-1',
      type: 'slow',
      role: 'fan',
      content: '结尾的悬念感很棒！但镜头拉远的速度感觉有点慢，可以再紧凑一点。',
      region: { x: 0.15, y: 0.2, width: 0.7, height: 0.5 },
      status: 'pending',
      pageVersion: 1,
      createdAt: now,
      reviewerName: '银河漫游者',
    },
  ];

  const links: ShareLink[] = [
    {
      id: 'link-1',
      workId: 'work-1',
      chapterId: 'chapter-1',
      token: 'token-editor-123',
      role: 'editor',
      expiresAt,
      createdAt: now,
    },
    {
      id: 'link-2',
      workId: 'work-1',
      chapterId: 'chapter-1',
      token: 'token-assistant-456',
      role: 'assistant',
      expiresAt,
      createdAt: now,
    },
    {
      id: 'link-3',
      workId: 'work-1',
      chapterId: 'chapter-1',
      token: 'token-fan-789',
      role: 'fan',
      expiresAt,
      createdAt: now,
    },
  ];

  return { works, chapters, pages, feedbacks, links };
}
