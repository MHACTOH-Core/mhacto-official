import { useState, useEffect, useCallback, useRef } from "react"

const IDLE_TIMEOUT = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS) || 30 * 60 * 1000 // 30 min
const WARNING_DURATION = Number(process.env.NEXT_PUBLIC_IDLE_WARNING_MS) || 5 * 60 * 1000 // 5 min
const STORAGE_KEY = "admin_last_activity"
const TRACKED_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const

export function useIdleTimer(enabled: boolean) {
  const [isWarning, setIsWarning] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(Math.floor(WARNING_DURATION / 1000))

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const warningStartRef = useRef<number | null>(null)
  const throttleRef = useRef(0)

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
    warningStartRef.current = null
  }, [])

  const startCountdown = useCallback(() => {
    setIsWarning(true)
    setRemainingSeconds(Math.floor(WARNING_DURATION / 1000))
    warningStartRef.current = Date.now()

    countdownRef.current = setInterval(() => {
      if (!warningStartRef.current) return
      const elapsed = Date.now() - warningStartRef.current
      const remaining = Math.max(0, Math.ceil((WARNING_DURATION - elapsed) / 1000))
      setRemainingSeconds(remaining)

      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current)
        setIsTimedOut(true)
      }
    }, 1000)
  }, [])

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      startCountdown()
    }, IDLE_TIMEOUT)
  }, [startCountdown])

  const reset = useCallback(() => {
    clearTimers()
    setIsWarning(false)
    setIsTimedOut(false)
    setRemainingSeconds(Math.floor(WARNING_DURATION / 1000))
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    }
    startIdleTimer()
  }, [clearTimers, startIdleTimer])

  // Record activity (throttled to once per second)
  const recordActivity = useCallback(() => {
    const now = Date.now()
    if (now - throttleRef.current < 1000) return
    throttleRef.current = now
    localStorage.setItem(STORAGE_KEY, String(now))
    // Only reset idle timer if NOT already in warning state
    if (!warningStartRef.current) {
      startIdleTimer()
    }
  }, [startIdleTimer])

  useEffect(() => {
    if (!enabled) {
      clearTimers()
      setIsWarning(false)
      setIsTimedOut(false)
      setRemainingSeconds(Math.floor(WARNING_DURATION / 1000))
      return
    }

    // Initialize last activity
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    startIdleTimer()

    // Listen for user activity
    for (const event of TRACKED_EVENTS) {
      window.addEventListener(event, recordActivity, { passive: true })
    }

    // Cross-tab sync: listen for activity in other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      const otherTabActivity = Number(e.newValue)
      if (otherTabActivity > 0 && !warningStartRef.current) {
        startIdleTimer()
      } else if (otherTabActivity > 0 && warningStartRef.current) {
        // Another tab had activity — reset warning
        clearTimers()
        setIsWarning(false)
        setIsTimedOut(false)
        setRemainingSeconds(Math.floor(WARNING_DURATION / 1000))
        startIdleTimer()
      }
    }
    window.addEventListener("storage", onStorage)

    // Re-check idle time when tab becomes visible
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return
      const lastActivity = Number(localStorage.getItem(STORAGE_KEY) || 0)
      const elapsed = Date.now() - lastActivity

      if (elapsed >= IDLE_TIMEOUT + WARNING_DURATION) {
        // Already past both idle + warning window → timeout
        clearTimers()
        setIsWarning(false)
        setIsTimedOut(true)
      } else if (elapsed >= IDLE_TIMEOUT && !warningStartRef.current) {
        // Past idle but within warning window → start countdown with adjusted remaining
        const warningElapsed = elapsed - IDLE_TIMEOUT
        warningStartRef.current = Date.now() - warningElapsed
        setIsWarning(true)
        const remaining = Math.max(0, Math.ceil((WARNING_DURATION - warningElapsed) / 1000))
        setRemainingSeconds(remaining)

        if (remaining <= 0) {
          setIsTimedOut(true)
        } else {
          countdownRef.current = setInterval(() => {
            if (!warningStartRef.current) return
            const el = Date.now() - warningStartRef.current
            const rem = Math.max(0, Math.ceil((WARNING_DURATION - el) / 1000))
            setRemainingSeconds(rem)
            if (rem <= 0) {
              if (countdownRef.current) clearInterval(countdownRef.current)
              setIsTimedOut(true)
            }
          }, 1000)
        }
      } else if (!warningStartRef.current) {
        // Still within idle window → restart timer with adjusted time
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        const remainingIdle = IDLE_TIMEOUT - elapsed
        idleTimerRef.current = setTimeout(() => {
          startCountdown()
        }, remainingIdle)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      clearTimers()
      for (const event of TRACKED_EVENTS) {
        window.removeEventListener(event, recordActivity)
      }
      window.removeEventListener("storage", onStorage)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [enabled, clearTimers, startIdleTimer, recordActivity, startCountdown])

  return { isWarning, isTimedOut, remainingSeconds, reset }
}
