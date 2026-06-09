import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Lightbulb, ChevronDown, ChevronUp, Loader } from 'lucide-react'
import { resumeAPI } from '../api'
import ScoreRing from '../components/dashboard/ScoreRing'
import toast from 'react-hot-toast'

export default function ResumePage() {
  const [uploading, setUploading] = useState(false)
  const [resume, setResume] = useState(null)
  const [resumes, setResumes] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    resumeAPI.list().then(r => { setResumes(r.data || []); if (r.data?.length) setResume(r.data[0]) }).catch(() => {})
  }, [])

  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'doc'].includes(ext)) { toast.error('Please upload a PDF or DOCX file'); return }
    setUploading(true)
    try {
      const { data } = await resumeAPI.upload(file)
      setResume(data)
      setResumes(p => [data, ...p])
      toast.success('Resume analyzed successfully!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1, disabled: uploading,
  })

  return (
    <div className="min-h-screen p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white tracking-wide">Resume Analysis</h1>
        <p className="text-white/40 font-body text-sm mt-1">AI-powered resume scanner & ATS optimizer</p>
      </motion.div>

      {/* Upload zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        {...getRootProps()}
        className={`relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-8 ${
          isDragActive ? 'border-cyber-blue bg-cyber-blue/5' : 'glass border-2 border-dashed border-white/10 hover:border-cyber-blue/40'
        }`}>
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader size={40} className="text-cyber-blue animate-spin" />
            <div className="font-display font-semibold text-white text-sm tracking-wide">Analyzing your resume with AI...</div>
            <div className="text-white/40 text-xs font-body">Extracting skills, projects, and experience</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Upload size={28} className="text-cyber-blue" />
            </div>
            <div>
              <div className="font-display font-semibold text-white text-sm tracking-wide mb-1">
                {isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}
              </div>
              <div className="text-white/40 text-xs font-body">Drag & drop or click · PDF, DOCX supported · Max 10MB</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* History toggle */}
      {resumes.length > 1 && (
        <div className="mb-6">
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-body transition-colors">
            <FileText size={16} />
            {resumes.length} resumes analyzed
            {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {resumes.map(r => (
                  <button key={r.id} onClick={() => setResume(r)}
                    className={`glass rounded-xl p-4 text-left transition-all hover:border-cyber-blue/30 ${resume?.id === r.id ? 'border border-cyber-blue/40 bg-cyber-blue/5' : 'border border-white/5'}`}>
                    <div className="text-white text-xs font-mono truncate">{r.filename}</div>
                    <div className="text-white/40 text-xs mt-1">{Math.round(r.resume_score)}/100 · {r.branch?.split(' ')[0]}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {resume && (
          <motion.div key={resume.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6">
            {/* Score cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scores */}
              <div className="glass-strong rounded-2xl p-6 cyber-border col-span-1">
                <h3 className="font-display font-semibold text-white text-sm mb-6 tracking-wide">Resume Scores</h3>
                <div className="flex justify-around">
                  <ScoreRing score={resume.resume_score} label="Resume Score" size={110} />
                  <ScoreRing score={resume.ats_score} label="ATS Score" size={110} color="#7c3aed" />
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { label: 'Content Quality', score: Math.min(100, (resume.resume_score + 5)) },
                    { label: 'Keyword Density', score: resume.ats_score },
                    { label: 'Format Score', score: Math.min(100, resume.ats_score + 8) },
                  ].map(({ label, score }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-body text-white/50 mb-1">
                        <span>{label}</span><span>{Math.round(score)}%</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div className="progress-fill" initial={{ width: 0 }}
                          animate={{ width: `${score}%` }} transition={{ duration: 1, delay: 0.5 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted info */}
              <div className="glass-strong rounded-2xl p-6 cyber-border">
                <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide">Extracted Information</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Name', value: resume.extracted_data?.name },
                    { label: 'Email', value: resume.extracted_data?.email },
                    { label: 'Phone', value: resume.extracted_data?.phone },
                    { label: 'Degree', value: resume.extracted_data?.education?.degree },
                    { label: 'Branch', value: resume.branch },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-3">
                      <span className="text-white/30 text-xs font-mono w-16 flex-shrink-0 pt-0.5">{label}</span>
                      <span className="text-white/80 text-xs font-body">{value || '—'}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="text-white/30 text-xs font-mono mb-2">Skills Detected</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(resume.skills || []).slice(0, 12).map(skill => (
                      <span key={skill} className="px-2 py-0.5 rounded text-xs font-mono text-cyber-blue"
                        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projects/Certs */}
              <div className="glass-strong rounded-2xl p-6 cyber-border">
                <h3 className="font-display font-semibold text-white text-sm mb-4 tracking-wide">Projects & Experience</h3>
                {(resume.extracted_data?.projects?.length > 0) && (
                  <div className="mb-4">
                    <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">Projects</div>
                    {resume.extracted_data.projects.slice(0, 3).map((p, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1.5">
                        <div className="w-1 h-1 rounded-full bg-cyber-blue mt-2 flex-shrink-0" />
                        <span className="text-white/60 text-xs font-body line-clamp-2">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(resume.extracted_data?.certifications?.length > 0) && (
                  <div>
                    <div className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">Certifications</div>
                    {resume.extracted_data.certifications.slice(0, 3).map((c, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1.5">
                        <div className="w-1 h-1 rounded-full bg-cyber-green mt-2 flex-shrink-0" />
                        <span className="text-white/60 text-xs font-body">{c}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!resume.extracted_data?.projects?.length && !resume.extracted_data?.certifications?.length && (
                  <div className="text-white/30 text-xs font-body">No projects/certifications extracted. Add them to your resume.</div>
                )}
              </div>
            </div>

            {/* Strengths, Weaknesses, Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-green-400" />
                  <h3 className="font-display font-semibold text-white text-sm tracking-wide">Strengths</h3>
                </div>
                <div className="space-y-2">
                  {(resume.strengths || []).map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/70 text-sm font-body">{s}</span>
                    </div>
                  ))}
                  {!resume.strengths?.length && <div className="text-white/30 text-sm font-body">Upload a detailed resume to see strengths</div>}
                </div>
              </div>

              <div className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown size={18} className="text-red-400" />
                  <h3 className="font-display font-semibold text-white text-sm tracking-wide">Weaknesses</h3>
                </div>
                <div className="space-y-2">
                  {(resume.weaknesses || []).map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/70 text-sm font-body">{w}</span>
                    </div>
                  ))}
                  {!resume.weaknesses?.length && <div className="text-white/30 text-sm font-body">No major weaknesses detected</div>}
                </div>
              </div>

              <div className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={18} className="text-yellow-400" />
                  <h3 className="font-display font-semibold text-white text-sm tracking-wide">AI Suggestions</h3>
                </div>
                <div className="space-y-2">
                  {(resume.suggestions || []).slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-yellow-400 text-xs font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
                      <span className="text-white/70 text-sm font-body">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
