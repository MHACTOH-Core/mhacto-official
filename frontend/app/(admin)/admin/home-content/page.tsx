"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Landmark,
  GripVertical,
  Save,
  Video,
} from "lucide-react"
import { MediaPickerInput } from "@/components/ui/media-picker"
import {
  apiFetchAllMilestones,
  apiFetchHeroSettings,
  apiCreateMilestone,
  apiUpdateMilestone,
  apiDeleteMilestone,
  apiReorderMilestones,
  apiUpdateHeroSettings,
  apiFetchTimelinePosts,
  type Milestone,
  type HeroSettings,
} from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { useToast } from "@/hooks/use-toast"

export default function HomeContentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, isHydrated } = useAdmin()

  const { toast } = useToast()

  // Data state
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Active tab state — persisted via URL search params so it survives refresh
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "hero")

  // Sync tab to URL without full navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // CMS posts for selection
  const [cmsTimelinePosts, setCmsTimelinePosts] = useState<CMSPost[]>([])

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Milestone | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null)

  // Save confirmation
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [pendingSave, setPendingSave] = useState<(() => Promise<void>) | null>(null)

  // Form state
  const [formData, setFormData] = useState<Record<string, string | number | boolean | null>>({})

  // Hero settings form state (separate from dialog formData)
  const [heroFormData, setHeroFormData] = useState<Partial<HeroSettings>>({})

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!isHydrated) return
    if (!isLoggedIn) {
      router.push("/admin")
      return
    }
    loadAllContent()
  }, [isHydrated, isLoggedIn, router])

  // Initialize hero form data when heroSettings loads
  useEffect(() => {
    if (heroSettings) {
      setHeroFormData({
        subtitle: heroSettings.subtitle ?? "",
        title: heroSettings.title ?? "",
        highlight: heroSettings.highlight ?? "",
        description: heroSettings.description ?? "",
        videoUrl: heroSettings.videoUrl ?? "",
        fallbackImage: heroSettings.fallbackImage ?? "",
        ctaText: heroSettings.ctaText ?? "Explore Now",
        ctaLink: heroSettings.ctaLink ?? "/destinations",
      })
    }
  }, [heroSettings])

  // Fetches ALL admin home-page content in parallel:
  //   1. GET /api/home/hero-settings.php          → PHP: SELECT from site_settings
  //   2. GET /api/home/milestones.php?all=1        → PHP: SELECT from milestone
  //   3. GET /api/home/timeline-posts              → PHP: SELECT timeline posts
  const loadAllContent = async () => {
    setLoading(true)
    setError(null)
    try {
      const [settings, miles, timelinePosts] = await Promise.all([
        apiFetchHeroSettings().catch(() => null),
        apiFetchAllMilestones().catch(() => []),
        apiFetchTimelinePosts().catch(() => []),
      ])
      setHeroSettings(settings)
      setMilestones(miles)
      setCmsTimelinePosts(timelinePosts)
    } catch (err) {
      setError("Failed to load content. Make sure the backend is running.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData({ contentId: "", year: "", side: "left", sortOrder: milestones.length + 1, isActive: true })
    setDialogOpen(true)
  }

  const openEditDialog = (item: Milestone) => {
    setEditingItem(item)
    const linkedPost = item.contentId ? cmsTimelinePosts.find(p => p.id === item.contentId) : null
    const yearFromMeta = linkedPost?.established || ""
    const yearFromTitle = linkedPost?.title?.match(/\b(\d{4})\b/)?.[1] || ""
    setFormData({
      ...item,
      year: item.year || yearFromMeta || yearFromTitle,
      _previewTitle: linkedPost?.title || item.title || "",
      _previewYear: item.year || yearFromMeta || yearFromTitle,
      _previewDescription: linkedPost?.body?.substring(0, 300) || item.description || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      // Strip preview-only fields before sending to API, but map them
      // to actual columns when the user hasn't provided explicit values
      const { _previewTitle, _previewYear, _previewDescription, ...milestoneData } = formData
      if (!milestoneData.title && _previewTitle) milestoneData.title = _previewTitle
      if (!milestoneData.description && _previewDescription) milestoneData.description = _previewDescription

      // Client-side duplicate check for new milestones
      if (!editingItem) {
        const effectiveTitle = (milestoneData.title as string) || ""
        const effectiveYear = (milestoneData.year as string) || ""
        const duplicate = milestones.find(
          (m) => m.year === effectiveYear && m.title === effectiveTitle
        )
        if (duplicate) {
          toast({ title: "Duplicate milestone", description: "A milestone with the same year and title already exists. Please change the year or title.", variant: "destructive" })
          return
        }
      }

      if (editingItem) {
        await apiUpdateMilestone(editingItem.milestoneId, milestoneData as Partial<Milestone>)
      } else {
        await apiCreateMilestone(milestoneData as Partial<Milestone>)
      }
      setDialogOpen(false)
      loadAllContent()
      toast({ title: editingItem ? "Content updated" : "Content created", description: `Milestone has been ${editingItem ? "updated" : "created"}.`, variant: "success" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save. Please try again."
      const isDuplicate = message.toLowerCase().includes("already exists")
      console.error("Save failed:", err)
      toast({ title: isDuplicate ? "Duplicate milestone" : "Save failed", description: message, variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await apiDeleteMilestone(deleteTarget.id)
      setDeleteTarget(null)
      loadAllContent()
      toast({ title: "Content deleted", description: "Milestone has been deleted.", variant: "success" })
    } catch (err) {
      console.error("Delete failed:", err)
      setError("Failed to delete. Please try again.")
      toast({ title: "Delete failed", description: "Failed to delete. Please try again.", variant: "destructive" })
    }
  }

  const toggleActive = async (id: number, currentState: boolean) => {
    try {
      await apiUpdateMilestone(id, { isActive: !currentState })
      loadAllContent()
      toast({ title: "Status toggled", description: `Milestone has been ${currentState ? "deactivated" : "activated"}.`, variant: "success" })
    } catch (err) {
      console.error("Toggle failed:", err)
      toast({ title: "Toggle failed", description: "Failed to toggle status.", variant: "destructive" })
    }
  }

  const moveItem = async (index: number, direction: "up" | "down") => {
    const newMilestones = [...milestones]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newMilestones.length) return
    ;[newMilestones[index], newMilestones[swapIndex]] = [newMilestones[swapIndex], newMilestones[index]]
    // Optimistic update — apply locally first so there is no full page reload/redirect
    setMilestones(newMilestones)
    const order = newMilestones.map(m => m.milestoneId)
    try {
      await apiReorderMilestones(order)
      toast({ title: "Order updated", description: "Milestones have been reordered.", variant: "success" })
    } catch (err) {
        console.error("Reorder failed:", err)
        // Revert on failure
        setMilestones(milestones)
        toast({ title: "Reorder failed", description: "Failed to reorder milestones.", variant: "destructive" })
      }
  }

  const handleDragEnd = async (fromIndex: number, toIndex: number) => {
    setDragIndex(null)
    setDragOverIndex(null)
    if (fromIndex === toIndex) return
    const newMilestones = [...milestones]
    const [moved] = newMilestones.splice(fromIndex, 1)
    newMilestones.splice(toIndex, 0, moved)
    setMilestones(newMilestones)
    const order = newMilestones.map(m => m.milestoneId)
    try {
      await apiReorderMilestones(order)
      toast({ title: "Order updated", description: "Milestones have been reordered.", variant: "success" })
    } catch (err) {
      console.error("Reorder failed:", err)
      setMilestones(milestones)
      toast({ title: "Reorder failed", description: "Failed to reorder milestones.", variant: "destructive" })
    }
  }

  // Handler for saving hero settings (single hero)
  const handleSaveHeroSettings = async () => {
    try {
      await apiUpdateHeroSettings(heroFormData)
      loadAllContent()
      setError(null)
      toast({ title: "Hero settings saved", description: "Hero section settings have been updated.", variant: "success" })
    } catch (err) {
      console.error("Save hero settings failed:", err)
      setError("Failed to save hero settings. Please try again.")
      toast({ title: "Save failed", description: "Failed to save hero settings.", variant: "destructive" })
    }
  }

  const confirmSave = (saveFn: () => Promise<void>) => {
    setPendingSave(() => saveFn)
    setSaveConfirmOpen(true)
  }

  const executePendingSave = async () => {
    setSaveConfirmOpen(false)
    if (pendingSave) {
      await pendingSave()
      setPendingSave(null)
    }
  }

  if (!isHydrated || !isLoggedIn) return null

  return (
    <>
    <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Home Page Content
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage hero settings, featured spotlight, and heritage milestones. Other sections (Culinary, Culture, Crafts, People, News) pull featured content from CMS posts.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
              {error}
              <Button variant="link" size="sm" onClick={loadAllContent} className="ml-2 h-auto p-0">
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
                <TabsTrigger value="hero" className="gap-2">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Hero</span>
                </TabsTrigger>
                <TabsTrigger value="milestone" className="gap-2">
                  <Landmark className="h-4 w-4" />
                  <span className="hidden sm:inline">Milestones</span>
                </TabsTrigger>
              </TabsList>

              {/* Hero Settings Tab (Single hero with video background) */}
              <TabsContent value="hero" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Hero Section Settings</h2>
                    <p className="text-sm text-muted-foreground">
                      Configure the main hero section with video background. Only one hero is displayed.
                    </p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Hero Content</CardTitle>
                    <CardDescription>
                      This content is displayed on the home page hero section with video background.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="heroSubtitle">Subtitle</Label>
                        <Input
                          id="heroSubtitle"
                          value={heroFormData.subtitle ?? ""}
                          onChange={(e) => setHeroFormData({ ...heroFormData, subtitle: e.target.value })}
                          placeholder="Bocaue, Bulacan"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heroHighlight">Highlight Text (optional)</Label>
                        <Input
                          id="heroHighlight"
                          value={heroFormData.highlight ?? ""}
                          onChange={(e) => setHeroFormData({ ...heroFormData, highlight: e.target.value })}
                          placeholder="Town Wonders"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroTitle">Main Title</Label>
                      <Input
                        id="heroTitle"
                        value={heroFormData.title ?? ""}
                        onChange={(e) => setHeroFormData({ ...heroFormData, title: e.target.value })}
                        placeholder="Explore The River"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroDescription">Description</Label>
                      <Textarea
                        id="heroDescription"
                        value={heroFormData.description ?? ""}
                        onChange={(e) => setHeroFormData({ ...heroFormData, description: e.target.value })}
                        placeholder="Where rich heritage meets vibrant culture..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="heroVideoUrl">Video URL</Label>
                        <MediaPickerInput
                          value={heroFormData.videoUrl ?? ""}
                          onChange={(url) => setHeroFormData({ ...heroFormData, videoUrl: url })}
                          accept="video"
                          placeholder="/videos/bocaue-hero.mp4 or browse..."
                          uploadCategory="home"
                          uploadLabel="hero"
                        />
                        <p className="text-xs text-muted-foreground">Background video for the hero section — browse existing or upload</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heroFallbackImage">Fallback Image URL</Label>
                        <MediaPickerInput
                          value={heroFormData.fallbackImage ?? ""}
                          onChange={(url) => setHeroFormData({ ...heroFormData, fallbackImage: url })}
                          accept="image"
                          placeholder="Browse or upload a fallback image..."
                          uploadCategory="home"
                          uploadLabel="hero"
                        />
                        <p className="text-xs text-muted-foreground">Shown if video cannot load — browse existing or upload</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => confirmSave(handleSaveHeroSettings)} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Hero Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Milestones Tab */}
              <TabsContent value="milestone" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">History & Culture Timeline</h2>
                    <p className="text-sm text-muted-foreground">
                      The Story of Bocaue milestones. Drag to reorder.
                    </p>
                  </div>
                  <Button onClick={() => openCreateDialog()} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Milestone
                  </Button>
                </div>

                <div className="space-y-2">
                  {milestones.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Landmark className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No milestones yet.</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => openCreateDialog()}>
                          Add First Milestone
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    milestones.map((mile, index) => (
                      <Card
                        key={mile.milestoneId}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
                        onDragEnd={() => { if (dragIndex !== null && dragOverIndex !== null) handleDragEnd(dragIndex, dragOverIndex) }}
                        className={`transition-all cursor-grab active:cursor-grabbing ${
                          !mile.isActive ? "opacity-60" : ""
                        } ${dragIndex === index ? "opacity-40 scale-[0.98]" : ""} ${
                          dragOverIndex === index && dragIndex !== index ? "border-primary border-2 shadow-md" : ""
                        }`}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-shrink-0 w-16 text-center">
                            <Badge variant="outline" className="font-bold">{mile.year}</Badge>
                            <div className="text-xs text-muted-foreground mt-1 capitalize">{mile.side}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{mile.title}</h3>
                              {!mile.isActive && (
                                <Badge variant="secondary" className="text-xs">Hidden</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{mile.description}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActive(mile.milestoneId, mile.isActive ?? true)}
                            >
                              {mile.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(mile)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget({ id: mile.milestoneId })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Create"} Milestone
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Milestone Form */}
                <div className="space-y-2">
                  <Label htmlFor="contentId">Select Timeline Event from CMS</Label>
                  <Select
                    value={(formData.contentId as string) || ""}
                    onValueChange={(v) => {
                      const selectedPost = cmsTimelinePosts.find(p => p.id === v)
                      // Try to extract year from established meta, or parse from title (e.g. "Founding - 1580")
                      const yearFromMeta = selectedPost?.established || ""
                      const yearFromTitle = selectedPost?.title?.match(/\b(\d{4})\b/)?.[1] || ""
                      const autoYear = yearFromMeta || yearFromTitle
                      setFormData({
                        ...formData,
                        contentId: v,
                        year: autoYear,
                        _previewTitle: selectedPost?.title || "",
                        _previewYear: autoYear,
                        _previewDescription: selectedPost?.body?.substring(0, 300) || "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timeline event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cmsTimelinePosts.length === 0 ? (
                        <p className="p-2 text-sm text-muted-foreground">No published timeline events found. Create timeline-of-events in CMS first.</p>
                      ) : (
                        cmsTimelinePosts.map((post) => (
                          <SelectItem key={post.id} value={post.id}>
                            <div className="flex items-center gap-2">
                              <span>{post.title}</span>
                              {post.established && (
                                <span className="text-xs text-muted-foreground">
                                  ({post.established})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Milestones are linked to CMS timeline-of-events content. Data is pulled automatically.
                  </p>
                </div>

                {/* Preview of selected timeline event */}
                {formData.contentId && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Selected Timeline Event Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex items-center gap-2">
                        {(formData._previewYear as string) && (
                          <Badge variant="outline" className="font-bold">{formData._previewYear as string}</Badge>
                        )}
                        <p className="font-medium">{formData._previewTitle as string}</p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{formData._previewDescription as string}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g. 1580"
                    value={(formData.year as string) || ""}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    The year shown on the timeline badge. Auto-filled from CMS when available.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="side">Timeline Side</Label>
                    <Select
                      value={(formData.side as string) || "left"}
                      onValueChange={(v) => setFormData({ ...formData, side: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={(formData.sortOrder as number) || 0}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={(formData.isActive as boolean) ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => confirmSave(handleSave)} className="gap-2">
              <Save className="h-4 w-4" />
              {editingItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Save Confirmation */}
      <AlertDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to save?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the content on the live site. Please make sure all changes are correct.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executePendingSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
