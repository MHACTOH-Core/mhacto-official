"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { PageView, DailyVisit } from "@/lib/data/admin-data"
import {
  apiFetchAnalyticsDashboard,
  AuthExpiredError,
  type VisitorSummary,
} from "@/lib/api"
import { useAuth } from "./auth-provider"

// ─── Types ─────────────────────────────────────────────────────────

export interface AnalyticsContextValue {
  pageViews: PageView[]
  dailyVisits: DailyVisit[]
  totalViews: number
  visitorSummary: VisitorSummary | null
  isLoadingAnalytics: boolean
  refreshAnalytics: () => Promise<void>
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider")
  return ctx
}

// ─── Provider ──────────────────────────────────────────────────────

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, isHydrated } = useAuth()
  const [pageViews, setPageViews] = useState<PageView[]>([])
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([])
  const [visitorSummary, setVisitorSummary] = useState<VisitorSummary | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true)
    try {
      const data = await apiFetchAnalyticsDashboard()
      setPageViews(data.pageViews)
      setDailyVisits(data.dailyVisits)
      setVisitorSummary(data.visitorSummary)
    } catch (e) {
      if (!(e instanceof AuthExpiredError) && !(e instanceof Error && /network error/i.test(e.message))) {
        console.error("[Analytics] dashboard fetch failed:", e)
      }
    } finally {
      setIsLoadingAnalytics(false)
    }
  }, [])

  // Delay analytics fetch so CMS data provider's 6 parallel requests finish first
  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return
    setIsLoadingAnalytics(true)
    const timer = setTimeout(fetchAnalytics, 500)
    return () => clearTimeout(timer)
  }, [isHydrated, isLoggedIn, fetchAnalytics])

  // Re-fetch when the user switches back to this tab (keeps data fresh)
  // Throttled to once every 30 s to avoid parallel requests from rapid alt-tabbing
  useEffect(() => {
    if (!isLoggedIn) return
    let lastFetch = 0
    const onVisible = () => {
      if (document.visibilityState !== "visible") return
      const now = Date.now()
      if (now - lastFetch < 30_000) return
      lastFetch = now
      fetchAnalytics()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [isLoggedIn, fetchAnalytics])

  const totalViews = pageViews.reduce((sum, p) => sum + p.views, 0)

  return (
    <AnalyticsContext.Provider value={{ pageViews, dailyVisits, totalViews, visitorSummary, isLoadingAnalytics, refreshAnalytics: fetchAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  )
}
