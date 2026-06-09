import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Target, Crown, ChevronRight, Clock, HelpCircle, Star } from 'lucide-react'
import { resumeAPI, interviewAPI } from '../api'
import { useInterviewStore } from '../store'
import toast from 'react-hot-toast'

const STREAMS = [
  'Computer Science Engineering', 'Information Technology',
  'Artificial Intelligence & Machine Learning', 'Data Science',
  'Electronics & Communication Engineering', 'Electrical Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
  'Aerospace Engineering', 'Biotechnology', 'BCA', 'MCA',
  'BBA', 'MBA', 'Commerce', 'Law', 'Medical', 'Nursing', 'Pharmacy', 'Diploma Courses',
]

const MODES = [
  {
    id: 'easy',
    label: 'Easy Interview',
    tagline: 'Warm Up Your Confidence',
    icon: Zap,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    duration: '5–7 min',
    questions: '5 core questions',
    features: ['Friendly female interviewer', 'Bonus questions if you struggle', 'Forgiving timeout (30s)', 'Basic stream + resume questions'],
    difficulty: 'Beginner',
  },
  {
    id: 'hard',
    label: 'Hard Interview',
    tagline: 'Sharpen Your Edge',
    icon: Target,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    duration: '15–20 min',
    questions: '20 questions',
    features: ['Professional female interviewer', 'No bonus questions', '20s response timeout', '"THE CANDIDATE" award for perfection'],
    difficulty: 'Intermediate',
  },
  {
    id: 'the_interview',
    label: 'THE INTERVIEW',
    tagline: 'Full Corporate Simulation',
    icon: Crown,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    duration: '30–45 min',
    questions: '40+ questions',
    features: ['Senior male interviewer', 'HR + Technical + Pressure rounds', '15s timeout under pressure', 'Full recruiter-style report'],
    difficulty: 'Advanced',
    badge: 'MOST REALISTIC',
  },
]

export default function InterviewSelectionPage() {
  const [selectedMode, setSelectedMode] = useState(null)
  const [stream, setStream] = useState('Computer Science Engineering')
  const [resumeId, setResumeId] = useState(null)
  const [resumes, setResumes] = useState([])
  const [starting, setStarting] = useState(false)
  const { setSession } = useInterviewStore()
  const navigate = useNavigate()

  useEffect(() => {
    resumeAPI.list().then(r => {
      const rs = r.data || []
      setResumes(rs)
      if (rs.length) { setResumeId(rs[0].id); setStream(rs[0].branch || stream) }
    }).catch(() => {})
  }, [])

  const startInterview = async () => {
    if (!selectedMode) { toast.error('Please select an interview mode'); return }
    setStarting(true)
    try {
      const { data } = await interviewAPI.start({ mode: selectedMode, stream, resume_id: resumeId })
      setSession(data)
      navigate(`/interview/session/${data.session_id}`)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to start interview')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-3">
          <Zap size={24} className="text-cyber-blue" />
          AI Interview
        </h1>
        <p className="text-white/40 font-body text-sm mt-1">Choose your challenge level and face the AI interviewer</p>
      </motion.div>

      {/* Config */}
      <div className="glass-strong rounded-2xl p-6 cyber-border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-white/50 text-xs font-mono uppercase tracking-widest mb-2">Your Academic Stream</label>
            <select value={stream} onChange={e => setStream(e.target.value)}
              className="input-cyber rounded-lg w-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
              {STREAMS.map(s => <option key={s} value={s} style={{ background: '#060d15' }}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono uppercase tracking-widest mb-2">Resume (Optional)</label>
            <select value={resumeId || ''} onChange={e => setResumeId(e.target.value ? Number(e.target.value) : null)}
              className="input-cyber rounded-lg w-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <option value="" style={{ background: '#060d15' }}>No resume (stream-based questions)</option>
              {resumes.map(r => <option key={r.id} value={r.id} style={{ background: '#060d15' }}>{r.filename}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {MODES.map(({ id, label, tagline, icon: Icon, color, bg, border, duration, questions, features, difficulty, badge }) => (
          <motion.button key={id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: MODES.findIndex(m => m.id === id) * 0.1 }}
            onClick={() => setSelectedMode(id)}
            className={`relative text-left rounded-2xl p-6 transition-all duration-300 card-hover ${
              selectedMode === id ? 'ring-2' : ''
            }`}
            style={{
              background: selectedMode === id ? bg : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selectedMode === id ? border : 'rgba(255,255,255,0.06)'}`,
              boxShadow: selectedMode === id ? `0 0 30px ${color}20` : 'none',
              ringColor: color,
            }}>
            {badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-display font-bold text-white"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}>
                {badge}
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={22} style={{ color }} />
              </div>
              {selectedMode === id && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: color }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
            <div className="mb-1">
              <span className="font-display font-bold text-white text-base tracking-wide">{label}</span>
            </div>
            <div className="text-white/40 text-xs font-body mb-4">{tagline}</div>

            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color }}>
                <Clock size={12} /> {duration}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-white/40">
                <HelpCircle size={12} /> {questions}
              </div>
            </div>

            <div className="space-y-1.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-body text-white/50">
                  <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                  {f}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono" style={{ color }}>Difficulty: {difficulty}</span>
              <ChevronRight size={14} className="text-white/30" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Start button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center">
        <button onClick={startInterview} disabled={!selectedMode || starting}
          className="btn-primary rounded-xl px-12 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 mx-auto">
          {starting ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparing Interview...</>
          ) : (
            <><Zap size={20} fill="white" /> Start Interview</>
          )}
        </button>
        {!selectedMode && <p className="text-white/30 text-xs font-body mt-3">Select an interview mode above</p>}
      </motion.div>
    </div>
  )
}
