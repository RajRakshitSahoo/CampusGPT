import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'campusgpt-auth' }
  )
)

export const useInterviewStore = create((set, get) => ({
  currentSession: null,
  currentQuestionIndex: 0,
  answers: [],
  tabSwitches: 0,
  focusEvents: [],
  isRecording: false,
  transcript: '',

  setSession: (session) => set({ currentSession: session, currentQuestionIndex: 0, answers: [], tabSwitches: 0 }),
  nextQuestion: () => set((s) => ({ currentQuestionIndex: s.currentQuestionIndex + 1 })),
  addAnswer: (answer) => set((s) => ({ answers: [...s.answers, answer] })),
  incrementTabSwitch: () => set((s) => ({ tabSwitches: s.tabSwitches + 1 })),
  setRecording: (val) => set({ isRecording: val }),
  setTranscript: (t) => set({ transcript: t }),
  resetInterview: () => set({ currentSession: null, currentQuestionIndex: 0, answers: [], tabSwitches: 0, isRecording: false, transcript: '' }),
}))
