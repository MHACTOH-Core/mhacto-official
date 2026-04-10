"use client"

import { useState, useCallback, useRef } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ZoomIn, RotateCw, Crop, Sparkles, Loader2, Blend, Copy, RefreshCw, Maximize2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// ─── Image enhancement (unsharp-mask + contrast bump) ───────────
// Inlined here to avoid module-resolution caching issues with the TS server.
// Step 1: 3×3 unsharp-mask convolution — sharpens edges.
// Step 2: overlay-blend a neutral gray to lift contrast slightly.
function enhanceImage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number = 0.6,
) {
  if (width === 0 || height === 0) return
  const imageData = ctx.getImageData(0, 0, width, height)
  const src = imageData.data
  const output = new Uint8ClampedArray(src.length)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Skip border pixels — they have no full set of 4 neighbours
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        output[idx] = src[idx]; output[idx+1] = src[idx+1]
        output[idx+2] = src[idx+2]; output[idx+3] = src[idx+3]
        continue
      }

      // Flat array indices for the 4 cardinal neighbour pixels
      const topIdx = ((y - 1) * width + x) * 4
      const botIdx = ((y + 1) * width + x) * 4
      const lftIdx = (y * width + (x - 1)) * 4
      const rgtIdx = (y * width + (x + 1)) * 4

      for (let c = 0; c < 3; c++) {
        const center     = src[idx + c]
        const neighbours = src[topIdx+c] + src[botIdx+c] + src[lftIdx+c] + src[rgtIdx+c]
        // Unsharp mask: amplify the centre pixel relative to its 4 neighbours
        output[idx + c] = center + strength * (4 * center - neighbours)
      }
      output[idx + 3] = src[idx + 3] // preserve alpha
    }
  }

  imageData.data.set(output)
  ctx.putImageData(imageData, 0, 0)

  // Overlay-blend a neutral mid-gray at low opacity → subtle contrast boost
  ctx.globalCompositeOperation = "overlay"
  ctx.globalAlpha = 0.08
  ctx.fillStyle = "#808080" // neutral gray; overlay mode makes darks darker, lights lighter
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
}

type GradientDirection = "left" | "right" | "top" | "bottom"

// Maps the user-selected fade-side to a CSS gradient direction (fade goes *toward* transparent)
const GRADIENT_CSS_DIRECTION: Record<GradientDirection, string> = {
  left:   "to right",
  right:  "to left",
  top:    "to bottom",
  bottom: "to top",
}

// Output quality for the final JPEG export (0–1)
const JPEG_QUALITY = 0.92

// Default sharpen strength — intentionally mild to avoid over-processing
const DEFAULT_ENHANCE_STRENGTH = 0.3

// Default gradient opacity (mid-strength fade)
const DEFAULT_GRADIENT_STRENGTH = 0.45

export type CropSaveMode = "copy" | "replace"

export interface ImageCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  /** Called with the final Blob (cropped + optionally enhanced) and the chosen save mode. */
  onCropComplete: (blob: Blob, mode: CropSaveMode) => void
  /** Desired aspect ratio (width / height). Free-form if omitted. */
  aspect?: number
  /** Dialog title. */
  title?: string
  /** When true, shows a Replace/Copy choice so the user can overwrite the original. */
  allowReplace?: boolean
}

