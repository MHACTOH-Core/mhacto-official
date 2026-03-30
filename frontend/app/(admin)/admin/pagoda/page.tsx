"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAdmin } from "@/components/providers/admin-provider"
import type { CMSPost } from "@/lib/data/admin-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MediaPicker } from "@/components/ui/media-picker"
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
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Flame,
  ImageIcon,
  LayoutDashboard,
  Type,
  GalleryHorizontalEnd,
  Quote,
  FileText,
  Plus,
  Trash2,
  X,
  Loader2,
} from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils"

/* ── Structured metadata stored in post.story as JSON ───────────── */
interface SectionData {
  title: string
  description: string
}

interface GalleryItemData {
  image: string
  title: string
  description: string
  category: string
}

interface PagodaMetadata {
  eventDate: string
  badgeText: string
  subtitle: string
  sections: [SectionData, SectionData, SectionData]
  gallery: GalleryItemData[]
  quote: { text: string; attribution: string }
}

const DEFAULT_METADATA: PagodaMetadata = {
  eventDate: "July 1st",
  badgeText: "Bocaue River Festival",
  subtitle: "A centuries-old river festival honoring the Holy Cross of Wawa",
  sections: [
    { title: "The Sacred Cross-River Procession", description: "" },
    { title: "A Night of Fire & Light", description: "" },
    { title: "Faith Rooted in Heritage", description: "" },
  ],
  gallery: [],
  quote: {
    text: "Where the river meets faith, the Pagoda sails — a living testament to centuries of devotion, fire, and the unbreakable spirit of Bocaue.",
    attribution: "— Bocaue Heritage",
  },
}

/* ── Image slot indices (hero + 3 sections only) ────────────────── */
const SLOT = { hero: 0, sec1: 1, sec2: 2, sec3: 3 } as const
const FIXED_IMAGE_COUNT = 4

