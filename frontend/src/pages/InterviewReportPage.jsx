import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Award, Star, BarChart2, MessageSquare, Target, Map, RefreshCw, Download } from 'lucide-react'
import { interviewAPI } from '../api'
import ScoreRing from '../components/dashboard/ScoreRing'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const RESULT_CONFIG = {
  'Placement Ready': { color: '#10b981', icon: '🏆', label: 'Placement Ready' },
  'Interview Ready': { color: '#00d4ff', icon: '✅', label: 'Interview Ready' },
  'Needs Improvement': { color: '#f59e0b', icon: '📈', label: 'Needs Improvement' },
}

export default function InterviewReportPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAchievement, setShowAchievement] = useState(false)

  useEffect(() => {
    interviewAPI.getSession(Number(sessionId))
      .then(({ data }) => {
        setSession(data)
        const allScores = (data.scores || []).map(s => s.score || 0)
        const avg = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0
        if (data.mode === 'hard' && avg >= 95) {
          setTimeout(() => setShowAchievement(true), 1000)
        }
      })
      .catch(() => navigate('/history'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyber-blue/30 border-t-cyber-blue rounded-full animate-spin" />
    </div>
  )

  if (!session) return null

  const result = RESULT_CONFIG[session.final_result] || RESULT_CONFIG['Needs Improvement']
  const radarData = [
    { subject: 'Technical', A: Math.round(session.technical_score || 0) },
    { subject: 'Communication', A: Math.round(session.communication_score || 0) },
    { subject: 'Confidence', A: Math.round(session.confidence_score || 0) },
    { subject: 'Focus', A: Math.round(session.focus_score || 0) },
  ]
  const allScores = (session.scores || []).map(s => s.score || 0)

  // Build weak/strong areas
  const questionScores = (session.scores || []).map((s, i) => ({
    question: session.questions?.[i]?.question || `Q${i + 1}`,
    score: s.score || 0,
    category: session.questions?.[i]?.category || 'Technical',
  }))
  const weakAreas = questionScores.filter(q => q.score < 50).slice(0, 4)
  const strongAreas = questionScores.filter(q => q.score >= 75).slice(0, 4)

  return (
    <div className="min-h-screen p-8 relative">
      {/* THE CANDIDATE achievement overlay */}
      {showAchievement && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setShowAchievement(false)}>
          <div className="achievement-pop text-center">
            <div className="text-8xl mb-4">🏅</div>
            <div className="font-display font-black text-4xl tracking-widest" style={{ color: '#ef4444', textShadow: '0 0 40px rgba(239,68,68,0.8)' }}>
              THE CANDIDATE
            </div>
            <div className="text-white/60 font-body text-lg mt-3">Exceptional performance — all 20 questions mastered!</div>
            <div className="text-white/30 text-sm font-mono mt-6">Tap to continue</div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white tracking-wide">Interview Report</h1>
        <p className="text-white/40 font-body text-sm mt-1">{session.stream} · {session.mode?.replace('_', ' ').toUpperCase()} · {new Date(session.created_at).toLocaleDateString()}</p>
      </motion.div>

      {/* Final result banner */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl p-8 mb-8 text-center"
        style={{ border: `1px solid ${result.color}30` }}>
        <div className="text-5xl mb-3">{result.icon}</div>
        <div className="font-display font-black text-3xl tracking-widest" style={{ color: result.color,
          textShadow: `0 0 30px ${result.color}60` }}>
          {result.label}
        </div>
        <div className="text-white/50 font-body text-sm mt-3 max-w-lg mx-auto leading-relaxed">
          {session.recruiter_comments}
        </div>
      </motion.div>

      {/* Score grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Technical', score: session.technical_score, color: '#00d4ff' },
          { label: 'Communication', score: session.communication_score, color: '#7c3aed' },
          { label: 'Confidence', score: session.confidence_score, color: '#10b981' },
          { label: 'Focus', score: session.focus_score, color: '#f59e0b' },
        ].map(({ label, score, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-5 text-center cyber-border">
            <ScoreRing score={score || 0} label={label} size={90} color={color} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Radar */}
        <div className="glass-strong rounded-2xl p-6 cyber-border">
          <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide">Performance Profile</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Exo 2' }} />
              <Radar dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Focus / integrity */}
        <div className="glass-strong rounded-2xl p-6 cyber-border">
          <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide">Focus & Integrity</h3>
          <div className="space-y-4">
            {[
              { label: 'Focus Score', value: session.focus_score || 100, color: '#10b981' },
              { label: 'Answers Attempted', value: Math.round((session.scores?.filter(s => s.score > 10).length / (session.questions?.length || 1)) * 100), color: '#00d4ff' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-body text-white/50 mb-1.5">
                  <span>{label}</span><span style={{ color }}>{Math.round(value)}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.5 }} style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between text-sm font-body text-white/60">
                <span>Tab Switches</span>
                <span className={session.tab_switches > 3 ? 'text-red-400' : 'text-green-400'}>
                  {session.tab_switches || 0}
                  {session.tab_switches > 3 && ' ⚠️'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-body text-white/60 mt-2">
                <span>Questions Answered</span>
                <span className="text-cyber-blue">{session.scores?.length || 0} / {session.questions?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Q&A Review */}
      {session.questions?.length > 0 && (
        <div className="glass-strong rounded-2xl p-6 cyber-border mb-8">
          <h3 className="font-display font-semibold text-white text-sm mb-5 tracking-wide flex items-center gap-2">
            <BarChart2 size={16} className="text-cyber-blue" /> Question-by-Question Review
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {session.questions.map((q, i) => {
              const score = session.scores?.[i]?.score || 0
              const ans = session.answers?.[i]?.answer || '—'
              return (
                <div key={i} className="rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${score >= 70 ? 'rgba(16,185,129,0.15)' : score >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.12)'}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-white/80 text-sm font-body mb-1">{q.question}</div>
                      <div className="text-white/40 text-xs font-mono truncate">{ans.slice(0, 100)}{ans.length > 100 ? '…' : ''}</div>
                    </div>
                    <div className="font-display font-bold text-base flex-shrink-0"
                      style={{ color: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444' }}>
                      {Math.round(score)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Learning roadmap teaser */}
      {weakAreas.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-8" style={{ border: '1px solid rgba(124,58,237,0.2)' }}>
          <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide flex items-center gap-2">
            <Map size={16} className="text-purple-400" /> Recommended Improvement Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weakAreas.map((w, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(124,58,237,0.06)' }}>
                <span className="text-purple-400 text-xs font-mono mt-0.5">{i + 1}.</span>
                <span className="text-white/60 text-xs font-body line-clamp-2">{w.question}</span>
              </div>
            ))}
          </div>
          <Link to="/roadmap" className="inline-flex items-center gap-2 mt-4 text-xs font-mono text-purple-400 hover:text-white transition-colors">
            View full learning roadmap <Target size={12} />
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        <Link to="/interview" className="btn-primary rounded-xl flex items-center gap-2">
          <RefreshCw size={16} /> New Interview
        </Link>
        <Link to="/dashboard" className="btn-cyber rounded-xl flex items-center gap-2">
          Dashboard
        </Link>
        <Link to="/history" className="btn-cyber rounded-xl flex items-center gap-2 text-white/60 border-white/15">
          All Sessions
        </Link>
      </div>
    </div>
  )
}
