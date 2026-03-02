"use client"

import { useState, useEffect } from "react"
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
  Search,
  ArrowLeft,
  MailOpen,
  CheckCircle2,
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
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

type MailboxTab = "all" | "unread" | "in_progress" | "resolved" | "archived"

const mailboxTabs: { key: MailboxTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all", label: "All", icon: Inbox },
  { key: "unread", label: "Unread", icon: Mail },
  { key: "in_progress", label: "In Progress", icon: Loader2 },
  { key: "resolved", label: "Resolved", icon: CheckCircle2 },
  { key: "archived", label: "Archived", icon: Archive },
]

export default function InquiriesPage() {
  const router = useRouter()
  const { isLoggedIn, inquiries, updateInquiry, deleteInquiry, permanentDeleteInquiry } = useAdmin()

  const [activeTab, setActiveTab] = useState<MailboxTab>("all")
  const [search, setSearch] = useState("")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null)

  useEffect(() => {
    if (!isLoggedIn) router.push("/admin")
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  // Filtered by tab
  const getFiltered = () => {
    let list = inquiries
    switch (activeTab) {
      case "all":
        break
      case "unread":
        list = inquiries.filter((i) => i.status === "unread")
        break
      case "in_progress":
        list = inquiries.filter((i) => i.status === "in_progress")
        break
      case "resolved":
        list = inquiries.filter((i) => i.status === "resolved")
        break
      case "archived":
        list = inquiries.filter((i) => i.status === "archived")
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
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  const filtered = getFiltered()

  const tabCounts: Record<MailboxTab, number> = {
    all: inquiries.length,
    unread: inquiries.filter((i) => i.status === "unread").length,
    in_progress: inquiries.filter((i) => i.status === "in_progress").length,
    resolved: inquiries.filter((i) => i.status === "resolved").length,
    archived: inquiries.filter((i) => i.status === "archived").length,
  }

  const unreadCount = tabCounts.unread

  // Open inquiry — mark as in_progress if unread
  const openInquiry = (inq: Inquiry) => {
    setSelectedInquiry(inq)
    if (inq.status === "unread") {
      updateInquiry(inq.id, { status: "in_progress" })
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
    if (selectedInquiry?.id === inq.id) setSelectedInquiry(null)
  }

  const handleDelete = (inq: Inquiry) => {
    setDeleteTarget(inq)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      permanentDeleteInquiry(deleteTarget.id)
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
    setSelectedIds(new Set())
  }

  const bulkResolve = () => {
    selectedIds.forEach((id) => updateInquiry(id, { status: "resolved" }))
    setSelectedIds(new Set())
  }

  const bulkDelete = () => {
    selectedIds.forEach((id) => permanentDeleteInquiry(id))
    if (selectedInquiry && selectedIds.has(selectedInquiry.id)) setSelectedInquiry(null)
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

  // ── Empty‑state messages ───────────────────────────────────────

  const emptyMessages: Record<MailboxTab, { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }> = {
    all: { icon: Inbox, title: "No inquiries yet", desc: "New inquiries will appear here." },
    unread: { icon: Mail, title: "All caught up!", desc: "No unread inquiries." },
    in_progress: { icon: Loader2, title: "Nothing in progress", desc: "Inquiries being worked on appear here." },
    resolved: { icon: CheckCircle2, title: "No resolved inquiries", desc: "Resolved inquiries will show here." },
    archived: { icon: Archive, title: "Archive is empty", desc: "Archived inquiries will show here." },
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
                <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2" onClick={bulkResolve}>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Resolve</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2" onClick={bulkArchive}>
                  <Archive className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Archive</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2 text-destructive hover:text-destructive" onClick={bulkDelete}>
                  <Trash2 className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            )}

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
                        {format(parseISO(inq.createdAt), "MMM d")}
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
                      <Badge className={cn("text-[10px] px-1.5 py-0 font-medium", inquiryStatusLabels[inq.status].color)}>
                        {inquiryStatusLabels[inq.status].label}
                      </Badge>

                      {/* Pax count */}
                      {inq.numberOfPax != null && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Users className="h-2.5 w-2.5" />
                          {inq.numberOfPax} pax
                        </span>
                      )}

                      {/* Visit date */}
                      {inq.dateOfVisit && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <CalendarDays className="h-2.5 w-2.5" />
                          {format(parseISO(inq.dateOfVisit), "MMM d")}
                        </span>
                      )}
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
                      {format(parseISO(selectedInquiry.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                    {selectedInquiry.status !== "resolved" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 sm:h-8 text-xs px-2 sm:px-3" onClick={() => handleStatusChange(selectedInquiry, "resolved")}>
                            <CheckCircle2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                            <span className="hidden sm:inline">Resolve</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark as resolved</TooltipContent>
                      </Tooltip>
                    )}

                    {selectedInquiry.status !== "archived" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleArchive(selectedInquiry)}>
                            <Archive className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archive</TooltipContent>
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
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(selectedInquiry)}>
                          <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete permanently</TooltipContent>
                    </Tooltip>
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
                                  {format(parseISO(selectedInquiry.createdAt), "MMMM d, yyyy · h:mm a")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={cn("text-[10px] sm:text-xs", inquiryStatusLabels[selectedInquiry.status].color)}>
                                {inquiryStatusLabels[selectedInquiry.status].label}
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
                          {selectedInquiry.dateOfVisit && (
                            <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shrink-0">
                                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Date of Visit</p>
                                <p className="text-xs font-medium text-card-foreground">
                                  {format(parseISO(selectedInquiry.dateOfVisit), "MMMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                          )}
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
                          {Object.entries(selectedInquiry.additionalDetails!).map(([key, value]) => (
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
                </div>
              </>
            )}
          </div>

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
