"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import {
  activityLabels,
  type ActivityAction,
} from "@/lib/data/admin-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  LogIn,
  LogOut,
  FileEdit,
  Trash2,
  Send,
  Archive,
  Settings,
  ClipboardList,
} from "lucide-react"
import { format, parseISO } from "date-fns"

const actionIcons: Record<ActivityAction, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
  logout: LogOut,
  create_post: FileEdit,
  update_post: FileEdit,
  delete_post: Trash2,
  publish_post: Send,
  archive_post: Archive,
  reply_inquiry: Send,
  archive_inquiry: Archive,
  update_settings: Settings,
}

const actionColors: Record<ActivityAction, string> = {
  login: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  logout: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300",
  create_post: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  update_post: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  delete_post: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  publish_post: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  archive_post: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  reply_inquiry: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  archive_inquiry: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  update_settings: "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300",
}

export default function ActivityLogPage() {
  const router = useRouter()
  const { isLoggedIn, activityLog } = useAdmin()
  const [search, setSearch] = useState("")
  const [filterAction, setFilterAction] = useState<ActivityAction | "all">("all")

  useEffect(() => {
    if (!isLoggedIn) router.push("/admin")
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  const filtered = activityLog.filter((entry) => {
    if (filterAction !== "all" && entry.action !== filterAction) return false
    if (
      search &&
      !entry.description.toLowerCase().includes(search.toLowerCase()) &&
      !entry.user.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  // Group by date
  const grouped: Record<string, typeof filtered> = {}
  for (const entry of filtered) {
    const dateKey = format(parseISO(entry.timestamp), "MMMM d, yyyy")
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(entry)
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Activity Log
              </h1>
              <p className="text-sm text-muted-foreground">
                Track all admin actions and changes.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filterAction}
              onValueChange={(v) => setFilterAction(v as ActivityAction | "all")}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(activityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total count */}
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <strong className="text-card-foreground">{filtered.length}</strong>{" "}
            of {activityLog.length} entries
          </p>

          {/* Grouped timeline */}
          {Object.keys(grouped).length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No activity found.</p>
            </div>
          )}

          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {date}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Card>
                <CardContent className="divide-y divide-border p-0">
                  {entries.map((entry) => {
                    const Icon = actionIcons[entry.action]
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/50"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${actionColors[entry.action]}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-card-foreground">
                            {entry.description}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {entry.user}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {activityLabels[entry.action]}
                        </Badge>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {format(parseISO(entry.timestamp), "h:mm a")}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
