import { create } from 'zustand'
import type { Work, Chapter, Page, Feedback, FeedbackStatus, ReaderRole, ShareLink } from '@shared/types'

interface AppState {
  works: Work[]
  currentWork: Work | null
  chapters: Chapter[]
  pages: Page[]
  feedbacks: Feedback[]
  links: ShareLink[]
  loading: boolean
  setWorks: (works: Work[]) => void
  setCurrentWork: (work: Work | null) => void
  setChapters: (chapters: Chapter[]) => void
  setPages: (pages: Page[]) => void
  setFeedbacks: (feedbacks: Feedback[]) => void
  setLinks: (links: ShareLink[]) => void
  setLoading: (loading: boolean) => void
  fetchWorks: () => Promise<void>
  fetchWorkDetail: (id: string) => Promise<void>
  fetchFeedbacks: (workId: string) => Promise<void>
  fetchLinks: (workId: string) => Promise<void>
  createWork: (data: Omit<Work, 'id' | 'createdAt'>) => Promise<Work>
  createChapter: (workId: string, title: string, images: string[]) => Promise<void>
  createLink: (workId: string, data: { role: ReaderRole; chapterId: string; expiresAt?: string }) => Promise<ShareLink>
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  works: [],
  currentWork: null,
  chapters: [],
  pages: [],
  feedbacks: [],
  links: [],
  loading: false,

  setWorks: (works) => set({ works }),
  setCurrentWork: (currentWork) => set({ currentWork }),
  setChapters: (chapters) => set({ chapters }),
  setPages: (pages) => set({ pages }),
  setFeedbacks: (feedbacks) => set({ feedbacks }),
  setLinks: (links) => set({ links }),
  setLoading: (loading) => set({ loading }),

  fetchWorks: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/works')
      const { data } = await res.json()
      set({ works: data })
    } finally {
      set({ loading: false })
    }
  },

  fetchWorkDetail: async (id: string) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/works/${id}`)
      const { data } = await res.json()
      set({
        currentWork: data.work,
        chapters: data.chapters,
        pages: data.pages,
      })
    } finally {
      set({ loading: false })
    }
  },

  fetchFeedbacks: async (workId: string) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/works/${workId}/feedbacks`)
      const { data } = await res.json()
      set({ feedbacks: data })
    } finally {
      set({ loading: false })
    }
  },

  fetchLinks: async (workId: string) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/works/${workId}/links`)
      const { data } = await res.json()
      set({ links: data })
    } finally {
      set({ loading: false })
    }
  },

  createWork: async (data: Omit<Work, 'id' | 'createdAt'>) => {
    set({ loading: true })
    try {
      const res = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const { data: work } = await res.json()
      set((state) => ({ works: [...state.works, work] }))
      return work
    } finally {
      set({ loading: false })
    }
  },

  createChapter: async (workId: string, title: string, images: string[]) => {
    set({ loading: true })
    try {
      await fetch(`/api/works/${workId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, images }),
      })
      await useAppStore.getState().fetchWorkDetail(workId)
    } finally {
      set({ loading: false })
    }
  },

  createLink: async (workId: string, data: { role: ReaderRole; chapterId: string; expiresAt?: string }) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/works/${workId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const { data: link } = await res.json()
      set((state) => ({ links: [...state.links, link] }))
      return link
    } finally {
      set({ loading: false })
    }
  },

  updateFeedbackStatus: async (id: string, status: FeedbackStatus) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/feedbacks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const { data: updated } = await res.json()
      set((state) => ({
        feedbacks: state.feedbacks.map((f) => (f.id === id ? updated : f)),
      }))
    } finally {
      set({ loading: false })
    }
  },
}))
