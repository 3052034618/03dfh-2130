import { create } from 'zustand'
import type { Chapter, Page, Feedback, FeedbackType, ReaderRole, Region, Work } from '@shared/types'

interface ReaderState {
  token: string | null
  role: ReaderRole | null
  work: Work | null
  chapter: Chapter | null
  pages: Page[]
  feedbacks: Feedback[]
  activeFeedbackType: FeedbackType | null
  selectingPageId: string | null
  selectedRegion: Region | null
  expandedFeedbackId: string | null
  zoom: number
  setToken: (token: string | null) => void
  setRole: (role: ReaderRole | null) => void
  setWork: (work: Work | null) => void
  setChapter: (chapter: Chapter | null) => void
  setPages: (pages: Page[]) => void
  setFeedbacks: (feedbacks: Feedback[]) => void
  setActiveFeedbackType: (type: FeedbackType | null) => void
  setSelectingPageId: (pageId: string | null) => void
  setSelectedRegion: (region: Region | null) => void
  setExpandedFeedbackId: (id: string | null) => void
  setZoom: (zoom: number) => void
  fetchShareData: (token: string) => Promise<void>
  submitFeedback: (data: {
    pageId: string
    type: FeedbackType
    content: string
    region: Region
    reviewerName: string
  }) => Promise<void>
}

export const useReaderStore = create<ReaderState>((set) => ({
  token: null,
  role: null,
  work: null,
  chapter: null,
  pages: [],
  feedbacks: [],
  activeFeedbackType: null,
  selectingPageId: null,
  selectedRegion: null,
  expandedFeedbackId: null,
  zoom: 1,

  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),
  setWork: (work) => set({ work }),
  setChapter: (chapter) => set({ chapter }),
  setPages: (pages) => set({ pages }),
  setFeedbacks: (feedbacks) => set({ feedbacks }),
  setActiveFeedbackType: (activeFeedbackType) => set({ activeFeedbackType }),
  setSelectingPageId: (selectingPageId) => set({ selectingPageId }),
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
  setExpandedFeedbackId: (expandedFeedbackId) => set({ expandedFeedbackId }),
  setZoom: (zoom) => set({ zoom }),

  fetchShareData: async (token: string) => {
    const res = await fetch(`/api/share/${token}`)
    const { data } = await res.json()
    set({
      token,
      role: data.role,
      work: data.work,
      chapter: data.chapter,
      pages: data.pages,
      feedbacks: data.feedbacks,
    })
  },

  submitFeedback: async (data: {
    pageId: string
    type: FeedbackType
    content: string
    region: Region
    reviewerName: string
  }) => {
    const token = useReaderStore.getState().token
    if (!token) return
    const res = await fetch(`/api/share/${token}/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const { data: feedback } = await res.json()
    set((state) => ({ feedbacks: [...state.feedbacks, feedback] }))
  },
}))
