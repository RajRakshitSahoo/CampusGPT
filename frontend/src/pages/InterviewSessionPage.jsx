import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, SkipForward, Camera, CameraOff, AlertTriangle, Volume2, VolumeX, ChevronRight } from 'lucide-react'
import { interviewAPI } from '../api'
import { useInterviewStore } from '../store'
import { useTTS } from '../hooks/useSpeech'
import { useWebcam, useTabFocus } from '../hooks/useWebcam'
import toast from 'react-hot-toast'

const SKIP_PHRASES = ['i don\'t know', 'idk', 'no idea', 'not sure', 'skip', 'pass', 'don\'t know']

const MODE_CONFIG = {
  easy: { voice: 'female', timeout: 30, name: 'Sarah', title: 'Junior Interviewer', color: '#10b981' },
  hard: { voice: 'female', timeout: 20, name: 'Ms. Priya', title: 'Senior Recruiter', color: '#f59e0b' },
  the_interview: { voice: 'male', timeout: 15, name: 'Mr. Sharma', title: 'VP Engineering', color: '#ef4444' },
}

export default function InterviewSessionPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { currentSession, setSession, incrementTabSwitch } = useInterviewStore()

  const [session, setLocalSession] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [listening, setListening] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [phase, setPhase] = useState('question') // question | answering | evaluating | result
  const [evaluation, setEvaluation] = useState(null)
  const [finished, setFinished] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [phaseLabel, setPhaseLabel] = useState('HR Round')

  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  const { speak, stop: stopTTS, speaking } = useTTS()
  const { videoRef, active: camActive, start: startCam, stop: stopCam, focusScore } = useWebcam()
  const { tabSwitches } = useTabFocus(incrementTabSwitch)

  // Load session
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await interviewAPI.getSession(Number(sessionId))
        setLocalSession(data)
        setSession(data)
        // Speak first question
        const q = data.questions?.[0]
        if (q && ttsEnabled) {
          const config = MODE_CONFIG[data.mode] || MODE_CONFIG.easy
          setTimeout(() => speak(q.question, config.voice), 800)
        }
      } catch {
        toast.error('Session not found')
        navigate('/interview')
      }
    }
    load()
  }, [sessionId])

  // Phase tracking for the_interview
  useEffect(() => {
    if (session?.mode === 'the_interview') {
      if (qIndex < 12) setPhaseLabel('HR Round')
      else if (qIndex < 35) setPhaseLabel('Technical Round')
      else setPhaseLabel('Pressure Round')
    }
  }, [qIndex, session?.mode])

  // Timer
  useEffect(() => {
    if (!session || phase !== 'answering') return
    const config = MODE_CONFIG[session.mode] || MODE_CONFIG.easy
    setTimeLeft(config.timeout)
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, qIndex])

  // Speech recognition
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast.error('Speech recognition not supported. Please type your answer.'); return }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      let final = '', interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      if (final) setAnswer(p => p + ' ' + final)
      else setTranscript(interim)
    }
    rec.onerror = () => { setListening(false) }
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
    setTranscript('')
  }, [])

  const handleStartAnswering = () => {
    setPhase('answering')
    setAnswer('')
    stopTTS()
  }

  const handleSubmit = async (timedOut = false) => {
    if (submitting) return
    clearInterval(timerRef.current)
    stopListening()

    const finalAnswer = timedOut ? (answer || '[Time expired - no answer]') : (answer.trim() || '[Skipped]')
    const isSkip = SKIP_PHRASES.some(p => finalAnswer.toLowerCase().includes(p)) || finalAnswer === '[Skipped]'

    setSubmitting(true)
    setPhase('evaluating')

    try {
      const { data } = await interviewAPI.submitAnswer({
        session_id: Number(sessionId),
        question_index: qIndex,
        answer: finalAnswer,
        time_taken: (MODE_CONFIG[session?.mode]?.timeout || 30) - timeLeft,
      })
      setEvaluation(data.evaluation)
      setPhase('result')
    } catch {
      setPhase('result')
      setEvaluation({ score: 0, feedback: 'Error evaluating answer.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    const total = session?.questions?.length || 0
    if (qIndex + 1 >= total) {
      handleComplete()
    } else {
      setQIndex(p => p + 1)
      setAnswer('')
      setEvaluation(null)
      setPhase('question')
      // Speak next question
      const nextQ = session?.questions?.[qIndex + 1]
      if (nextQ && ttsEnabled) {
        const config = MODE_CONFIG[session.mode] || MODE_CONFIG.easy
        setTimeout(() => speak(nextQ.question, config.voice), 400)
      }
    }
  }

  const handleComplete = async () => {
    try {
      await interviewAPI.complete(Number(sessionId), tabSwitches, focusScore)
      setFinished(true)
      stopCam()
      setTimeout(() => navigate(`/interview/report/${sessionId}`), 1500)
    } catch {
      navigate(`/interview/report/${sessionId}`)
    }
  }

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyber-blue/30 border-t-cyber-blue rounded-full animate-spin" />
    </div>
  )

  if (finished) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #10b981, #00d4ff)' }}>
        <span className="text-white text-3xl">✓</span>
      </motion.div>
      <div className="font-display font-bold text-white text-xl">Interview Complete!</div>
      <div className="text-white/40 font-body text-sm">Generating your report...</div>
    </div>
  )

  const currentQ = session.questions?.[qIndex]
  const config = MODE_CONFIG[session.mode] || MODE_CONFIG.easy
  const progress = ((qIndex) / (session.questions?.length || 1)) * 100
  const timePercent = (timeLeft / (config.timeout)) * 100

  return (
    <div className="min-h-screen p-6 flex flex-col max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-display font-bold text-white text-sm tracking-widest uppercase">
            {session.mode === 'the_interview' ? phaseLabel : session.mode === 'easy' ? 'Easy Interview' : 'Hard Interview'}
          </div>
          <div className="text-white/40 text-xs font-body mt-0.5">{session.stream}</div>
        </div>
        <div className="flex items-center gap-4">
          {/* Tab switch indicator */}
          {tabSwitches > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-yellow-400">
              <AlertTriangle size={13} /> {tabSwitches} tab switch{tabSwitches > 1 ? 'es' : ''}
            </div>
          )}
          {/* Webcam toggle */}
          <button onClick={() => { if (camActive) stopCam(); else startCam(); setShowWebcam(!camActive) }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              camActive ? 'bg-cyber-blue/15 text-cyber-blue' : 'bg-white/5 text-white/30 hover:text-white/60'
            }`}>
            {camActive ? <Camera size={15} /> : <CameraOff size={15} />}
          </button>
          {/* TTS toggle */}
          <button onClick={() => { setTtsEnabled(p => !p); stopTTS() }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              ttsEnabled ? 'bg-cyber-blue/15 text-cyber-blue' : 'bg-white/5 text-white/30 hover:text-white/60'
            }`}>
            {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          {/* Question counter */}
          <div className="glass rounded-lg px-3 py-1.5 text-xs font-mono text-white/60">
            {qIndex + 1} / {session.questions?.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden mb-8" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
          style={{ background: `linear-gradient(90deg, ${config.color}, #00d4ff)` }} />
      </div>

      <div className="flex gap-6 flex-1">
        {/* Main interview area */}
        <div className="flex-1 flex flex-col">
          {/* Interviewer card */}
          <motion.div key={qIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-6 mb-6" style={{ border: `1px solid ${config.color}20` }}>
            <div className="flex items-center gap-4 mb-5">
              {/* Avatar */}
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${config.color}30, ${config.color}10)`, border: `2px solid ${config.color}40` }}>
                <span className="font-display font-bold text-lg" style={{ color: config.color }}>
                  {config.name[0]}
                </span>
                {speaking && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: config.color }}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-display font-semibold text-white text-sm">{config.name}</div>
                <div className="text-white/40 text-xs font-body">{config.title}</div>
                {session.mode === 'the_interview' && (
                  <div className="text-xs font-mono mt-0.5" style={{ color: config.color }}>{phaseLabel}</div>
                )}
              </div>
              {/* Q category badge */}
              {currentQ?.category && (
                <div className="ml-auto px-3 py-1 rounded-full text-xs font-mono"
                  style={{ background: `${config.color}12`, color: config.color, border: `1px solid ${config.color}25` }}>
                  {currentQ.category}
                </div>
              )}
            </div>

            {/* Question text */}
            <div className="font-body text-white text-base leading-relaxed mb-4">
              {currentQ?.question}
            </div>

            {/* Speak button */}
            {ttsEnabled && phase === 'question' && (
              <button onClick={() => speak(currentQ?.question, config.voice)}
                className="flex items-center gap-2 text-xs font-mono transition-colors"
                style={{ color: speaking ? config.color : 'rgba(255,255,255,0.3)' }}>
                <Volume2 size={13} />
                {speaking ? 'Speaking...' : 'Replay question'}
              </button>
            )}
          </motion.div>

          {/* Answer area */}
          <AnimatePresence mode="wait">
            {phase === 'question' && (
              <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-6">
                <button onClick={handleStartAnswering} className="btn-primary rounded-xl px-8 py-3.5 flex items-center gap-2 mx-auto">
                  <Mic size={18} /> Begin Answering
                </button>
                <p className="text-white/30 text-xs font-body mt-3">You'll have {config.timeout} seconds</p>
              </motion.div>
            )}

            {phase === 'answering' && (
              <motion.div key="answering" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 mb-4">
                {/* Timer */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${listening ? 'record-pulse' : ''}`}
                      style={{ background: listening ? '#ef4444' : 'rgba(255,255,255,0.2)' }} />
                    <span className="text-xs font-mono text-white/50">{listening ? 'Recording...' : 'Microphone off'}</span>
                  </div>
                  <div className={`font-mono text-sm font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white/70'}`}>
                    {timeLeft}s
                  </div>
                </div>
                {/* Timer bar */}
                <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${timePercent}%`, background: timeLeft <= 5 ? '#ef4444' : `linear-gradient(90deg, ${config.color}, #00d4ff)` }} />
                </div>

                {/* Transcript preview */}
                {(answer || transcript) && (
                  <div className="mb-4 p-3 rounded-lg text-sm font-body text-white/70 leading-relaxed min-h-16"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {answer}
                    {transcript && <span className="text-white/30 italic">{transcript}</span>}
                  </div>
                )}

                {/* Text fallback */}
                <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here (or use mic)..."
                  className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white/80 text-sm font-body resize-none outline-none mb-4 focus:border-cyber-blue/30"
                  rows={3} />

                <div className="flex gap-3">
                  <button onClick={listening ? stopListening : startListening}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono transition-all ${
                      listening ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}
                    style={listening
                      ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {listening ? <><MicOff size={15} /> Stop</> : <><Mic size={15} /> Record</>}
                  </button>
                  <button onClick={() => handleSubmit(false)} disabled={submitting}
                    className="btn-primary rounded-lg flex items-center gap-2 flex-1 justify-center text-sm disabled:opacity-50">
                    Submit Answer <ChevronRight size={15} />
                  </button>
                  <button onClick={() => { setAnswer('I don\'t know'); handleSubmit(false) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono text-white/30 hover:text-white/60 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <SkipForward size={15} /> Skip
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'evaluating' && (
              <motion.div key="evaluating" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-12">
                <div className="w-10 h-10 border-2 border-cyber-blue/30 border-t-cyber-blue rounded-full animate-spin mx-auto mb-4" />
                <div className="text-white/60 font-body text-sm">AI evaluating your answer...</div>
              </motion.div>
            )}

            {phase === 'result' && evaluation && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 mb-4" style={{ border: `1px solid ${evaluation.score >= 60 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display font-semibold text-white text-sm">Answer Evaluation</div>
                  <div className="font-display font-bold text-2xl" style={{ color: evaluation.score >= 70 ? '#10b981' : evaluation.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {Math.round(evaluation.score || 0)}<span className="text-xs text-white/30">/100</span>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Technical', score: evaluation.technical_accuracy },
                    { label: 'Communication', score: evaluation.communication },
                    { label: 'Completeness', score: evaluation.completeness },
                  ].map(({ label, score }) => (
                    <div key={label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="font-display font-bold text-white text-base">{Math.round(score || 0)}</div>
                      <div className="text-white/40 text-xs font-body mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="text-white/60 text-sm font-body mb-3 leading-relaxed">{evaluation.feedback}</div>
                {evaluation.improvement && (
                  <div className="text-xs font-body text-yellow-400/80 mb-4">
                    💡 {evaluation.improvement}
                  </div>
                )}

                <button onClick={handleNext} className="btn-primary rounded-lg w-full flex items-center justify-center gap-2">
                  {qIndex + 1 >= (session.questions?.length || 0) ? 'View Report' : 'Next Question'} <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Webcam sidebar */}
        {camActive && (
          <div className="w-52 flex-shrink-0">
            <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,212,255,0.15)' }}>
              <video ref={videoRef} className="w-full aspect-video object-cover" muted />
              <div className="p-3">
                <div className="text-xs font-mono text-white/40 mb-1">Focus Score</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${focusScore}%` }} />
                </div>
                <div className="text-right text-xs font-mono mt-1 text-cyber-blue">{focusScore}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
