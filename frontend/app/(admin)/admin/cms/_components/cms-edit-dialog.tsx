"use client"

import { useState } from "react"
import {
  contentLabels,
  contentCategories,
  getLabelsByCategory,
  type CMSPost,
  type ContentCategory,
  type ContentLabel,
  type ContentStatus,
  type PostType,
} from "@/lib/data/admin-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  MapPin,
  Clock,
  Phone,
  CalendarDays,
  Tag,
  Sparkles,
  List,
  Upload,
  X,
  Newspaper,
  Landmark,
  FolderOpen,
  Star,
  Users,
} from "lucide-react"
import { MediaPicker } from "@/components/ui/media-picker"
import { apiUploadMedia } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import {
  type FormData,
  PLACE_CATEGORIES,
  LABEL_PLACE_TYPES,
  LABEL_VISIBLE_FIELDS,
  LABEL_FIELD_LABELS,
  type DetailField,
} from "./cms-types"

interface CMSEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPost: CMSPost | null
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  showTypeChooser: boolean
  onSelectPostType: (type: PostType, preset?: string) => void
  onSave: () => void
}

export function CMSEditDialog({
  open,
  onOpenChange,
  editingPost,
  form,
  setForm,
  showTypeChooser,
  onSelectPostType,
  onSave,
}: CMSEditDialogProps) {

  const [imageInputMode, setImageInputMode] = useState<"url" | "upload" | "browse">("url")
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [mediaBrowseOpen, setMediaBrowseOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [contactHint, setContactHint] = useState<string | null>(null)
  const [establishedHint, setEstablishedHint] = useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {editingPost ? "Edit Post" : showTypeChooser ? "What would you like to post?" : `New ${form.postType === "news" ? "News / Event" : form.contentCategory === "community" ? "Community Post" : "Cultural Post"}`}
          </DialogTitle>
        </DialogHeader>

        {showTypeChooser && !editingPost ? (
          <div className="grid gap-4 sm:grid-cols-3 py-4">
            <button
              onClick={() => onSelectPostType("place")}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border p-8 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Landmark className="h-7 w-7" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-card-foreground">Cultural</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tourist spots, heritage sites, arts & culture
                </p>
              </div>
            </button>
            <button
              onClick={() => onSelectPostType("news")}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border p-8 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 transition-transform group-hover:scale-110">
                <Newspaper className="h-7 w-7" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-card-foreground">News & Events</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  News articles, events, updates & announcements
                </p>
              </div>
            </button>
            <button
              onClick={() => onSelectPostType("place", "community")}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border p-8 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 transition-transform group-hover:scale-110">
                <Users className="h-7 w-7" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-card-foreground">Community</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Schools, hospitals, barangay & local businesses
                </p>
              </div>
            </button>
          </div>
        ) : (
        <>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter post title..."
            />
          </div>

          {form.contentCategory !== "community" && (
          <div className="space-y-2">
            <Label>Author</Label>
            <Input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="e.g. MHACTO Admin, Juan Dela Cruz"
            />
          </div>
          )}

          <div className="space-y-2">
            <Label>{form.postType === "news" ? "Story / Content" : form.postType === "event" ? "Event Details" : "Content"}</Label>
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder={form.postType === "news" ? "Write the full news story here..." : form.postType === "event" ? "Describe the event..." : "Write your content here..."}
              rows={form.postType === "news" ? 12 : 10}
              className="resize-y"
            />
          </div>

          {(form.postType === "news" || form.postType === "event") && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> Date
              </Label>
              <Input
                type="date"
                value={form.newsDate}
                onChange={(e) => setForm({ ...form, newsDate: e.target.value })}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Category</Label>
              {form.postType === "news" || form.postType === "event" ? (
                <Select
                  value={form.contentCategory}
                  onValueChange={(v) => {
                    if (v === "events") {
                      setForm({ ...form, contentCategory: "events", label: "events", postType: "event" })
                    } else {
                      setForm({ ...form, contentCategory: "news", label: "news", postType: "news" })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                  </SelectContent>
                </Select>
              ) : form.contentCategory === "community" ? (
                <Input value="Community" readOnly className="bg-muted cursor-not-allowed" />
              ) : (
                <Select
                  value={form.contentCategory}
                  onValueChange={(v) => {
                    const cat = v as ContentCategory
                    const labelsForCat = getLabelsByCategory(cat)
                    const firstLabelEntry = labelsForCat[0]
                    const firstLabelKey = firstLabelEntry ? firstLabelEntry[0] : form.label
                    const relevantTypes = LABEL_PLACE_TYPES[firstLabelKey] ?? PLACE_CATEGORIES
                    const defaultPlaceCategory = relevantTypes.length === 1 ? relevantTypes[0] : "none"
                    setForm({
                      ...form,
                      contentCategory: cat,
                      label: firstLabelKey,
                      category: defaultPlaceCategory,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contentCategories)
                      .filter(([key]) => key !== "news" && key !== "events" && key !== "community")
                      .map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Label</Label>
              {form.postType === "news" || form.postType === "event" ? (
                <Input value={form.contentCategory === "events" ? "Events" : "News"} readOnly className="bg-muted cursor-not-allowed" />
              ) : (
                <Select
                  value={form.label}
                  onValueChange={(v) => {
                    const newLabel = v as ContentLabel
                    const relevantTypes = LABEL_PLACE_TYPES[newLabel] ?? PLACE_CATEGORIES
                    const autoCategory = relevantTypes.length === 1 ? relevantTypes[0] : "none"
                    setForm({ ...form, label: newLabel, category: autoCategory })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getLabelsByCategory(form.contentCategory).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as ContentStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Star className={`h-4 w-4 ${form.isFeatured ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
              <div>
                <Label className="text-sm font-medium">Featured Post</Label>
                <p className="text-xs text-muted-foreground">
                  Mark as featured for the &quot;{contentLabels[form.label]?.label ?? form.label}&quot; category. Featured posts appear prominently in dropdown menus and section highlights.
                </p>
              </div>
            </div>
            <Switch
              checked={form.isFeatured}
              onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Images (optional)</Label>

              {form.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="group/img relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolveMediaUrl(img)} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })
                        }
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover/img:opacity-100 hover:bg-black/80"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={imageInputMode === "upload" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => setImageInputMode("upload")}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
                <Button
                  type="button"
                  variant={imageInputMode === "browse" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => {
                    setImageInputMode("browse")
                    setMediaBrowseOpen(true)
                  }}
                >
                  <FolderOpen className="h-3.5 w-3.5" /> Browse Existing
                </Button>
              </div>

              {imageInputMode === "upload" ? (
                <div>
                  <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors ${isUploading ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary hover:text-primary"}`}>
                    <Upload className="h-5 w-5" />
                    <span>{isUploading ? "Uploading..." : "Click to upload images"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const files = e.target.files
                        if (!files) return
                        setIsUploading(true)
                        try {
                          const result = await apiUploadMedia(Array.from(files), "image", { category: form.contentCategory, label: form.label })
                          if (result.uploaded.length > 0) {
                            const newUrls = result.uploaded.map((u) => u.url)
                            setForm((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }))
                          }
                          if (result.errors.length > 0) {
                            toast({ title: "Something went wrong", description: result.errors.join("\n"), variant: "destructive" })
                          }
                        } catch (err) {
                          toast({ title: "Something went wrong", variant: "destructive" })
                        } finally {
                          setIsUploading(false)
                          e.target.value = ""
                        }
                      }}
                    />
                  </label>
                </div>
              ) : null}

              <MediaPicker
                open={mediaBrowseOpen}
                onOpenChange={(open) => {
                  setMediaBrowseOpen(open)
                  if (!open) setImageInputMode("url")
                }}
                onSelect={(url) => {
                  setForm((prev) => ({ ...prev, images: [...prev.images, url] }))
                  setMediaBrowseOpen(false)
                  setImageInputMode("url")
                }}
                accept="image"
                title="Select Image from Library"
                uploadCategory={form.contentCategory}
                uploadLabel={form.label}
              />
            </div>
          </div>

          {/* Contextual Details Section */}
          {(form.postType === "place" || form.postType === "event") && (() => {
            const visibleFields = LABEL_VISIBLE_FIELDS[form.label] ?? ["location", "hours", "contact", "established", "category", "story", "highlights"]
            if (visibleFields.length === 0) return null
            const show = (f: DetailField) => visibleFields.includes(f)
            const fieldLabel = (f: DetailField, fallback: string) =>
              LABEL_FIELD_LABELS[form.label]?.[f]?.label ?? fallback
            const fieldPlaceholder = (f: DetailField, fallback: string) =>
              LABEL_FIELD_LABELS[form.label]?.[f]?.placeholder ?? fallback

            const sectionTitle = form.label === "travel-tours" ? "Tour Details" : form.label === "timeline-of-events" ? "Timeline Details" : form.label === "notable-figures" ? "Person Details" : form.label === "local-cuisine" ? "Dish Details" : form.label === "restaurants" ? "Restaurant Details" : "Additional Details"

            return (
            <>
              <Separator />
              <p className="text-sm font-medium text-muted-foreground">{sectionTitle}</p>

              {(show("location") || show("hours") || show("contact") || show("established")) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {show("location") && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {fieldLabel("location", "Location")}
                      </Label>
                      <Input
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder={fieldPlaceholder("location", "e.g. Bocaue Town Center, Bulacan")}
                      />
                    </div>
                  )}

                  {show("hours") && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {fieldLabel("hours", form.label === "travel-tours" ? "Duration" : "Hours")}
                      </Label>
                      <Input
                        value={form.hours}
                        onChange={(e) => setForm({ ...form, hours: e.target.value })}
                        placeholder={fieldPlaceholder("hours", form.label === "travel-tours" ? "e.g. Full Day (8 hours)" : "e.g. Daily: 6:00 AM – 8:00 PM")}
                      />
                    </div>
                  )}

                  {show("contact") && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {fieldLabel("contact", "Contact")}
                      </Label>
                      <Input
                        value={form.contact}
                        onChange={(e) => {
                          const raw = e.target.value
                          const val = raw.replace(/[^0-9+()\-\s]/g, '')
                          if (val !== raw) {
                            setContactHint("Only numbers, +, (, ), and dashes are allowed in phone numbers.")
                            setTimeout(() => setContactHint(null), 4000)
                          } else if (val.replace(/\D/g, '').length > 15) {
                            setContactHint("Phone numbers should not exceed 15 digits.")
                            setTimeout(() => setContactHint(null), 4000)
                            return
                          } else {
                            setContactHint(null)
                          }
                          setForm({ ...form, contact: val })
                        }}
                        type="tel"
                        placeholder={fieldPlaceholder("contact", "e.g. (044) 123-4567")}
                        maxLength={25}
                      />
                      {contactHint && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">{contactHint}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground">Numbers, +, parentheses, and dashes only. Max 15 digits.</p>
                    </div>
                  )}

                  {show("established") && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> {fieldLabel("established", "Established")}
                      </Label>
                      <Input
                        value={form.established}
                        onChange={(e) => {
                          const raw = e.target.value
                          const val = raw.replace(/[^0-9\s\-\/,A-Za-z.]/g, '')
                          if (val !== raw) {
                            setEstablishedHint("Special characters are not allowed. Use numbers, letters, dashes, or slashes.")
                            setTimeout(() => setEstablishedHint(null), 4000)
                          } else {
                            setEstablishedHint(null)
                          }
                          setForm({ ...form, established: val })
                        }}
                        placeholder={fieldPlaceholder("established", "e.g. 1787")}
                        maxLength={50}
                      />
                      {establishedHint && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">{establishedHint}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground">Year or date when this was established (e.g. 1787, March 1945).</p>
                    </div>
                  )}
                </div>
              )}

              {show("category") && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" /> {form.label === "local-cuisine" ? "Food Type" : form.label === "restaurants" ? "Restaurant Type" : form.label === "travel-tours" ? "Tour Type" : form.label === "schools" ? "Ownership" : form.label === "hospitals" ? "Facility Type" : form.label === "local-business" ? "Business Type" : "Place Type"}
                  </Label>
                  {(() => {
                    const relevantTypes = LABEL_PLACE_TYPES[form.label] ?? PLACE_CATEGORIES
                    if (relevantTypes.length === 0) {
                      return (
                        <p className="text-xs text-muted-foreground italic py-2">
                          No type needed for this label.
                        </p>
                      )
                    }
                    if (relevantTypes.length === 1) {
                      return (
                        <Input value={relevantTypes[0]} readOnly className="bg-muted cursor-not-allowed" />
                      )
                    }
                    return (
                      <Select
                        value={form.category}
                        onValueChange={(v) => setForm({ ...form, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {relevantTypes.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  })()}
                </div>
              )}

              {show("story") && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" /> {fieldLabel("story", "Story")}
                  </Label>
                  <Textarea
                    value={form.story}
                    onChange={(e) => setForm({ ...form, story: e.target.value })}
                    placeholder={fieldPlaceholder("story", "Write the story behind this place...")}
                    rows={4}
                    className="resize-y"
                  />
                </div>
              )}

              {show("highlights") && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <List className="h-3.5 w-3.5 text-muted-foreground" /> {fieldLabel("highlights", "Highlights")}
                    <span className="text-xs text-muted-foreground font-normal">(one per line)</span>
                  </Label>
                  <Textarea
                    value={form.highlights}
                    onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                    placeholder={fieldPlaceholder("highlights", "Over 235 years of tradition\nIconic pagoda fluvial procession\nWeek-long festivities")}
                    rows={4}
                    className="resize-y"
                  />
                </div>
              )}
            </>
            )
          })()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!form.title.trim() || !form.body.trim()}>
            {editingPost ? "Save Changes" : "Create Post"}
          </Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}
