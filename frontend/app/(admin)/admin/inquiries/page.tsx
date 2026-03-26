"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import {
  inquiryStatusLabels,
  inquiryTypeLabels,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/data/admin-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Inbox,
  Archive,
  CircleCheck,
  Search,
  ArrowLeft,
  MailOpen,
  UserCheck,
  Mail,
  Clock,
  Trash2,
  Phone,
  CalendarDays,
  Users,
  School,
  MapPin,
  Loader2,
  ListFilter,
  Reply,
  ShieldAlert,
  RotateCcw,
  Send,
  X,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"
import { apiReplyInquiry } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type VisitDateFilter = "all" | "this_week" | "this_month" | "this_year" | "custom_range"

type MailboxTab = "all" | "unread" | "in_progress" | "assigned" | "archived" | "spam" | "trash"

const mailboxTabs: { key: MailboxTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all",         label: "All Mail",    icon: Inbox },
  { key: "unread",      label: "Unread",      icon: Mail },
  { key: "in_progress", label: "In Progress", icon: Loader2 },
  { key: "assigned",    label: "Assigned",    icon: UserCheck },
  { key: "archived",    label: "Completed",   icon: CircleCheck },
  { key: "spam",        label: "Spam",        icon: ShieldAlert },
  { key: "trash",       label: "Trash",       icon: Trash2 },
]

