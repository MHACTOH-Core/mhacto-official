"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"
import type { PageView, DailyVisit } from "@/lib/data/admin-data"
import { MOCK_PAGE_VIEWS, MOCK_DAILY_VISITS } from "@/lib/data/admin-data"

// ─── Types ─────────────────────────────────────────────────────────

export interface AnalyticsContextValue {
  pageViews: PageView[]
  dailyVisits: DailyVisit[]
  totalViews: number
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider")
  return ctx
}

// ─── Provider ──────────────────────────────────────────────────────

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [pageViews] = useState<PageView[]>(MOCK_PAGE_VIEWS)
  const [dailyVisits] = useState<DailyVisit[]>(MOCK_DAILY_VISITS)
  const totalViews = pageViews.reduce((sum, p) => sum + p.views, 0)

  return (
    <AnalyticsContext.Provider value={{ pageViews, dailyVisits, totalViews }}>
      {children}
    </AnalyticsContext.Provider>
  )
}
