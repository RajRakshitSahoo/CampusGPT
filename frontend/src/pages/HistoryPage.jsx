import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, Eye, Zap, Target, Crown, TrendingUp, Calendar, Award } from 'lucide-react'
import { interviewAPI } from '../api'

const MODE_ICONS = { easy: Zap, hard: Target, the_interview: Crown }
const MODE_COLORS = { easy: '#10b981', hard: '#f59e0b', the_interview: '#ef4444' }
const RESULT_COLORS = {
  'Placement Ready': '#10b981',
  'Interview Ready': '#00d4ff',
  'Needs Improvement': '#f59e0b',
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    interviewAPI.history()
      .then(r => setSessions(r.data || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + (s.technical_score || 0), 0) / sessions.length)
    : 0
  const bestScore = sessions.length
    ? Math.round(Math.max(...sessions.map(s => s.technical_score || 0)))
    : 0

  return (
    <div className="min-h-screen p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-3">
          <History size={24} className="text-cyber-blue" /> Interview History
        </h1>
        <p className="text-white/40 font-body text-sm mt-1">All your past interview sessions and performance</p>
      </motion.div>

      {/* Summary stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Sessions', value: sessions.length, icon: History, color: '#00d4ff' },
            { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: '#7c3aed' },
            { label: 'Best Score', value: `${bestScore}%`, icon: Award, color: '#10b981' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-strong rounded-xl p-5 cyber-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-white/40 text-xs font-body">{label}</span>
              </div>
              <div className="font-display font-bold text-2xl text-white">{value}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-cyber-blue/30 border-t-cyber-blue rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-24">
          <History size={48} className="mx-auto text-white/15 mb-4" />
          <div className="font-display font-semibold text-white/40 text-lg mb-2">No Interviews Yet</div>
          <div className="text-white/25 text-sm font-body mb-6">Start your first interview to see history here</div>
          <Link to="/interview" className="btn-primary rounded-xl inline-flex items-center gap-2">
            <Zap size={16} /> Start First Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, i) => {
            const ModeIcon = MODE_ICONS[session.mode] || Zap
            const modeColor = MODE_COLORS[session.mode] || '#00d4ff'
            const resultColor = RESULT_COLORS[session.final_result] || '#f59e0b'

            return (
              <motion.div key={session.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 hover:border-white/10 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-4">
                  {/* Mode icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${modeColor}15`, border: `1px solid ${modeColor}25` }}>
                    <ModeIcon size={20} style={{ color: modeColor }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-display font-semibold text-white text-sm">
                        {session.mode === 'the_interview' ? 'THE INTERVIEW' : session.mode === 'hard' ? 'Hard Interview' : 'Easy Interview'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono"
                        style={{ background: `${resultColor}12`, color: resultColor, border: `1px solid ${resultColor}25` }}>
                        {session.final_result || 'Completed'}
                      </span>
                    </div>
                    <div className="text-white/40 text-xs font-body truncate">{session.stream}</div>
                    <div className="flex items-center gap-1.5 mt-1 text-white/25 text-xs font-mono">
                      <Calendar size={11} />
                      {new Date(session.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="hidden md:flex items-center gap-6">
                    {[
                      { label: 'Technical', score: session.technical_score, color: '#00d4ff' },
                      { label: 'Communication', score: session.communication_score, color: '#7c3aed' },
                      { label: 'Focus', score: session.focus_score, color: '#10b981' },
                    ].map(({ label, score, color }) => (
                      <div key={label} className="text-center">
                        <div className="font-display font-bold text-lg" style={{ color }}>
                          {Math.round(score || 0)}
                        </div>
                        <div className="text-white/30 text-xs font-body">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* View report */}
                  <Link to={`/interview/report/${session.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono text-cyber-blue transition-all hover:bg-cyber-blue/10 flex-shrink-0"
                    style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
                    <Eye size={14} /> Report
                  </Link>
                </div>

                {/* Mobile scores */}
                <div className="flex md:hidden items-center gap-4 mt-3 pt-3 border-t border-white/5">
                  {[
                    { label: 'Tech', score: session.technical_score, color: '#00d4ff' },
                    { label: 'Comm', score: session.communication_score, color: '#7c3aed' },
                    { label: 'Focus', score: session.focus_score, color: '#10b981' },
                  ].map(({ label, score, color }) => (
                    <div key={label} className="text-center">
                      <div className="font-display font-bold text-base" style={{ color }}>{Math.round(score || 0)}</div>
                      <div className="text-white/30 text-xs font-body">{label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
