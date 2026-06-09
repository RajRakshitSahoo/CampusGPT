import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Zap, BookOpen, History, TrendingUp, Award, Target, ChevronRight } from 'lucide-react'
import { interviewAPI, resumeAPI } from '../api'
import { useAuthStore } from '../store'
import ScoreRing from '../components/dashboard/ScoreRing'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const ACTIONS = [
  { path: '/resume', icon: FileText, label: 'Analyze Resume', desc: 'Upload & get AI feedback', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
  { path: '/interview', icon: Zap, label: 'Start Interview', desc: 'AI mock interview', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { path: '/vault', icon: BookOpen, label: 'Question Vault', desc: 'Browse 500+ questions', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { path: '/history', icon: History, label: 'View History', desc: 'Past interview reports', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
]

const TIPS = [
  'Practice answering behavioral questions using the STAR method.',
  'Research the company before any interview — know their products and culture.',
  'Prepare 3-5 questions to ask the interviewer at the end.',
  'Use quantified achievements in your resume (e.g., "improved speed by 40%").',
  'Mock interviews are the single best way to reduce nervousness.',
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState([])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    Promise.all([
      interviewAPI.history().catch(() => ({ data: [] })),
      resumeAPI.list().catch(() => ({ data: [] })),
    ]).then(([s, r]) => {
      setSessions(s.data || [])
      setResumes(r.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const avgScore = sessions.length
    ? Math.round(sessions.slice(0, 5).reduce((a, s) => a + (s.technical_score || 0), 0) / Math.min(sessions.length, 5))
    : 0

  const latestResume = resumes[0]
  const completedSessions = sessions.filter(s => s.completed)

  const radarData = [
    { subject: 'Technical', A: sessions[0]?.technical_score || 0 },
    { subject: 'Communication', A: sessions[0]?.communication_score || 0 },
    { subject: 'Confidence', A: sessions[0]?.confidence_score || 0 },
    { subject: 'Focus', A: sessions[0]?.focus_score || 0 },
    { subject: 'Resume', A: latestResume?.resume_score || 0 },
  ]

  const historyData = sessions.slice(0, 6).reverse().map((s, i) => ({
    name: `#${i + 1}`,
    score: Math.round(s.technical_score || 0),
    mode: s.mode,
  }))

  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
  const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-white tracking-wide">
              Welcome back, <span className="text-cyber-blue">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-white/40 font-body text-sm mt-1">Your AI-powered career dashboard</p>
          </div>
          <div className="glass cyber-border rounded-xl px-4 py-2 text-xs font-mono text-cyber-blue">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </motion.div>

      {/* Tip banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4 mb-8 border border-cyber-blue/10 flex items-start gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
          <span className="text-white text-xs font-bold">💡</span>
        </div>
        <div>
          <span className="text-cyber-blue text-xs font-mono uppercase tracking-widest">Daily Tip · </span>
          <span className="text-white/70 text-sm font-body">{tip}</span>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={container} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Interviews Done', value: completedSessions.length, icon: Zap, color: '#00d4ff' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp, color: '#7c3aed' },
          { label: 'Resumes Analyzed', value: resumes.length, icon: FileText, color: '#10b981' },
          { label: 'Best Score', value: sessions.length ? `${Math.round(Math.max(...sessions.map(s => s.technical_score || 0)))}%` : '—', icon: Award, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={item}
            className="glass-strong rounded-xl p-5 cyber-border card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div className="font-display font-bold text-2xl text-white">{loading ? '...' : value}</div>
            <div className="text-white/40 text-xs font-body mt-1">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mb-8">
        <h2 className="font-display font-semibold text-white text-sm uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIONS.map(({ path, icon: Icon, label, desc, color, bg }) => (
            <Link key={path} to={path}
              className="glass rounded-xl p-5 card-hover group"
              style={{ border: `1px solid ${color}20` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="font-display font-semibold text-white text-sm">{label}</div>
              <div className="text-white/40 text-xs font-body mt-1">{desc}</div>
              <div className="flex items-center gap-1 mt-3 text-xs font-mono" style={{ color }}>
                Go <ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      {(sessions.length > 0 || latestResume) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Radar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="glass-strong rounded-xl p-6 cyber-border">
            <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide">Skill Profile</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Exo 2' }} />
                <Radar name="Score" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15}
                  strokeWidth={2} dot={{ fill: '#00d4ff', r: 4 }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="glass-strong rounded-xl p-6 cyber-border">
            <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide">Interview Score History</h3>
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={historyData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#060d15', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="score" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-white/30 font-body text-sm">
                Complete your first interview to see progress
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Latest resume summary */}
      {latestResume && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-strong rounded-xl p-6 cyber-border mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-white text-sm tracking-wide">Latest Resume Analysis</h3>
            <Link to="/resume" className="text-cyber-blue text-xs font-mono hover:text-white transition-colors flex items-center gap-1">
              View Full <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 items-center">
            <ScoreRing score={latestResume.resume_score} label="Resume Score" size={100} />
            <ScoreRing score={latestResume.ats_score} label="ATS Score" size={100} color="#7c3aed" />
            <div className="flex-1 min-w-48">
              <div className="text-white/50 text-xs font-mono uppercase tracking-widest mb-2">Detected Stream</div>
              <div className="text-cyber-blue font-display font-semibold text-sm mb-4">{latestResume.branch}</div>
              <div className="text-white/50 text-xs font-mono uppercase tracking-widest mb-2">Top Skills</div>
              <div className="flex flex-wrap gap-2">
                {(latestResume.skills || []).slice(0, 6).map(skill => (
                  <span key={skill} className="px-2 py-1 rounded text-xs font-mono text-cyber-blue"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && resumes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center py-16">
          <Target size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="font-display font-semibold text-white text-lg mb-2">Start Your Journey</h3>
          <p className="text-white/40 font-body text-sm mb-6 max-w-sm mx-auto">
            Upload your resume and take your first AI mock interview to begin your placement preparation.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/resume" className="btn-primary rounded-lg text-sm">Upload Resume</Link>
            <Link to="/interview" className="btn-cyber rounded-lg text-sm">Start Interview</Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
