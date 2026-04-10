"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import type { TourGuide, GuideAvailability, TourGuideAppointment } from "@/lib/data/admin-data"
import {
  apiFetchAppointments,
  apiCreateAppointment,
  apiUpdateAppointment,
  apiDeleteAppointment,
} from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  CalendarPlus,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const availabilityConfig: Record<GuideAvailability, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  available:   { label: "Available",   color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",   icon: CheckCircle2 },
  unavailable: { label: "Unavailable", color: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",       icon: XCircle },
  on_tour:     { label: "On Tour",     color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",       icon: MapPin },
}

// ── Helpers ────────────────────────────────────────────────────────

function toDatetimeLocal(dbDatetime: string): string {
  // "2026-04-15 09:00:00" → "2026-04-15T09:00"
  return dbDatetime.replace(" ", "T").slice(0, 16)
}

function fromDatetimeLocal(local: string): string {
  // "2026-04-15T09:00" → "2026-04-15 09:00:00"
  return local.replace("T", " ") + ":00"
}

function formatDisplay(dbDatetime: string): string {
  const d = new Date(dbDatetime.replace(" ", "T"))
  return d.toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ── Appointment form state type ─────────────────────────────────────

interface ApptForm {
  title: string
  startDatetime: string // datetime-local value
  endDatetime: string
  notes: string
}

const EMPTY_APPT: ApptForm = { title: "", startDatetime: "", endDatetime: "", notes: "" }

export default function TourGuidesPage() {
  const router = useRouter()
  const { isLoggedIn, isHydrated, tourGuides, createTourGuide, updateTourGuide, deleteTourGuide, refreshTourGuides } = useAdmin()
  const { toast } = useToast()

  // ── Guide form dialog ──────────────────────────────────────────────
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [editTarget, setEditTarget] = useState<TourGuide | null>(null)
  const [formName, setFormName] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formAvailability, setFormAvailability] = useState<GuideAvailability>("available")
  const [isSaving, setIsSaving] = useState(false)

  // ── Delete guide dialog ────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<TourGuide | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Search ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("")

  // ── Appointments dialog ───────────────────────────────────────────
  const [schedGuide, setSchedGuide] = useState<TourGuide | null>(null)
  const [appointments, setAppointments] = useState<TourGuideAppointment[]>([])
  const [isLoadingAppts, setIsLoadingAppts] = useState(false)

  // ── Appointment create/edit form ──────────────────────────────────
  const [apptFormMode, setApptFormMode] = useState<"create" | "edit" | null>(null)
  const [apptEditTarget, setApptEditTarget] = useState<TourGuideAppointment | null>(null)
  const [apptForm, setApptForm] = useState<ApptForm>(EMPTY_APPT)
  const [isSavingAppt, setIsSavingAppt] = useState(false)

  // ── Appointment delete confirm ────────────────────────────────────
  const [deleteApptTarget, setDeleteApptTarget] = useState<TourGuideAppointment | null>(null)
  const [isDeletingAppt, setIsDeletingAppt] = useState(false)

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push("/admin")
  }, [isHydrated, isLoggedIn, router])

  if (!isHydrated || !isLoggedIn) return null

  const filtered = tourGuides.filter((g) =>
    !search || g.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (g.phoneNumber ?? "").includes(search)
  )

  // ── Guide CRUD ─────────────────────────────────────────────────────
  const openCreate = () => {
    setDialogMode("create")
    setEditTarget(null)
    setFormName("")
    setFormPhone("")
    setFormAvailability("available")
  }

  const openEdit = (g: TourGuide) => {
    setDialogMode("edit")
    setEditTarget(g)
    setFormName(g.fullName)
    setFormPhone(g.phoneNumber ?? "")
    setFormAvailability(g.availability)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    setIsSaving(true)
    try {
      if (dialogMode === "create") {
        await createTourGuide({ fullName: formName.trim(), phoneNumber: formPhone.trim() || undefined, availability: formAvailability })
        toast({ title: "Guide added", description: `${formName} has been added to the roster.`, variant: "success" })
      } else if (editTarget) {
        await updateTourGuide(editTarget.id, { fullName: formName.trim(), phoneNumber: formPhone.trim() || undefined, availability: formAvailability })
        toast({ title: "Guide updated", description: `${formName} has been updated.`, variant: "success" })
      }
      setDialogMode(null)
    } catch {
      toast({ title: "Error", description: "Failed to save guide. Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteTourGuide(deleteTarget.id)
      toast({ title: "Guide removed", description: `${deleteTarget.fullName} has been removed.`, variant: "destructive" })
      setDeleteTarget(null)
    } catch {
      toast({ title: "Error", description: "Failed to delete guide.", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleActive = async (g: TourGuide) => {
    await updateTourGuide(g.id, { isActive: !g.isActive })
    toast({ title: g.isActive ? "Guide deactivated" : "Guide activated", description: `${g.fullName} is now ${g.isActive ? "inactive" : "active"}.` })
  }

  // ── Appointments ───────────────────────────────────────────────────
  const openSchedule = async (g: TourGuide) => {
    setSchedGuide(g)
    setIsLoadingAppts(true)
    try {
      const list = await apiFetchAppointments(g.id)
      setAppointments(list)
    } catch {
      toast({ title: "Error", description: "Could not load appointments.", variant: "destructive" })
    } finally {
      setIsLoadingAppts(false)
    }
  }

  const closeSchedule = () => {
    setSchedGuide(null)
    setAppointments([])
    setApptFormMode(null)
    setApptEditTarget(null)
    setApptForm(EMPTY_APPT)
  }

  const openApptCreate = () => {
    setApptFormMode("create")
    setApptEditTarget(null)
    setApptForm(EMPTY_APPT)
  }

  const openApptEdit = (appt: TourGuideAppointment) => {
    setApptFormMode("edit")
    setApptEditTarget(appt)
    setApptForm({
      title: appt.title,
      startDatetime: toDatetimeLocal(appt.startDatetime),
      endDatetime: toDatetimeLocal(appt.endDatetime),
      notes: appt.notes ?? "",
    })
  }

  const handleSaveAppt = async () => {
    if (!schedGuide || !apptForm.title.trim() || !apptForm.startDatetime || !apptForm.endDatetime) return
    if (apptForm.endDatetime <= apptForm.startDatetime) {
      toast({ title: "Invalid time range", description: "End time must be after start time.", variant: "destructive" })
      return
    }
    setIsSavingAppt(true)
    try {
      const payload = {
        title: apptForm.title.trim(),
        startDatetime: fromDatetimeLocal(apptForm.startDatetime),
        endDatetime: fromDatetimeLocal(apptForm.endDatetime),
        notes: apptForm.notes.trim() || null,
      }
      if (apptFormMode === "create") {
        await apiCreateAppointment(schedGuide.id, payload)
        toast({ title: "Appointment scheduled", description: `"${payload.title}" has been added.`, variant: "success" })
      } else if (apptEditTarget) {
        await apiUpdateAppointment(schedGuide.id, apptEditTarget.id, payload)
        toast({ title: "Appointment updated", description: `"${payload.title}" has been updated.`, variant: "success" })
      }
      // Refresh appointment list + guide availability
      const [fresh] = await Promise.all([apiFetchAppointments(schedGuide.id), refreshTourGuides()])
      setAppointments(fresh)
      setApptFormMode(null)
      setApptEditTarget(null)
      setApptForm(EMPTY_APPT)
    } catch {
      toast({ title: "Error", description: "Failed to save appointment.", variant: "destructive" })
    } finally {
      setIsSavingAppt(false)
    }
  }

  const handleDeleteAppt = async () => {
    if (!schedGuide || !deleteApptTarget) return
    setIsDeletingAppt(true)
    try {
      await apiDeleteAppointment(schedGuide.id, deleteApptTarget.id)
      toast({ title: "Appointment removed", description: `"${deleteApptTarget.title}" has been deleted.` })
      const [fresh] = await Promise.all([apiFetchAppointments(schedGuide.id), refreshTourGuides()])
      setAppointments(fresh)
      setDeleteApptTarget(null)
    } catch {
      toast({ title: "Error", description: "Failed to delete appointment.", variant: "destructive" })
    } finally {
      setIsDeletingAppt(false)
    }
  }

  const counts = {
    total: tourGuides.length,
    active: tourGuides.filter((g) => g.isActive).length,
    available: tourGuides.filter((g) => g.isActive && g.availability === "available").length,
    on_tour: tourGuides.filter((g) => g.availability === "on_tour").length,
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Tourist Guides</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage the guide roster for tour assignments.</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Guide
          </Button>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Guides", value: counts.total, color: "text-card-foreground" },
            { label: "Active",       value: counts.active, color: "text-card-foreground" },
            { label: "Available",    value: counts.available, color: "text-green-600 dark:text-green-400" },
            { label: "On Tour",      value: counts.on_tour, color: "text-teal-600 dark:text-teal-400" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-xs">
          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guides…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* ── Guide list ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-16">
            <div className="rounded-full bg-muted/50 p-5">
              <Users className="h-10 w-10 opacity-30" />
            </div>
            <p className="text-sm font-medium">No guides yet</p>
            <p className="text-xs text-muted-foreground">Click &quot;Add Guide&quot; to add your first tourist guide.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((g) => {
              const avConfig = availabilityConfig[g.availability]
              return (
                <Card key={g.id} className={cn(!g.isActive && "opacity-50")}>
                  <CardContent className="p-4 flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {g.fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-card-foreground truncate">{g.fullName}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => openSchedule(g)}>
                                <CalendarDays className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Schedule</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(g)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(g)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Phone */}
                      {g.phoneNumber && (
                        <a href={`tel:${g.phoneNumber}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1">
                          <Phone className="h-3 w-3" /> {g.phoneNumber}
                        </a>
                      )}

                      {/* Availability + active toggle */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge className={cn("text-[10px] px-1.5 py-0 gap-0.5", avConfig.color)}>
                          <avConfig.icon className="h-3 w-3" />
                          {avConfig.label}
                        </Badge>
                        <button
                          onClick={() => toggleActive(g)}
                          className={cn(
                            "text-[10px] font-medium rounded-full px-2 py-0.5 transition-colors",
                            g.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-red-100 hover:text-red-700"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 hover:bg-green-100 hover:text-green-700"
                          )}
                        >
                          {g.isActive ? "Active" : "Inactive"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Create / Edit Guide Dialog ── */}
      <AlertDialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) setDialogMode(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogMode === "create" ? "Add Tourist Guide" : "Edit Tourist Guide"}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMode === "create" ? "Add a new guide to the roster." : `Editing ${editTarget?.fullName}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full Name <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Juan dela Cruz" value={formName} onChange={(e) => setFormName(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
              <Input placeholder="+63 9xx xxx xxxx" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Availability</label>
              <Select value={formAvailability} onValueChange={(v) => setFormAvailability(v as GuideAvailability)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="on_tour">On Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!formName.trim() || isSaving}
              onClick={handleSave}
              className="bg-primary text-primary-foreground"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              {dialogMode === "create" ? "Add Guide" : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Guide Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tour Guide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently remove &quot;{deleteTarget?.fullName}&quot; from the roster? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Remove Guide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Schedule / Appointments Dialog ── */}
      <Dialog open={!!schedGuide} onOpenChange={(open) => { if (!open) closeSchedule() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {schedGuide?.fullName} — Schedule
            </DialogTitle>
            <DialogDescription>
              Set tour appointments. Availability updates automatically when a tour starts or ends.
            </DialogDescription>
          </DialogHeader>

          {/* ── Appointment form (inline) ── */}
          {apptFormMode !== null && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {apptFormMode === "create" ? "New Appointment" : "Edit Appointment"}
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title <span className="text-destructive">*</span></label>
                <Input
                  placeholder="e.g. Bocaue River Tour"
                  value={apptForm.title}
                  onChange={(e) => setApptForm((f) => ({ ...f, title: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Start <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={apptForm.startDatetime}
                    onChange={(e) => setApptForm((f) => ({ ...f, startDatetime: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> End <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={apptForm.endDatetime}
                    onChange={(e) => setApptForm((f) => ({ ...f, endDatetime: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <Textarea
                  placeholder="Any additional details…"
                  value={apptForm.notes}
                  onChange={(e) => setApptForm((f) => ({ ...f, notes: e.target.value }))}
                  className="text-sm resize-none h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => { setApptFormMode(null); setApptForm(EMPTY_APPT) }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!apptForm.title.trim() || !apptForm.startDatetime || !apptForm.endDatetime || isSavingAppt}
                  onClick={handleSaveAppt}
                >
                  {isSavingAppt && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
                  {apptFormMode === "create" ? "Add Appointment" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Appointment list ── */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {isLoadingAppts ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <CalendarDays className="h-8 w-8 opacity-30" />
                <p className="text-sm">No appointments scheduled yet.</p>
              </div>
            ) : (
              appointments.map((appt) => {
                const now = new Date()
                const start = new Date(appt.startDatetime.replace(" ", "T"))
                const end = new Date(appt.endDatetime.replace(" ", "T"))
                const isActive = now >= start && now <= end
                const isPast = now > end
                return (
                  <div
                    key={appt.id}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-lg border p-3",
                      isActive && "border-teal-400 bg-teal-50 dark:bg-teal-900/20",
                      isPast && "opacity-50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{appt.title}</p>
                        {isActive && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                            Active
                          </Badge>
                        )}
                        {isPast && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            Past
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDisplay(appt.startDatetime)} → {formatDisplay(appt.endDatetime)}
                      </p>
                      {appt.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{appt.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openApptEdit(appt)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteApptTarget(appt)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <DialogFooter className="flex-row items-center gap-2 sm:justify-between">
            {apptFormMode === null && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={openApptCreate}>
                <CalendarPlus className="h-3.5 w-3.5" /> Add Appointment
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={closeSchedule} className="ml-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Appointment Confirm ── */}
      <AlertDialog open={!!deleteApptTarget} onOpenChange={(open) => { if (!open) setDeleteApptTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &quot;{deleteApptTarget?.title}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAppt}
              disabled={isDeletingAppt}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingAppt && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}