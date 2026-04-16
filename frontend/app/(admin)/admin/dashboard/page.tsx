"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useEffect, useState, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { useAdmin } from "@/components/providers/admin-provider"

// Lazy-load heavy dialog/modal components (only needed when opened)
const DashboardPrintReport = dynamic(() => import("@/components/admin/dashboard-print-report"), { ssr: false })
const PageViewsDialog = dynamic(() => import("@/components/admin/page-views-dialog").then(m => ({ default: m.PageViewsDialog })), { ssr: false })
const VisitorEngagementDialog = dynamic(() => import("@/components/admin/visitor-engagement-dialog").then(m => ({ default: m.VisitorEngagementDialog })), { ssr: false })
import {
  Users,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Footprints,
  CalendarCheck,
  ClockAlert,
  UserCheck,
  Mail,
  MapPin,
  Handshake,
  Printer,
  CalendarDays,
  RefreshCw,
} from "lucide-react"
import {
  inquiryStatusLabels,
  inquiryTypeLabels,
  type InquiryStatus,
  type InquiryType,
} from "@/lib/data/admin-data"
import { resolveMediaUrl } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { format, parseISO, startOfYear, isAfter, isBefore, startOfMonth, startOfWeek, differenceInDays } from "date-fns"

// Static gradient definitions — defined outside to avoid recreation on every render
const BAR_GRADIENTS = [
  { id: "barGrad0", from: "hsl(210, 80%, 55%)", to: "hsl(210, 80%, 72%)" },
  { id: "barGrad1", from: "hsl(145, 65%, 42%)", to: "hsl(145, 65%, 60%)" },
  { id: "barGrad2", from: "hsl(35, 90%, 55%)",  to: "hsl(35, 90%, 72%)" },
  { id: "barGrad3", from: "hsl(270, 60%, 55%)", to: "hsl(270, 60%, 72%)" },
  { id: "barGrad4", from: "hsl(190, 70%, 50%)", to: "hsl(190, 70%, 68%)" },
  { id: "barGrad5", from: "hsl(340, 70%, 55%)", to: "hsl(340, 70%, 72%)" },
  { id: "barGrad6", from: "hsl(160, 60%, 45%)", to: "hsl(160, 60%, 62%)" },
  { id: "barGrad7", from: "hsl(50, 85%, 52%)",  to: "hsl(50, 85%, 68%)" },
]

const INQUIRY_TYPE_ICON: Record<string, React.ElementType> = {
  general_contact: Mail,
  tour_booking: MapPin,
  partnership: Handshake,
}

