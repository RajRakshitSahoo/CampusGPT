import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, Brain, BookOpen,
  History, Map, LogOut, Zap, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resume', icon: FileText, label: 'Resume Analysis' },
  { path: '/training', icon: Brain, label: 'Career Training' },
  { path: '/vault', icon: BookOpen, label: 'Question Vault' },
  { path: '/interview', icon: Zap, label: 'AI Interview' },
  { path: '/history', icon: History, label: 'Interview History' },
  { path: '/roadmap', icon: Map, label: 'Learning Roadmap' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/5 z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
            <span className="font-display font-black text-white text-sm">CG</span>
            <div className="absolute inset-0 hologram-lines" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm tracking-widest">CAMPUS<span className="text-cyber-blue">GPT</span></div>
            <div className="text-white/40 text-xs font-mono">AI Career Coach</div>
          </div>
        </NavLink>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(0,212,255,0.05)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #1a8bf5, #7c3aed)' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name || 'Student'}</div>
            <div className="text-white/40 text-xs truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'text-cyber-blue bg-cyber-blue/10 border border-cyber-blue/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-cyber-blue' : 'text-white/50 group-hover:text-white'} />
                <span className="font-body text-sm flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-cyber-blue" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
          <LogOut size={18} />
          <span className="font-body text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
