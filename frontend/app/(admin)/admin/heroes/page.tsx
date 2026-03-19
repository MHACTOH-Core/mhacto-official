"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ImageIcon,
  Pencil,
  Save,
  Loader2,
  CheckCircle,
  Landmark,
  Sparkles,
  Scissors,
  BookOpen,
  CalendarDays,
  Megaphone,
  Building2,
  Map,
  Eye,
  X,
  Compass,
  Globe,
  Heart,
  Star,
  Camera,
  Music,
  Users,
  Trophy,
  Flag,
  Utensils,
  Hammer,
  Clock,
  Store,
  Church,
  GraduationCap,
  School,
  Activity,
  Palette,
} from "lucide-react"
import { MediaPickerInput } from "@/components/ui/media-picker"
import { resolveMediaUrl, asset } from "@/lib/utils"
import {
  apiFetchAllPageHeroes,
  apiUpdatePageHero,
  type PageHeroData,
} from "@/lib/api"

// Available Lucide icon options for the admin to choose from
const ICON_OPTIONS = [
  { value: "", label: "None" },
  { value: "Landmark", label: "Landmark" },
  { value: "Sparkles", label: "Sparkles" },
  { value: "Scissors", label: "Scissors" },
  { value: "BookOpen", label: "Book Open" },
  { value: "CalendarDays", label: "Calendar" },
  { value: "Megaphone", label: "Megaphone" },
  { value: "Building2", label: "Building" },
  { value: "Map", label: "Map" },
  { value: "Compass", label: "Compass" },
  { value: "Globe", label: "Globe" },
  { value: "Heart", label: "Heart" },
  { value: "Star", label: "Star" },
  { value: "Camera", label: "Camera" },
  { value: "Music", label: "Music" },
  { value: "Users", label: "Users" },
  { value: "Trophy", label: "Trophy" },
  { value: "Flag", label: "Flag" },
  { value: "Utensils", label: "Utensils" },
  { value: "Hammer", label: "Hammer" },
  { value: "Clock", label: "Clock" },
  { value: "Store", label: "Store" },
  { value: "Church", label: "Church" },
  { value: "GraduationCap", label: "Graduation Cap" },
  { value: "School", label: "School" },
  { value: "Activity", label: "Activity" },
  { value: "Palette", label: "Palette" },
]

const ACCENT_OPTIONS = [
  { value: "amber-300", label: "Amber", preview: "bg-amber-300" },
  { value: "cyan-300", label: "Cyan", preview: "bg-cyan-300" },
  { value: "blue-300", label: "Blue", preview: "bg-blue-300" },
  { value: "green-300", label: "Green", preview: "bg-green-300" },
  { value: "purple-300", label: "Purple", preview: "bg-purple-300" },
  { value: "rose-300", label: "Rose", preview: "bg-rose-300" },
  { value: "orange-300", label: "Orange", preview: "bg-orange-300" },
  { value: "red-300", label: "Red", preview: "bg-red-300" },
  { value: "pink-300", label: "Pink", preview: "bg-pink-300" },
]

// Map icon names to actual components for rendering
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  Sparkles,
  Scissors,
  BookOpen,
  CalendarDays,
  Megaphone,
  Building2,
  Map,
  Compass,
  Globe,
  Heart,
  Star,
  Camera,
  Music,
  Users,
  Trophy,
  Flag,
  Utensils,
  Hammer,
  Clock,
  Store,
  Church,
  GraduationCap,
  School,
  Activity,
  Palette,
}

function resolveHeroImage(url: string): string {
  if (!url) return asset("/images/defaults/no-image.svg")
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    return resolveMediaUrl(url)
  }
  return asset(url.startsWith("/") ? url : `/${url}`)
}

