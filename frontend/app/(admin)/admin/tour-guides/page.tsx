"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import type { TourGuide, GuideAvailability } from "@/lib/data/admin-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const availabilityConfig: Record<GuideAvailability, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  available:   { label: "Available",   color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",   icon: CheckCircle2 },
  unavailable: { label: "Unavailable", color: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",       icon: XCircle },
  on_tour:     { label: "On Tour",     color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",       icon: MapPin },
}

export default function TourGuidesPage() {
  const router = useRouter()
  const { isLoggedIn, isHydrated, tourGuides, createTourGuide, updateTourGuide, deleteTourGuide } = useAdmin()
  const { toast } = useToast()

  // Form dialog state
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [editTarget, setEditTarget] = useState<TourGuide | null>(null)
  const [formName, setFormName] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formAvailability, setFormAvailability] = useState<GuideAvailability>("available")
  const [isSaving, setIsSaving] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<TourGuide | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Search
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push("/admin")
  }, [isHydrated, isLoggedIn, router])

  if (!isHydrated || !isLoggedIn) return null

  const filtered = tourGuides.filter((g) =>
    !search || g.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (g.phoneNumber ?? "").includes(search)
  )

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

      {/* ── Create / Edit Dialog ── */}
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

      {/* ── Delete Confirm ── */}
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
    </TooltipProvider>
  )
}
