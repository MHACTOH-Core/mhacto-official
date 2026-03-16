"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import {
  apiListMedia,
  apiUploadMedia,
  apiDeleteMedia,
  API_BASE,
  type MediaFile,
} from "@/lib/api"

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
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  accept = "all",
  title = "Select Media",
  currentValue,
  uploadCategory,
  uploadLabel,
}: MediaPickerProps) {
  const [tab, setTab] = useState<"existing" | "upload" | "url">("existing")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback(async () => {
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
    } catch (err) {
      console.error("Failed to load media:", err)
      setError("Failed to load media library. Make sure the backend is running.")
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

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return
    try {
      await apiDeleteMedia(file.url)
      if (selected === file.url) setSelected(null)
      await loadFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  const handleConfirm = () => {
    if (tab === "url" && urlInput.trim()) {
      onSelect(urlInput.trim())
      onOpenChange(false)
    } else if (selected) {
      onSelect(selected)
      onOpenChange(false)
    }
  }

  const filteredFiles = files.filter((f) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
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
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1">
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
                            handleDelete(file)
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
          <Button
            onClick={handleConfirm}
            disabled={tab === "url" ? !urlInput.trim() : !selected}
          >
            {tab === "url" ? "Use URL" : "Select"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Inline trigger button ────────────────────────────────────────

interface MediaPickerTriggerProps {
  value: string
  onChange: (url: string) => void
  accept?: MediaPickerAccept
  label?: string
  placeholder?: string
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
      />
    </>
  )
}
