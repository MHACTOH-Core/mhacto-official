"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { contentLabels, type CMSPost, type ContentStatus } from "@/lib/data/admin-data"
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
  Trash2,
  Edit3,
  Eye,
  CheckCircle,
  Archive,
  Flame,
} from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { type FormData, EMPTY_FORM, UNKNOWN_LABEL } from "../cms/_components/cms-types"
import { CMSEditDialog } from "../cms/_components/cms-edit-dialog"
import { CMSPreviewDialog } from "../cms/_components/cms-preview-dialog"

const statusColor: Record<ContentStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300",
}

export default function PagodaPage() {
  const router = useRouter()
  const { isLoggedIn, isHydrated, posts, createPost, updatePost, deletePost } = useAdmin()

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<ContentStatus | "all">("all")

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<CMSPost | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CMSPost | null>(null)
  const [previewPost, setPreviewPost] = useState<CMSPost | null>(null)

  const { toast } = useToast()

  if (!isHydrated || !isLoggedIn) return null

  // Filter only pagoda posts
  const pagodaPosts = useMemo(() =>
    posts.filter((p) => {
      if (p.label !== "pagoda") return false
      if (filterStatus !== "all" && p.status !== filterStatus) return false
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }),
    [posts, filterStatus, search]
  )

  const stats = useMemo(() => ({
    total: posts.filter((p) => p.label === "pagoda").length,
    published: posts.filter((p) => p.label === "pagoda" && p.status === "published").length,
    drafts: posts.filter((p) => p.label === "pagoda" && p.status === "draft").length,
  }), [posts])

  // Handlers
  const openCreate = () => {
    setEditingPost(null)
    setForm({
      ...EMPTY_FORM,
      postType: "place",
      contentCategory: "arts-culture",
      label: "pagoda",
    })
    setDialogOpen(true)
  }

  const openEdit = (post: CMSPost) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      body: post.body,
      contentCategory: post.contentCategory ?? "arts-culture",
      label: "pagoda",
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
      contentCategory: "arts-culture",
      label: "pagoda",
      postType: "place",
      status: form.status,
      image: form.images,
      isFeatured: form.isFeatured,
      author: form.author || undefined,
      location: form.location || undefined,
      established: form.established || undefined,
      story: form.story || undefined,
      highlights: form.highlights.trim()
        ? form.highlights.split("\n").map((h: string) => h.trim()).filter(Boolean)
        : undefined,
    }

    if (editingPost) {
      updatePost(editingPost.id, payload)
      toast({ title: "Post updated", description: `"${form.title}" has been updated.` })
    } else {
      createPost(payload as Omit<CMSPost, "id" | "createdAt" | "updatedAt">)
      toast({ title: "Post created", description: `"${form.title}" has been created.` })
    }
    setDialogOpen(false)
  }

  const handlePublish = (post: CMSPost) => {
    updatePost(post.id, { ...post, status: "published" })
    toast({ title: "Post published", description: `"${post.title}" is now live.` })
  }

  const handleArchive = (post: CMSPost) => {
    updatePost(post.id, { ...post, status: "archived" })
    toast({ title: "Post archived", description: `"${post.title}" has been archived.` })
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePost(deleteTarget.id)
      toast({ title: "Post deleted", description: `"${deleteTarget.title}" has been deleted.`, variant: "destructive" })
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
                <Flame className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Pagoda Festival</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Manage Pagoda sa Bocaue festival content
                </p>
              </div>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pagoda posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as ContentStatus | "all")}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-sm text-muted-foreground ml-auto">
              {pagodaPosts.length} post{pagodaPosts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Posts grid */}
          {pagodaPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Flame className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No pagoda posts found</h3>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Create your first pagoda festival post to get started.
                </p>
                <Button onClick={openCreate} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pagodaPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden group">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {post.image?.[0] ? (
                      <Image
                        src={resolveMediaUrl(post.image[0])}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/30">
                        <Flame className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={`text-xs shadow-sm ${statusColor[post.status]}`}>
                        {post.status}
                      </Badge>
                    </div>
                    {post.isFeatured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-amber-100 text-amber-800 text-xs shadow-sm">Featured</Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-card-foreground line-clamp-1">{post.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.body}</p>
                    <p className="mt-2 text-[10px] text-muted-foreground/60">
                      {post.createdAt ? format(parseISO(post.createdAt), "MMM d, yyyy") : "—"}
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewPost(post)} title="Preview">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)} title="Edit">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      {post.status === "draft" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handlePublish(post)} title="Publish">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {post.status === "published" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleArchive(post)} title="Archive">
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive ml-auto" onClick={() => setDeleteTarget(post)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit / Create Dialog */}
      <CMSEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPost={editingPost}
        form={form}
        setForm={setForm}
        showTypeChooser={false}
        onSelectPostType={() => {}}
        onSave={handleSave}
      />

      {/* Preview Dialog */}
      <CMSPreviewDialog
        post={previewPost}
        onClose={() => setPreviewPost(null)}
      />

      {/* Save Confirmation */}
      <AlertDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {editingPost ? "update" : "create"} the pagoda festival post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeSave}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
