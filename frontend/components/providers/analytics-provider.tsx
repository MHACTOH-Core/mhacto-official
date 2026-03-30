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
  apiFetchPageViews,
  apiFetchDailyVisits,
  apiFetchVisitorSummary,
  type VisitorSummary,
} from "@/lib/api"
import { useAuth } from "./auth-provider"

// ─── Types ─────────────────────────────────────────────────────────

export interface AnalyticsContextValue {
  pageViews: PageView[]
  dailyVisits: DailyVisit[]
  totalViews: number
  visitorSummary: VisitorSummary | null
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

  const fetchAnalytics = useCallback(async () => {
    const [pvResult, dvResult, vsResult] = await Promise.allSettled([
      apiFetchPageViews(),
      apiFetchDailyVisits(),
      apiFetchVisitorSummary(),
    ])
    if (pvResult.status === "fulfilled") setPageViews(pvResult.value)
    if (dvResult.status === "fulfilled") setDailyVisits(dvResult.value)
    if (vsResult.status === "fulfilled") setVisitorSummary(vsResult.value)
  }, [])

  // Only fetch analytics after the user is authenticated
  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return
    fetchAnalytics()
  }, [isHydrated, isLoggedIn, fetchAnalytics])

  // Re-fetch when the user switches back to this tab (keeps data fresh)
  useEffect(() => {
    if (!isLoggedIn) return
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchAnalytics()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [isLoggedIn, fetchAnalytics])

  const totalViews = pageViews.reduce((sum, p) => sum + p.views, 0)

  return (
    <AnalyticsContext.Provider value={{ pageViews, dailyVisits, totalViews, visitorSummary }}>
      {children}
    </AnalyticsContext.Provider>
  )
}
