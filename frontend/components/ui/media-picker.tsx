"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Link2,
  Upload,
  FolderOpen,
  Check,
  Loader2,
  Film,
  ImageIcon,
  Trash2,
  Search,
  FileVideo,
  FileImage,
  X,
  ChevronRight,
  ChevronDown,
  Pencil,
} from "lucide-react"
import {
  apiListMedia,
  apiUploadMedia,
  apiDeleteMedia,
  apiGetMediaUsages,
  API_BASE,
  type MediaFile,
  type MediaUsageItem,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ImageCropDialog, type CropSaveMode } from "@/components/ui/image-crop-dialog"

export type MediaPickerAccept = "image" | "video" | "all"

interface MediaPickerProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Called when user confirms a selection */
  onSelect: (url: string) => void
  /** Restrict to image or video files only (default: "all") */
  accept?: MediaPickerAccept
  /** Title for the dialog */
  title?: string
  /** Current value (for highlighting the already-selected file) */
  currentValue?: string
  /** Optional category for organizing uploads into subfolders */
  uploadCategory?: string
  /** Optional label for organizing uploads into subfolders */
  uploadLabel?: string
  /** Show crop + enhance dialog when selecting an image (default: true for images) */
  enableCrop?: boolean
  /** Default aspect ratio for the crop dialog (e.g. 16/9). Free-form if omitted. */
  cropAspect?: number
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFolderPath(url: string): string {
  const stripped = url.replace(/^\/uploads\/(images|videos)\//, "")
  const lastSlash = stripped.lastIndexOf("/")
  return lastSlash === -1 ? "" : stripped.substring(0, lastSlash)
}

/**
 * Map folder slugs to display names that match the Navbar labels.
 * Only entries that differ from the default title-case conversion are listed.
 */
const FOLDER_DISPLAY_NAMES: Record<string, string> = {
  "arts-culture": "Arts & Culture Wonders",
  "festivals": "Bocaue Festival",
  "notable-figures": "Remarkable Persons",
  "news": "News",
}

function formatFolderName(name: string): string {
  if (FOLDER_DISPLAY_NAMES[name]) return FOLDER_DISPLAY_NAMES[name]
  return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

type FolderInfo = { path: string; name: string; depth: number; count: number; hasChildren: boolean }

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  accept = "all",
  title = "Select Media",
  currentValue,
  uploadCategory,
  uploadLabel,
  enableCrop,
  cropAspect,
}: MediaPickerProps) {
  const [tab, setTab] = useState<"existing" | "upload" | "url">("existing")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  /** Map of file URL → usage items (which content/settings reference it) */
  const [usageMap, setUsageMap] = useState<Record<string, MediaUsageItem[]>>({})
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Crop dialog state
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropUploading, setCropUploading] = useState(false)

  // Resolve whether crop is enabled (default: true for image-only pickers)
  const cropEnabled = enableCrop ?? (accept === "image")

  const loadFiles = useCallback(async (retryCount = 0) => {
    setLoading(true)
    setError(null)
    try {
      const type = accept === "image" ? "images" : accept === "video" ? "videos" : "all"
      const result = await apiListMedia(type)
      const all: MediaFile[] = [
        ...(result.images ?? []),
        ...(result.videos ?? []),
      ]
      setFiles(all)
      // Load usage map in parallel (non-blocking — failures are silent)
      apiGetMediaUsages().then(setUsageMap).catch(() => {})
    } catch (err) {
      console.error("Failed to load media:", err)
      // Auto-retry once after 2 seconds on failure
      if (retryCount < 1) {
        setTimeout(() => loadFiles(retryCount + 1), 2000)
        return // keep loading state active
      }
      setError("Failed to load media library. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [accept])

  useEffect(() => {
    if (open) {
      loadFiles()
      setSelected(currentValue ?? null)
      setUrlInput("")
      setSearch("")
      setError(null)
      setSelectedFolder(null)
      setExpandedFolders(new Set())
      setCropSrc(null)
    }
  }, [open, loadFiles, currentValue])

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const filesArr = Array.from(fileList)
      const uploadType = accept === "video" ? "video" : "image"
      const result = await apiUploadMedia(filesArr, uploadType, { category: uploadCategory, label: uploadLabel })

      if (result.errors.length > 0) {
        setError(result.errors.join("; "))
      }

      if (result.uploaded.length > 0) {
        // Auto-select the first uploaded file
        setSelected(result.uploaded[0].url)
        // Refresh the file list
        await loadFiles()
        // Switch to existing tab to show the upload
        setTab("existing")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const file = deleteTarget
    setDeleteTarget(null)
    try {
      await apiDeleteMedia(file.url)
      if (selected === file.url) setSelected(null)
      await loadFiles()
      toast({
        title: "Deleted",
        description: `"${file.name}" has been deleted.`,
      })
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Could not delete the file.",
        variant: "destructive",
      })
    }
  }

  const handleConfirm = () => {
    if (tab === "url" && urlInput.trim()) {
      const url = urlInput.trim()
      // For URL tab: show crop dialog if it looks like an image
      if (cropEnabled && /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(url)) {
        setCropSrc(url)
        return
      }
      onSelect(url)
      onOpenChange(false)
    } else if (selected) {
      // For existing / uploaded: show crop dialog if it's an image
      const isImage = /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(selected) || !selected.match(/\.(mp4|webm|ogg|mov|avi)$/i)
      if (cropEnabled && isImage) {
        // Use relative path so the image is served through the Next.js
        // rewrite proxy (same-origin), which allows canvas pixel access.
        setCropSrc(selected)
        return
      }
      onSelect(selected)
      onOpenChange(false)
    }
  }

  /** Use selected image as-is — bypasses the crop/enhance dialog entirely */
  const handleUseAsIs = () => {
    if (selected) {
      onSelect(selected)
      onOpenChange(false)
    }
  }

  /** After cropping, upload the new blob (and optionally delete the original) */
  const handleCropDone = async (blob: Blob, mode: CropSaveMode) => {
    setCropUploading(true)
    try {
      // If replacing, delete the original first
      if (mode === "replace" && cropSrc) {
        try {
          await apiDeleteMedia(cropSrc)
        } catch {
          // Non-fatal — original may already be gone or be a URL not managed by us
        }
      }
      const ext = "jpg"
      const fileName = `edited_${Date.now()}.${ext}`
      const file = new File([blob], fileName, { type: "image/jpeg" })
      const result = await apiUploadMedia([file], "image", { category: uploadCategory, label: uploadLabel, subfolder: "edited" })
      if (result.uploaded.length > 0) {
        onSelect(result.uploaded[0].url)
        setCropSrc(null)
        onOpenChange(false)
      } else {
        toast({
          title: "Upload failed",
          description: result.errors.join("; ") || "Could not save the cropped image.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not save the cropped image.",
        variant: "destructive",
      })
    } finally {
      setCropUploading(false)
    }
  }

  const folderData = useMemo(() => {
    const folderCounts = new Map<string, number>()
    for (const f of files) {
      const folder = getFolderPath(f.url)
      folderCounts.set(folder, (folderCounts.get(folder) ?? 0) + 1)
    }
    const allPaths = new Set<string>()
    for (const path of folderCounts.keys()) {
      if (!path) continue
      const parts = path.split("/")
      let current = ""
      for (const part of parts) {
        current = current ? `${current}/${part}` : part
        allPaths.add(current)
      }
    }
    const sortedPaths = Array.from(allPaths).sort()
    const folders: FolderInfo[] = sortedPaths.map(path => {
      const parts = path.split("/")
      const name = parts[parts.length - 1]
      const depth = parts.length - 1
      let count = 0
      for (const [p, c] of folderCounts) {
        if (p === path || p.startsWith(path + "/")) count += c
      }
      const hasChildren = sortedPaths.some(p => p !== path && p.startsWith(path + "/"))
      return { path, name, depth, count, hasChildren }
    })
    return { folders, rootCount: folderCounts.get("") ?? 0 }
  }, [files])

  const filteredFiles = files.filter((f) => {
    if (selectedFolder !== null) {
      const folder = getFolderPath(f.url)
      if (selectedFolder === "") {
        if (folder !== "") return false
      } else {
        if (folder !== selectedFolder && !folder.startsWith(selectedFolder + "/")) return false
      }
    }
    if (search) {
      return f.name.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  const acceptAttr =
    accept === "image"
      ? "image/*"
      : accept === "video"
        ? "video/*"
        : "image/*,video/*"

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[85vh] flex flex-col" onInteractOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {accept === "video" ? <Film className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="existing" className="gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Existing
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              URL
            </TabsTrigger>
          </TabsList>

          {/* ── Existing Files Tab ── */}
          <TabsContent value="existing" className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-1 min-h-0 gap-3">
              {/* Folder Sidebar — hidden on very small screens */}
              {!loading && files.length > 0 && (
                <div className="hidden sm:block w-36 md:w-44 shrink-0">
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-0.5 py-1">
                      <button
                        type="button"
                        onClick={() => setSelectedFolder(null)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                          selectedFolder === null ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate flex-1">All Files</span>
                        <span className="text-[10px] tabular-nums opacity-70">{files.length}</span>
                      </button>
                      {folderData.rootCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedFolder("")}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                            selectedFolder === "" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate flex-1">Uncategorized</span>
                          <span className="text-[10px] tabular-nums opacity-70">{folderData.rootCount}</span>
                        </button>
                      )}
                      {folderData.folders
                        .filter(f => {
                          if (f.depth === 0) return true
                          const parentPath = f.path.substring(0, f.path.lastIndexOf("/"))
                          return expandedFolders.has(parentPath)
                        })
                        .map(folder => (
                          <button
                            key={folder.path}
                            type="button"
                            onClick={() => {
                              setSelectedFolder(folder.path)
                              if (folder.hasChildren) {
                                setExpandedFolders(prev => {
                                  const next = new Set(prev)
                                  if (next.has(folder.path)) next.delete(folder.path)
                                  else next.add(folder.path)
                                  return next
                                })
                              }
                            }}
                            className={`flex w-full items-center gap-1.5 rounded-md py-1.5 text-left text-sm transition-colors cursor-pointer ${
                              selectedFolder === folder.path ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                            }`}
                            style={{ paddingLeft: `${8 + folder.depth * 16}px`, paddingRight: 8 }}
                          >
                            {folder.hasChildren ? (
                              expandedFolders.has(folder.path) ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />
                            ) : (
                              <span className="w-3 shrink-0" />
                            )}
                            <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate flex-1">{formatFolderName(folder.name)}</span>
                            <span className="text-[10px] tabular-nums opacity-60">{folder.count}</span>
                          </button>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* File Grid */}
              <div className="flex-1 min-w-0 flex flex-col min-w-0">
                {loading ? (
                  <div className="flex flex-1 items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mb-3 opacity-50" />
                    <p className="font-medium">No media files found</p>
                    <p className="text-sm">Upload some files to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 max-h-[400px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-1">
                      {filteredFiles.map((file) => {
                        const isSelected = selected === file.url
                        const isVideo = file.type === "video"
                        const thumbUrl = isVideo ? undefined : `${API_BASE}${file.url}`

                        return (
                          <div
                            key={file.url}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelected(file.url)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(file.url) } }}
                            className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition-all cursor-pointer
                              ${isSelected
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-border hover:border-primary/50"
                              }`}
                          >
                            {isVideo ? (
                              <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
                                <FileVideo className="h-8 w-8 text-muted-foreground" />
                                <span className="mt-1 max-w-full truncate px-1 text-[10px] text-muted-foreground">
                                  {file.name}
                                </span>
                              </div>
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={thumbUrl}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            )}

                            {/* Selection check */}
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                                <div className="rounded-full bg-primary p-1">
                                  <Check className="h-4 w-4 text-primary-foreground" />
                                </div>
                              </div>
                            )}

                            {/* Edited badge */}
                            {file.url.includes('/edited/') && (
                              <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow">
                                <Pencil className="h-2.5 w-2.5" />
                                Edited
                              </div>
                            )}

                            {/* In-use badge — shown when this image is referenced by content/settings */}
                            {!file.url.includes('/edited/') && (usageMap[file.url]?.length ?? 0) > 0 && (
                              <div
                                className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-blue-600/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow"
                                title={`Used by: ${usageMap[file.url].map(u => u.title ?? u.label ?? u.config_key).join(", ")}`}
                              >
                                In Use
                              </div>
                            )}

                            {/* File info overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                              <p className="truncate text-[10px] font-medium text-white">{file.name}</p>
                              <p className="text-[9px] text-white/70">{formatFileSize(file.size)}</p>
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteTarget(file)
                              }}
                              className="absolute right-1 top-1 rounded-full bg-destructive/80 p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>

            {selected && (
              <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span className="truncate flex-1 text-muted-foreground">{selected}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSelected(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── Upload Tab ── */}
          <TabsContent value="upload" className="flex-1 flex flex-col space-y-3">
            <div
              className={`flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors
                ${uploading ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading files...</p>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-muted p-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {accept === "video"
                        ? "MP4, WebM, OGG up to 200MB"
                        : accept === "image"
                          ? "JPG, PNG, GIF, WebP, SVG up to 10MB"
                          : "Images up to 10MB, Videos up to 200MB"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptAttr}
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </>
              )}
            </div>
          </TabsContent>

          {/* ── URL Tab ── */}
          <TabsContent value="url" className="flex-1 flex flex-col space-y-3">
            <div className="space-y-2">
              <Label>Paste a URL to an image or video</Label>
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/video.mp4 or /images/photo.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleConfirm()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Enter a full URL (https://...) or a local path (/images/...)
              </p>
            </div>

            {urlInput.trim() && (
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-sm font-medium">Preview</p>
                {urlInput.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video
                    src={urlInput}
                    className="aspect-video w-full max-w-md rounded bg-black"
                    controls
                    muted
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="aspect-video w-full max-w-md rounded border object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {/* Use as-is: select existing image without opening the crop/enhance dialog */}
          {tab === "existing" && selected && cropEnabled && (
            <Button variant="outline" onClick={handleUseAsIs}>
              Use
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={tab === "url" ? !urlInput.trim() : !selected}
          >
            {tab === "url" ? "Use URL" : cropEnabled && tab === "existing" ? "Edit" : "Select"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ImageCropDialog
      open={!!cropSrc}
      onOpenChange={(v) => { if (!v) setCropSrc(null) }}
      imageSrc={cropSrc ?? ""}
      onCropComplete={handleCropDone}
      aspect={cropAspect}
      title="Crop & Enhance Image"
      allowReplace={!!(cropSrc && /^\/uploads\//.test(cropSrc))}
    />

    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete file?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
              </p>
              {/* Usage warning — shown when the file is referenced by content or settings */}
              {deleteTarget && (usageMap[deleteTarget.url]?.length ?? 0) > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                  <p className="mb-1.5 text-sm font-semibold">
                    ⚠️ This image is currently in use by {usageMap[deleteTarget.url].length} item{usageMap[deleteTarget.url].length !== 1 ? "s" : ""}:
                  </p>
                  <ul className="space-y-0.5 text-xs">
                    {usageMap[deleteTarget.url].map((u, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="font-medium">
                          {u.type === "content"
                            ? `${u.title ?? "Untitled"} (${u.post_type ?? "content"}, ${u.status})`
                            : u.label ?? u.config_key}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-xs opacity-80">
                    Deleting this file will remove its image from the listed items.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({ variant: "destructive" })}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

// ─── Inline trigger button ────────────────────────────────────────

interface MediaPickerTriggerProps {
  value: string
  onChange: (url: string) => void
  accept?: MediaPickerAccept
  label?: string
  placeholder?: string
  uploadCategory?: string
  uploadLabel?: string
}

/**
 * A convenience wrapper: shows an Input with a "Browse" button that opens
 * the MediaPicker dialog. Can be used as a drop-in replacement for a plain
 * URL input.
 */
export function MediaPickerInput({
  value,
  onChange,
  accept = "all",
  label,
  placeholder,
  uploadCategory,
  uploadLabel,
}: MediaPickerTriggerProps) {
  const [open, setOpen] = useState(false)

  const dialogTitle =
    accept === "video"
      ? "Select Video"
      : accept === "image"
        ? "Select Image"
        : "Select Media"

  return (
    <>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? (accept === "video" ? "/videos/hero.mp4 or https://..." : "/images/photo.jpg or https://...")}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 shrink-0"
          onClick={() => setOpen(true)}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Browse
        </Button>
      </div>
      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        onSelect={onChange}
        accept={accept}
        title={dialogTitle}
        currentValue={value}
        uploadCategory={uploadCategory}
        uploadLabel={uploadLabel}
      />
    </>
  )
}