/** Crop an image to the given pixel area and return a JPEG Blob. */
async function getCroppedBlob(
  imageSrc: string,
  crop: Area | null,
  enhance: { enabled: boolean; strength: number },
  gradient: { enabled: boolean; direction: GradientDirection; strength: number },
  outputSize?: { width: number; height: number },
): Promise<Blob> {
  // We need same-origin pixel access for canvas crop + enhance.
  // Strategy: load the image via an object URL created from a fetch blob.
  // This avoids tainted-canvas issues regardless of the server's CORS config.
  let objectUrl: string | null = null
  try {
    const resp = await fetch(imageSrc)
    if (resp.ok) {
      const imgBlob = await resp.blob()
      objectUrl = URL.createObjectURL(imgBlob)
    }
  } catch {
    // Fetch may fail for cross-origin images; fall through to direct load
  }

  const image = new window.Image()
  // If we couldn't fetch as blob, try loading directly (may taint canvas
  // on cross-origin, but works when the server sends CORS headers).
  if (!objectUrl) {
    image.crossOrigin = "anonymous"
  }
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error("Failed to load image for cropping"))
    image.src = objectUrl ?? imageSrc
  })
  if (objectUrl) URL.revokeObjectURL(objectUrl)

  const canvas = document.createElement("canvas")
  // null crop = full image mode
  const srcX      = crop ? crop.x : 0
  const srcY      = crop ? crop.y : 0
  const srcWidth  = crop ? crop.width  : image.naturalWidth
  const srcHeight = crop ? crop.height : image.naturalHeight
  canvas.width  = srcWidth
  canvas.height = srcHeight

  const ctx = canvas.getContext("2d")!
  ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight)

  // Apply sharpening / enhancement if toggled on
  if (enhance.enabled) {
    enhanceImage(ctx, canvas.width, canvas.height, enhance.strength)
  }

  // Apply gradient overlay if enabled
  if (gradient.enabled && gradient.strength > 0) {
    const w = canvas.width
    const h = canvas.height
    // Canvas gradient: dark end at the chosen side, fades to transparent
    const gradientCoords: Record<GradientDirection, [number, number, number, number]> = {
      left:   [0, 0, w, 0],
      right:  [w, 0, 0, 0],
      top:    [0, 0, 0, h],
      bottom: [0, h, 0, 0],
    }
    const [x0, y0, x1, y1] = gradientCoords[gradient.direction]
    const grd = ctx.createLinearGradient(x0, y0, x1, y1)
    grd.addColorStop(0, `rgba(0,0,0,${gradient.strength})`)
    grd.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
  }

  // Resize to custom output dimensions if specified
  let finalCanvas = canvas
  if (outputSize && (outputSize.width !== canvas.width || outputSize.height !== canvas.height)) {
    finalCanvas = document.createElement("canvas")
    finalCanvas.width  = outputSize.width
    finalCanvas.height = outputSize.height
    const rCtx = finalCanvas.getContext("2d")!
    rCtx.drawImage(canvas, 0, 0, outputSize.width, outputSize.height)
  }

  return new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      JPEG_QUALITY,
    )
  })
}

/** Figma-style horizontal drag scrubber for numeric values. Double-click to reset. */
function DragNumber({
  label,
  value,
  onChange,
  min = 1,
  max = 9999,
}: {
  label: string
  value: number | ""
  onChange: (v: number | "") => void
  min?: number
  max?: number
}) {
  const startRef = useRef<{ x: number; startVal: number } | null>(null)
  const [active, setActive] = useState(false)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startVal = typeof value === "number" ? value : Math.round((min + max) / 2)
    startRef.current = { x: e.clientX, startVal }
    setActive(true)
    const onMove = (ev: MouseEvent) => {
      if (!startRef.current) return
      const delta = Math.round(ev.clientX - startRef.current.x)
      const next = Math.min(max, Math.max(min, startRef.current.startVal + delta))
      onChange(next)
    }
    const onUp = () => {
      setActive(false)
      startRef.current = null
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  return (
    <div
      role="spinbutton"
      aria-valuenow={typeof value === "number" ? value : undefined}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => onChange("")}
      title="Drag to set value • double-click to reset"
      className={`flex items-center gap-1.5 rounded border px-2.5 h-8 cursor-ew-resize select-none text-xs transition-colors ${
        active ? "border-primary bg-primary/10" : "border-border bg-muted/60 hover:border-primary/50"
      }`}
    >
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="tabular-nums min-w-[2rem] text-right">
        {typeof value === "number" ? value : <span className="opacity-40">—</span>}
      </span>
    </div>
  )
}

