"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type { PageView, DailyVisit } from "@/lib/data/admin-data"
import {
  apiFetchPageViews,
  apiFetchDailyVisits,
  apiFetchVisitorSummary,
  type VisitorSummary,
} from "@/lib/api"

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
  const [pageViews, setPageViews] = useState<PageView[]>([])
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([])
  const [visitorSummary, setVisitorSummary] = useState<VisitorSummary | null>(null)

  useEffect(() => {
    Promise.allSettled([
      apiFetchPageViews(),
      apiFetchDailyVisits(),
      apiFetchVisitorSummary(),
    ]).then(([pvResult, dvResult, vsResult]) => {
      if (pvResult.status === "fulfilled") setPageViews(pvResult.value)
      if (dvResult.status === "fulfilled") setDailyVisits(dvResult.value)
      if (vsResult.status === "fulfilled") setVisitorSummary(vsResult.value)
    })
  }, [])

  const totalViews = pageViews.reduce((sum, p) => sum + p.views, 0)

  return (
    <AnalyticsContext.Provider value={{ pageViews, dailyVisits, totalViews, visitorSummary }}>
      {children}
    </AnalyticsContext.Provider>
  )
}