/* ── Image picker button ─────────────────────────────────────────── */
function ImageSlot({
  src,
  label,
  onPick,
  onClear,
  aspectClass = "aspect-video",
}: {
  src: string
  label: string
  onPick: () => void
  onClear: () => void
  aspectClass?: string
}) {
  const resolved = src ? resolveMediaUrl(src) : ""
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div
        className={`relative ${aspectClass} rounded-lg border border-dashed border-border bg-muted/40 overflow-hidden group cursor-pointer`}
        onClick={onPick}
      >
        {resolved ? (
          <>
            <Image src={resolved} alt={label} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="hidden group-hover:block text-white text-xs font-medium">Change Image</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Click to select</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════ */

export default function PagodaPage() {
  const router = useRouter()
  const { isLoggedIn, isHydrated, posts, createPost, updatePost } = useAdmin()
  const { toast } = useToast()

  // Find the single pagoda content post
  const pagodaPost = posts.find((p) => p.label === "pagoda") ?? null

  // Form state
  const [overview, setOverview] = useState("")
  const [images, setImages] = useState<string[]>(Array(FIXED_IMAGE_COUNT).fill(""))
  const [meta, setMeta] = useState<PagodaMetadata>(DEFAULT_METADATA)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)

  // Media picker — callback-based so it works for both fixed slots and gallery items
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerCallback, setPickerCallback] = useState<{ fn: (url: string) => void } | null>(null)
  const [pickerCurrentValue, setPickerCurrentValue] = useState<string | undefined>(undefined)

  // Load existing data
  useEffect(() => {
    if (!pagodaPost) return
    setOverview(pagodaPost.body ?? "")

    // Fixed images: hero + 3 sections
    const imgs = [...(pagodaPost.image ?? [])]
    while (imgs.length < FIXED_IMAGE_COUNT) imgs.push("")
    setImages(imgs.slice(0, FIXED_IMAGE_COUNT))

    // Parse metadata from story
    if (pagodaPost.story) {
      try {
        const parsed = JSON.parse(pagodaPost.story) as Partial<PagodaMetadata>
        setMeta({ ...DEFAULT_METADATA, ...parsed })
      } catch { /* keep defaults */ }
    }
  }, [pagodaPost])

  if (!isHydrated || !isLoggedIn) return null

  // Image helpers for fixed slots (hero + sections)
  const setImage = (idx: number, url: string) => {
    setImages((prev) => { const next = [...prev]; next[idx] = url; return next })
    setDirty(true)
  }
  const clearImage = (idx: number) => setImage(idx, "")
  const openFixedPicker = (idx: number) => {
    setPickerCurrentValue(images[idx] || undefined)
    setPickerCallback({ fn: (url: string) => setImage(idx, url) })
    setPickerOpen(true)
  }
  const openGalleryPicker = (galIdx: number) => {
    setPickerCurrentValue(meta.gallery[galIdx]?.image || undefined)
    setPickerCallback({ fn: (url: string) => {
      setMeta((prev) => {
        const gallery = [...prev.gallery]
        gallery[galIdx] = { ...gallery[galIdx], image: url }
        return { ...prev, gallery }
      })
      setDirty(true)
    } })
    setPickerOpen(true)
  }

  // Metadata helpers
  const updateSection = (idx: number, field: keyof SectionData, value: string) => {
    setMeta((prev) => {
      const sections = [...prev.sections] as [SectionData, SectionData, SectionData]
      sections[idx] = { ...sections[idx], [field]: value }
      return { ...prev, sections }
    })
    setDirty(true)
  }
  const updateGallery = (idx: number, field: keyof GalleryItemData, value: string) => {
    setMeta((prev) => {
      const gallery = [...prev.gallery]
      gallery[idx] = { ...gallery[idx], [field]: value }
      return { ...prev, gallery }
    })
    setDirty(true)
  }
  const addGalleryItem = () => {
    setMeta((prev) => ({
      ...prev,
      gallery: [...prev.gallery, { image: "", title: "", description: "", category: "" }],
    }))
    setDirty(true)
  }
  const removeGalleryItem = (idx: number) => {
    setMeta((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== idx),
    }))
    setDirty(true)
  }
  const updateQuote = (field: "text" | "attribution", value: string) => {
    setMeta((prev) => ({ ...prev, quote: { ...prev.quote, [field]: value } }))
    setDirty(true)
  }
  const updateField = (field: "eventDate" | "badgeText" | "subtitle", value: string) => {
    setMeta((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  // Save handler
  const handleSave = () => setSaveConfirmOpen(true)

  const executeSave = async () => {
    setSaveConfirmOpen(false)
    setSaving(true)

    const payload: Record<string, unknown> = {
      title: "Pagoda sa Bocaue",
      body: overview,
      contentCategory: "arts-culture",
      label: "pagoda",
      postType: "place",
      status: "published",
      image: images.slice(0, FIXED_IMAGE_COUNT).filter(Boolean),
      story: JSON.stringify(meta),
    }

    try {
      if (pagodaPost) {
        await updatePost(pagodaPost.id, payload)
        toast({ title: "Pagoda content updated", description: "Your changes have been saved.", variant: "success" })
      } else {
        await createPost(payload as Omit<CMSPost, "id" | "createdAt" | "updatedAt">)
        toast({ title: "Pagoda content created", description: "The pagoda page is now live.", variant: "success" })
      }
      setDirty(false)
    } catch {
      toast({ title: "Save failed", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <main className="flex-1 overflow-y-auto">

        {/* ── Sticky Header ──────────────────────────────────────── */}
        <div className="border-b border-border bg-card px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">Pagoda Festival</h1>
                <p className="text-sm text-muted-foreground">
                  Edit the Pagoda sa Bocaue page content
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dirty && <Badge variant="outline" className="text-amber-600 border-amber-300">Unsaved changes</Badge>}
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-6">
          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid lg:grid-cols-3 mb-5">
              <TabsTrigger value="hero" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Hero & Overview
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-2">
                <FileText className="h-4 w-4" />
                Content Sections
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <GalleryHorizontalEnd className="h-4 w-4" />
                Gallery & Quote
              </TabsTrigger>
            </TabsList>

            {/* ═══ TAB 1 — Hero & Overview ════════════════════════ */}
            <TabsContent value="hero" className="space-y-5 mt-0">
              {/* Hero */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 dark:bg-sky-900/40">
                      <LayoutDashboard className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Hero Section</CardTitle>
                      <p className="text-xs text-muted-foreground">Background image and headline details</p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <ImageSlot
                      src={images[SLOT.hero]}
                      label="Hero Background Image"
                      onPick={() => openFixedPicker(SLOT.hero)}
                      onClear={() => clearImage(SLOT.hero)}
                      aspectClass="aspect-[16/10]"
                    />
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Badge Text</Label>
                        <Input
                          value={meta.badgeText}
                          onChange={(e) => updateField("badgeText", e.target.value)}
                          placeholder="Bocaue River Festival"
                        />
                      </div>
                      <div className="grid gap-4 grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Event Date</Label>
                          <Input
                            value={meta.eventDate}
                            onChange={(e) => updateField("eventDate", e.target.value)}
                            placeholder="July 1st"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Subtitle</Label>
                          <Input
                            value={meta.subtitle}
                            onChange={(e) => updateField("subtitle", e.target.value)}
                            placeholder="A centuries-old river festival..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/40">
                      <Type className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Festival Overview</CardTitle>
                      <p className="text-xs text-muted-foreground">Description shown after the statistics section</p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <Textarea
                    value={overview}
                    onChange={(e) => { setOverview(e.target.value); setDirty(true) }}
                    placeholder="Write the festival overview description that appears after the stats..."
                    rows={4}
                    className="resize-y"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ TAB 2 — Content Sections ═══════════════════════ */}
            <TabsContent value="sections" className="space-y-5 mt-0">
              {meta.sections.map((sec, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 dark:bg-sky-900/40">
                        <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">Content Section {i + 1}</CardTitle>
                        <p className="text-xs text-muted-foreground">Image and text for story section {i + 1}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="grid gap-5 lg:grid-cols-2">
                      <ImageSlot
                        src={images[SLOT.sec1 + i]}
                        label="Section Image"
                        onPick={() => openFixedPicker(SLOT.sec1 + i)}
                        onClear={() => clearImage(SLOT.sec1 + i)}
                      />
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label>Section Title</Label>
                          <Input
                            value={sec.title}
                            onChange={(e) => updateSection(i, "title", e.target.value)}
                            placeholder="Section title..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Description</Label>
                          <Textarea
                            value={sec.description}
                            onChange={(e) => updateSection(i, "description", e.target.value)}
                            placeholder="Write the section description..."
                            rows={5}
                            className="resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* ═══ TAB 3 — Gallery & Quote ════════════════════════ */}
            <TabsContent value="gallery" className="space-y-5 mt-0">
              {/* Pull Quote */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/40">
                      <Quote className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Pull Quote</CardTitle>
                      <p className="text-xs text-muted-foreground">Featured quote displayed on the page</p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-1.5">
                      <Label>Quote Text</Label>
                      <Textarea
                        value={meta.quote.text}
                        onChange={(e) => updateQuote("text", e.target.value)}
                        placeholder="Where the river meets faith..."
                        rows={3}
                        className="resize-y italic"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Attribution</Label>
                      <Input
                        value={meta.quote.attribution}
                        onChange={(e) => updateQuote("attribution", e.target.value)}
                        placeholder="— Bocaue Heritage"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-900/40">
                        <GalleryHorizontalEnd className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Gallery — Moments on the River</CardTitle>
                        <p className="text-xs text-muted-foreground">{meta.gallery.length} photo{meta.gallery.length !== 1 ? "s" : ""} added</p>
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addGalleryItem}>
                      <Plus className="h-4 w-4" />
                      Add Photo
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  {meta.gallery.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/60">
                      <GalleryHorizontalEnd className="h-10 w-10 mb-2" />
                      <p className="text-sm">No gallery photos yet</p>
                      <p className="text-xs">Click "Add Photo" to start building your gallery</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {meta.gallery.map((item, i) => (
                        <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2.5 relative group">
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(i)}
                            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                            title="Remove photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ImageSlot
                            src={item.image}
                            label={`Gallery Image ${i + 1}`}
                            onPick={() => openGalleryPicker(i)}
                            onClear={() => updateGallery(i, "image", "")}
                            aspectClass="aspect-[4/3]"
                          />
                          <div className="space-y-1.5">
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={item.title}
                              onChange={(e) => updateGallery(i, "title", e.target.value)}
                              placeholder="Image title..."
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="grid gap-3 grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Category</Label>
                              <Input
                                value={item.category}
                                onChange={(e) => updateGallery(i, "category", e.target.value)}
                                placeholder="e.g. Procession"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Description</Label>
                              <Input
                                value={item.description}
                                onChange={(e) => updateGallery(i, "description", e.target.value)}
                                placeholder="Brief caption..."
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ── Media Picker Dialog ───────────────────────────────────── */}
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        accept="image"
        title="Select Image"
        currentValue={pickerCurrentValue}
        uploadCategory="arts-culture"
        uploadLabel="pagoda"
        onSelect={(url) => {
          pickerCallback?.fn(url)
          setPickerOpen(false)
        }}
      />

      {/* ── Save Confirmation ─────────────────────────────────────── */}
      <AlertDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save pagoda content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {pagodaPost ? "update" : "publish"} the Pagoda sa Bocaue page with your changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeSave}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
