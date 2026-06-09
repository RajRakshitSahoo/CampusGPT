import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { interviewAPI, resumeAPI } from '../api'

const ROADMAPS = {
  'Computer Science Engineering': {
    weakAreas: ['DBMS', 'Computer Networks', 'Operating Systems', 'System Design'],
    weeks: [
      { week: 1, title: 'Database Fundamentals', topics: ['SQL Joins & Subqueries', 'Normalization (1NF–3NF)', 'Indexing & Query Optimization', 'ACID Properties', 'SQL vs NoSQL'], color: '#00d4ff' },
      { week: 2, title: 'Networking Essentials', topics: ['OSI Model & TCP/IP', 'HTTP vs HTTPS', 'DNS & Load Balancing', 'REST API Design', 'WebSockets'], color: '#7c3aed' },
      { week: 3, title: 'OS & Concurrency', topics: ['Process vs Thread', 'Deadlock Detection', 'Memory Management', 'Virtual Memory', 'Scheduling Algorithms'], color: '#10b981' },
      { week: 4, title: 'System Design Basics', topics: ['Scalability Patterns', 'Caching Strategies', 'Microservices', 'Message Queues', 'CAP Theorem'], color: '#f59e0b' },
      { week: 5, title: 'DSA Practice', topics: ['Arrays & Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Sorting Algorithms', 'LeetCode Top 50'], color: '#ec4899' },
      { week: 6, title: 'Mock Interviews', topics: ['2 Easy interviews', '2 Hard interviews', '1 THE INTERVIEW simulation', 'Review reports', 'Focus on weak areas'], color: '#6366f1' },
    ],
  },
  'Artificial Intelligence & Machine Learning': {
    weakAreas: ['Deep Learning', 'NLP', 'Model Deployment', 'Statistics'],
    weeks: [
      { week: 1, title: 'ML Foundations', topics: ['Supervised vs Unsupervised', 'Bias-Variance Tradeoff', 'Cross-Validation', 'Regularization', 'Feature Engineering'], color: '#00d4ff' },
      { week: 2, title: 'Deep Learning Core', topics: ['Neural Network Architecture', 'Backpropagation', 'CNNs for Vision', 'RNNs & LSTMs', 'Transfer Learning'], color: '#7c3aed' },
      { week: 3, title: 'NLP & Transformers', topics: ['Word Embeddings', 'Attention Mechanism', 'BERT & GPT Basics', 'Text Classification', 'Sentiment Analysis'], color: '#10b981' },
      { week: 4, title: 'Statistics & Math', topics: ['Probability Distributions', 'Hypothesis Testing', 'Bayesian Statistics', 'PCA & Dimensionality', 'A/B Testing'], color: '#f59e0b' },
      { week: 5, title: 'MLOps & Deployment', topics: ['Model Serialization', 'FastAPI for ML', 'Docker Containers', 'Monitoring & Drift', 'Cloud Deployment'], color: '#ec4899' },
      { week: 6, title: 'Interview Practice', topics: ['ML system design questions', 'Coding ML from scratch', 'Paper discussion prep', 'Mock interviews', 'Portfolio review'], color: '#6366f1' },
    ],
  },
}

const DEFAULT_ROADMAP = {
  weakAreas: ['Technical Depth', 'Communication', 'Problem Solving', 'Domain Knowledge'],
  weeks: [
    { week: 1, title: 'Core Subject Revision', topics: ['Fundamental concepts of your stream', 'Key formulas and theories', 'Standard textbook problems', 'Past year exam questions', 'YouTube lectures'], color: '#00d4ff' },
    { week: 2, title: 'Technical Interview Prep', topics: ['Common technical questions', 'Problem-solving approach', 'Explain concepts clearly', 'Whiteboard practice', 'Time complexity awareness'], color: '#7c3aed' },
    { week: 3, title: 'HR & Soft Skills', topics: ['Tell me about yourself (script it)', 'STAR method for behavioral', 'Strengths & weaknesses', 'Salary negotiation basics', 'Body language & eye contact'], color: '#10b981' },
    { week: 4, title: 'Resume Optimization', topics: ['Action verb descriptions', 'Quantify achievements', 'ATS keyword optimization', 'LinkedIn profile polish', 'GitHub/portfolio cleanup'], color: '#f59e0b' },
    { week: 5, title: 'Company Research', topics: ['Target company list', 'Company culture research', 'Role-specific preparation', 'Practice questions per company', 'Glassdoor interview reviews'], color: '#ec4899' },
    { week: 6, title: 'Full Simulation', topics: ['Daily mock interviews', 'Record yourself answering', 'Peer mock interviews', 'Feedback incorporation', 'Final report review'], color: '#6366f1' },
  ],
}