export default function InquiriesPage() {
  const router = useRouter()
  const { isLoggedIn, isHydrated, inquiries, updateInquiry, deleteInquiry, permanentDeleteInquiry } = useAdmin()

  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<MailboxTab>("all")
  const [search, setSearch] = useState("")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null)
  // Assign dialog
  const [assignTarget, setAssignTarget] = useState<Inquiry | null>(null)
  const [assignGuideName, setAssignGuideName] = useState("")
  // Reply composer
  const [replyText, setReplyText] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [showReplyBox, setShowReplyBox] = useState(false)
  // Visit date filter
  const [visitDateFilter, setVisitDateFilter] = useState<VisitDateFilter>("all")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push("/admin")
  }, [isHydrated, isLoggedIn, router])

  // Memoized tab counts — single pass over inquiries
  const tabCounts = useMemo(() => {
    const counts: Record<MailboxTab, number> = {
      all: 0, unread: 0, in_progress: 0, assigned: 0, archived: 0, spam: 0, trash: 0,
    }
    for (const i of inquiries) {
      if (i.status !== "spam" && i.status !== "trash") counts.all++
      if (i.status === "unread") counts.unread++
      else if (i.status === "in_progress") counts.in_progress++
      else if (i.status === "assigned") counts.assigned++
      else if (i.status === "archived") counts.archived++
      else if (i.status === "spam") counts.spam++
      else if (i.status === "trash") counts.trash++
    }
    return counts
  }, [inquiries])

  // Memoized filtered list
  const filtered = useMemo(() => {
    let list = inquiries
    switch (activeTab) {
      case "all":
        list = inquiries.filter((i) => i.status !== "spam" && i.status !== "trash")
        break
      case "unread":
        list = inquiries.filter((i) => i.status === "unread")
        break
      case "in_progress":
        list = inquiries.filter((i) => i.status === "in_progress")
        break
      case "assigned":
        list = inquiries.filter((i) => i.status === "assigned")
        break
      case "archived":
        list = inquiries.filter((i) => i.status === "archived")
        break
      case "spam":
        list = inquiries.filter((i) => i.status === "spam")
        break
      case "trash":
        list = inquiries.filter((i) => i.status === "trash")
        break
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q),
      )
    }
    // Visit date filter
    if (visitDateFilter !== "all") {
      const now = new Date()
      list = list.filter((i) => {
        if (!i.dateOfVisit) return false
        try {
          const visit = parseISO(i.dateOfVisit)
          if (isNaN(visit.getTime())) return false
          switch (visitDateFilter) {
            case "this_week":
              return isWithinInterval(visit, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) })
            case "this_month":
              return isWithinInterval(visit, { start: startOfMonth(now), end: endOfMonth(now) })
            case "this_year":
              return isWithinInterval(visit, { start: startOfYear(now), end: endOfYear(now) })
            case "custom_range": {
              if (!customDateFrom && !customDateTo) return true
              const from = customDateFrom ? parseISO(customDateFrom) : new Date(0)
              const to = customDateTo ? parseISO(customDateTo) : new Date(9999, 11, 31)
              return isWithinInterval(visit, { start: from, end: to })
            }
          }
        } catch { return false }
      })
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [inquiries, activeTab, search, visitDateFilter, customDateFrom, customDateTo])

  const unreadCount = tabCounts.unread

  if (!isHydrated || !isLoggedIn) return null

  // Open inquiry — mark as in_progress if unread; reset reply composer
  const openInquiry = (inq: Inquiry) => {
    setShowReplyBox(false)
    setReplyText("")
    if (inq.status === "unread") {
      const updated = { ...inq, status: "in_progress" as InquiryStatus }
      setSelectedInquiry(updated)
      updateInquiry(inq.id, { status: "in_progress" })
    } else {
      setSelectedInquiry(inq)
    }
  }

  const handleStatusChange = (inq: Inquiry, status: InquiryStatus) => {
    updateInquiry(inq.id, { status })
    if (selectedInquiry?.id === inq.id) {
      setSelectedInquiry({ ...inq, status })
    }
  }

  const handleArchive = (inq: Inquiry) => {
    handleStatusChange(inq, "archived")
    toast({ title: "Completed", description: `Inquiry from ${inq.name} has been completed.`, variant: "success" })
    if (selectedInquiry?.id === inq.id) setSelectedInquiry(null)
  }

  const handleDelete = (inq: Inquiry) => {
    setDeleteTarget(inq)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      permanentDeleteInquiry(deleteTarget.id)
      toast({ title: "Deleted", description: `Inquiry from ${deleteTarget.name} has been permanently deleted.`, variant: "destructive" })
      if (selectedInquiry?.id === deleteTarget.id) setSelectedInquiry(null)
      setDeleteTarget(null)
    }
  }

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkArchive = () => {
    selectedIds.forEach((id) => updateInquiry(id, { status: "archived" }))
    toast({ title: "Bulk completed", description: `${selectedIds.size} inquiries completed.`, variant: "success" })
    setSelectedIds(new Set())
  }

  const bulkAssign = () => {
    selectedIds.forEach((id) => updateInquiry(id, { status: "assigned" }))
    toast({ title: "Bulk assigned", description: `${selectedIds.size} inquiries assigned.`, variant: "success" })
    setSelectedIds(new Set())
  }

  const bulkSpam = () => {
    selectedIds.forEach((id) => updateInquiry(id, { status: "spam" }))
    toast({ title: "Marked as spam", description: `${selectedIds.size} inquiries marked as spam.`, variant: "success" })
    setSelectedIds(new Set())
  }

  const bulkTrash = () => {
    selectedIds.forEach((id) => updateInquiry(id, { status: "trash" }))
    toast({ title: "Moved to trash", description: `${selectedIds.size} inquiries moved to trash.`, variant: "success" })
    setSelectedIds(new Set())
  }

  const bulkDelete = () => {
    selectedIds.forEach((id) => permanentDeleteInquiry(id))
    if (selectedInquiry && selectedIds.has(selectedInquiry.id)) setSelectedInquiry(null)
    toast({ title: "Permanently deleted", description: `${selectedIds.size} inquiries permanently deleted.`, variant: "destructive" })
    setSelectedIds(new Set())
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)))
    }
  }

  // ── Helpers ────────────────────────────────────────────────────

  /** Safely format a date string — returns fallback on invalid input */
  const safeFormatDate = (dateStr: string | null | undefined, fmt: string, fallback = "—") => {
    if (!dateStr) return fallback
    try {
      const parsed = parseISO(dateStr)
      if (isNaN(parsed.getTime())) return fallback
      return format(parsed, fmt)
    } catch {
      return fallback
    }
  }

  const hasAdditionalDetails = (inq: Inquiry) =>
    inq.additionalDetails && Object.keys(inq.additionalDetails).length > 0

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)

  // Format additional_details keys for display
  const formatKey = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())

  // Icon for additional_details keys
  const getDetailIcon = (key: string) => {
    if (key.includes("school")) return <School className="h-3.5 w-3.5 text-primary" />
    if (key.includes("purpose")) return <MapPin className="h-3.5 w-3.5 text-primary" />
    if (key.includes("company")) return <ListFilter className="h-3.5 w-3.5 text-primary" />
    return <ListFilter className="h-3.5 w-3.5 text-primary" />
  }

  // ── New action handlers ────────────────────────────────────────

  const handleMarkSpam = (inq: Inquiry) => {
    handleStatusChange(inq, "spam")
    toast({ title: "Marked as spam", description: `Inquiry from ${inq.name} marked as spam.`, variant: "success" })
    if (selectedInquiry?.id === inq.id) setSelectedInquiry(null)
  }

  const handleMoveToTrash = (inq: Inquiry) => {
    handleStatusChange(inq, "trash")
    toast({ title: "Moved to trash", description: `Inquiry from ${inq.name} moved to trash.` })
    if (selectedInquiry?.id === inq.id) setSelectedInquiry(null)
  }

  const handleRestoreFromTrash = (inq: Inquiry) => {
    handleStatusChange(inq, "unread")
    toast({ title: "Restored", description: `Inquiry from ${inq.name} has been restored.` })
  }

  const confirmAssign = () => {
    if (!assignTarget) return
    updateInquiry(assignTarget.id, { status: "assigned" })
    if (selectedInquiry?.id === assignTarget.id) {
      setSelectedInquiry({ ...assignTarget, status: "assigned" })
    }
    toast({ title: "Assigned", description: `Inquiry from ${assignTarget.name} has been assigned.` })
    setAssignTarget(null)
    setAssignGuideName("")
  }

  const handleSendReply = async (openEmail: boolean) => {
    if (!selectedInquiry || !replyText.trim()) return
    setIsSendingReply(true)
    try {
      await apiReplyInquiry(selectedInquiry.id, replyText.trim())
      const updated = { ...selectedInquiry, replyText: replyText.trim(), repliedAt: new Date().toISOString(), repliedBy: "Admin" }
      updateInquiry(selectedInquiry.id, { replyText: replyText.trim(), repliedAt: new Date().toISOString(), repliedBy: "Admin" })
      setSelectedInquiry(updated)
      setReplyText("")
      setShowReplyBox(false)
      toast({ title: "Reply sent", description: `Reply to ${selectedInquiry.name} has been saved.` })
      if (openEmail) {
        const subject = encodeURIComponent(
          `Re: Your Inquiry — ${inquiryTypeLabels[selectedInquiry.inquiryType]?.label ?? "General"} | MHACTO Bocaue`
        )
        const body = encodeURIComponent(
          `Dear ${selectedInquiry.name},\n\nThank you for reaching out to the Municipal Heritage, Arts, Culture and Tourism Office (MHACTO) of Bocaue.\n\n${replyText.trim()}\n\nBest regards,\nMHACTO Bocaue Tourism Office`
        )
        window.open(`mailto:${selectedInquiry.email}?subject=${subject}&body=${body}`, "_blank")
      }
    } catch {
      toast({ title: "Reply failed", description: "Failed to save reply. Please try again.", variant: "destructive" })
    } finally {
      setIsSendingReply(false)
    }
  }

  // ── Empty‑state messages ───────────────────────────────────────

  const emptyMessages: Record<MailboxTab, { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }> = {
    all:         { icon: Inbox,      title: "No inquiries yet",          desc: "New inquiries will appear here." },
    unread:      { icon: Mail,       title: "All caught up!",            desc: "No unread inquiries." },
    in_progress: { icon: Loader2,    title: "Nothing in progress",       desc: "Inquiries being worked on appear here." },
    assigned:    { icon: UserCheck,  title: "No assigned inquiries",     desc: "Inquiries assigned to a tourist guide appear here." },
    archived:    { icon: CircleCheck, title: "No completed inquiries",    desc: "Completed inquiries will show here." },
    spam:        { icon: ShieldAlert, title: "No spam",                  desc: "Inquiries marked as spam appear here." },
    trash:       { icon: Trash2,     title: "Trash is empty",            desc: "Deleted inquiries can be restored from here." },
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <main className="flex flex-1 overflow-hidden">

          {/* ─── LEFT: Mailbox sidebar ─────────────────────────── */}
          <div className={cn(
            "flex flex-col border-r border-border bg-card transition-all duration-200",
            "w-full sm:w-56 md:w-64 lg:w-72 shrink-0",
            selectedInquiry ? "hidden sm:flex" : "flex"
          )}>
            {/* Header */}
            <div className="border-b border-border px-3 sm:px-4 py-3 sm:py-4">
              <h1 className="text-lg sm:text-xl font-bold text-card-foreground">Inquiries</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                  : "All caught up"}
              </p>
            </div>

            {/* Nav tabs */}
            <nav className="space-y-0.5 px-2 py-2 sm:py-3">
              {mailboxTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setSelectedInquiry(null)
                    setSelectedIds(new Set())
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                    activeTab === tab.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tabCounts[tab.key] > 0 && (
                    <span className={cn(
                      "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none",
                      tab.key === "unread" && unreadCount > 0
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}>
                      {tabCounts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Search */}
            <div className="px-2 sm:px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, subject, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 sm:h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ─── MIDDLE: Message list ──────────────────────────── */}
          <div className={cn(
            "flex flex-col border-r border-border transition-all duration-200",
            "w-full sm:w-64 md:w-80 lg:w-96 shrink-0",
            selectedInquiry ? "hidden md:flex" : "flex"
          )}>
            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 border-b border-border bg-accent/50 px-2 sm:px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedIds.size} selected
                </span>
                <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2" onClick={bulkAssign}>
                  <UserCheck className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Assign</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2" onClick={bulkSpam}>
                  <ShieldAlert className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Spam</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2 text-destructive hover:text-destructive" onClick={activeTab === "trash" ? bulkDelete : bulkTrash}>
                  <Trash2 className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">{activeTab === "trash" ? "Delete Forever" : "Trash"}</span>
                </Button>
              </div>
            )}

            {/* Visit date filter */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-2 sm:px-4 py-2">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={visitDateFilter} onValueChange={(v) => setVisitDateFilter(v as VisitDateFilter)}>
                <SelectTrigger className="h-7 w-auto min-w-[110px] text-xs gap-1 px-2">
                  <SelectValue placeholder="Visit date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="this_week">This week</SelectItem>
                  <SelectItem value="this_month">This month</SelectItem>
                  <SelectItem value="this_year">This year</SelectItem>
                  <SelectItem value="custom_range">Custom range</SelectItem>
                </SelectContent>
              </Select>
              {visitDateFilter === "custom_range" && (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="h-7 w-auto text-xs px-1.5"
                  />
                  <span className="text-xs text-muted-foreground">—</span>
                  <Input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="h-7 w-auto text-xs px-1.5"
                  />
                </div>
              )}
              {visitDateFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-1.5 text-muted-foreground"
                  onClick={() => { setVisitDateFilter("all"); setCustomDateFrom(""); setCustomDateTo("") }}
                >
                  <X className="h-3 w-3 mr-0.5" /> Clear
                </Button>
              )}
            </div>

            {/* Select all */}
            <div className="flex items-center gap-2 border-b border-border px-2 sm:px-4 py-2">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                onChange={toggleSelectAll}
                className="h-3.5 w-3.5 rounded border-border"
              />
              <span className="text-xs text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "message" : "messages"}
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground p-6">
                  {(() => {
                    const empty = emptyMessages[activeTab]
                    return (
                      <>
                        <div className="rounded-full bg-muted/50 p-4">
                          <empty.icon className="h-8 w-8 opacity-40" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{empty.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{empty.desc}</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              {filtered.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => openInquiry(inq)}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 sm:gap-3 border-b border-border px-2 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-accent/50",
                    selectedInquiry?.id === inq.id && "bg-primary/5 border-l-2 border-l-primary",
                    inq.status === "unread" && "bg-blue-50/50 dark:bg-blue-950/20",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(inq.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(inq.id) }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded border-border"
                  />

                  {/* Avatar circle */}
                  <div className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    inq.status === "unread"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {getInitials(inq.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Row 1: Name + Time */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "truncate text-sm",
                        inq.status === "unread" ? "font-bold" : "font-medium",
                      )}>
                        {inq.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {safeFormatDate(inq.createdAt, "MMM d")}
                      </span>
                    </div>

                    {/* Row 2: Inquiry type */}
                    <p className={cn(
                      "mt-0.5 truncate text-xs",
                      inq.status === "unread" ? "font-semibold text-card-foreground" : "text-card-foreground",
                    )}>
                      {inquiryTypeLabels[inq.inquiryType]?.label ?? inq.inquiryType}
                    </p>

                    {/* Row 3: Message preview */}
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground leading-relaxed">
                      {inq.message}
                    </p>

                    {/* Row 4: Badges */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {/* Type badge */}
                      <Badge className={cn(
                        "text-[10px] px-1.5 py-0 gap-0.5 font-medium",
                        inquiryTypeLabels[inq.inquiryType]?.color ?? "",
                      )}>
                        {inquiryTypeLabels[inq.inquiryType]?.label ?? inq.inquiryType}
                      </Badge>

                      {/* Status badge */}
                      <Badge className={cn("text-[10px] px-1.5 py-0 font-medium", inquiryStatusLabels[inq.status]?.color ?? "")}>
                        {inquiryStatusLabels[inq.status]?.label ?? inq.status}
                      </Badge>

                      {/* Pax count */}
                      {inq.numberOfPax != null && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Users className="h-2.5 w-2.5" />
                          {inq.numberOfPax} pax
                        </span>
                      )}

                      {/* Visit date */}
                      {inq.dateOfVisit && (() => {
                        const dateTo = inq.additionalDetails?.dateToVisit as string | undefined
                        const hasRange = dateTo && dateTo !== inq.dateOfVisit
                        return (
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <CalendarDays className="h-2.5 w-2.5" />
                            {safeFormatDate(inq.dateOfVisit, "MMM d")}
                            {hasRange && <> — {safeFormatDate(dateTo, "MMM d")}</>}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT: Detail view ───────────────────────────── */}
          <div className={cn(
            "flex flex-1 flex-col overflow-hidden",
            selectedInquiry ? "flex" : "hidden md:flex"
          )}>
            {!selectedInquiry ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-4">
                <div className="rounded-full bg-muted/50 p-6 mb-4">
                  <MailOpen className="h-10 sm:h-12 w-10 sm:w-12 opacity-30" />
                </div>
                <p className="text-sm font-medium">Select an inquiry to view</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a message from the list to read it
                </p>
              </div>
            ) : (
              <>
                {/* ── Detail header bar ── */}
                <div className="flex items-center gap-2 sm:gap-3 border-b border-border px-3 sm:px-6 py-3 sm:py-4 bg-card">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 md:hidden"
                    onClick={() => setSelectedInquiry(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base sm:text-lg font-semibold text-card-foreground">
                        {selectedInquiry.name}
                      </h2>
                      <Badge className={cn(
                        "shrink-0 text-[10px] px-1.5 py-0 font-medium",
                        inquiryTypeLabels[selectedInquiry.inquiryType]?.color ?? "",
                      )}>
                        {inquiryTypeLabels[selectedInquiry.inquiryType]?.label ?? selectedInquiry.inquiryType}
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {selectedInquiry.email}
                      {" · "}
                      {safeFormatDate(selectedInquiry.createdAt, "MMMM d, yyyy")}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">

                    {/* Assign button — not shown when in trash/spam */}
                    {selectedInquiry.status !== "assigned" && selectedInquiry.status !== "spam" && selectedInquiry.status !== "trash" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 sm:h-8 text-xs px-2 sm:px-3" onClick={() => { setAssignTarget(selectedInquiry); setAssignGuideName("") }}>
                            <UserCheck className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                            <span className="hidden sm:inline">Assign</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Assign to a tourist guide</TooltipContent>
                      </Tooltip>
                    )}

                    {/* Restore (only in trash) */}
                    {selectedInquiry.status === "trash" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 sm:h-8 text-xs px-2 sm:px-3" onClick={() => handleRestoreFromTrash(selectedInquiry)}>
                            <RotateCcw className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                            <span className="hidden sm:inline">Restore</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Restore to inbox</TooltipContent>
                      </Tooltip>
                    )}

                    {/* Archive toggle — not shown in spam/trash */}
                    {selectedInquiry.status !== "spam" && selectedInquiry.status !== "trash" && (
                      selectedInquiry.status !== "archived" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleArchive(selectedInquiry)}>
                              <Archive className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mark as completed</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleStatusChange(selectedInquiry, "unread")}>
                              <Inbox className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Move to inbox</TooltipContent>
                        </Tooltip>
                      )
                    )}

                    {/* Spam */}
                    {selectedInquiry.status !== "spam" && selectedInquiry.status !== "trash" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500 hover:text-orange-600" onClick={() => handleMarkSpam(selectedInquiry)}>
                            <ShieldAlert className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark as spam</TooltipContent>
                      </Tooltip>
                    )}

                    {/* Trash / Delete Forever */}
                    {selectedInquiry.status !== "trash" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => handleMoveToTrash(selectedInquiry)}>
                            <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to trash</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(selectedInquiry)}>
                            <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete permanently</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* ── Detail body ── */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5">

                  {/* Sender info card */}
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Avatar */}
                        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {getInitials(selectedInquiry.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm sm:text-base text-card-foreground">
                                {selectedInquiry.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  <a href={`mailto:${selectedInquiry.email}`} className="hover:underline text-primary/80">
                                    {selectedInquiry.email}
                                  </a>
                                </span>
                                {selectedInquiry.contactNumber && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <a href={`tel:${selectedInquiry.contactNumber}`} className="hover:underline">
                                      {selectedInquiry.contactNumber}
                                    </a>
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 shrink-0" />
                                  {safeFormatDate(selectedInquiry.createdAt, "MMMM d, yyyy · h:mm a")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={cn("text-[10px] sm:text-xs", inquiryStatusLabels[selectedInquiry.status]?.color ?? "")}>
                                {inquiryStatusLabels[selectedInquiry.status]?.label ?? selectedInquiry.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Visit info — real columns */}
                  {(selectedInquiry.dateOfVisit || selectedInquiry.numberOfPax != null) && (
                    <Card className="border-dashed">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Visit Information
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedInquiry.dateOfVisit && (() => {
                            const dateTo = selectedInquiry.additionalDetails?.dateToVisit as string | undefined
                            const hasRange = dateTo && dateTo !== selectedInquiry.dateOfVisit
                            return (
                              <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shrink-0">
                                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                    {hasRange ? "Visit Date Range" : "Date of Visit"}
                                  </p>
                                  <p className="text-xs font-medium text-card-foreground">
                                    {safeFormatDate(selectedInquiry.dateOfVisit, "MMMM d, yyyy")}
                                    {hasRange && (
                                      <> — {safeFormatDate(dateTo, "MMMM d, yyyy")}</>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )
                          })()}
                          {selectedInquiry.numberOfPax != null && (
                            <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shrink-0">
                                <Users className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Number of Visitors</p>
                                <p className="text-xs font-medium text-card-foreground">
                                  {selectedInquiry.numberOfPax} {selectedInquiry.numberOfPax === 1 ? "person" : "people"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Additional details — JSON extras */}
                  {hasAdditionalDetails(selectedInquiry) && (
                    <Card className="border-dashed">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Additional Details
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(selectedInquiry.additionalDetails!).filter(([key]) => key !== "dateToVisit").map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shrink-0">
                                {getDetailIcon(key)}
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">{formatKey(key)}</p>
                                <p className="text-xs font-medium text-card-foreground">{String(value)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Message body */}
                  <Card>
                    <CardContent className="p-3 sm:p-5">
                      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-card-foreground">
                        {selectedInquiry.message}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Assigned guide info */}
                  {selectedInquiry.status === "assigned" && selectedInquiry.assignedTo && (
                    <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 shrink-0">
                          <UserCheck className="h-4 w-4 text-green-700 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Assigned to Tourist Guide</p>
                          <p className="text-sm font-semibold text-card-foreground">{selectedInquiry.assignedTo}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Existing reply thread */}
                  {selectedInquiry.replyText && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 text-[10px] font-bold text-primary">
                            ME
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-semibold text-card-foreground">
                                {selectedInquiry.repliedBy ?? "Admin"}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {selectedInquiry.repliedAt ? safeFormatDate(selectedInquiry.repliedAt, "MMM d, yyyy · h:mm a") : ""}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-xs text-card-foreground leading-relaxed">
                              {selectedInquiry.replyText}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reply composer */}
                  {selectedInquiry.status !== "trash" && (
                    <div className="pt-1">
                      {!showReplyBox ? (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => setShowReplyBox(true)}
                        >
                          <Reply className="h-4 w-4" />
                          {selectedInquiry.replyText ? "Reply Again" : "Reply"}
                        </Button>
                      ) : (
                        <Card className="border-border shadow-sm">
                          <CardContent className="p-3 sm:p-4 space-y-3">
                            {/* To: line */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border pb-2">
                              <span className="font-medium">To:</span>
                              <span className="text-card-foreground">{selectedInquiry.name}</span>
                              <span className="text-primary/70">&lt;{selectedInquiry.email}&gt;</span>
                              <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => { setShowReplyBox(false); setReplyText("") }}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <Textarea
                              placeholder={`Dear ${selectedInquiry.name},\n\nThank you for your inquiry…`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-[120px] text-sm resize-none"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                className="gap-1.5"
                                disabled={!replyText.trim() || isSendingReply}
                                onClick={() => handleSendReply(true)}
                              >
                                {isSendingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                Send & Open Gmail
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                disabled={!replyText.trim() || isSendingReply}
                                onClick={() => handleSendReply(false)}
                              >
                                Save Reply Only
                              </Button>
                              <span className="text-[10px] text-muted-foreground">
                                "Send & Open Gmail" saves the reply and opens your email client
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ─── Assign Dialog ────────────────────────────────── */}
          <AlertDialog open={!!assignTarget} onOpenChange={() => { setAssignTarget(null); setAssignGuideName("") }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Assign to Tourist Guide</AlertDialogTitle>
                <AlertDialogDescription>
                  Mark the inquiry from &quot;{assignTarget?.name}&quot; as assigned to a tourist guide?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmAssign}
                  className="bg-primary text-primary-foreground"
                >
                  Assign
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* ─── Delete Confirm ───────────────────────────────── */}
          <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete Inquiry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete the inquiry from &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </main>
      </div>
    </TooltipProvider>
  )
}
