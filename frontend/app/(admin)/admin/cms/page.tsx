"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import {
  contentLabels,
  type CMSPost,
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
} from "lucide-react"
import { format, parseISO } from "date-fns"

type FormData = {
  title: string
  body: string
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
}

const EMPTY_FORM: FormData = {
  title: "",
  body: "",
  label: "historical",
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
}

const UNKNOWN_LABEL = { label: "Other", color: "bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-300" }

const PLACE_CATEGORIES = [
  "Temple & Heritage",
  "Nature",
  "Festival",
  "Arts & Culture",
  "Cuisine",
  "Landmark",
]

export default function CMSPage() {
  const router = useRouter()
  const { isLoggedIn, posts, createPost, updatePost, deletePost } = useAdmin()

  const [search, setSearch] = useState("")
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
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url")
  const [imageUrlInput, setImageUrlInput] = useState("")

  useEffect(() => {
    if (!isLoggedIn) router.push("/admin")
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  // Filtering
  const filtered = posts.filter((p) => {
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
    setForm({
      ...EMPTY_FORM,
      postType: type,
      label: type === "news" ? "news" : "historical",
    })
    setShowTypeChooser(false)
  }

  const openEdit = (post: CMSPost) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      body: post.body,
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
      label: form.label,
      postType: form.postType,
      status: form.status,
      image: form.images,
    }

    if (form.postType === "place") {
      payload.location = form.location || undefined
      payload.hours = form.hours || undefined
      payload.contact = form.contact || undefined
      payload.established = form.established || undefined
      payload.category = form.category && form.category !== "none" ? form.category : undefined
      payload.story = form.story || undefined
      payload.highlights = form.highlights.trim()
        ? form.highlights.split("\n").map((h) => h.trim()).filter(Boolean)
        : undefined
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
                Create, edit, and manage places, cultural posts & news articles.
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
                value={filterLabel}
                onValueChange={(v) => setFilterLabel(v as ContentLabel | "all")}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  {Object.entries(contentLabels).map(([key, { label }]) => (
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
                      src={post.image[0]}
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
                {editingPost ? "Edit Post" : showTypeChooser ? "What would you like to post?" : `New ${form.postType === "news" ? "News Article" : "Place / Cultural Post"}`}
              </DialogTitle>
            </DialogHeader>

            {/* ── Type chooser (only on create, first step) ── */}
            {showTypeChooser && !editingPost ? (
              <div className="grid gap-4 sm:grid-cols-2 py-4">
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
                      Tourist spots, heritage sites, festivals, arts & culture
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
                <Label>{form.postType === "news" ? "Story / Content" : "Content"}</Label>
                <Textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder={form.postType === "news" ? "Write the full news story here..." : "Write your content here..."}
                  rows={form.postType === "news" ? 12 : 10}
                  className="resize-y"
                />
              </div>

              {/* News-specific: Date field */}
              {form.postType === "news" && (
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

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Label select — only show Place labels for place posts, "News" for news posts */}
                <div className="space-y-2">
                  <Label>Label</Label>
                  {form.postType === "news" ? (
                    <Input value="News" readOnly className="bg-muted cursor-not-allowed" />
                  ) : (
                    <Select
                      value={form.label}
                      onValueChange={(v) =>
                        setForm({ ...form, label: v as ContentLabel })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(contentLabels)
                          .filter(([key]) => key !== "news")
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

                <div className="space-y-2">
                  <Label>Images (optional)</Label>

                  {/* Existing images */}
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="group/img relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" className="h-full w-full object-cover" />
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
                  ) : (
                    <div>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                        <Upload className="h-5 w-5" />
                        <span>Click to upload images</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files
                            if (!files) return
                            Array.from(files).forEach((file) => {
                              const reader = new FileReader()
                              reader.onload = (ev) => {
                                const dataUrl = ev.target?.result as string
                                if (dataUrl) {
                                  setForm((prev) => ({ ...prev, images: [...prev.images, dataUrl] }))
                                }
                              }
                              reader.readAsDataURL(file)
                            })
                            e.target.value = ""
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Place Details Section (only for place posts) ── */}
              {form.postType === "place" && (
                <>
                  <Separator />
                  <p className="text-sm font-medium text-muted-foreground">Place Details (optional)</p>

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
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Hours
                      </Label>
                      <Input
                        value={form.hours}
                        onChange={(e) => setForm({ ...form, hours: e.target.value })}
                        placeholder="e.g. Daily: 6:00 AM – 8:00 PM"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Contact
                      </Label>
                      <Input
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                        placeholder="e.g. (044) 123-4567"
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
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" /> Category
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {PLACE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground" /> Story
                    </Label>
                    <Textarea
                      value={form.story}
                      onChange={(e) => setForm({ ...form, story: e.target.value })}
                      placeholder="Write the story behind this place..."
                      rows={4}
                      className="resize-y"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <List className="h-3.5 w-3.5 text-muted-foreground" /> Highlights
                      <span className="text-xs text-muted-foreground font-normal">(one per line)</span>
                    </Label>
                    <Textarea
                      value={form.highlights}
                      onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                      placeholder={"Over 235 years of tradition\nIconic pagoda fluvial procession\nWeek-long festivities"}
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
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(previewPost.createdAt), "MMMM d, yyyy · h:mm a")}
                  </p>
                </DialogHeader>
                {previewPost.image.length > 0 && (
                  <div className="relative overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewPost.image[previewImgIdx] ?? previewPost.image[0]}
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
