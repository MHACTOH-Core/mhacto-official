"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import {
  inquiryStatusLabels,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/data/admin-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Inbox,
  Star,
  Archive,
  Send,
  Search,
  ArrowLeft,
  Reply,
  MailOpen,
  StarOff,
  CheckCheck,
  User,
  Mail,
  Clock,
  Trash2,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import { format, parseISO, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

type MailboxTab = "inbox" | "starred" | "replied" | "archived" | "spam" | "trash"

const mailboxTabs: { key: MailboxTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "starred", label: "Starred", icon: Star },
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
      case "starred":
        list = inquiries.filter((i) => i.status === "starred")
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
    starred: inquiries.filter((i) => i.status === "starred").length,
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

  const handleStar = (inq: Inquiry) => {
    updateInquiry(inq.id, {
      status: inq.status === "starred" ? "read" : "starred",
    })
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

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex flex-1 overflow-hidden">
        {/* Left — mailbox sidebar */}
        <div className="flex w-72 shrink-0 flex-col border-r border-border bg-card">
          {/* Header */}
          <div className="border-b border-border px-4 py-4">
            <h1 className="text-xl font-bold text-card-foreground">Inquiries</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Tabs */}
          <nav className="space-y-0.5 px-2 py-3">
            {mailboxTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setSelectedInquiry(null)
                  setSelectedIds(new Set())
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{tab.label}</span>
                <span className="text-xs text-muted-foreground">
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </nav>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inquiries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Middle — message list */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border lg:w-96">
          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 border-b border-border bg-accent/50 px-4 py-2">
              <span className="text-xs text-muted-foreground">
                {selectedIds.size} selected
              </span>
              {activeTab === "trash" ? (
                <>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={bulkRestore}>
                    <RotateCcw className="mr-1 h-3 w-3" /> Restore
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={bulkPermanentDelete}>
                    <Trash2 className="mr-1 h-3 w-3" /> Delete Forever
                  </Button>
                </>
              ) : activeTab === "spam" ? (
                <>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={bulkRestore}>
                    <RotateCcw className="mr-1 h-3 w-3" /> Not Spam
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={bulkTrash}>
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={bulkArchive}>
                    <Archive className="mr-1 h-3 w-3" /> Archive
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={bulkSpam}>
                    <ShieldAlert className="mr-1 h-3 w-3" /> Spam
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={bulkTrash}>
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Trash / Spam banner */}
          {activeTab === "trash" && tabCounts.trash > 0 && (
            <div className="flex items-center gap-2 border-b border-border bg-yellow-50 px-4 py-2.5 dark:bg-yellow-950/30">
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Messages in Trash will be <strong>permanently deleted after 30 days</strong>.
              </p>
            </div>
          )}
          {activeTab === "spam" && tabCounts.spam > 0 && (
            <div className="flex items-center gap-2 border-b border-border bg-orange-50 px-4 py-2.5 dark:bg-orange-950/30">
              <ShieldAlert className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Messages marked as spam are hidden from your inbox.
              </p>
            </div>
          )}

          {/* Select all */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selectedIds.size === filtered.length}
              onChange={toggleSelectAll}
              className="h-3.5 w-3.5 rounded border-border"
            />
            <span className="text-xs text-muted-foreground">Select all</span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                {activeTab === "trash" ? (
                  <>
                    <Trash2 className="h-8 w-8 opacity-30" />
                    <p className="text-sm">No messages in Trash</p>
                  </>
                ) : activeTab === "spam" ? (
                  <>
                    <ShieldAlert className="h-8 w-8 opacity-30" />
                    <p className="text-sm">No spam messages</p>
                  </>
                ) : (
                  <p className="text-sm">No inquiries</p>
                )}
              </div>
            )}
            {filtered.map((inq) => (
              <div
                key={inq.id}
                onClick={() => openInquiry(inq)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-accent/50",
                  selectedInquiry?.id === inq.id && "bg-primary/5",
                  inq.status === "unread" && "bg-blue-50/50 dark:bg-blue-950/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(inq.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleSelect(inq.id)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-border"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-sm",
                        inq.status === "unread"
                          ? "font-bold text-card-foreground"
                          : "font-medium text-card-foreground",
                      )}
                    >
                      {inq.name}
                    </span>
                    <Badge
                      className={`shrink-0 text-[11px] px-1.5 py-0 ${inquiryStatusLabels[inq.status].color}`}
                    >
                      {inquiryStatusLabels[inq.status].label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium text-card-foreground">
                    {inq.subject}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {inq.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(parseISO(inq.createdAt), "MMM d, yyyy · h:mm a")}
                    {inq.status === "trash" && inq.trashedAt && (
                      <span className="ml-2 text-destructive">
                        · Auto-deletes in {getDaysUntilDeletion(inq)} day{getDaysUntilDeletion(inq) !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — detail view */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {!selectedInquiry ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <MailOpen className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">Select an inquiry to view</p>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 lg:hidden"
                  onClick={() => setSelectedInquiry(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-card-foreground">
                    {selectedInquiry.subject}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    From{" "}
                    <span className="font-medium text-card-foreground">
                      {selectedInquiry.name}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {selectedInquiry.status === "trash" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleRestore(selectedInquiry)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(selectedInquiry)}
                        title="Delete Forever"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : selectedInquiry.status === "spam" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleRestore(selectedInquiry)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Not Spam
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleTrash(selectedInquiry)}
                        title="Move to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStar(selectedInquiry)}
                        title={selectedInquiry.status === "starred" ? "Unstar" : "Star"}
                      >
                        {selectedInquiry.status === "starred" ? (
                          <StarOff className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                      {selectedInquiry.status !== "archived" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleArchive(selectedInquiry)}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUnarchive(selectedInquiry)}
                          title="Move to Inbox"
                        >
                          <Inbox className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSpam(selectedInquiry)}
                        title="Report Spam"
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          setReplyText("")
                          setReplyOpen(true)
                        }}
                      >
                        <Reply className="h-3.5 w-3.5" /> Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleTrash(selectedInquiry)}
                        title="Move to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Detail body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Sender info card */}
                <Card className="mb-6">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-card-foreground">
                        {selectedInquiry.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedInquiry.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(
                            parseISO(selectedInquiry.createdAt),
                            "MMMM d, yyyy · h:mm a",
                          )}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={inquiryStatusLabels[selectedInquiry.status].color}
                    >
                      {inquiryStatusLabels[selectedInquiry.status].label}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Message */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
                    {selectedInquiry.message}
                  </p>
                </div>

                {/* Reply shown */}
                {selectedInquiry.replyMessage && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50/50 p-5 dark:border-green-800 dark:bg-green-950/30">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-green-700 dark:text-green-300">
                      <CheckCheck className="h-3.5 w-3.5" />
                      Replied on{" "}
                      {selectedInquiry.repliedAt &&
                        format(parseISO(selectedInquiry.repliedAt), "MMMM d, yyyy · h:mm a")}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-green-900 dark:text-green-100">
                      {selectedInquiry.replyMessage}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Reply Dialog */}
        <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Reply to {selectedInquiry?.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
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
              <Button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" /> Send Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently Delete Inquiry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete the inquiry from &quot;{deleteTarget?.name}&quot; regarding &quot;{deleteTarget?.subject}&quot;? This action cannot be undone.
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
  )
}
