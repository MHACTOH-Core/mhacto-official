"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import {
  contentLabels,
  contentCategories,
  getPlaceLabels,
  getNewsLabel,
  getEventsLabel,
  getLabelsByCategory,
  type CMSPost,
  type ContentCategory,
  type ContentLabel,
  type ContentStatus,
  type PostType,
} from "@/lib/data/admin-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Archive,
  Send,
  Filter,
  MapPin,
  Clock,
  Phone,
  CalendarDays,
  Tag,
  Sparkles,
  List,
  ImagePlus,
  Link2,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Landmark,
  Calendar,
  FolderOpen,
  Star,
  User,
} from "lucide-react"
import { MediaPicker } from "@/components/ui/media-picker"
import { apiUploadMedia } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/utils"
import { format, parseISO } from "date-fns"

type FormData = {
  title: string
  body: string
  contentCategory: ContentCategory
  label: ContentLabel
  postType: PostType
  status: ContentStatus
  images: string[]
  location: string
  hours: string
  contact: string
  established: string
  category: string
  story: string
  highlights: string
  newsDate: string
  isFeatured: boolean
  author: string
}

const EMPTY_FORM: FormData = {
  title: "",
  body: "",
  contentCategory: "history",
  label: "timeline-of-events",
  postType: "place",
  status: "draft",
  images: [],
  location: "",
  hours: "",
  contact: "",
  established: "",
  category: "",
  story: "",
  highlights: "",
  newsDate: new Date().toISOString().slice(0, 10),
  isFeatured: false,
  author: "",
}

const UNKNOWN_LABEL = { label: "Other", color: "bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-300" }

const PLACE_CATEGORIES = [
  "Heritage Site",
  "Religious Site",
  "Museum",
  "Festival Grounds",
  "Food & Dining",
  "Arts & Culture",
  "Arena & Events Venue",
]

// Mapping: label → relevant Place Type options (empty = show none / auto-handled)
const LABEL_PLACE_TYPES: Record<string, string[]> = {
  "timeline-of-events": ["Heritage Site", "Religious Site", "Museum", "Landmark"],
  "notable-figures": [],
  "local-cuisine": ["Main Dish", "Snack", "Dessert & Sweets", "Drink"],
  "festivals": ["Festival Grounds", "Arena & Events Venue"],
  "cultural-practices": ["Arts & Culture", "Heritage Site"],
  "crafts-artisan": ["Arts & Culture"],
  "people-wonders": [],
  "restaurants": ["Restaurant", "Eatery", "Café", "Carinderia", "Bakery"],
  "destinations": ["Heritage Site", "Museum", "Religious Site"],
  "travel-tours": ["Heritage Tour", "Food Trail", "Festival Package", "Nature Tour", "Custom"],
}