export default function HeroesAdminPage() {
  const router = useRouter()
  const { isLoggedIn, isHydrated } = useAdmin()

  const { toast } = useToast()

  const [heroes, setHeroes] = useState<PageHeroData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit dialog
  const [editing, setEditing] = useState<PageHeroData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Preview dialog
  const [previewing, setPreviewing] = useState<PageHeroData | null>(null)

  // Save confirmation
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)

  // Form state (for edit dialog)
  const [formImageUrl, setFormImageUrl] = useState("")
  const [formIconName, setFormIconName] = useState("")
  const [formAccentColor, setFormAccentColor] = useState("")
  const [formLabel, setFormLabel] = useState("")
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")

  useEffect(() => {
    if (!isHydrated) return
    if (!isLoggedIn) {
      router.push("/admin")
      return
    }
    loadHeroes()
  }, [isHydrated, isLoggedIn, router])

  async function loadHeroes() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetchAllPageHeroes()
      setHeroes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page heroes")
    } finally {
      setLoading(false)
    }
  }

  function openEdit(hero: PageHeroData) {
    setEditing(hero)
    setFormImageUrl(hero.imageUrl)
    setFormIconName(hero.iconName)
    setFormAccentColor(hero.accentColor)
    setFormLabel(hero.label)
    setFormTitle(hero.title)
    setFormDescription(hero.description)
    setSaveSuccess(false)
  }

  async function doSave() {
    if (!editing) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      const result = await apiUpdatePageHero(editing.slug, {
        imageUrl: formImageUrl,
        iconName: formIconName,
        accentColor: formAccentColor,
        label: formLabel,
        title: formTitle,
        description: formDescription,
      })
      // Update local state
      setHeroes((prev) =>
        prev.map((h) => (h.slug === editing.slug ? result.hero : h)),
      )
      setSaveSuccess(true)
      toast({ title: "Hero updated", description: `"${formTitle}" page hero has been saved.` })
      setTimeout(() => {
        setEditing(null)
        setSaveSuccess(false)
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
      toast({ title: "Save failed", description: "Failed to save page hero.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    setSaveConfirmOpen(true)
  }

  if (!isHydrated || !isLoggedIn) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-foreground">Page Heroes</h1>
            <p className="mt-1 text-muted-foreground">
              Manage hero images and text for every page on the public site. Changes appear instantly.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
              <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {heroes.map((hero) => {
                const IconComp = ICON_MAP[hero.iconName]
                return (
                  <Card
                    key={hero.slug}
                    className="group overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    {/* Image preview */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${resolveHeroImage(hero.imageUrl)})`,
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        {/* Icon + label */}
                        <div className="flex items-center gap-2 mb-1.5">
                          {IconComp && (
                            <IconComp className={`h-4 w-4 text-${hero.accentColor}`} />
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-widest text-${hero.accentColor}`}>
                            {hero.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight line-clamp-2">
                          {hero.title}
                        </h3>
                        <p className="mt-1 text-xs text-white/80 line-clamp-2">
                          {hero.description}
                        </p>
                      </div>
                    </div>

                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{hero.displayName}</p>
                        <p className="text-xs text-muted-foreground">/{hero.slug}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewing(hero)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(hero)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Edit Hero — {editing?.displayName}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-6 py-2">
              {/* Live Preview */}
              <div className="rounded-xl overflow-hidden border border-border">
                <div
                  className="relative aspect-[21/9] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${resolveHeroImage(formImageUrl)})`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-2">
                      {formIconName && ICON_MAP[formIconName] && (() => {
                        const IC = ICON_MAP[formIconName]
                        return <IC className={`h-5 w-5 text-${formAccentColor}`} />
                      })()}
                      <span className={`text-[10px] font-bold uppercase tracking-widest text-${formAccentColor}`}>
                        {formLabel || "Label"}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {formTitle || "Title"}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-white/90 max-w-md line-clamp-2">
                      {formDescription || "Description text..."}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 px-4 py-2 text-[10px] text-muted-foreground text-center">
                  Live Preview
                </div>
              </div>

              {/* Hero Image */}
              <div className="space-y-2">
                <Label>Hero Image</Label>
                <MediaPickerInput
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  accept="image"
                  placeholder="Select from media library or paste URL"
                />
                <p className="text-[11px] text-muted-foreground">
                  Upload via media library or paste an external URL.
                </p>
              </div>

              {/* Icon & Accent Color — side by side */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={formIconName || "__none__"} onValueChange={(v) => setFormIconName(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value || "__none__"}>
                          <span className="flex items-center gap-2">
                            {opt.value && ICON_MAP[opt.value] && (() => {
                              const IC = ICON_MAP[opt.value]
                              return <IC className="h-4 w-4" />
                            })()}
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <Select value={formAccentColor} onValueChange={setFormAccentColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${opt.preview}`} />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <Label>Label (small uppercase text above title)</Label>
                <Input
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Bocaue Wonders"
                  maxLength={50}
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Tourist Destinations"
                  maxLength={80}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="A brief description shown below the title..."
                  rows={3}
                  maxLength={300}
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {formDescription.length}/300
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Full Preview Dialog ── */}
      <Dialog open={!!previewing} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {previewing && (
            <>
              <div
                className="relative min-h-[300px] sm:min-h-[380px] bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${resolveHeroImage(previewing.imageUrl)})`,
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
                  onClick={() => setPreviewing(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 py-12">
                  <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center gap-3">
                      {previewing.iconName && ICON_MAP[previewing.iconName] && (() => {
                        const IC = ICON_MAP[previewing.iconName]
                        return <IC className={`h-8 w-8 text-${previewing.accentColor}`} />
                      })()}
                      <span className={`text-sm font-bold uppercase tracking-widest text-${previewing.accentColor}`}>
                        {previewing.label}
                      </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
                      {previewing.title}
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
                      {previewing.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{previewing.displayName}</p>
                  <p className="text-xs text-muted-foreground">Page: /{previewing.slug}</p>
                </div>
                <Button size="sm" onClick={() => { setPreviewing(null); openEdit(previewing) }} className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Confirmation */}
      <AlertDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to save?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the page hero on the live site. Please make sure all changes are correct.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
