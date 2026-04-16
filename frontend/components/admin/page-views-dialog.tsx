"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { apiFetchAllPageViews, type AllPageViewsFilter } from "@/lib/api"
import type { PageView } from "@/lib/data/admin-data"
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileBarChart2,
  Calendar,
  BarChart3,
  Search,
  RefreshCw,
  Tag,
  AlertCircle,
} from "lucide-react"
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns"

interface PageViewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SortKey = "views" | "title" | "category"
type DatePreset = "all" | "today" | "this_week" | "this_month" | "this_year"

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "all",        label: "All Time"   },
  { key: "today",      label: "Today"      },
  { key: "this_week",  label: "This Week"  },
  { key: "this_month", label: "This Month" },
  { key: "this_year",  label: "This Year"  },
]

function getDateRange(preset: DatePreset): { startDate?: string; endDate?: string } {
  const now = new Date()
  const fmt = (d: Date) => format(d, "yyyy-MM-dd")
  const end = fmt(now)
  switch (preset) {
    case "today":      return { startDate: fmt(startOfDay(now)),                       endDate: end }
    case "this_week":  return { startDate: fmt(startOfWeek(now, { weekStartsOn: 1 })), endDate: end }
    case "this_month": return { startDate: fmt(startOfMonth(now)),                     endDate: end }
    case "this_year":  return { startDate: fmt(startOfYear(now)),                      endDate: end }
    default:           return {}
  }
}

const PER_PAGE = 10

export function PageViewsDialog({ open, onOpenChange }: PageViewsDialogProps) {
  const [data, setData]           = useState<PageView[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [sortKey, setSortKey]     = useState<SortKey>("views")
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC")
  const [preset, setPreset]       = useState<DatePreset>("all")
  const [search, setSearch]           = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [page, setPage]               = useState(1)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setIsLoading(true)
    setError(null)
    try {
      const { startDate, endDate } = getDateRange(preset)
      const filters: AllPageViewsFilter = { sortBy: sortKey, sortOrder }
      if (startDate) filters.startDate = startDate
      if (endDate)   filters.endDate   = endDate
      const result = await apiFetchAllPageViews(filters)
      if (ctrl.signal.aborted) return
      setData(result)
      setPage(1)
    } catch (e) {
      if (ctrl.signal.aborted) return
      console.error("[PageViewsDialog] fetch failed:", e)
      setError(e instanceof Error ? e.message : "Failed to load page view data.")
      setData([])
    } finally {
      if (!ctrl.signal.aborted) setIsLoading(false)
    }
  }, [preset, sortKey, sortOrder])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  useEffect(() => {
    if (open) fetchData()
  }, [open, fetchData])

  // Reset category filter when the date preset changes
  useEffect(() => {
    setSelectedCategory("")
    setPage(1)
  }, [preset])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "DESC" ? "ASC" : "DESC"))
    } else {
      setSortKey(key)
      setSortOrder(key === "views" ? "DESC" : "ASC")
    }
  }

  const uniqueCategories = useMemo(
    () =>
      Array.from(new Set(data.map((r) => r.category).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [data],
  )

  const filtered = useMemo(
    () =>
      data.filter(
        (r) =>
          (!selectedCategory || r.category === selectedCategory) &&
          (!search || (
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.category.toLowerCase().includes(search.toLowerCase()) ||
            r.page.toLowerCase().includes(search.toLowerCase())
          )),
      ),
    [data, selectedCategory, search],
  )

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const maxViews   = data.length > 0 ? Math.max(...data.map((r) => Number(r.views)), 1) : 1

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return sortOrder === "DESC" ? (
      <ChevronDown className="h-3 w-3" />
    ) : (
      <ChevronUp className="h-3 w-3" />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-none h-[92vh] flex flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <DialogTitle className="text-lg font-semibold">All Page Views</DialogTitle>
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {isLoading
              ? "Loading…"
              : error
              ? "Failed to load data — see error below"
              : `${filtered.length} page${filtered.length !== 1 ? "s" : ""} · Click column headers to sort`}
          </DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-col gap-2 px-6 py-3 border-b bg-muted/30 shrink-0">
          {/* Row 1: Date presets + Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setPreset(p.key)
                    setPage(1)
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    preset === p.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Filter pages…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-8 h-8 text-xs w-48"
              />
            </div>
          </div>

          {/* Row 2: Category chips */}
          {uniqueCategories.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <button
                onClick={() => { setSelectedCategory(""); setPage(1) }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === ""
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border hover:bg-accent"
                }`}
              >
                All
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setPage(1) }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto min-h-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <AlertCircle className="h-12 w-12 opacity-40 mb-3 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load page views</p>
              <p className="text-xs mt-1 opacity-80 max-w-xs text-center">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 rounded px-4 py-1.5 text-xs font-medium bg-muted hover:bg-accent transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <FileBarChart2 className="h-12 w-12 opacity-20 mb-3" />
              <p className="text-sm font-medium">No page view data for this period</p>
              <p className="text-xs mt-1 opacity-70">Try selecting a different date range or category</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b z-10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold">
                    <button
                      onClick={() => handleSort("title")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Page <SortIcon col="title" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("category")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Category <SortIcon col="category" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold">
                    <button
                      onClick={() => handleSort("views")}
                      className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                    >
                      Views <SortIcon col="views" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => {
                  const rank = (page - 1) * PER_PAGE + i + 1
                  const pct  = Math.round((Number(row.views) / maxViews) * 100)
                  return (
                    <tr
                      key={`${row.page}-${i}`}
                      className="border-b border-border/40 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground">{rank}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-card-foreground truncate leading-tight">
                          {row.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {row.page}
                        </div>
                        {/* Mobile: show category badge */}
                        <div className="sm:hidden mt-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {row.category}
                          </Badge>
                        </div>
                        {/* Views bar */}
                        <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {row.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-primary tabular-nums">
                          {Number(row.views).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20 shrink-0">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 px-2 text-xs"
              >
                Prev
              </Button>
              <span className="text-xs px-2 text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 px-2 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
