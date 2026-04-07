"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { useAdmin } from "@/components/providers/admin-provider"
import DashboardPrintReport from "@/components/admin/dashboard-print-report"
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Footprints,
  CalendarCheck,
  ClockAlert,
  UserCheck,
  Mail,
  MapPin,
  Handshake,
  Printer,
} from "lucide-react"
import {
  inquiryStatusLabels,
  inquiryTypeLabels,
  type InquiryStatus,
  type InquiryType,
} from "@/lib/data/admin-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "recharts"
import { format, parseISO } from "date-fns"

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
  } = useAdmin()

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push("/admin")
  }, [isHydrated, isLoggedIn, router])

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [showPrintDialog, setShowPrintDialog] = useState(false)

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

  const handleExport = useCallback(() => {
    setShowPrintDialog(true)
  }, [])

  const handlePrintConfirm = useCallback(() => {
    setShowPrintDialog(false)
    // Small delay so the dialog fully closes before print dialog opens
    setTimeout(() => window.print(), 100)
  }, [])

  if (!isHydrated || !isLoggedIn) return null

  const topPages = [...pageViews].sort((a, b) => b.views - a.views)

  // Inquiry summary — exclude spam/trash from active count
  const activeInquiries = inquiries.filter((i) => i.status !== "spam" && i.status !== "trash")
  const totalActiveInquiries = activeInquiries.length

  const inquiryTypeIcon: Record<string, React.ElementType> = {
    general_contact: Mail,
    tour_booking: MapPin,
    partnership: Handshake,
  }

  const inquiryByType = (["general_contact", "tour_booking", "partnership"] as InquiryType[]).map((type) => {
    const count = activeInquiries.filter((i) => i.inquiryType === type).length
    return { type, count, ...inquiryTypeLabels[type] }
  })

  const displayStatuses: InquiryStatus[] = ["unread", "in_progress", "assigned", "archived"]
  const inquiryByStatus = displayStatuses.map((status) => {
    const count = inquiries.filter((i) => i.status === status).length
    return { status, count, ...inquiryStatusLabels[status] }
  })

  // Chart data: daily visits last 30 days
  const visitChartData = dailyVisits.map((d) => ({
    date: format(parseISO(d.date), "MMM d"),
    views: d.views,
  }))

  const totals = visitorSummary?.totals

  // Pie chart data for visitor engagement
  const pieData = [
    { name: "Walk-ins", value: totals?.walkIns ?? 0, color: "hsl(210, 80%, 55%)", bg: "bg-blue-500", ring: "ring-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
    { name: "Completed", value: totals?.bookingsCompleted ?? 0, color: "hsl(145, 65%, 42%)", bg: "bg-emerald-500", ring: "ring-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
    { name: "Pending", value: totals?.bookingsPending ?? 0, color: "hsl(35, 90%, 55%)", bg: "bg-amber-500", ring: "ring-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
    { name: "Assigned", value: totals?.guideAssigned ?? 0, color: "hsl(270, 60%, 55%)", bg: "bg-violet-500", ring: "ring-violet-500/20", text: "text-violet-600 dark:text-violet-400" },
  ]
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0)
  const hasPieData = pieTotal > 0

  // Bar chart gradient colours — mirrors the pie palette
  const barGradients = [
    { id: "barGrad0", from: "hsl(210, 80%, 55%)", to: "hsl(210, 80%, 72%)" },
    { id: "barGrad1", from: "hsl(145, 65%, 42%)", to: "hsl(145, 65%, 60%)" },
    { id: "barGrad2", from: "hsl(35, 90%, 55%)",  to: "hsl(35, 90%, 72%)" },
    { id: "barGrad3", from: "hsl(270, 60%, 55%)", to: "hsl(270, 60%, 72%)" },
    { id: "barGrad4", from: "hsl(190, 70%, 50%)", to: "hsl(190, 70%, 68%)" },
    { id: "barGrad5", from: "hsl(340, 70%, 55%)", to: "hsl(340, 70%, 72%)" },
    { id: "barGrad6", from: "hsl(160, 60%, 45%)", to: "hsl(160, 60%, 62%)" },
    { id: "barGrad7", from: "hsl(50, 85%, 52%)",  to: "hsl(50, 85%, 68%)" },
  ]

  // Chart data: top 8 pages for bar chart
  const barChartData = topPages.slice(0, 8).map((p, i) => ({
    name: p.title.length > 22 ? p.title.slice(0, 22) + "…" : p.title,
    views: p.views,
    fill: `url(#${barGradients[i % barGradients.length].id})`,
  }))

  const recentActivity = activityLog.slice(0, 5)

  const statCards = [
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
  ]

  return (
    <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-card-foreground sm:text-2xl">Dashboard</h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Welcome back — here&apos;s what&apos;s happening on your website.
              </p>
            </div>
            {currentUser?.role === "super_admin" && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExport}
              >
                <Printer className="h-4 w-4" /> Export Summary
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Link key={stat.label} href={stat.href} className="group">
                <Card className="transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="flex items-start gap-3 p-3 sm:gap-4 sm:p-5">
                    <div className={`shrink-0 rounded-lg p-2 sm:rounded-xl sm:p-3 ${stat.color}`}>
                      <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-card-foreground sm:mt-1 sm:text-2xl">
                        {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Charts row — pie left, bar right, equal stretch */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Visitor Engagement */}
            <Card className="relative flex flex-col overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold sm:text-base">
                  Visitor Engagement
                </CardTitle>
                <p className="text-[11px] text-muted-foreground sm:text-xs">Last 30 days overview</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                {hasPieData ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    {/* Donut chart with center label */}
                    <div className="relative">
                      <div className="h-36 w-36 sm:h-40 sm:w-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              {pieData.map((d, i) => (
                                <linearGradient key={d.name} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                                  <stop offset="100%" stopColor={d.color} stopOpacity={0.6} />
                                </linearGradient>
                              ))}
                            </defs>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius="58%"
                              outerRadius="90%"
                              paddingAngle={4}
                              dataKey="value"
                              strokeWidth={0}
                              cornerRadius={5}
                              animationBegin={0}
                              animationDuration={1000}
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-card-foreground leading-none sm:text-2xl">{pieTotal}</span>
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">Total</span>
                      </div>
                    </div>

                    {/* Breakdown grid */}
                    <div className="w-full grid grid-cols-2 gap-2">
                      {pieData.map((d) => {
                        const pct = pieTotal > 0 ? (d.value / pieTotal) * 100 : 0
                        return (
                          <div key={d.name} className="group rounded-lg border border-border/60 bg-muted/30 px-2.5 py-2 transition-all hover:border-border hover:bg-muted/60">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`h-2 w-2 rounded-full ${d.bg} ring-3 ${d.ring}`} />
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{d.name}</span>
                            </div>
                            <div className="flex items-end justify-between">
                              <span className={`text-base font-bold sm:text-lg ${d.text}`}>{d.value}</span>
                              <span className="text-[10px] font-bold text-muted-foreground/70">{pct.toFixed(0)}%</span>
                            </div>
                            <div className="mt-1.5 h-1 w-full rounded-full bg-border/40 overflow-hidden">
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
            <Card className="relative flex flex-col overflow-hidden">
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold sm:text-base">
                  Most Popular Pages
                </CardTitle>
                <p className="text-[11px] text-muted-foreground sm:text-xs">Top pages by total views</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                {barChartData.length > 0 ? (
                  <div className="flex-1 min-h-0" style={{ minHeight: Math.max(180, barChartData.length * 44 + 32) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                        <defs>
                          {barGradients.map((g) => (
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
            <Card className="lg:col-span-3">
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
                    const Icon = inquiryTypeIcon[t.type] ?? Mail
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
            <Card className="lg:col-span-2">
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
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0">
                        <p className="text-xs text-card-foreground sm:text-sm">
                          {entry.description}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-sm">
                          {format(parseISO(entry.timestamp), "MMM d, yyyy · h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
            />,
            portalContainer,
          )}
    </main>
  )
}
