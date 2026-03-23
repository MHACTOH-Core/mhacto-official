"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import type { CMSPost } from "@/lib/data/admin-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  gallery: Array.from({ length: 6 }, () => ({ title: "", description: "", category: "" })),
  quote: {
    text: "Where the river meets faith, the Pagoda sails — a living testament to centuries of devotion, fire, and the unbreakable spirit of Bocaue.",
    attribution: "— Bocaue Heritage",
  },
}

/* ── Image slot indices ──────────────────────────────────────────── */
// images[0] = hero, images[1-3] = sections, images[4-9] = gallery
const SLOT = { hero: 0, sec1: 1, sec2: 2, sec3: 3, gal: 4 } as const

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
  const [images, setImages] = useState<string[]>(Array(10).fill(""))
  const [meta, setMeta] = useState<PagodaMetadata>(DEFAULT_METADATA)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)

  // Media picker
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<number>(-1)

  // Load existing data
  useEffect(() => {
    if (!pagodaPost) return
    setOverview(pagodaPost.body ?? "")

    // Populate images array (pad to 10)
    const imgs = [...(pagodaPost.image ?? [])]
    while (imgs.length < 10) imgs.push("")
    setImages(imgs.slice(0, 10))

    // Parse metadata from story
    if (pagodaPost.story) {
      try {
        const parsed = JSON.parse(pagodaPost.story) as Partial<PagodaMetadata>
        setMeta({ ...DEFAULT_METADATA, ...parsed })
      } catch { /* keep defaults */ }
    }
  }, [pagodaPost])

  if (!isHydrated || !isLoggedIn) return null

  // Image helpers
  const setImage = (idx: number, url: string) => {
    setImages((prev) => { const next = [...prev]; next[idx] = url; return next })
    setDirty(true)
  }
  const clearImage = (idx: number) => setImage(idx, "")
  const openPicker = (idx: number) => { setPickerTarget(idx); setPickerOpen(true) }

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

  const executeSave = () => {
    setSaveConfirmOpen(false)
    setSaving(true)

    const payload: Record<string, unknown> = {
      title: "Pagoda sa Bocaue",
      body: overview,
      contentCategory: "arts-culture",
      label: "pagoda",
      postType: "place",
      status: "published",
      image: images.filter(Boolean),
      story: JSON.stringify(meta),
    }

    try {
      if (pagodaPost) {
        updatePost(pagodaPost.id, payload)
        toast({ title: "Pagoda content updated", description: "Your changes have been saved." })
      } else {
        createPost(payload as Omit<CMSPost, "id" | "createdAt" | "updatedAt">)
        toast({ title: "Pagoda content created", description: "The pagoda page is now live." })
      }
      setDirty(false)
    } catch {
      toast({ title: "Save failed", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="border-b border-border bg-card px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
                <Flame className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Pagoda Festival</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
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

        <div className="p-6 space-y-8 max-w-5xl">

          {/* ── 1. Hero Section ───────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutDashboard className="h-5 w-5 text-sky-500" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageSlot
                src={images[SLOT.hero]}
                label="Hero Background Image"
                onPick={() => openPicker(SLOT.hero)}
                onClear={() => clearImage(SLOT.hero)}
                aspectClass="aspect-[21/9]"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Badge Text</Label>
                  <Input
                    value={meta.badgeText}
                    onChange={(e) => updateField("badgeText", e.target.value)}
                    placeholder="Bocaue River Festival"
                  />
                </div>
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
            </CardContent>
          </Card>

          {/* ── 2. Overview Section ───────────────────────────────── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Type className="h-5 w-5 text-amber-500" />
                Festival Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={overview}
                onChange={(e) => { setOverview(e.target.value); setDirty(true) }}
                placeholder="Write the festival overview description that appears after the stats..."
                rows={5}
                className="resize-y"
              />
            </CardContent>
          </Card>

          {/* ── 4. Content Sections (1-3) ─────────────────────────── */}
          {meta.sections.map((sec, i) => (
            <Card key={i}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  Content Section {i + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <ImageSlot
                    src={images[SLOT.sec1 + i]}
                    label="Section Image"
                    onPick={() => openPicker(SLOT.sec1 + i)}
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

          {/* ── 5. Pull Quote ─────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Quote className="h-5 w-5 text-violet-500" />
                Pull Quote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* ── 6. Gallery Section ────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GalleryHorizontalEnd className="h-5 w-5 text-rose-500" />
                Gallery — Moments on the River
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                    <ImageSlot
                      src={images[SLOT.gal + i]}
                      label={`Gallery Image ${i + 1}`}
                      onPick={() => openPicker(SLOT.gal + i)}
                      onClear={() => clearImage(SLOT.gal + i)}
                      aspectClass="aspect-[4/3]"
                    />
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={meta.gallery[i]?.title ?? ""}
                        onChange={(e) => updateGallery(i, "title", e.target.value)}
                        placeholder="Image title..."
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={meta.gallery[i]?.description ?? ""}
                        onChange={(e) => updateGallery(i, "description", e.target.value)}
                        placeholder="Image description..."
                        rows={2}
                        className="text-sm resize-y"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Category</Label>
                      <Input
                        value={meta.gallery[i]?.category ?? ""}
                        onChange={(e) => updateGallery(i, "category", e.target.value)}
                        placeholder="e.g. Procession, Celebration..."
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="h-8" />
        </div>
      </main>

      {/* ── Media Picker Dialog ───────────────────────────────────── */}
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        accept="image"
        title="Select Image"
        currentValue={pickerTarget >= 0 ? images[pickerTarget] : undefined}
        uploadCategory="arts-culture"
        uploadLabel="pagoda"
        onSelect={(url) => {
          if (pickerTarget >= 0) setImage(pickerTarget, url)
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
    </div>
  )
}
