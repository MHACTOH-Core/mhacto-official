"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import {
  contentLabels,
  contentCategories,
  getCmsLabelsByCategory,
  getCmsFilterLabels,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Archive,
  Send,
  Filter,
  MapPin,
  ImagePlus,
  Star,
} from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { type FormData, EMPTY_FORM, UNKNOWN_LABEL } from "./_components/cms-types"
import { CMSEditDialog } from "./_components/cms-edit-dialog"
import { CMSPreviewDialog } from "./_components/cms-preview-dialog"

const statusColor: Record<ContentStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300",
}

export default function CMSPage() {
  const router = useRouter()
  const { isLoggedIn, isHydrated, posts, createPost, updatePost, deletePost } = useAdmin()

  const resolvePostCategory = (post: CMSPost): ContentCategory =>
    contentLabels[post.label]?.category ?? post.contentCategory ?? "history"

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

  // Save confirm
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)

  // Preview
  const [previewPost, setPreviewPost] = useState<CMSPost | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push("/admin")
  }, [isHydrated, isLoggedIn, router])

  // Memoized filtering
  const filtered = useMemo(() =>
    posts.filter((p) => {
      const resolvedCategory = resolvePostCategory(p)
      if (p.label === "pagoda") return false
      if (filterCategory !== "all" && resolvedCategory !== filterCategory) return false
      if (filterLabel !== "all" && p.label !== filterLabel) return false
      if (filterStatus !== "all" && p.status !== filterStatus) return false
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }),
    [posts, filterCategory, filterLabel, filterStatus, search]
  )

  // Memoized stats
  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    showing: filtered.length,
  }), [posts, filtered.length])

  if (!isHydrated || !isLoggedIn) return null

  // Handlers
  const openCreate = () => {
    setEditingPost(null)
    setForm(EMPTY_FORM)
    setShowTypeChooser(true)
    setDialogOpen(true)
  }

  const selectPostType = (type: PostType, preset?: string) => {
    let defaultCategory: ContentCategory
    let defaultLabel: ContentLabel
    if (preset === "community") {
      defaultCategory = "community"
      defaultLabel = "schools"
    } else if (type === "news") {
      defaultCategory = "news"
      defaultLabel = "news"
    } else {
      defaultCategory = "history"
      defaultLabel = "timeline-of-events"
    }
    setForm({
      ...EMPTY_FORM,
      postType: type,
      contentCategory: defaultCategory,
      label: defaultLabel,
    })
    setShowTypeChooser(false)
  }

  const openEdit = (post: CMSPost) => {
    const resolvedCategory = resolvePostCategory(post)
    setEditingPost(post)
    setForm({
      title: post.title,
      body: post.body,
      contentCategory: resolvedCategory,
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
    setShowTypeChooser(false)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title.trim() || !form.body.trim()) return
    setSaveConfirmOpen(true)
  }

  const executeSave = () => {
    setSaveConfirmOpen(false)

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
        ? form.highlights.split("\n").map((h: string) => h.trim()).filter(Boolean)
        : undefined
      if (form.postType === "event") {
        payload.newsDate = form.newsDate || undefined
      }
    } else {
      payload.newsDate = form.newsDate || undefined
    }

    if (editingPost) {
      updatePost(editingPost.id, payload)
      toast({ title: "Post updated", description: `"${form.title}" has been updated.`, variant: "success" })
    } else {
      createPost(payload as Omit<CMSPost, "id" | "createdAt" | "updatedAt">)
      toast({ title: "Post created", description: `"${form.title}" has been created.`, variant: "success" })
    }
    setDialogOpen(false)
  }

  const handlePublish = (post: CMSPost) => {
    updatePost(post.id, { ...post, status: "published" })
    toast({ title: "Post published", description: `"${post.title}" is now live.`, variant: "success" })
  }

  const handleArchive = (post: CMSPost) => {
    updatePost(post.id, { ...post, status: "archived" })
    toast({ title: "Post archived", description: `"${post.title}" has been archived.`, variant: "success" })
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePost(deleteTarget.id)
      toast({ title: "Post deleted", description: `"${deleteTarget.title}" has been deleted.`, variant: "destructive" })
      setDeleteTarget(null)
    }
  }

  return (
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
                    ? getCmsLabelsByCategory(filterCategory)
                    : getCmsFilterLabels()
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
              Total: <strong className="text-card-foreground">{stats.total}</strong>
            </span>
            <span>
              Published:{" "}
              <strong className="text-green-600 dark:text-green-400">
                {stats.published}
              </strong>
            </span>
            <span>
              Drafts:{" "}
              <strong className="text-yellow-600 dark:text-yellow-400">
                {stats.drafts}
              </strong>
            </span>
            <span>
              Showing: <strong className="text-card-foreground">{stats.showing}</strong>
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
                  {post.image.length > 1 && (
                    <div className="absolute right-2.5 bottom-2.5">
                      <Badge className="bg-black/60 text-white text-xs shadow-sm">
                        <ImagePlus className="h-3 w-3 mr-1" /> {post.image.length}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                    {post.isFeatured && (
                      <Badge className="text-xs shadow-sm bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Star className="h-3 w-3 mr-0.5 fill-amber-500" /> Featured
                      </Badge>
                    )}
                    {contentCategories[resolvePostCategory(post)] && (
                      <Badge className={`text-xs shadow-sm ${contentCategories[resolvePostCategory(post)].color}`}>
                        {contentCategories[resolvePostCategory(post)].label}
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
                      onClick={() => setPreviewPost(post)}
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

        {/* Edit Dialog */}
        <CMSEditDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingPost={editingPost}
          form={form}
          setForm={setForm}
          showTypeChooser={showTypeChooser}
          onSelectPostType={selectPostType}
          onSave={handleSave}
        />

        {/* Preview Dialog */}
        <CMSPreviewDialog
          post={previewPost}
          onClose={() => setPreviewPost(null)}
        />

        {/* Delete Confirm */}
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

        {/* Save Confirm */}
        <AlertDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to save?</AlertDialogTitle>
              <AlertDialogDescription>
                This will {editingPost ? "update" : "create"} the content on the site. Please make sure all details are correct.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeSave}>
                {editingPost ? "Save Changes" : "Create Post"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </main>
  )
}
