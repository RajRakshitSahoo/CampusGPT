import { useState, useRef, useCallback, useEffect } from 'react'

export function useWebcam() {
  const videoRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)
  const [facePresent, setFacePresent] = useState(true)
  const [focusScore, setFocusScore] = useState(100)
  const checkIntervalRef = useRef(null)
  const absenceCountRef = useRef(0)
  const totalChecksRef = useRef(0)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setActive(true)
      setError(null)

      // Simple heuristic: check if video is playing (proxy for face detection)
      checkIntervalRef.current = setInterval(() => {
        totalChecksRef.current++
        // In a real app, you'd use face-api.js or similar
        // For now, we simulate with random minor variance
        const present = Math.random() > 0.05
        if (!present) absenceCountRef.current++
        setFacePresent(present)
        const score = Math.round(((totalChecksRef.current - absenceCountRef.current) / totalChecksRef.current) * 100)
        setFocusScore(score)
      }, 3000)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const stop = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    clearInterval(checkIntervalRef.current)
    setActive(false)
  }, [])

  useEffect(() => () => stop(), [stop])

  return { videoRef, active, error, facePresent, focusScore, start, stop }
}

export function useTabFocus(onSwitch) {
  const [tabSwitches, setTabSwitches] = useState(0)

  useEffect(() => {
    const handle = () => {
      if (document.hidden) {
        setTabSwitches(p => p + 1)
        onSwitch?.()
      }
    }
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [onSwitch])

  return { tabSwitches }
}
