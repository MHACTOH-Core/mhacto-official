"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { apiFetchVisitorDetails, type VisitorDetailsFilter, type VisitorDetail } from "@/lib/api"
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Calendar,
  Search,
  RefreshCw,
  Users,
  AlertCircle,
  Mail,
  MapPin,
  Handshake,
  Footprints,
  Phone,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns"

interface VisitorEngagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SortKey = "created_at" | "full_name" | "type" | "status" | "pax" | "date_of_visit"
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

const TYPE_LABELS: Record<string, string> = {
  walk_in: "Walk-in",
  tour_booking: "Tour Booking",
  general_contact: "General Contact",
  partnership: "Partnership",
}

const TYPE_ICONS: Record<string, typeof Users> = {
  walk_in: Footprints,
  tour_booking: MapPin,
  general_contact: Mail,
  partnership: Handshake,
}

const STATUS_COLORS: Record<string, string> = {
  unread:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  read:      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  assigned:  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  expired:   "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  archived:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
}

const TYPE_FILTERS = ["all", "walk_in", "tour_booking", "general_contact", "partnership"] as const
const STATUS_FILTERS = ["all", "unread", "read", "assigned", "confirmed", "completed", "cancelled", "expired", "archived"] as const

const PER_PAGE = 10

export function VisitorEngagementDialog({ open, onOpenChange }: VisitorEngagementDialogProps) {
  const [data, setData]           = useState<VisitorDetail[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [sortKey, setSortKey]     = useState<SortKey>("created_at")
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC")
  const [preset, setPreset]       = useState<DatePreset>("all")
  const [search, setSearch]       = useState("")
  const [typeFilter, setTypeFilter]     = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage]           = useState(1)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { startDate, endDate } = getDateRange(preset)
      const filters: VisitorDetailsFilter = { sortBy: sortKey, sortOrder }
      if (startDate) filters.startDate = startDate
      if (endDate)   filters.endDate   = endDate
      if (typeFilter !== "all") filters.type = typeFilter
      if (statusFilter !== "all") filters.status = statusFilter
      const result = await apiFetchVisitorDetails(filters)
      setData(result)
      setPage(1)
    } catch (e) {
      console.error("[VisitorEngagement] fetch failed:", e)
      setError(e instanceof Error ? e.message : "Failed to load visitor data.")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [preset, sortKey, sortOrder, typeFilter, statusFilter])

  useEffect(() => {
    if (open) fetchData()
  }, [open, fetchData])

  useEffect(() => {
    setPage(1)
  }, [preset, typeFilter, statusFilter])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "DESC" ? "ASC" : "DESC"))
    } else {
      setSortKey(key)
      setSortOrder(key === "full_name" ? "ASC" : "DESC")
    }
  }

  const filtered = useMemo(
    () =>
      data.filter((r) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          r.fullName.toLowerCase().includes(q) ||
          (r.touristName?.toLowerCase().includes(q) ?? false) ||
          r.email.toLowerCase().includes(q) ||
          (r.contactNumber?.toLowerCase().includes(q) ?? false) ||
          (r.assignedGuide?.toLowerCase().includes(q) ?? false)
        )
      }),
    [data, search],
  )

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return sortOrder === "DESC" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
  }

  const fmtDate = (d: string | null) => {
    if (!d) return "—"
    try { return format(new Date(d), "MMM d, yyyy") } catch { return d }
  }

  const fmtDateTime = (d: string | null) => {
    if (!d) return "—"
    try { return format(new Date(d), "MMM d, yyyy · h:mm a") } catch { return d }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-none h-[92vh] flex flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <DialogTitle className="text-lg font-semibold">Visitor Engagement Details</DialogTitle>
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
              : `${filtered.length} visitor${filtered.length !== 1 ? "s" : ""} · Click a row to expand details`}
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
                  onClick={() => setPreset(p.key)}
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
                placeholder="Search name, email, guide…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-8 h-8 text-xs w-56"
              />
            </div>
          </div>

          {/* Row 2: Type filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</span>
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    typeFilter === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {t === "all" ? "All" : TYPE_LABELS[t] ?? t}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Status filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
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
              <p className="text-sm font-semibold text-destructive">Failed to load visitor data</p>
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
              <Users className="h-12 w-12 opacity-20 mb-3" />
              <p className="text-sm font-medium">No visitor data for this period</p>
              <p className="text-xs mt-1 opacity-70">Try selecting a different date range or filter</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b z-10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold">
                    <button onClick={() => handleSort("full_name")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Visitor <SortIcon col="full_name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden md:table-cell">
                    <button onClick={() => handleSort("type")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Type <SortIcon col="type" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell">
                    <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Status <SortIcon col="status" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold hidden lg:table-cell">
                    <button onClick={() => handleSort("pax")} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      Pax <SortIcon col="pax" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden xl:table-cell">
                    <button onClick={() => handleSort("date_of_visit")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Visit Date <SortIcon col="date_of_visit" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden xl:table-cell">Guide</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold">
                    <button onClick={() => handleSort("created_at")} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      Submitted <SortIcon col="created_at" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => {
                  const idx = (page - 1) * PER_PAGE + i + 1
                  const TypeIcon = TYPE_ICONS[row.type] ?? Users
                  const isExpanded = expandedId === row.id
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        key={row.id}
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        className={`border-b cursor-pointer transition-colors ${isExpanded ? "bg-muted/50" : "hover:bg-muted/30"}`}
                      >
                        <td className="px-4 py-3 text-xs text-muted-foreground">{idx}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <TypeIcon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{row.fullName}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{row.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant="outline" className="text-[11px] font-medium">
                            {TYPE_LABELS[row.type] ?? row.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[row.status] ?? "bg-muted text-muted-foreground"}`}>
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm tabular-nums hidden lg:table-cell">
                          {row.pax ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-sm hidden xl:table-cell">
                          {fmtDate(row.dateOfVisit)}
                        </td>
                        <td className="px-4 py-3 text-sm hidden xl:table-cell">
                          {row.assignedGuide ? (
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="h-3 w-3 text-emerald-500" />
                              <span className="truncate max-w-[120px]">{row.assignedGuide}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDateTime(row.createdAt)}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr key={`${row.id}-detail`} className="bg-muted/30 border-b">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <DetailItem label="Full Name" value={row.fullName} />
                              {row.touristName && <DetailItem label="Tourist Name" value={row.touristName} />}
                              <DetailItem label="Email" value={row.email} icon={<Mail className="h-3 w-3" />} />
                              {row.contactNumber && <DetailItem label="Phone" value={row.contactNumber} icon={<Phone className="h-3 w-3" />} />}
                              <DetailItem label="Type" value={TYPE_LABELS[row.type] ?? row.type} />
                              <DetailItem label="Status" value={row.status.charAt(0).toUpperCase() + row.status.slice(1)} />
                              {row.pax != null && <DetailItem label="Number of Pax" value={String(row.pax)} />}
                              {row.dateOfVisit && <DetailItem label="Date of Visit" value={fmtDate(row.dateOfVisit)} />}
                              {row.confirmedDate && <DetailItem label="Confirmed Date" value={fmtDate(row.confirmedDate)} />}
                              {row.assignedGuide && <DetailItem label="Assigned Guide" value={row.assignedGuide} icon={<UserCheck className="h-3 w-3 text-emerald-500" />} />}
                              <DetailItem label="Submitted" value={fmtDateTime(row.createdAt)} />
                              {row.message && (
                                <div className="sm:col-span-2 lg:col-span-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Message</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap bg-background rounded-md px-3 py-2 border">{row.message}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer / Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t shrink-0 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded p-1.5 hover:bg-accent transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-xs font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded p-1.5 hover:bg-accent transition-colors disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  )
}