export default function CMSPage() {
  const router = useRouter()
  const { isLoggedIn, posts, createPost, updatePost, deletePost } = useAdmin()

  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<ContentCategory | "all">("all")
  const [filterLabel, setFilterLabel] = useState<ContentLabel | "all">("all")
  const [filterStatus, setFilterStatus] = useState<ContentStatus | "all">("all")

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<CMSPost | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [showTypeChooser, setShowTypeChooser] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<CMSPost | null>(null)

  // Preview
  const [previewPost, setPreviewPost] = useState<CMSPost | null>(null)
  const [previewImgIdx, setPreviewImgIdx] = useState(0)

  // Image input mode
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload" | "browse">("url")
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [mediaBrowseOpen, setMediaBrowseOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) router.push("/admin")
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  // Filtering
  const filtered = posts.filter((p) => {
    if (filterCategory !== "all" && p.contentCategory !== filterCategory) return false
    if (filterLabel !== "all" && p.label !== filterLabel) return false
    if (filterStatus !== "all" && p.status !== filterStatus) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Handlers
  const openCreate = () => {
    setEditingPost(null)
    setForm(EMPTY_FORM)
    setImageUrlInput("")
    setShowTypeChooser(true)
    setDialogOpen(true)
  }

  const selectPostType = (type: PostType) => {
    const defaultCategory: ContentCategory = type === "news" ? "news" : type === "event" ? "events" : "history"
    const defaultLabel: ContentLabel = type === "news" ? "news" : type === "event" ? "events" : "timeline-of-events"
    setForm({
      ...EMPTY_FORM,
      postType: type,
      contentCategory: defaultCategory,
      label: defaultLabel,
    })
    setShowTypeChooser(false)
  }

  const openEdit = (post: CMSPost) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      body: post.body,
      contentCategory: post.contentCategory ?? "history",
      label: post.label,
      postType: post.postType ?? "place",
      status: post.status,
      images: post.image,
      location: post.location ?? "",
      hours: post.hours ?? "",
      contact: post.contact ?? "",
      established: post.established ?? "",
      category: post.category ?? "",
      story: post.story ?? "",
      highlights: post.highlights?.join("\n") ?? "",
      newsDate: post.newsDate ?? "",
      isFeatured: post.isFeatured ?? false,
      author: post.author ?? "",
    })
    setImageUrlInput("")
    setShowTypeChooser(false)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title.trim() || !form.body.trim()) return

    const payload: Record<string, unknown> = {
      title: form.title,
      body: form.body,
      contentCategory: form.contentCategory,
      label: form.label,
      postType: form.postType,
      status: form.status,
      image: form.images,
      isFeatured: form.isFeatured,
      author: form.author || undefined,
    }

    if (form.postType === "place" || form.postType === "event") {
      payload.location = form.location || undefined
      payload.hours = form.hours || undefined
      payload.contact = form.contact || undefined
      payload.established = form.established || undefined
      payload.category = form.category && form.category !== "none" ? form.category : undefined
      payload.story = form.story || undefined
      payload.highlights = form.highlights.trim()
        ? form.highlights.split("\n").map((h) => h.trim()).filter(Boolean)
        : undefined
      if (form.postType === "event") {
        payload.newsDate = form.newsDate || undefined
      }
    } else {
      payload.newsDate = form.newsDate || undefined
    }

    if (editingPost) {
      updatePost(editingPost.id, payload)
    } else {
      createPost(payload as Omit<CMSPost, "id" | "createdAt" | "updatedAt">)
    }
    setDialogOpen(false)
  }

  const handlePublish = (post: CMSPost) => {
    updatePost(post.id, { ...post, status: "published" })
  }

  const handleArchive = (post: CMSPost) => {
    updatePost(post.id, { ...post, status: "archived" })
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePost(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const statusColor: Record<ContentStatus, string> = {
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    archived: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300",
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Content Management
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create, edit, and manage places, cultural posts, events & news articles.
              </p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> New Post
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filterCategory}
                onValueChange={(v) => {
                  setFilterCategory(v as ContentCategory | "all")
                  setFilterLabel("all")
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(contentCategories).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterLabel}
                onValueChange={(v) => setFilterLabel(v as ContentLabel | "all")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  {(filterCategory !== "all"
                    ? getLabelsByCategory(filterCategory)
                    : Object.entries(contentLabels)
                  ).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as ContentStatus | "all")}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              Total: <strong className="text-card-foreground">{posts.length}</strong>
            </span>
            <span>
              Published:{" "}
              <strong className="text-green-600 dark:text-green-400">
                {posts.filter((p) => p.status === "published").length}
              </strong>
            </span>
            <span>
              Drafts:{" "}
              <strong className="text-yellow-600 dark:text-yellow-400">
                {posts.filter((p) => p.status === "draft").length}
              </strong>
            </span>
            <span>
              Showing: <strong className="text-card-foreground">{filtered.length}</strong>
            </span>
          </div>

          {/* Post grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No posts found.</p>
              </div>
            )}

            {filtered.map((post) => (
              <Card key={post.id} className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
                {/* Thumbnail */}
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  {post.image.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveMediaUrl(post.image[0])}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <Eye className="h-10 w-10" />
                    </div>
                  )}
                  {/* Image count badge */}
                  {post.image.length > 1 && (
                    <div className="absolute right-2.5 bottom-2.5">
                      <Badge className="bg-black/60 text-white text-xs shadow-sm">
                        <ImagePlus className="h-3 w-3 mr-1" /> {post.image.length}
                      </Badge>
                    </div>
                  )}
                  {/* Overlay badges */}
                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                    {post.isFeatured && (
                      <Badge className="text-xs shadow-sm bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Star className="h-3 w-3 mr-0.5 fill-amber-500" /> Featured
                      </Badge>
                    )}
                    {post.contentCategory && contentCategories[post.contentCategory] && (
                      <Badge className={`text-xs shadow-sm ${contentCategories[post.contentCategory].color}`}>
                        {contentCategories[post.contentCategory].label}
                      </Badge>
                    )}
                    <Badge className={`text-xs shadow-sm ${(contentLabels[post.label] ?? UNKNOWN_LABEL).color}`}>
                      {(contentLabels[post.label] ?? UNKNOWN_LABEL).label}
                    </Badge>
                    <Badge className={`text-xs shadow-sm ${statusColor[post.status]}`}>
                      {post.status}
                    </Badge>
                  </div>
                </div>

                {/* Card body */}
                <CardContent className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-semibold text-card-foreground line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground line-clamp-3">
                    {post.body}
                  </p>
                  {post.location && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {post.location}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {post.author && (<span className="font-medium">By {post.author} · </span>)}
                    {format(parseISO(post.createdAt), "MMM d, yyyy")}
                    {post.updatedAt !== post.createdAt && (
                      <span> · Edited {format(parseISO(post.updatedAt), "MMM d, yyyy")}</span>
                    )}
                  </p>

                  {/* Actions row */}
                  <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setPreviewImgIdx(0); setPreviewPost(post) }}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(post)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {post.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 dark:text-green-400"
                        onClick={() => handlePublish(post)}
                        title="Publish"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    {post.status === "published" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
                        onClick={() => handleArchive(post)}
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteTarget(post)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Create / Edit Dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit Post" : showTypeChooser ? "What would you like to post?" : `New ${form.postType === "news" ? "News Article" : form.postType === "event" ? "Event" : "Place / Cultural Post"}`}
              </DialogTitle>
            </DialogHeader>

            {/* ── Type chooser (only on create, first step) ── */}
            {showTypeChooser && !editingPost ? (
              <div className="grid gap-4 sm:grid-cols-3 py-4">
                <button
                  onClick={() => selectPostType("place")}
                  className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border p-8 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <Landmark className="h-7 w-7" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-card-foreground">Place / Cultural</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tourist spots, heritage sites, arts & culture
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => selectPostType("news")}
                  className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border p-8 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 transition-transform group-hover:scale-110">
                    <Newspaper className="h-7 w-7" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-card-foreground">News</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      News articles, updates & announcements
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => selectPostType("event")}
                  className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border p-8 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 transition-transform group-hover:scale-110">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-card-foreground">Event</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Festivals, celebrations & upcoming events
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

              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="e.g. MHACTO Admin, Juan Dela Cruz"
                />
              </div>

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

              {/* News / Event: Date field */}
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
                {/* Category select — based on navbar structure */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  {form.postType === "news" ? (
                    <Input value="News" readOnly className="bg-muted cursor-not-allowed" />
                  ) : form.postType === "event" ? (
                    <Input value="Events" readOnly className="bg-muted cursor-not-allowed" />
                  ) : (
                    <Select
                      value={form.contentCategory}
                      onValueChange={(v) => {
                        const cat = v as ContentCategory
                        const firstLabel = getLabelsByCategory(cat)[0]
                        setForm({
                          ...form,
                          contentCategory: cat,
                          label: firstLabel ? firstLabel[0] : form.label,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(contentCategories)
                          .filter(([key]) => key !== "news" && key !== "events")
                          .map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Label select — sub-items filtered by selected category */}
                <div className="space-y-2">
                  <Label>Label</Label>
                  {form.postType === "news" ? (
                    <Input value="News" readOnly className="bg-muted cursor-not-allowed" />
                  ) : form.postType === "event" ? (
                    <Input value="Events" readOnly className="bg-muted cursor-not-allowed" />
                  ) : (
                    <Select
                      value={form.label}
                      onValueChange={(v) => {
                        const newLabel = v as ContentLabel
                        // Auto-set Place Type based on label
                        const relevantTypes = LABEL_PLACE_TYPES[newLabel] ?? PLACE_CATEGORIES
                        const autoCategory = relevantTypes.length === 1 ? relevantTypes[0] : form.category
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

              {/* Featured Toggle — per-label featured assignment */}
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

                  {/* Existing images */}
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

                  {/* Add image controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={imageInputMode === "url" ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => setImageInputMode("url")}
                    >
                      <Link2 className="h-3.5 w-3.5" /> URL
                    </Button>
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

                  {imageInputMode === "url" ? (
                    <div className="flex gap-2">
                      <Input
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="/image.jpg or https://..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            if (imageUrlInput.trim()) {
                              setForm({ ...form, images: [...form.images, imageUrlInput.trim()] })
                              setImageUrlInput("")
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-9"
                        disabled={!imageUrlInput.trim()}
                        onClick={() => {
                          setForm({ ...form, images: [...form.images, imageUrlInput.trim()] })
                          setImageUrlInput("")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : imageInputMode === "upload" ? (
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
                              const result = await apiUploadMedia(Array.from(files), "image")
                              if (result.uploaded.length > 0) {
                                const newUrls = result.uploaded.map((u) => u.url)
                                setForm((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }))
                              }
                              if (result.errors.length > 0) {
                                alert("Some files failed: " + result.errors.join("; "))
                              }
                            } catch (err) {
                              alert(err instanceof Error ? err.message : "Upload failed")
                            } finally {
                              setIsUploading(false)
                              e.target.value = ""
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : null}

                  {/* Media Picker dialog for browsing existing files */}
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
                  />
                </div>
              </div>

              {/* ── Place / Event Details Section ── */}
              {(form.postType === "place" || form.postType === "event") && (
                <>
                  <Separator />
                  <p className="text-sm font-medium text-muted-foreground">{form.label === "travel-tours" ? "Tour Details (optional)" : "Place Details (optional)"}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location
                      </Label>
                      <Input
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="e.g. Bocaue Town Center, Bulacan"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {form.label === "travel-tours" ? "Duration" : "Hours"}
                      </Label>
                      <Input
                        value={form.hours}
                        onChange={(e) => setForm({ ...form, hours: e.target.value })}
                        placeholder={form.label === "travel-tours" ? "e.g. Full Day (8 hours)" : "e.g. Daily: 6:00 AM – 8:00 PM"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {form.label === "travel-tours" ? "Booking Contact" : "Contact"}
                      </Label>
                      <Input
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                        placeholder={form.label === "travel-tours" ? "e.g. MHACTO Office" : "e.g. (044) 123-4567"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> Established
                      </Label>
                      <Input
                        value={form.established}
                        onChange={(e) => setForm({ ...form, established: e.target.value })}
                        placeholder="e.g. 1787"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" /> {form.label === "local-cuisine" ? "Food Type" : form.label === "restaurants" ? "Restaurant Type" : form.label === "travel-tours" ? "Tour Type" : "Place Type"}
                    </Label>
                    {(() => {
                      const relevantTypes = LABEL_PLACE_TYPES[form.label] ?? PLACE_CATEGORIES
                      // If no relevant types for this label, show info
                      if (relevantTypes.length === 0) {
                        return (
                          <p className="text-xs text-muted-foreground italic py-2">
                            No place type needed for this label.
                          </p>
                        )
                      }
                      // If exactly one type, auto-set and show read-only
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
                            <SelectValue placeholder="Select a category..." />
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

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground" /> {form.label === "travel-tours" ? "Itinerary" : "Story"}
                    </Label>
                    <Textarea
                      value={form.story}
                      onChange={(e) => setForm({ ...form, story: e.target.value })}
                      placeholder={form.label === "travel-tours" ? "Describe the tour itinerary..." : "Write the story behind this place..."}
                      rows={4}
                      className="resize-y"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <List className="h-3.5 w-3.5 text-muted-foreground" /> {form.label === "travel-tours" ? "Includes" : "Highlights"}
                      <span className="text-xs text-muted-foreground font-normal">(one per line)</span>
                    </Label>
                    <Textarea
                      value={form.highlights}
                      onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                      placeholder={form.label === "travel-tours" ? "Licensed MHACTO guide\nEntrance fees\nWelcome snack" : "Over 235 years of tradition\nIconic pagoda fluvial procession\nWeek-long festivities"}
                      rows={4}
                      className="resize-y"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!form.title.trim() || !form.body.trim()}>
                {editingPost ? "Save Changes" : "Create Post"}
              </Button>
            </DialogFooter>
            </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Preview Dialog ── */}
        <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {previewPost && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={(contentLabels[previewPost.label] ?? UNKNOWN_LABEL).color}>
                      {(contentLabels[previewPost.label] ?? UNKNOWN_LABEL).label}
                    </Badge>
                    <Badge className={statusColor[previewPost.status]}>
                      {previewPost.status}
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl">
                    {previewPost.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {previewPost.author && (
                      <span className="flex items-center gap-1 font-medium">
                        <User className="h-3 w-3" /> {previewPost.author}
                      </span>
                    )}
                    {previewPost.author && <span>·</span>}
                    <span>{format(parseISO(previewPost.createdAt), "MMMM d, yyyy · h:mm a")}</span>
                  </div>
                </DialogHeader>
                {previewPost.image.length > 0 && (
                  <div className="relative overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveMediaUrl(previewPost.image[previewImgIdx] ?? previewPost.image[0])}
                      alt=""
                      className="w-full h-48 object-cover"
                    />
                    {previewPost.image.length > 1 && (
                      <>
                        <button
                          onClick={() => setPreviewImgIdx((i) => (i - 1 + previewPost.image.length) % previewPost.image.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setPreviewImgIdx((i) => (i + 1) % previewPost.image.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {previewPost.image.map((_: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => setPreviewImgIdx(i)}
                              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === previewImgIdx ? "bg-white" : "bg-white/50"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm text-card-foreground leading-relaxed">
                  {previewPost.body}
                </div>

                {/* Story */}
                {previewPost.story && (
                  <div className="space-y-1">
                    <h4 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                      <Sparkles className="h-4 w-4 text-amber-500" /> Story
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{previewPost.story}</p>
                  </div>
                )}

                {/* Highlights */}
                {previewPost.highlights && previewPost.highlights.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                      <List className="h-4 w-4" /> Highlights
                    </h4>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm text-muted-foreground">
                      {previewPost.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Place detail info cards */}
                {(previewPost.location || previewPost.hours || previewPost.contact || previewPost.established || previewPost.category) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      {previewPost.established && (
                        <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                          <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Established</p>
                            <p className="text-sm font-medium text-card-foreground">{previewPost.established}</p>
                          </div>
                        </div>
                      )}
                      {previewPost.category && (
                        <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                          <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="text-sm font-medium text-card-foreground">{previewPost.category}</p>
                          </div>
                        </div>
                      )}
                      {previewPost.location && (
                        <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-medium text-card-foreground">{previewPost.location}</p>
                          </div>
                        </div>
                      )}
                      {previewPost.hours && (
                        <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Hours</p>
                            <p className="text-sm font-medium text-card-foreground">{previewPost.hours}</p>
                          </div>
                        </div>
                      )}
                      {previewPost.contact && (
                        <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                          <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Contact</p>
                            <p className="text-sm font-medium text-card-foreground">{previewPost.contact}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ── */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
