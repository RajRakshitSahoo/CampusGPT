import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, User } from 'lucide-react'
import { authAPI } from '../api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      setAuth(data.user, data.access_token)
      toast.success(`Welcome, ${data.user.name}! Let's ace your interviews!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)', filter: 'blur(80px)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h1 className="font-display font-black text-3xl text-white tracking-widest">
            CAMPUS<span className="text-cyber-blue glow-text-blue">GPT</span>
          </h1>
          <p className="text-white/40 font-body text-sm mt-1">Start your AI-powered career journey</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <h2 className="font-display font-bold text-xl text-white mb-1 tracking-wide">Create Account</h2>
          <p className="text-white/40 text-sm font-body mb-8">Join thousands of students getting placement-ready</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/60 text-xs font-mono uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-cyber rounded-lg pl-10" placeholder="Raj Rakshit" />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-mono uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-cyber rounded-lg pl-10" placeholder="student@university.edu" />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-mono uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-cyber rounded-lg pl-10 pr-10" placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full rounded-lg py-3.5 mt-2 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : 'Get Started Free'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm font-body mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyber-blue hover:text-white transition-colors font-medium">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
