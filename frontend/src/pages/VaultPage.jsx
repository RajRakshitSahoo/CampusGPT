import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search, RefreshCw, Filter } from 'lucide-react'
import { vaultAPI } from '../api'
import toast from 'react-hot-toast'

const STREAMS = [
  'Computer Science Engineering', 'Information Technology',
  'Artificial Intelligence & Machine Learning', 'Data Science',
  'Electronics & Communication Engineering', 'Electrical Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
  'Aerospace Engineering', 'Biotechnology', 'BCA', 'MCA', 'BBA', 'MBA',
  'Commerce', 'Law', 'Medical', 'Nursing', 'Pharmacy', 'Diploma Courses',
]

const CATEGORIES = ['All', 'HR', 'Technical', 'Resume', 'Project', 'Internship', 'Stream']

const CAT_COLORS = {
  HR: '#f59e0b', Technical: '#00d4ff', Resume: '#7c3aed',
  Project: '#10b981', Internship: '#ec4899', Stream: '#6366f1', All: '#ffffff',
}

export default function VaultPage() {
  const [stream, setStream] = useState('Computer Science Engineering')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [count, setCount] = useState(50)

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const { data } = await vaultAPI.getQuestions(stream, count)
      setQuestions(data.questions || [])
      toast.success(`Loaded ${data.total} questions for ${stream}`)
    } catch (e) {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || q.category === activeCategory
    return matchSearch && matchCat
  })

  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = c === 'All' ? questions.length : questions.filter(q => q.category === c).length
    return acc
  }, {})

  return (
    <div className="min-h-screen p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-3">
          <BookOpen size={24} className="text-cyber-blue" />
          Question Vault
        </h1>
        <p className="text-white/40 font-body text-sm mt-1">Study 500+ realistic interview questions — no answers shown, just like real interviews</p>
      </motion.div>

      {/* Controls */}
      <div className="glass-strong rounded-2xl p-6 cyber-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-white/50 text-xs font-mono uppercase tracking-widest mb-2">Academic Stream</label>
            <select value={stream} onChange={e => setStream(e.target.value)}
              className="input-cyber rounded-lg w-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
              {STREAMS.map(s => <option key={s} value={s} style={{ background: '#060d15' }}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono uppercase tracking-widest mb-2">Question Count</label>
            <select value={count} onChange={e => setCount(Number(e.target.value))}
              className="input-cyber rounded-lg w-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
              {[25, 50, 75, 100].map(n => <option key={n} value={n} style={{ background: '#060d15' }}>{n} Questions</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={fetchQuestions} disabled={loading}
              className="btn-primary rounded-lg w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <RefreshCw size={16} />}
              {loading ? 'Loading...' : 'Generate Questions'}
            </button>
          </div>
        </div>
      </div>

      {questions.length > 0 && (
        <>
          {/* Search + filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="input-cyber rounded-lg pl-10 w-full" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeCategory === cat ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                  style={activeCategory === cat
                    ? { background: `${CAT_COLORS[cat]}20`, border: `1px solid ${CAT_COLORS[cat]}40`, color: CAT_COLORS[cat] }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {cat} {categoryCounts[cat] > 0 && <span className="ml-1 opacity-60">({categoryCounts[cat]})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Questions grid */}
          <div className="text-white/40 text-xs font-mono mb-4">{filtered.length} questions</div>
          <motion.div layout className="space-y-2">
            <AnimatePresence>
              {filtered.map((q, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.01 }}
                  className="glass rounded-xl p-4 flex items-start gap-4 hover:border-white/10 transition-all group"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-xs font-mono text-white/30"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-white/80 font-body text-sm leading-relaxed">{q.question}</span>
                  </div>
                  <div className="flex-shrink-0 flex gap-2 items-center">
                    {q.difficulty && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono capitalize"
                        style={{
                          background: q.difficulty === 'basic' ? 'rgba(16,185,129,0.1)' : q.difficulty === 'advanced' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: q.difficulty === 'basic' ? '#10b981' : q.difficulty === 'advanced' ? '#ef4444' : '#f59e0b',
                          border: `1px solid ${q.difficulty === 'basic' ? '#10b98130' : q.difficulty === 'advanced' ? '#ef444430' : '#f59e0b30'}`,
                        }}>
                        {q.difficulty}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-xs font-mono"
                      style={{
                        background: `${CAT_COLORS[q.category] || '#ffffff'}10`,
                        color: CAT_COLORS[q.category] || '#ffffff',
                        border: `1px solid ${CAT_COLORS[q.category] || '#ffffff'}25`,
                      }}>
                      {q.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {!questions.length && !loading && (
        <div className="text-center py-24">
          <BookOpen size={48} className="mx-auto text-white/15 mb-4" />
          <div className="font-display font-semibold text-white/40 text-lg mb-2">Question Vault Ready</div>
          <div className="text-white/25 text-sm font-body">Select your stream and generate questions to study</div>
        </div>
      )}
    </div>
  )
}
