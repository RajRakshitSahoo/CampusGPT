import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Zap, ChevronRight, Star, Lock } from 'lucide-react'
import { resumeAPI } from '../api'

const STREAM_PATHS = {
  'Computer Science Engineering': {
    recommended: ['Python Interview', 'Data Structures & Algorithms', 'Web Development Interview', 'System Design', 'HR Interview'],
    optional: ['Cloud Computing (AWS)', 'Cyber Security', 'DevOps & Docker', 'Database Design'],
  },
  'Artificial Intelligence & Machine Learning': {
    recommended: ['AI/ML Interview', 'Python & NumPy', 'Deep Learning Interview', 'Data Science Interview', 'HR Interview'],
    optional: ['Computer Vision', 'NLP Interview', 'MLOps', 'Research Paper Discussion'],
  },
  'Data Science': {
    recommended: ['Data Science Interview', 'Statistics & Probability', 'SQL & Databases', 'Python Interview', 'HR Interview'],
    optional: ['Machine Learning Basics', 'Tableau & Power BI', 'Big Data', 'Business Analytics'],
  },
  'Electronics & Communication Engineering': {
    recommended: ['ECE Core Interview', 'Embedded Systems', 'VLSI Design', 'Signal Processing', 'HR Interview'],
    optional: ['IoT Interview', 'Communication Systems', 'Microcontrollers', 'PCB Design'],
  },
  'Mechanical Engineering': {
    recommended: ['Mechanical Core Interview', 'Thermodynamics', 'Manufacturing Processes', 'CAD/CAM', 'HR Interview'],
    optional: ['Automobile Engineering', 'Robotics', 'Fluid Mechanics', 'Production Engineering'],
  },
  'MBA': {
    recommended: ['MBA HR Interview', 'Marketing Interview', 'Finance Interview', 'Operations Management', 'Case Study Round'],
    optional: ['Strategy Consulting', 'Entrepreneurship', 'Digital Marketing', 'Supply Chain'],
  },
}

const DEFAULT_PATH = {
  recommended: ['Core Subject Interview', 'Technical Skills Interview', 'Project Discussion', 'HR Interview', 'Aptitude Round'],
  optional: ['Leadership Round', 'Case Study', 'Group Discussion', 'Presentation Skills'],
}

const TRACK_COLORS = [
  { bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)', color: '#00d4ff' },
  { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', color: '#7c3aed' },
  { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#10b981' },
  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)', color: '#ec4899' },
]

export default function TrainingPage() {
  const [stream, setStream] = useState('Computer Science Engineering')
  const [resumes, setResumes] = useState([])

  useEffect(() => {
    resumeAPI.list()
      .then(r => {
        const rs = r.data || []
        setResumes(rs)
        if (rs.length && rs[0].branch) setStream(rs[0].branch)
      })
      .catch(() => {})
  }, [])

  const paths = STREAM_PATHS[stream] || DEFAULT_PATH

  return (
    <div className="min-h-screen p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-3">
          <Brain size={24} className="text-cyber-blue" /> Career Training Dashboard
        </h1>
        <p className="text-white/40 font-body text-sm mt-1">Personalized interview paths based on your stream and resume</p>
      </motion.div>

      {/* Stream detected */}
      <div className="glass-strong rounded-2xl p-5 cyber-border mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))' }}>
          <Star size={18} className="text-cyber-blue" />
        </div>
        <div className="flex-1">
          <div className="text-white/40 text-xs font-mono uppercase tracking-widest">Detected Stream</div>
          <div className="font-display font-semibold text-white text-sm mt-0.5">{stream}</div>
        </div>
        {resumes.length === 0 && (
          <Link to="/resume" className="text-xs font-mono text-yellow-400 hover:text-white transition-colors flex items-center gap-1">
            Upload resume for better results <ChevronRight size={12} />
          </Link>
        )}
      </div>

      {/* Recommended interviews */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={16} className="text-cyber-blue" /> Recommended Interview Tracks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.recommended.map((track, i) => {
            const style = TRACK_COLORS[i % TRACK_COLORS.length]
            return (
              <motion.div key={track}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5 card-hover"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${style.color}18`, border: `1px solid ${style.color}30` }}>
                    <span className="font-display font-bold text-xs" style={{ color: style.color }}>{i + 1}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: `${style.color}15`, color: style.color }}>
                    Recommended
                  </span>
                </div>
                <div className="font-display font-semibold text-white text-sm mb-2">{track}</div>
                <div className="text-white/40 text-xs font-body mb-4">
                  {i === paths.recommended.length - 1
                    ? 'Behavioural & soft skills assessment'
                    : `Focused ${track.toLowerCase()} practice session`}
                </div>
                <Link to="/interview"
                  className="flex items-center gap-1.5 text-xs font-mono transition-colors hover:text-white"
                  style={{ color: style.color }}>
                  Start Practice <ChevronRight size={12} />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Optional interviews */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <Lock size={16} className="text-white/30" /> Optional Tracks
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {paths.optional.map((track, i) => (
            <motion.div key={track}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
              className="glass rounded-xl p-4 card-hover group"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-body text-white/60 text-sm mb-2 group-hover:text-white transition-colors">{track}</div>
              <Link to="/interview" className="text-white/25 group-hover:text-cyber-blue text-xs font-mono transition-colors flex items-center gap-1">
                Start <ChevronRight size={11} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick tip */}
      <div className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(124,58,237,0.15)' }}>
        <h3 className="font-display font-semibold text-white text-sm mb-3">📌 Placement Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-body text-white/50">
          <div><span className="text-cyber-blue font-mono">Week 1–2:</span> Complete all Recommended tracks on Easy mode</div>
          <div><span className="text-purple-400 font-mono">Week 3–4:</span> Attempt Hard mode + Optional tracks</div>
          <div><span className="text-yellow-400 font-mono">Week 5+:</span> Full simulation with THE INTERVIEW mode</div>
        </div>
      </div>
    </div>
  )
}