const RESOURCES = [
  { name: 'GeeksforGeeks', url: 'https://geeksforgeeks.org', desc: 'CS fundamentals & interview prep' },
  { name: 'LeetCode', url: 'https://leetcode.com', desc: 'Coding interview questions' },
  { name: 'Coursera', url: 'https://coursera.org', desc: 'Online courses & certifications' },
  { name: 'YouTube (FreeCodeCamp)', url: 'https://youtube.com/@freecodecamp', desc: 'Free video tutorials' },
  { name: 'LinkedIn Learning', url: 'https://linkedin.com/learning', desc: 'Professional skill courses' },
  { name: 'NPTEL', url: 'https://nptel.ac.in', desc: 'IIT & IISc lecture courses' },
]

export default function RoadmapPage() {
  const [stream, setStream] = useState('Computer Science Engineering')
  const [expandedWeek, setExpandedWeek] = useState(0)
  const [completedTopics, setCompletedTopics] = useState({})

  useEffect(() => {
    resumeAPI.list()
      .then(r => { if (r.data?.[0]?.branch) setStream(r.data[0].branch) })
      .catch(() => {})
  }, [])

  const roadmap = ROADMAPS[stream] || DEFAULT_ROADMAP

  const toggleTopic = (weekIdx, topicIdx) => {
    const key = `${weekIdx}-${topicIdx}`
    setCompletedTopics(p => ({ ...p, [key]: !p[key] }))
  }

  const totalTopics = roadmap.weeks.reduce((a, w) => a + w.topics.length, 0)
  const doneTopics = Object.values(completedTopics).filter(Boolean).length
  const progressPct = Math.round((doneTopics / totalTopics) * 100)

  return (
    <div className="min-h-screen p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-3">
          <Map size={24} className="text-cyber-blue" /> Learning Roadmap
        </h1>
        <p className="text-white/40 font-body text-sm mt-1">Personalized 6-week placement preparation plan for {stream}</p>
      </motion.div>

      {/* Overall progress */}
      <div className="glass-strong rounded-2xl p-6 cyber-border mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-display font-semibold text-white text-sm">Overall Progress</div>
            <div className="text-white/40 text-xs font-body mt-0.5">{doneTopics} / {totalTopics} topics completed</div>
          </div>
          <div className="font-display font-bold text-3xl text-cyber-blue">{progressPct}%</div>
        </div>
        <div className="progress-bar h-3">
          <motion.div className="h-full rounded-full" animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1 }}
            style={{ background: 'linear-gradient(90deg, #00d4ff, #7c3aed)' }} />
        </div>
      </div>

      {/* Week cards */}
      <div className="space-y-4 mb-8">
        {roadmap.weeks.map((week, wi) => {
          const isOpen = expandedWeek === wi
          const weekDone = week.topics.filter((_, ti) => completedTopics[`${wi}-${ti}`]).length
          const weekPct = Math.round((weekDone / week.topics.length) * 100)

          return (
            <motion.div key={wi}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: wi * 0.07 }}
              className="glass rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${isOpen ? week.color + '40' : 'rgba(255,255,255,0.06)'}` }}>
              {/* Header */}
              <button onClick={() => setExpandedWeek(isOpen ? -1 : wi)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/2 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
                  style={{ background: `${week.color}18`, border: `1px solid ${week.color}30`, color: week.color }}>
                  W{week.week}
                </div>
                <div className="flex-1">
                  <div className="font-display font-semibold text-white text-sm">{week.title}</div>
                  <div className="text-white/40 text-xs font-body mt-0.5">{weekDone}/{week.topics.length} topics · {weekPct}% done</div>
                </div>
                {/* Mini progress */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${weekPct}%`, background: week.color }} />
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-white/40 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/40 flex-shrink-0" />}
              </button>

              {/* Topics */}
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                  className="px-5 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {week.topics.map((topic, ti) => {
                      const done = completedTopics[`${wi}-${ti}`]
                      return (
                        <button key={ti} onClick={() => toggleTopic(wi, ti)}
                          className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/3"
                          style={{ background: done ? `${week.color}10` : 'rgba(255,255,255,0.02)', border: `1px solid ${done ? week.color + '30' : 'rgba(255,255,255,0.05)'}` }}>
                          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                            style={{ background: done ? week.color : 'rgba(255,255,255,0.06)', border: `1px solid ${done ? week.color : 'rgba(255,255,255,0.1)'}` }}>
                            {done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <span className={`text-sm font-body ${done ? 'line-through' : ''}`}
                            style={{ color: done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)' }}>
                            {topic}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Resources */}
      <div className="glass-strong rounded-2xl p-6 cyber-border">
        <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide flex items-center gap-2">
          <BookOpen size={16} className="text-cyber-blue" /> Recommended Resources
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {RESOURCES.map(({ name, url, desc }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
              className="glass rounded-xl p-4 hover:border-cyber-blue/20 transition-all group"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="font-body font-medium text-white/80 group-hover:text-white text-sm transition-colors">{name}</div>
                <ExternalLink size={12} className="text-white/20 group-hover:text-cyber-blue transition-colors" />
              </div>
              <div className="text-white/35 text-xs font-body">{desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
