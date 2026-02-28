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
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  UserCheck,
  Archive,
  Send,
  Search,
  ArrowLeft,
  Reply,
  MailOpen,
  UserX,
  CheckCheck,
  Mail,
  Clock,
  Trash2,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  Phone,
  CalendarDays,
  Users,
  GraduationCap,
  School,
  Hash,
  MapPin,
} from "lucide-react"
import { format, parseISO, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

type MailboxTab = "inbox" | "assigned" | "replied" | "archived" | "spam" | "trash"

const mailboxTabs: { key: MailboxTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "assigned", label: "Assigned", icon: UserCheck },
  { key: "replied", label: "Replied", icon: Send },
  { key: "archived", label: "Archived", icon: Archive },
  { key: "spam", label: "Spam", icon: ShieldAlert },
  { key: "trash", label: "Trash", icon: Trash2 },
]

export default function InquiriesPage() {
  const router = useRouter()
  const { isLoggedIn, inquiries, updateInquiry, deleteInquiry, permanentDeleteInquiry, replyToInquiry } = useAdmin()

  const [activeTab, setActiveTab] = useState<MailboxTab>("inbox")
  const [search, setSearch] = useState("")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
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
      case "inbox":
        list = inquiries.filter((i) => i.status === "unread" || i.status === "read")
        break
      case "assigned":
        list = inquiries.filter((i) => i.isAssigned)
        break
      case "replied":
        list = inquiries.filter((i) => i.status === "replied")
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
          i.subject.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q),
      )
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  const filtered = getFiltered()

  const tabCounts: Record<MailboxTab, number> = {
    inbox: inquiries.filter((i) => i.status === "unread" || i.status === "read").length,
    assigned: inquiries.filter((i) => i.isAssigned).length,
    replied: inquiries.filter((i) => i.status === "replied").length,
    archived: inquiries.filter((i) => i.status === "archived").length,
    spam: inquiries.filter((i) => i.status === "spam").length,
    trash: inquiries.filter((i) => i.status === "trash").length,
  }

  const unreadCount = inquiries.filter((i) => i.status === "unread").length

  // Open inquiry — mark as read
  const openInquiry = (inq: Inquiry) => {
    setSelectedInquiry(inq)
    if (inq.status === "unread") {
      updateInquiry(inq.id, { status: "read" })
    }
  }

  const handleAssign = (inq: Inquiry) => {
    updateInquiry(inq.id, { isAssigned: !inq.isAssigned } as Partial<Inquiry>)
    setSelectedInquiry({ ...inq, isAssigned: !inq.isAssigned })
  }

  const handleArchive = (inq: Inquiry) => {
    updateInquiry(inq.id, { status: "archived" })
    if (selectedInquiry?.id === inq.id) setSelectedInquiry(null)
  }

  const handleUnarchive = (inq: Inquiry) => {
    updateInquiry(inq.id, { status: "read" })
  }

  const handleSpam = (inq: Inquiry) => {
    updateInquiry(inq.id, { status: "spam" })
    if (selectedInquiry?.id === inq.id) setSelectedInquiry(null)
  }

  const handleTrash = (inq: Inquiry) => {
    deleteInquiry(inq.id)
    if (selectedInquiry?.id === inq.id) setSelectedInquiry(null)
  }

  const handleRestore = (inq: Inquiry) => {
    updateInquiry(inq.id, { status: "read", trashedAt: undefined })
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

  const getDaysUntilDeletion = (inq: Inquiry) => {
    if (!inq.trashedAt) return 30
    const trashed = parseISO(inq.trashedAt)
    const daysElapsed = differenceInDays(new Date(), trashed)
    return Math.max(0, 30 - daysElapsed)
  }

  const handleReply = () => {
    if (!selectedInquiry || !replyText.trim()) return
    replyToInquiry(selectedInquiry.id, replyText)
    setReplyOpen(false)
    setReplyText("")
    // Refresh selected
    setSelectedInquiry({
      ...selectedInquiry,
      status: "replied",
      replyMessage: replyText,
      repliedAt: new Date().toISOString(),
    })
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

  const bulkSpam = () => {
    selectedIds.forEach((id) => updateInquiry(id, { status: "spam" }))
    setSelectedIds(new Set())
  }

  const bulkTrash = () => {
    selectedIds.forEach((id) => deleteInquiry(id))
    if (selectedInquiry && selectedIds.has(selectedInquiry.id)) setSelectedInquiry(null)
    setSelectedIds(new Set())
  }

  const bulkRestore = () => {
    selectedIds.forEach((id) => updateInquiry(id, { status: "read", trashedAt: undefined }))
    setSelectedIds(new Set())
  }

  const bulkPermanentDelete = () => {
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

  const hasVisitDetails = (inq: Inquiry) =>
    inq.purposeName || inq.dateOfVisit || inq.numberOfPax

  const isStudent = (inq: Inquiry) => inq.inquiryType === "student"

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)

  // ── Empty‑state messages ───────────────────────────────────────

  const emptyMessages: Record<MailboxTab, { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }> = {
    inbox: { icon: Inbox, title: "All caught up!", desc: "No new inquiries to review." },
    assigned: { icon: UserCheck, title: "Nothing assigned", desc: "Assigned inquiries will appear here." },
    replied: { icon: Send, title: "No replies yet", desc: "Replied inquiries will appear here." },
    archived: { icon: Archive, title: "Archive is empty", desc: "Archived inquiries will show here." },
    spam: { icon: ShieldAlert, title: "No spam", desc: "Messages flagged as spam appear here." },
    trash: { icon: Trash2, title: "Trash is empty", desc: "Deleted messages appear here for 30 days." },
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
                      tab.key === "inbox" && unreadCount > 0
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
                {activeTab === "trash" ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2" onClick={bulkRestore}>
                      <RotateCcw className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Restore</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2 text-destructive hover:text-destructive" onClick={bulkPermanentDelete}>
                      <Trash2 className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Delete Forever</span>
                    </Button>
                  </>
                ) : activeTab === "spam" ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2" onClick={bulkRestore}>
                      <RotateCcw className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Not Spam</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2 text-destructive hover:text-destructive" onClick={bulkTrash}>
                      <Trash2 className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2" onClick={bulkArchive}>
                      <Archive className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Archive</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2" onClick={bulkSpam}>
                      <ShieldAlert className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Spam</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 sm:h-7 text-xs px-2 text-destructive hover:text-destructive" onClick={bulkTrash}>
                      <Trash2 className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Trash / Spam banner */}
            {activeTab === "trash" && tabCounts.trash > 0 && (
              <div className="flex items-center gap-2 border-b border-border bg-yellow-50 px-2 sm:px-4 py-2 sm:py-2.5 dark:bg-yellow-950/30">
                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
                <p className="text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-300">
                  Messages in Trash are <strong>permanently deleted after 30 days</strong>.
                </p>
              </div>
            )}
            {activeTab === "spam" && tabCounts.spam > 0 && (
              <div className="flex items-center gap-2 border-b border-border bg-orange-50 px-2 sm:px-4 py-2 sm:py-2.5 dark:bg-orange-950/30">
                <ShieldAlert className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
                <p className="text-[10px] sm:text-xs text-orange-700 dark:text-orange-300">
                  Spam messages are hidden from your inbox.
                </p>
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

                    {/* Row 2: Subject */}
                    <p className={cn(
                      "mt-0.5 truncate text-xs",
                      inq.status === "unread" ? "font-semibold text-card-foreground" : "text-card-foreground",
                    )}>
                      {inq.subject}
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
                        inquiryTypeLabels[inq.inquiryType ?? "general"].color,
                      )}>
                        {isStudent(inq) && <GraduationCap className="h-2.5 w-2.5" />}
                        {inquiryTypeLabels[inq.inquiryType ?? "general"].label}
                      </Badge>

                      {/* Status badge */}
                      <Badge className={cn("text-[10px] px-1.5 py-0 font-medium", inquiryStatusLabels[inq.status].color)}>
                        {inquiryStatusLabels[inq.status].label}
                      </Badge>

                      {/* Assigned badge */}
                      {inq.isAssigned && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-medium">
                          <UserCheck className="mr-0.5 h-2.5 w-2.5" />
                          Assigned
                        </Badge>
                      )}

                      {/* Pax count if available */}
                      {inq.numberOfPax && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Users className="h-2.5 w-2.5" />
                          {inq.numberOfPax} pax
                        </span>
                      )}

                      {/* Auto-delete countdown for trash */}
                      {inq.status === "trash" && inq.trashedAt && (
                        <span className="text-[10px] text-destructive font-medium">
                          · {getDaysUntilDeletion(inq)}d left
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
                        {selectedInquiry.subject}
                      </h2>
                      <Badge className={cn(
                        "shrink-0 text-[10px] px-1.5 py-0 font-medium",
                        inquiryTypeLabels[selectedInquiry.inquiryType ?? "general"].color,
                      )}>
                        {isStudent(selectedInquiry) && <GraduationCap className="mr-0.5 h-2.5 w-2.5" />}
                        {inquiryTypeLabels[selectedInquiry.inquiryType ?? "general"].label}
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      From <span className="font-medium text-card-foreground">{selectedInquiry.name}</span>
                      {" · "}
                      {format(parseISO(selectedInquiry.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                    {selectedInquiry.status === "trash" ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5 h-7 sm:h-8 text-xs px-2 sm:px-3" onClick={() => handleRestore(selectedInquiry)}>
                              <RotateCcw className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                              <span className="hidden sm:inline">Restore</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Move back to inbox</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(selectedInquiry)}>
                              <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete forever</TooltipContent>
                        </Tooltip>
                      </>
                    ) : selectedInquiry.status === "spam" ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5 h-7 sm:h-8 text-xs px-2 sm:px-3" onClick={() => handleRestore(selectedInquiry)}>
                              <RotateCcw className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                              <span className="hidden sm:inline">Not Spam</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mark as not spam</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => handleTrash(selectedInquiry)}>
                              <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Move to trash</TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => handleAssign(selectedInquiry)}
                            >
                              {selectedInquiry.isAssigned
                                ? <UserX className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-purple-500" />
                                : <UserCheck className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                              }
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{selectedInquiry.isAssigned ? "Unassign" : "Mark as assigned"}</TooltipContent>
                        </Tooltip>

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
                              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleUnarchive(selectedInquiry)}>
                                <Inbox className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move to inbox</TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex" onClick={() => handleSpam(selectedInquiry)}>
                              <ShieldAlert className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Report spam</TooltipContent>
                        </Tooltip>

                        <Button
                          variant="outline" size="sm"
                          className="gap-1 sm:gap-1.5 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                          onClick={() => { setReplyText(""); setReplyOpen(true) }}
                        >
                          <Reply className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                          <span className="hidden xs:inline">Reply</span>
                        </Button>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => handleTrash(selectedInquiry)}>
                              <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Move to trash</TooltipContent>
                        </Tooltip>
                      </>
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
                                  {format(parseISO(selectedInquiry.createdAt), "MMMM d, yyyy · h:mm a")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={cn("text-[10px] sm:text-xs", inquiryStatusLabels[selectedInquiry.status].color)}>
                                {inquiryStatusLabels[selectedInquiry.status].label}
                              </Badge>
                              {selectedInquiry.isAssigned && (
                                <Badge className="text-[10px] sm:text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                                  Assigned
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Visit details card — only if there is visit info */}
                  {(hasVisitDetails(selectedInquiry) || isStudent(selectedInquiry)) && (
                    <Card className="border-dashed">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {isStudent(selectedInquiry) ? "Student Visit Details" : "Visit Details"}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedInquiry.purposeName && (
                            <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shrink-0">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Purpose</p>
                                <p className="text-xs font-medium text-card-foreground">{selectedInquiry.purposeName}</p>
                              </div>
                            </div>
                          )}

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

                          {/* Student-specific fields */}
                          {isStudent(selectedInquiry) && selectedInquiry.schoolName && (
                            <div className="flex items-center gap-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shrink-0">
                                <School className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">School</p>
                                <p className="text-xs font-medium text-card-foreground">{selectedInquiry.schoolName}</p>
                              </div>
                            </div>
                          )}

                          {isStudent(selectedInquiry) && selectedInquiry.studentNumber && (
                            <div className="flex items-center gap-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shrink-0">
                                <Hash className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Student Number</p>
                                <p className="text-xs font-medium text-card-foreground">{selectedInquiry.studentNumber}</p>
                              </div>
                            </div>
                          )}
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

                  {/* Reply shown */}
                  {selectedInquiry.replyMessage && (
                    <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                      <CardContent className="p-3 sm:p-5">
                        <div className="mb-2 flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-300">
                          <CheckCheck className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                          <span>
                            Replied on{" "}
                            {selectedInquiry.repliedAt &&
                              format(parseISO(selectedInquiry.repliedAt), "MMM d, yyyy · h:mm a")}
                          </span>
                        </div>
                        <Separator className="my-2 bg-green-200 dark:bg-green-800" />
                        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-green-900 dark:text-green-100">
                          {selectedInquiry.replyMessage}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick reply prompt when not yet replied */}
                  {selectedInquiry.status !== "replied" && selectedInquiry.status !== "trash" && selectedInquiry.status !== "spam" && (
                    <button
                      onClick={() => { setReplyText(""); setReplyOpen(true) }}
                      className="w-full rounded-xl border-2 border-dashed border-border px-4 py-3 text-left text-xs sm:text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      <Reply className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                      Click to reply to {selectedInquiry.name}...
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ─── Reply Dialog ─────────────────────────────────── */}
          <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  Reply to {selectedInquiry?.name}
                </DialogTitle>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  RE: {selectedInquiry?.subject}
                </p>
              </DialogHeader>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={8}
                className="resize-y"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setReplyOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReply} disabled={!replyText.trim()} className="gap-2">
                  <Send className="h-4 w-4" /> Send Reply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ─── Delete Confirm ───────────────────────────────── */}
          <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete Inquiry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete the inquiry from &quot;{deleteTarget?.name}&quot;
                  regarding &quot;{deleteTarget?.subject}&quot;? This action cannot be undone.
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