// Preset aspect ratios for common use cases
const ASPECT_PRESETS = [
  { label: "Free", value: undefined },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:2", value: 3 / 2 },
  { label: "21:9", value: 21 / 9 },
] as const

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspect: initialAspect,
  title = "Crop & Enhance Image",
  allowReplace = false,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [enhance, setEnhance] = useState(true)
  const [enhanceStrength, setEnhanceStrength] = useState(DEFAULT_ENHANCE_STRENGTH)
  const [aspect, setAspect] = useState<number | undefined>(initialAspect)
  const [gradientEnabled, setGradientEnabled] = useState(false)
  const [gradientDirection, setGradientDirection] = useState<GradientDirection>("left")
  const [gradientStrength, setGradientStrength] = useState(DEFAULT_GRADIENT_STRENGTH)
  const [saveMode, setSaveMode] = useState<CropSaveMode>("copy")
  /** When true, the entire image is used — no crop box */
  const [fullImage, setFullImage] = useState(false)
  /** Custom output dimensions (empty string = use natural crop size) */
  const [outputWidth, setOutputWidth] = useState<number | "">("")
  const [outputHeight, setOutputHeight] = useState<number | "">("")

  const handleCropComplete = useCallback(
    (_percent: Area, pixels: Area) => setCroppedArea(pixels),
    [],
  )

  const handleSave = async () => {
    if (!fullImage && !croppedArea) return
    setSaving(true)
    try {
      const w = typeof outputWidth === "number" ? outputWidth : 0
      const h = typeof outputHeight === "number" ? outputHeight : 0
      const outputSize = (w > 0 && h > 0) ? { width: w, height: h } : undefined
      const blob = await getCroppedBlob(
        imageSrc,
        fullImage ? null : croppedArea,
        { enabled: enhance, strength: enhanceStrength },
        { enabled: gradientEnabled, direction: gradientDirection, strength: gradientStrength },
        outputSize,
      )
      onCropComplete(blob, saveMode)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  // Reset state when dialog re-opens
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setCroppedArea(null)
      setEnhance(true)
      setEnhanceStrength(DEFAULT_ENHANCE_STRENGTH)
      setAspect(initialAspect)
      setGradientEnabled(false)
      setGradientDirection("left")
      setGradientStrength(DEFAULT_GRADIENT_STRENGTH)
      setSaveMode("copy")
      setFullImage(false)
      setOutputWidth("")
      setOutputHeight("")
    }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Crop className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Crop area */}
        <div className="relative mx-auto w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border" style={{ height: 'clamp(16rem, 40vw, 22rem)' }}>
          {fullImage ? (
            /* Full-image mode: show the image scaled to fit, no crop UI */
            <div className="flex h-full w-full items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Full image preview"
                  className="max-h-full max-w-full rounded object-contain"
                  style={gradientEnabled && gradientStrength > 0 ? {
                    mask: `linear-gradient(${GRADIENT_CSS_DIRECTION[gradientDirection]}, rgba(0,0,0,${1 - gradientStrength}), black)`,
                    WebkitMask: `linear-gradient(${GRADIENT_CSS_DIRECTION[gradientDirection]}, rgba(0,0,0,${1 - gradientStrength}), black)`,
                  } : undefined}
                />
              )}
              <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
                <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">Full image — no crop applied</span>
              </div>
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={handleCropComplete}
              style={{
                cropAreaStyle: gradientEnabled && gradientStrength > 0 ? {
                  background: `linear-gradient(${GRADIENT_CSS_DIRECTION[gradientDirection]}, rgba(0,0,0,${gradientStrength}), transparent)`,
                } : undefined,
              }}
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 overflow-y-auto max-h-[40vh] sm:max-h-none pr-1">
          {/* Left column – sliders & aspect */}
          <div className="space-y-4">
            {/* Full image toggle + Aspect ratio presets */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Mode</Label>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant={fullImage ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1"
                  onClick={() => setFullImage((v) => !v)}
                >
                  <Maximize2 className="h-3 w-3" />
                  Full Image
                </Button>
              </div>
            </div>

            {/* Aspect ratio presets — hidden in full-image mode */}
            {!fullImage && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Aspect Ratio</Label>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={aspect === preset.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setAspect(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            )}

            {/* Zoom + Rotation — hidden in full-image mode */}
            {!fullImage && (
            <>
            {/* Zoom slider */}
            <div className="flex items-center gap-3">
              <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Slider
                min={1}
                max={3}
                step={0.05}
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                className="flex-1"
              />
              <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Rotation slider */}
            <div className="flex items-center gap-3">
              <RotateCw className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Slider
                min={0}
                max={360}
                step={1}
                value={[rotation]}
                onValueChange={([v]) => setRotation(v)}
                className="flex-1"
              />
              <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                {rotation}°
              </span>
            </div>
            </>
            )}

            {/* Custom output dimensions */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Output Size (optional)</Label>
              <div className="flex items-center gap-1.5">
                <DragNumber label="W" value={outputWidth} onChange={setOutputWidth} />
                <span className="text-xs text-muted-foreground">×</span>
                <DragNumber label="H" value={outputHeight} onChange={setOutputHeight} />
                <span className="text-xs text-muted-foreground">px</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Drag to set • double-click to reset</p>
            </div>
          </div>

          {/* Right column – toggles & gradient */}
          <div className="space-y-4">
            {/* Auto-enhance toggle */}
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Auto‑Enhance</p>
                    <p className="text-xs text-muted-foreground">Sharpen &amp; improve clarity</p>
                  </div>
                </div>
                <Switch checked={enhance} onCheckedChange={setEnhance} />
              </div>
              {enhance && (
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-muted-foreground shrink-0">Strength</Label>
                  <Slider
                    min={0.1}
                    max={0.8}
                    step={0.05}
                    value={[enhanceStrength]}
                    onValueChange={([v]) => setEnhanceStrength(v)}
                    className="flex-1"
                  />
                  <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                    {Math.round(enhanceStrength * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Gradient overlay toggle */}
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Blend className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Gradient Overlay</p>
                    <p className="text-xs text-muted-foreground">Dark fade for text readability</p>
                  </div>
                </div>
                <Switch checked={gradientEnabled} onCheckedChange={setGradientEnabled} />
              </div>
              {gradientEnabled && (
                <>
                  {/* Direction buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {(["left", "right", "top", "bottom"] as const).map((dir) => (
                      <Button
                        key={dir}
                        type="button"
                        variant={gradientDirection === dir ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-2.5 text-xs capitalize"
                        onClick={() => setGradientDirection(dir)}
                      >
                        {dir}
                      </Button>
                    ))}
                  </div>
                  {/* Strength slider */}
                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-muted-foreground shrink-0">Strength</Label>
                    <Slider
                      min={0.05}
                      max={0.9}
                      step={0.05}
                      value={[gradientStrength]}
                      onValueChange={([v]) => setGradientStrength(v)}
                      className="flex-1"
                    />
                    <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                      {Math.round(gradientStrength * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Save mode selector */}
        {allowReplace && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSaveMode("copy")}
              className={`flex flex-1 items-center gap-2.5 rounded-lg border px-4 py-2.5 text-left transition-colors ${
                saveMode === "copy"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Copy className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium leading-none">Create a copy</p>
                <p className="mt-0.5 text-xs opacity-70">Upload as a new file</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSaveMode("replace")}
              className={`flex flex-1 items-center gap-2.5 rounded-lg border px-4 py-2.5 text-left transition-colors ${
                saveMode === "replace"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-amber-500/50"
              }`}
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium leading-none">Replace original</p>
                <p className="mt-0.5 text-xs opacity-70">Overwrite the existing file</p>
              </div>
            </button>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || (!fullImage && !croppedArea)}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : saveMode === "replace" ? (
              "Replace & Apply"
            ) : (
              "Apply Copy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
