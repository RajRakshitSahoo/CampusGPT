import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ResumePage from './pages/ResumePage'
import TrainingPage from './pages/TrainingPage'
import VaultPage from './pages/VaultPage'
import InterviewSelectionPage from './pages/InterviewSelectionPage'
import InterviewSessionPage from './pages/InterviewSessionPage'
import InterviewReportPage from './pages/InterviewReportPage'
import HistoryPage from './pages/HistoryPage'
import RoadmapPage from './pages/RoadmapPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a1628',
            color: '#e2e8f0',
            border: '1px solid rgba(0,212,255,0.2)',
            fontFamily: '"Exo 2", sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0a1628' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0a1628' } },
          duration: 3500,
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="vault" element={<VaultPage />} />
          <Route path="interview" element={<InterviewSelectionPage />} />
          <Route path="interview/session/:sessionId" element={<InterviewSessionPage />} />
          <Route path="interview/report/:sessionId" element={<InterviewReportPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
