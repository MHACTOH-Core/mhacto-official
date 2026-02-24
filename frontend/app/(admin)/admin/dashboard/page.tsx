"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import {
  Eye,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { format, parseISO } from "date-fns"

export default function DashboardPage() {
  const router = useRouter()
  const {
    isLoggedIn,
    pageViews,
    dailyVisits,
    totalViews,
    posts,
    inquiries,
    activityLog,
  } = useAdmin()

  useEffect(() => {
    if (!isLoggedIn) router.push("/admin")
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  const publishedPosts = posts.filter((p) => p.status === "published").length
  const unreadInquiries = inquiries.filter((i) => i.status === "unread").length
  const topPages = [...pageViews].sort((a, b) => b.views - a.views)

  // Chart data: daily visits last 30 days
  const visitChartData = dailyVisits.map((d) => ({
    date: format(parseISO(d.date), "MMM d"),
    views: d.views,
  }))

  // Chart data: top 8 pages for bar chart
  const barChartData = topPages.slice(0, 8).map((p) => ({
    name: p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title,
    views: p.views,
  }))

  const recentActivity = activityLog.slice(0, 5)

  const statCards = [
    {
      label: "Total Page Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300",
      trend: "+12.5%",
    },
    {
      label: "Unique Visitors",
      value: Math.floor(totalViews * 0.62).toLocaleString(),
      icon: Users,
      color: "text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-300",
      trend: "+8.3%",
    },
    {
      label: "Published Posts",
      value: publishedPosts,
      icon: FileText,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300",
      trend: null,
    },
    {
      label: "Unread Inquiries",
      value: unreadInquiries,
      icon: MessageSquare,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300",
      trend: null,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <h1 className="text-2xl font-bold text-card-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back — here&apos;s what&apos;s happening on your website.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-card-foreground">
                      {stat.value}
                    </p>
                    {stat.trend && (
                      <div className="mt-1 flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3 w-3" />
                        {stat.trend} this month
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Area chart — Daily visits */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Website Traffic — Last 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visitChartData}>
                      <defs>
                        <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        interval="preserveStartEnd"
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          fontSize: 13,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#viewGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar chart — Most popular */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Most Popular Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        width={130}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          fontSize: 13,
                        }}
                      />
                      <Bar
                        dataKey="views"
                        fill="hsl(var(--primary))"
                        radius={[0, 6, 6, 0]}
                        barSize={22}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom row: top pages table + recent activity */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Most popular — table */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Page Popularity Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {topPages.map((page, idx) => (
                    <div
                      key={page.page}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          idx === 0
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                            : idx === 1
                              ? "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300"
                              : idx === 2
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {page.title}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {page.page}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-sm">
                        {page.category}
                      </Badge>
                      <span className="shrink-0 text-sm font-semibold text-card-foreground">
                        {page.views.toLocaleString()}
                      </span>
                      <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
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
                <div className="space-y-4">
                  {recentActivity.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0">
                        <p className="text-sm text-card-foreground">
                          {entry.description}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
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
      </main>
    </div>
  )
}
