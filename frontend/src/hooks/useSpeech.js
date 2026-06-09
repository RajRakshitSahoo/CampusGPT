import { useState, useRef, useCallback, useEffect } from 'react'

// Text-to-Speech hook using browser API
export function useTTS() {
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  const speak = useCallback((text, voice = 'female') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = voice === 'female' ? 1.1 : 0.9
    utterance.volume = 1

    // Pick voice
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      const preferred = voice === 'female'
        ? voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Zira') || v.name.includes('Google UK English Female') || v.name.includes('Samantha'))
        : voices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('David') || v.name.includes('Google UK English Male') || v.name.includes('Alex'))
      if (preferred) utterance.voice = preferred
    }

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { speak, stop, speaking }
}

// Speech-to-Text hook using Web Speech API
export function useSTT() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let final = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript
          else interim += event.results[i][0].transcript
        }
        setTranscript((prev) => prev + final || interim)
      }

      recognition.onerror = (e) => {
        setError(e.error)
        setListening(false)
      }

      recognition.onend = () => setListening(false)

      recognitionRef.current = recognition
    }

    return () => recognitionRef.current?.abort()
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setTranscript('')
    setError(null)
    setListening(true)
    try {
      recognitionRef.current.start()
    } catch {}
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const resetTranscript = useCallback(() => setTranscript(''), [])

  return { listening, transcript, error, supported, startListening, stopListening, resetTranscript }
}