export default function DashboardPage() {
  const router = useRouter()
  const {
    isLoggedIn,
    isHydrated,
    currentUser,
    pageViews,
    dailyVisits,
    inquiries,
    activityLog,
    visitorSummary,
    isLoadingAnalytics,
    activeDateFilter,
    refreshAnalytics,
    refreshAnalyticsWithRange,
  } = useAdmin()

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [showPageViewsDialog, setShowPageViewsDialog] = useState(false)
  const [showVisitorDialog, setShowVisitorDialog] = useState(false)

  // ── Global dashboard date filter ──
  type GlobalFilter = "all" | "today" | "week" | "month" | "year" | "custom"
  const [globalFilter, setGlobalFilter] = useState<GlobalFilter>("all")
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined)
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push("/admin")
  }, [isHydrated, isLoggedIn, router])

  useEffect(() => {
    let el = document.getElementById("print-portal")
    if (!el) {
      el = document.createElement("div")
      el.id = "print-portal"
      document.body.appendChild(el)
    }
    setPortalContainer(el)
    return () => {
      if (el && el.parentNode) el.parentNode.removeChild(el)
    }
  }, [])

  // ── Compute the active date range from the global filter ──
  const globalDateRange = useMemo(() => {
    const now = new Date()
    switch (globalFilter) {
      case "today":
        return { from: format(now, "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd"), label: "Today" }
      case "week": {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
        return { from: format(weekStart, "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd"), label: "This Week" }
      }
      case "month":
        return { from: format(startOfMonth(now), "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd"), label: "This Month" }
      case "year":
        return { from: format(startOfYear(now), "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd"), label: "This Year" }
      case "custom":
        if (customFrom && customTo)
          return {
            from: format(customFrom, "yyyy-MM-dd"),
            to:   format(customTo,   "yyyy-MM-dd"),
            label: `${format(customFrom, "MMM d")} – ${format(customTo, "MMM d, yyyy")}`,
          }
        return null
      default:
        return null // "all" → last 30 days (backend default)
    }
  }, [globalFilter, customFrom, customTo])

  // ── Re-fetch analytics whenever the global filter changes ──
  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return
    if (globalDateRange) {
      refreshAnalyticsWithRange(globalDateRange.from, globalDateRange.to, globalDateRange.label)
    } else if (globalFilter === "all") {
      refreshAnalytics()
    }
  // refreshAnalytics / refreshAnalyticsWithRange are stable useCallback refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDateRange, globalFilter, isHydrated, isLoggedIn])

  const handleExport = useCallback(() => {
    setShowPrintDialog(true)
  }, [])

  const handlePrintConfirm = useCallback(() => {
    setShowPrintDialog(false)
    setTimeout(() => window.print(), 100)
  }, [])

  // ── Memoized derived data ──

  const topPages = useMemo(() => [...pageViews].sort((a, b) => b.views - a.views), [pageViews])

  // Filter inquiries client-side by the active global date range
  const dateFilteredInquiries = useMemo(() => {
    if (!globalDateRange) return inquiries
    const from = parseISO(globalDateRange.from)
    const to   = parseISO(globalDateRange.to)
    return inquiries.filter((i) => {
      const d = parseISO(i.createdAt)
      return !isBefore(d, from) && !isAfter(d, to)
    })
  }, [inquiries, globalDateRange])

  const activeInquiries = useMemo(
    () => dateFilteredInquiries.filter((i) => i.status !== "spam" && i.status !== "trash"),
    [dateFilteredInquiries],
  )
  const totalActiveInquiries = activeInquiries.length

  const inquiryByType = useMemo(
    () => (["general_contact", "tour_booking", "partnership"] as InquiryType[]).map((type) => {
      const count = activeInquiries.filter((i) => i.inquiryType === type).length
      return { type, count, ...inquiryTypeLabels[type] }
    }),
    [activeInquiries],
  )

  const inquiryByStatus = useMemo(
    () => (["unread", "read", "assigned"] as InquiryStatus[]).map((status) => {
      const count = dateFilteredInquiries.filter((i) => i.status === status).length
      return { status, count, ...inquiryStatusLabels[status] }
    }),
    [dateFilteredInquiries],
  )

  // Auto-aggregate by month when range spans more than 60 days
  const visitChartData = useMemo(() => {
    const rangeDays = globalDateRange
      ? differenceInDays(parseISO(globalDateRange.to), parseISO(globalDateRange.from)) + 1
      : 30
    const aggregateByMonth = rangeDays > 60
    if (aggregateByMonth) {
      const monthly: Record<string, number> = {}
      for (const d of dailyVisits) {
        const key = format(parseISO(d.date), "MMM yyyy")
        monthly[key] = (monthly[key] ?? 0) + d.views
      }
      return Object.entries(monthly).map(([date, views]) => ({ date, views }))
    }
    return dailyVisits.map((d) => ({ date: format(parseISO(d.date), "MMM d"), views: d.views }))
  }, [dailyVisits, globalDateRange])

  const totals = visitorSummary?.totals

  const pieData = useMemo(
    () => [
      { name: "Walk-ins",  value: totals?.walkIns ?? 0,           color: "hsl(210, 80%, 55%)", bg: "bg-blue-500",    ring: "ring-blue-500/20",    text: "text-blue-600 dark:text-blue-400" },
      { name: "Completed", value: totals?.bookingsCompleted ?? 0,  color: "hsl(145, 65%, 42%)", bg: "bg-emerald-500", ring: "ring-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
      { name: "Pending",   value: totals?.bookingsPending ?? 0,    color: "hsl(35, 90%, 55%)",  bg: "bg-amber-500",   ring: "ring-amber-500/20",   text: "text-amber-600 dark:text-amber-400" },
      { name: "Assigned",  value: totals?.guideAssigned ?? 0,      color: "hsl(270, 60%, 55%)", bg: "bg-violet-500",  ring: "ring-violet-500/20",  text: "text-violet-600 dark:text-violet-400" },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visitorSummary],
  )

  const pieTotal = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData])
  const hasPieData = pieTotal > 0

  const barChartData = useMemo(
    () => topPages.slice(0, 8).map((p, i) => ({
      name: p.title.length > 22 ? p.title.slice(0, 22) + "…" : p.title,
      views: Number(p.views),
      fill: `url(#${BAR_GRADIENTS[i % BAR_GRADIENTS.length].id})`,
    })),
    [topPages],
  )

  const recentActivity = useMemo(() => activityLog.slice(0, 5), [activityLog])

  const trafficSparkline = useMemo(() => visitChartData, [visitChartData])

  const { todayViews, trendPct, trendDir } = useMemo(() => {
    if (dailyVisits.length === 0)
      return { todayViews: 0, trendPct: 0, trendDir: "neutral" as const }
    const sorted = [...dailyVisits].sort((a, b) => a.date.localeCompare(b.date))
    const today = sorted[sorted.length - 1]?.views ?? 0
    const yesterday = sorted[sorted.length - 2]?.views ?? 0
    const pct =
      yesterday === 0
        ? today > 0 ? 100 : 0
        : Math.round(((today - yesterday) / yesterday) * 100)
    const dir = pct > 0 ? "up" : pct < 0 ? "down" : "neutral"
    return { todayViews: today, trendPct: Math.abs(pct), trendDir: dir }
  }, [dailyVisits])

  const statCards = useMemo(
    () => [
      {
        label: "Walk-ins",
        value: totals?.walkIns ?? 0,
        icon: Footprints,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300",
        href: "/admin/inquiries",
      },
      {
        label: "Bookings Completed",
        value: totals?.bookingsCompleted ?? 0,
        icon: CalendarCheck,
        color: "text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-300",
        href: "/admin/inquiries",
      },
      {
        label: "Bookings Pending",
        value: totals?.bookingsPending ?? 0,
        icon: ClockAlert,
        color: "text-orange-600 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300",
        href: "/admin/inquiries",
      },
      {
        label: "Guide Assigned",
        value: totals?.guideAssigned ?? 0,
        icon: UserCheck,
        color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300",
        href: "/admin/inquiries",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visitorSummary],
  )

  // ── Early returns (after all hooks) ──
  if (!isHydrated || !isLoggedIn || !currentUser) return null

  // Only super_admin and admin can access dashboard
  if (currentUser.role === "content_manager") {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Access Restricted</h2>
          <p className="mt-2 text-muted-foreground">You don&apos;t have permission to access the dashboard.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-card-foreground sm:text-2xl">Dashboard</h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {activeDateFilter
                  ? <>Showing data for <strong>{activeDateFilter.label}</strong> ({activeDateFilter.from} – {activeDateFilter.to})</>
                  : <>Welcome back — here&apos;s what&apos;s happening on your website.</>}
              </p>
            </div>
            {currentUser && (
              <div className="flex flex-wrap items-center gap-2">
                {/* ── Global Date Filter ── */}
                <Select value={globalFilter} onValueChange={(v) => setGlobalFilter(v as GlobalFilter)}>
                  <SelectTrigger className="h-8 w-[145px] text-xs">
                    <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Last 30 days</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="custom">Custom range…</SelectItem>
                  </SelectContent>
                </Select>

                {/* Custom range date picker — shown only when "custom" is selected */}
                {globalFilter === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {customFrom && customTo
                          ? `${format(customFrom, "MMM d")} – ${format(customTo, "MMM d, yyyy")}`
                          : "Pick dates"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="range"
                        selected={customFrom && customTo ? { from: customFrom, to: customTo } : undefined}
                        onSelect={(range) => {
                          setCustomFrom(range?.from)
                          setCustomTo(range?.to)
                        }}
                        numberOfMonths={2}
                        disabled={{ after: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    if (globalDateRange) {
                      refreshAnalyticsWithRange(globalDateRange.from, globalDateRange.to, globalDateRange.label)
                    } else {
                      refreshAnalytics()
                    }
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleExport}
                >
                  <Printer className="h-3.5 w-3.5" /> Export PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Link key={stat.label} href={stat.href} className="group">
                <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1 sm:p-5 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</CardTitle>
                    <div className={`shrink-0 rounded-lg p-1.5 sm:rounded-xl sm:p-2 ${stat.color}`}>
                      <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                    {isLoadingAnalytics ? (
                      <Skeleton className="mt-1 h-7 w-10 sm:h-8 sm:w-12" />
                    ) : (
                      <p className="text-lg font-bold text-card-foreground sm:text-2xl">
                        {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Website Visits widget */}
          <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold sm:text-base">Website Visits</CardTitle>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {activeDateFilter ? activeDateFilter.label : "Last 30 days overview"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-6">
              {/* Left: number + trend */}
              <div className="min-w-[180px]">
                {isLoadingAnalytics ? (
                  <div className="space-y-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ) : dailyVisits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No visit data yet</p>
                ) : (
                  <>
                    <p className="text-3xl font-black text-card-foreground tabular-nums leading-none">
                      {dailyVisits.reduce((s, d) => s + d.views, 0).toLocaleString()}
                      <span className="text-sm font-medium text-muted-foreground ml-2">
                        {activeDateFilter ? activeDateFilter.label.toLowerCase() : "last 30d"}
                      </span>
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {trendDir === "up" && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <TrendingUp className="h-3 w-3" /> +{trendPct}%
                        </span>
                      )}
                      {trendDir === "down" && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
                          <TrendingDown className="h-3 w-3" /> -{trendPct}%
                        </span>
                      )}
                      {trendDir === "neutral" && (
                        <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          <Minus className="h-3 w-3" /> No change
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        latest day vs prior day
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Right: chart — fills remaining width */}
              <div className="h-36 w-full">
                {isLoadingAnalytics ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : trafficSparkline.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficSparkline} margin={{ top: 8, right: 12, bottom: 20, left: 12 }}>
                      <defs>
                        <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        dy={4}
                        interval={Math.max(0, Math.floor(trafficSparkline.length / 7) - 1)}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          color: "hsl(var(--card-foreground))",
                          fontSize: 12,
                          boxShadow: "0 8px 30px rgba(0,0,0,.12)",
                        }}
                        itemStyle={{ color: "hsl(var(--card-foreground))" }}
                        labelStyle={{ color: "hsl(var(--card-foreground))", fontSize: 11 }}
                        formatter={(value: number) => [`${value.toLocaleString()} visits`, ""]}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#visitGrad)"
                        dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        animationBegin={0}
                        animationDuration={900}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Not enough data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charts row — pie left, bar right, equal stretch */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Visitor Engagement */}
            <Card className="relative flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Visitor Engagement
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] font-semibold text-primary hover:text-primary/80 gap-1"
                    onClick={() => setShowVisitorDialog(true)}
                  >
                    View All <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {activeDateFilter ? activeDateFilter.label : "Last 30 days overview"}
                  </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                {isLoadingAnalytics ? (
                  <div className="flex flex-1 flex-col items-center gap-5 py-2">
                    <Skeleton className="h-44 w-44 rounded-full" />
                    <div className="w-full space-y-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i}>
                          <div className="mb-1 flex items-center justify-between">
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-3.5 w-12" />
                          </div>
                          <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : hasPieData ? (
                  <div className="flex flex-1 flex-col items-center gap-5 py-2">
                    {/* Donut chart centered */}
                    <div className="relative shrink-0">
                      <div className="h-44 w-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              {pieData.map((d, i) => (
                                <linearGradient key={d.name} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                                  <stop offset="100%" stopColor={d.color} stopOpacity={0.65} />
                                </linearGradient>
                              ))}
                            </defs>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius="56%"
                              outerRadius="88%"
                              paddingAngle={3}
                              dataKey="value"
                              strokeWidth={0}
                              cornerRadius={3}
                              animationBegin={0}
                              animationDuration={900}
                            >
                              {pieData.map((_, i) => (
                                <Cell key={pieData[i].name} fill={`url(#pieGrad${i})`} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: 10,
                                border: "1px solid hsl(var(--border))",
                                background: "hsl(var(--card))",
                                color: "hsl(var(--card-foreground))",
                                fontSize: 13,
                                boxShadow: "0 8px 30px rgba(0,0,0,.12)",
                              }}
                              itemStyle={{ color: "hsl(var(--card-foreground))" }}
                              labelStyle={{ color: "hsl(var(--card-foreground))" }}
                              formatter={(value: number, name: string) => [
                                `${value} (${pieTotal > 0 ? Math.round((value / pieTotal) * 100) : 0}%)`,
                                name,
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Center total overlay */}
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black leading-none text-card-foreground">{pieTotal}</span>
                        <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Total</span>
                      </div>
                    </div>

                    {/* Stat list below chart */}
                    <div className="w-full space-y-3">
                      {pieData.map((d) => {
                        const pct = pieTotal > 0 ? (d.value / pieTotal) * 100 : 0
                        return (
                          <div key={d.name}>
                            <div className="mb-1 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${d.bg}`} />
                                <span className="text-xs font-medium text-card-foreground">{d.name}</span>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className={`text-sm font-bold ${d.text}`}>{d.value}</span>
                                <span className="w-7 text-right text-[10px] font-medium text-muted-foreground">{pct.toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${d.bg} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    No visitor data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar chart — Most popular pages */}
            <Card className="relative flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Most Popular Pages
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowPageViewsDialog(true)}
                      className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="View all page views"
                    >
                      View All
                    </button>
                    <button
                      onClick={() => refreshAnalytics()}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="Refresh"
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground sm:text-xs">Top pages by total views</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                {isLoadingAnalytics ? (
                  <div className="flex flex-1 flex-col justify-center gap-2 py-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-5 w-28 shrink-0" />
                        <Skeleton className="h-5 flex-1" style={{ width: `${40 + (i % 3) * 20}%` }} />
                      </div>
                    ))}
                  </div>
                ) : barChartData.length > 0 ? (
                  <div className="flex-1 min-h-0" style={{ minHeight: Math.max(180, barChartData.length * 44 + 32) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                        <defs>
                          {BAR_GRADIENTS.map((g) => (
                            <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={g.from} stopOpacity={0.9} />
                              <stop offset="100%" stopColor={g.to} stopOpacity={0.7} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="hsl(var(--border))"
                          strokeOpacity={0.5}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          width={120}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "hsl(var(--muted))", opacity: 0.4, radius: 6 }}
                          contentStyle={{
                            borderRadius: 10,
                            border: "1px solid hsl(var(--border))",
                            background: "hsl(var(--card))",
                            color: "hsl(var(--card-foreground))",
                            fontSize: 13,
                            boxShadow: "0 8px 30px rgba(0,0,0,.12)",
                          }}
                          itemStyle={{ color: "hsl(var(--card-foreground))" }}
                          labelStyle={{ color: "hsl(var(--card-foreground))" }}
                          formatter={(value: number) => [`${value.toLocaleString()} views`, "Page Views"]}
                        />
                        <Bar
                          dataKey="views"
                          radius={[0, 8, 8, 0]}
                          barSize={22}
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {barChartData.map((entry, i) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    No page view data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom row: inquiry summary + recent activity */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
            {/* Inquiry Summary */}
            <Card className="lg:col-span-3 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Inquiry Summary
                  </CardTitle>
                  <Link
                    href="/admin/inquiries"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {/* Total count */}
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{totalActiveInquiries}</p>
                    <p className="text-[11px] text-muted-foreground">Total Inquiries</p>
                  </div>
                </div>

                {/* By inquiry type */}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  By Type
                </p>
                <div className="mb-4 space-y-2">
                  {inquiryByType.map((t) => {
                    const pct = totalActiveInquiries > 0 ? (t.count / totalActiveInquiries) * 100 : 0
                    const Icon = INQUIRY_TYPE_ICON[t.type] ?? Mail
                    return (
                      <div key={t.type} className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent sm:gap-3 sm:px-3">
                        <Badge className={`shrink-0 gap-1 text-[10px] sm:text-xs ${t.color}`}>
                          <Icon className="h-3 w-3" />
                          {t.label}
                        </Badge>
                        <div className="mx-1 h-1.5 flex-1 overflow-hidden rounded-full bg-border/40">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-card-foreground sm:text-sm">
                          {t.count}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* By status */}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  By Status
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {inquiryByStatus.map((s) => (
                    <div
                      key={s.status}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 transition-all hover:border-border hover:bg-muted/60"
                    >
                      <Badge className={`text-[10px] sm:text-xs ${s.color}`}>{s.label}</Badge>
                      <span className="text-sm font-bold text-card-foreground">{s.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Recent Activity
                  </CardTitle>
                  <Link
                    href="/admin/activity-log"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics && recentActivity.length === 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="mt-1 h-2 w-2 shrink-0 rounded-full" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <Skeleton className="h-3.5 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((entry) => {
                      const initials = entry.user
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                      return (
                        <div key={entry.id} className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 border border-border/50">
                            {entry.profilePicture && (
                              <AvatarImage
                                src={resolveMediaUrl(entry.profilePicture)}
                                alt={entry.user}
                              />
                            )}
                            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-card-foreground sm:text-sm">
                              {entry.user}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                              {entry.description}
                            </p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              {format(parseISO(entry.timestamp), "MMM d, yyyy · h:mm a")}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    No recent activity yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Page views detail dialog */}
        <PageViewsDialog
          open={showPageViewsDialog}
          onOpenChange={setShowPageViewsDialog}
        />

        {/* Visitor engagement detail dialog */}
        <VisitorEngagementDialog
          open={showVisitorDialog}
          onOpenChange={setShowVisitorDialog}
        />

        {/* Pre-print instruction dialog */}
        <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> Before You Print
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-foreground">
                  <p>To get a clean PDF without the browser URL and page title, follow these steps in the print dialog:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                    <li>Click <strong className="text-foreground">More settings</strong></li>
                    <li>Uncheck <strong className="text-foreground">Headers and footers</strong></li>
                    <li>Click <strong className="text-foreground">Print</strong> or <strong className="text-foreground">Save</strong></li>
                  </ol>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePrintConfirm} className="gap-2">
                <Printer className="h-4 w-4" /> Open Print Dialog
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Print-only report (rendered into a portal outside the app shell) */}
        {portalContainer &&
          createPortal(
            <DashboardPrintReport
              statCards={statCards}
              pieData={pieData}
              pieTotal={pieTotal}
              topPages={topPages}
              inquiryByType={inquiryByType}
              inquiryByStatus={inquiryByStatus}
              totalActiveInquiries={totalActiveInquiries}
              recentActivity={recentActivity}
              generatedBy={currentUser?.fullName || currentUser?.email || "Super Admin"}
              reportPeriod={activeDateFilter
                ? `${activeDateFilter.label} (${activeDateFilter.from} – ${activeDateFilter.to})`
                : "Last 30 Days"}
            />,
            portalContainer,
          )}
    </main>
  )
}
