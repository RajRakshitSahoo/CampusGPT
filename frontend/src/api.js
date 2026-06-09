import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('campusgpt-auth')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
    } catch {}
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campusgpt-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Resume
export const resumeAPI = {
  upload: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  list: () => api.get('/resume/my-resumes'),
  get: (id) => api.get(`/resume/${id}`),
}

// Interview
export const interviewAPI = {
  start: (data) => api.post('/interview/start', data),
  submitAnswer: (data) => api.post('/interview/answer', data),
  complete: (sessionId, tabSwitches, focusScore) =>
    api.post(`/interview/complete/${sessionId}?tab_switches=${tabSwitches}&focus_score=${focusScore}`),
  history: () => api.get('/interview/sessions/history'),
  getSession: (id) => api.get(`/interview/session/${id}`),
}

// Vault
export const vaultAPI = {
  getQuestions: (stream, count) => api.post('/vault/questions', { stream, count }),
  getStreams: () => api.get('/vault/streams'),
}

// TTS
export const ttsAPI = {
  speak: (text, voice = 'female') => `/api/tts/speak?text=${encodeURIComponent(text)}&voice=${voice}`,
}
