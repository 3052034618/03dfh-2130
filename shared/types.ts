export type ReaderRole = 'editor' | 'assistant' | 'fan';
export type FeedbackType = 'confusing' | 'slow' | 'funny' | 'cute' | 'detail';
export type FeedbackStatus = 'pending' | 'resolved' | 'ignored';

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Work {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  workId: string;
  title: string;
  createdAt: string;
}

export interface Page {
  id: string;
  chapterId: string;
  imageUrl: string;
  version: number;
  pageIndex: number;
  width: number;
  height: number;
  createdAt: string;
}

export interface Feedback {
  id: string;
  pageId: string;
  workId: string;
  type: FeedbackType;
  role: ReaderRole;
  content: string;
  region: Region;
  status: FeedbackStatus;
  pageVersion: number;
  createdAt: string;
  reviewerName: string;
}

export interface ShareLink {
  id: string;
  workId: string;
  chapterId: string;
  token: string;
  role: ReaderRole;
  expiresAt: string;
  createdAt: string;
}
