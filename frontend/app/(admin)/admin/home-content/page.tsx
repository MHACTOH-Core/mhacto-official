"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
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
  Sparkles,
  Landmark,
  Calendar,
  MapPin,
  ChevronUp,
  ChevronDown,
  Save,
  Video,
} from "lucide-react"
import { MediaPickerInput } from "@/components/ui/media-picker"
import {
  apiFetchAllSpotlights,
  apiFetchAllMilestones,
  apiFetchHeroSettings,
  apiCreateSpotlight,
  apiUpdateSpotlight,
  apiDeleteSpotlight,
  apiCreateMilestone,
  apiUpdateMilestone,
  apiDeleteMilestone,
  apiReorderMilestones,
  apiUpdateHeroSettings,
  apiFetchPosts,
  type Spotlight,
  type Milestone,
  type HeroSettings,
  type FeaturedContent,
} from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"

type ContentType = "spotlight" | "milestone"

export default function HomeContentPage() {
  const router = useRouter()
  const { isLoggedIn } = useAdmin()

  // Data state
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null)
  const [spotlights, setSpotlights] = useState<(FeaturedContent & Spotlight)[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // CMS posts for selection
  const [cmsEvents, setCmsEvents] = useState<CMSPost[]>([])

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<ContentType>("spotlight")
  const [editingItem, setEditingItem] = useState<Spotlight | Milestone | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: ContentType; id: number } | null>(null)

  // Form state
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  // Hero settings form state (separate from dialog formData)
  const [heroFormData, setHeroFormData] = useState<Partial<HeroSettings>>({})

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/admin")
      return
    }
    loadAllContent()
  }, [isLoggedIn, router])

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
  //   2. GET /api/home/spotlight.php?all=1         → PHP: SELECT from featured_content WHERE section='spotlight'
  //   3. GET /api/home/milestones.php?all=1        → PHP: SELECT from milestone
  //   4. GET /api/posts/read.php?status=published  → PHP: SELECT from content WHERE status='published'
  const loadAllContent = async () => {
    setLoading(true)
    setError(null)
    try {
      const [settings, spots, miles, allPosts] = await Promise.all([
        apiFetchHeroSettings().catch(() => null),
        apiFetchAllSpotlights().catch(() => []),
        apiFetchAllMilestones().catch(() => []),
        apiFetchPosts("published").catch(() => []),
      ])
      setHeroSettings(settings)
      setSpotlights(Array.isArray(spots) ? spots : spots ? [spots] : [])
      setMilestones(miles)
      
      // Filter CMS posts by type/category
      const events = allPosts.filter((p: CMSPost) => p.postType === "event" || p.label === "events" || p.label === "festivals")
      
      setCmsEvents(events)
    } catch (err) {
      setError("Failed to load content. Make sure the backend is running.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = (type: ContentType) => {
    setDialogType(type)
    setEditingItem(null)
    setFormData(getDefaultFormData(type))
    setDialogOpen(true)
  }

  const openEditDialog = (type: ContentType, item: Spotlight | Milestone) => {
    setDialogType(type)
    setEditingItem(item)
    setFormData({ ...item })
    setDialogOpen(true)
  }

  const getDefaultFormData = (type: ContentType): Record<string, unknown> => {
    switch (type) {
      case "spotlight":
        return { contentId: "", sortOrder: spotlights.length + 1, isActive: false }
      case "milestone":
        return { year: "", title: "", description: "", detail: "", side: "left", sortOrder: milestones.length + 1, isActive: true }
      default:
        return {}
    }
  }

  const handleSave = async () => {
    try {
      if (dialogType === "spotlight") {
        if (editingItem) {
          await apiUpdateSpotlight((editingItem as Spotlight).spotlightId, formData as Partial<Spotlight>)
        } else {
          await apiCreateSpotlight(formData as Partial<Spotlight>)
        }
      } else if (dialogType === "milestone") {
        if (editingItem) {
          await apiUpdateMilestone((editingItem as Milestone).milestoneId, formData as Partial<Milestone>)
        } else {
          await apiCreateMilestone(formData as Partial<Milestone>)
        }
      }
      setDialogOpen(false)
      loadAllContent()
    } catch (err) {
      console.error("Save failed:", err)
      setError("Failed to save. Please try again.")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === "spotlight") {
        await apiDeleteSpotlight(deleteTarget.id)
      } else if (deleteTarget.type === "milestone") {
        await apiDeleteMilestone(deleteTarget.id)
      }
      setDeleteTarget(null)
      loadAllContent()
    } catch (err) {
      console.error("Delete failed:", err)
      setError("Failed to delete. Please try again.")
    }
  }

  const toggleActive = async (type: ContentType, id: number, currentState: boolean) => {
    try {
      if (type === "spotlight") {
        await apiUpdateSpotlight(id, { isActive: !currentState })
      } else if (type === "milestone") {
        await apiUpdateMilestone(id, { isActive: !currentState })
      }
      loadAllContent()
    } catch (err) {
      console.error("Toggle failed:", err)
    }
  }

  const moveItem = async (type: ContentType, index: number, direction: "up" | "down") => {
    if (type === "milestone") {
      const newMilestones = [...milestones]
      const swapIndex = direction === "up" ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= newMilestones.length) return
      [newMilestones[index], newMilestones[swapIndex]] = [newMilestones[swapIndex], newMilestones[index]]
      const order = newMilestones.map(m => m.milestoneId)
      try {
        await apiReorderMilestones(order)
        loadAllContent()
      } catch (err) {
        console.error("Reorder failed:", err)
      }
    }
  }

  // Handler for saving hero settings (single hero)
  const handleSaveHeroSettings = async () => {
    try {
      await apiUpdateHeroSettings(heroFormData)
      loadAllContent()
      setError(null)
    } catch (err) {
      console.error("Save hero settings failed:", err)
      setError("Failed to save hero settings. Please try again.")
    }
  }

  if (!isLoggedIn) return null

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Home Page Content
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage hero settings, featured spotlight, and heritage milestones.
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
            <Tabs defaultValue="hero" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="hero" className="gap-2">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Hero</span>
                </TabsTrigger>
                <TabsTrigger value="spotlight" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Spotlight</span>
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
                        />
                        <p className="text-xs text-muted-foreground">Background video for the hero section — browse existing or upload</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heroFallbackImage">Fallback Image URL</Label>
                        <MediaPickerInput
                          value={heroFormData.fallbackImage ?? ""}
                          onChange={(url) => setHeroFormData({ ...heroFormData, fallbackImage: url })}
                          accept="image"
                          placeholder="/images/heroes/hero-bocaue.jpg or browse..."
                        />
                        <p className="text-xs text-muted-foreground">Shown if video cannot load — browse existing or upload</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="heroCtaText">Button Text</Label>
                        <Input
                          id="heroCtaText"
                          value={heroFormData.ctaText ?? ""}
                          onChange={(e) => setHeroFormData({ ...heroFormData, ctaText: e.target.value })}
                          placeholder="Explore Now"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heroCtaLink">Button Link</Label>
                        <Input
                          id="heroCtaLink"
                          value={heroFormData.ctaLink ?? ""}
                          onChange={(e) => setHeroFormData({ ...heroFormData, ctaLink: e.target.value })}
                          placeholder="/destinations"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveHeroSettings} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Hero Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Spotlight Tab */}
              <TabsContent value="spotlight" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Featured Spotlight</h2>
                    <p className="text-sm text-muted-foreground">
                      Highlight a featured event like the Pagoda Festival. Only one can be active.
                    </p>
                  </div>
                  <Button onClick={() => openCreateDialog("spotlight")} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Spotlight
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {spotlights.length === 0 ? (
                    <Card className="border-dashed col-span-full">
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Sparkles className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No spotlight events yet.</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => openCreateDialog("spotlight")}>
                          Add First Spotlight
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    spotlights.map((spot) => (
                      <Card key={spot.featuredId} className={`transition-all ${spot.isActive ? "ring-2 ring-primary" : "opacity-60"}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{spot.title}</CardTitle>
                              {spot.isActive && (
                                <Badge className="mt-1 bg-primary">Active</Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleActive("spotlight", spot.spotlightId, spot.isActive ?? false)}
                                title={spot.isActive ? "Deactivate" : "Set as active"}
                              >
                                {spot.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog("spotlight", spot)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget({ type: "spotlight", id: spot.spotlightId })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{spot.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {spot.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(spot.date).toLocaleDateString()}
                              </span>
                            )}
                            {spot.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {spot.location}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Milestones Tab */}
              <TabsContent value="milestone" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Heritage & Culture Timeline</h2>
                    <p className="text-sm text-muted-foreground">
                      The Story of Bocaue milestones. Drag to reorder.
                    </p>
                  </div>
                  <Button onClick={() => openCreateDialog("milestone")} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Milestone
                  </Button>
                </div>

                <div className="space-y-2">
                  {milestones.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Landmark className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No milestones yet.</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => openCreateDialog("milestone")}>
                          Add First Milestone
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    milestones.map((mile, index) => (
                      <Card key={mile.milestoneId} className={`transition-opacity ${!mile.isActive ? "opacity-60" : ""}`}>
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === 0}
                              onClick={() => moveItem("milestone", index, "up")}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === milestones.length - 1}
                              onClick={() => moveItem("milestone", index, "down")}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
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
                              onClick={() => toggleActive("milestone", mile.milestoneId, mile.isActive ?? true)}
                            >
                              {mile.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog("milestone", mile)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget({ type: "milestone", id: mile.milestoneId })}
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
              {editingItem ? "Edit" : "Create"}{" "}
              {dialogType === "spotlight" && "Spotlight"}
              {dialogType === "milestone" && "Milestone"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Spotlight Form */}
            {dialogType === "spotlight" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="contentId">Select Event from CMS</Label>
                  <Select
                    value={(formData.contentId as string) || ""}
                    onValueChange={(v) => {
                      const selectedEvent = cmsEvents.find(e => e.id === v)
                      setFormData({
                        ...formData,
                        contentId: v,
                        title: selectedEvent?.title || "",
                        description: selectedEvent?.body?.substring(0, 300) || "",
                        image: selectedEvent?.image?.[0] || "",
                        date: selectedEvent?.newsDate || "",
                        location: selectedEvent?.location || "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cmsEvents.length === 0 ? (
                        <p className="p-2 text-sm text-muted-foreground">No published events found. Create events in CMS first.</p>
                      ) : (
                        cmsEvents.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            <div className="flex items-center gap-2">
                              <span>{event.title}</span>
                              {event.newsDate && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(event.newsDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Spotlight events are linked to CMS content. Data is pulled automatically.
                  </p>
                </div>
                
                {/* Preview of selected event */}
                {formData.contentId && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Selected Event Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        {(formData.image as string) && (
                          <div className="h-12 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={formData.image as string} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{formData.title as string}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {(formData.date as string) && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(formData.date as string).toLocaleDateString()}
                              </span>
                            )}
                            {(formData.location as string) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {formData.location as string}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{formData.description as string}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={(formData.isActive as boolean) ?? false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Set as Active Spotlight</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only one spotlight can be active at a time. Activating this will deactivate others.
                </p>
              </>
            )}

            {/* Milestone Form */}
            {dialogType === "milestone" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      value={(formData.year as string) || ""}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="1580 or Present"
                    />
                  </div>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={(formData.title as string) || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Founding of Bocaue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={(formData.description as string) || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description shown initially..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detail">Expanded Detail</Label>
                  <Textarea
                    id="detail"
                    value={(formData.detail as string) || ""}
                    onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                    placeholder="Full detail shown when user clicks 'Read more'..."
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={(formData.sortOrder as number) || 0}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      id="isActive"
                      checked={(formData.isActive as boolean) ?? true}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
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
    </div>
  )
}
