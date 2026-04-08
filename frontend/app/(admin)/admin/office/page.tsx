"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Building2,
  Target,
  Eye,
  Heart,
  Users,
  Layers,
  List,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react"
import {
  apiFetchOfficeContent,
  apiUpdateOfficeContent,
  apiLogActivity,
  type OfficeContent,
  type OrgStructureItem,
  type ProgramItem,
  type CoreValueItem,
} from "@/lib/api"

// ── Badge colour options for Programs ────────────────────────────────────────
const BADGE_COLOR_OPTIONS = [
  { label: "Ongoing",     value: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300" },
  { label: "Annual",      value: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300" },
  { label: "Dated",       value: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300" },
  { label: "Highlighted", value: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300" },
]

// ── Initial state ─────────────────────────────────────────────────────────────
const INIT: OfficeContent = {
  aboutP1: "",
  aboutP2: "",
  mission: "",
  vision: "",
  coreValues: [],
  objectives: [],
  orgStructure: [],
  programs: [],
}

// ── Generic list helpers ──────────────────────────────────────────────────────
function moveUp<T>(arr: T[], i: number): T[] {
  if (i === 0) return arr
  const next = [...arr]
  ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
  return next
}

function moveDown<T>(arr: T[], i: number): T[] {
  if (i >= arr.length - 1) return arr
  const next = [...arr]
  ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
  return next
}

function removeAt<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i)
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OfficeCMSPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, isHydrated } = useAdmin()
  const { toast } = useToast()

  const [form, setForm] = useState<OfficeContent>(INIT)
  const [saved, setSaved] = useState<OfficeContent>(INIT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Tab state — persisted in URL so it survives refresh
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "tourism-office")
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved)

  // Auth guard
  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.replace("/admin/login")
  }, [isHydrated, isLoggedIn, router])

  // Fetch initial content
  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return
    apiFetchOfficeContent()
      .then((data) => { setForm(data); setSaved(data) })
      .catch(() => toast({ title: "Failed to load office content", variant: "destructive" }))
      .finally(() => setLoading(false))
  }, [isHydrated, isLoggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const result = await apiUpdateOfficeContent(form)
      setForm(result.content)
      setSaved(result.content)
      toast({ title: "Saved", description: "MHACTO Office content updated.", variant: "success" })
      apiLogActivity("update_settings", "Updated MHACTO Office content").catch(() => {})
    } catch {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }, [form, toast])

  // ── Field helpers ─────────────────────────────────────────────────────────────
  const setField = <K extends keyof OfficeContent>(key: K, value: OfficeContent[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const updateOrg = (i: number, patch: Partial<OrgStructureItem>) =>
    setField("orgStructure", form.orgStructure.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))
  const addOrg = () =>
    setField("orgStructure", [...form.orgStructure, { name: "", role: "", note: "" }])

  const updateCoreValue = (i: number, patch: Partial<CoreValueItem>) =>
    setField("coreValues", form.coreValues.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))
  const addCoreValue = () =>
    setField("coreValues", [...form.coreValues, { title: "", description: "" }])

  const updateProgram = (i: number, patch: Partial<ProgramItem>) =>
    setField("programs", form.programs.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))
  const addProgram = () =>
    setField("programs", [...form.programs, { title: "", description: "", badge: "Ongoing", badgeColor: BADGE_COLOR_OPTIONS[0].value }])

  const updateObjective = (i: number, value: string) =>
    setField("objectives", form.objectives.map((obj, idx) => (idx === i ? value : obj)))
  const addObjective = () =>
    setField("objectives", [...form.objectives, ""])

  if (!isHydrated || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">

      {/* ── Sticky Header ────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
              <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">MHACTO Office</h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "tourism-office"
                  ? "Edit content for the Tourism Office page."
                  : "Edit content for the Mission & Vision page."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Unsaved changes
              </Badge>
            )}
            <Button onClick={handleSave} disabled={saving || !isDirty} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabbed Content ───────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-10">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-5">

          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid lg:grid-cols-2">
            <TabsTrigger value="tourism-office" className="gap-2">
              <Building2 className="h-4 w-4" />
              Tourism Office
            </TabsTrigger>
            <TabsTrigger value="mission-vision" className="gap-2">
              <Target className="h-4 w-4" />
              Mission &amp; Vision
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1 — TOURISM OFFICE
              Fields: About MHACTO (2 paragraphs), Org Structure, Programs
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="tourism-office" className="space-y-5 mt-0">

            {/* About MHACTO */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-100 dark:bg-cyan-900/40">
                    <Building2 className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                  </div>
                  <div>
                    <CardTitle className="text-base">About MHACTO</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Two introductory paragraphs displayed at the top of the Tourism Office page.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="aboutP1">Paragraph 1</Label>
                  <Textarea
                    id="aboutP1"
                    rows={4}
                    value={form.aboutP1}
                    onChange={(e) => setField("aboutP1", e.target.value)}
                    placeholder="First paragraph about MHACTO…"
                    className="resize-y"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aboutP2">Paragraph 2</Label>
                  <Textarea
                    id="aboutP2"
                    rows={4}
                    value={form.aboutP2}
                    onChange={(e) => setField("aboutP2", e.target.value)}
                    placeholder="Second paragraph about MHACTO…"
                    className="resize-y"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Org Structure */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/40">
                    <Users className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Organizational Structure</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Divisions and roles shown in the org chart on the Tourism Office page.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                {form.orgStructure.map((item, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Division {i + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setField("orgStructure", moveUp(form.orgStructure, i))} disabled={i === 0}>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setField("orgStructure", moveDown(form.orgStructure, i))} disabled={i === form.orgStructure.length - 1}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setField("orgStructure", removeAt(form.orgStructure, i))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Name / Division</Label>
                        <Input value={item.name} onChange={(e) => updateOrg(i, { name: e.target.value })} placeholder="e.g. Heritage & Culture Division" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Role</Label>
                        <Input value={item.role} onChange={(e) => updateOrg(i, { role: e.target.value })} placeholder="e.g. Documentation & Preservation" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Notes</Label>
                      <Input value={item.note} onChange={(e) => updateOrg(i, { note: e.target.value })} placeholder="Brief description of responsibilities" />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-1.5 mt-1" onClick={addOrg}>
                  <Plus className="h-3.5 w-3.5" /> Add Division
                </Button>
              </CardContent>
            </Card>

            {/* Programs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/40">
                    <Layers className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Programs &amp; Initiatives</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Program cards shown in the Programs section of the Tourism Office page.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                {form.programs.map((prog, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Program {i + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setField("programs", moveUp(form.programs, i))} disabled={i === 0}>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setField("programs", moveDown(form.programs, i))} disabled={i === form.programs.length - 1}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setField("programs", removeAt(form.programs, i))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input value={prog.title} onChange={(e) => updateProgram(i, { title: e.target.value })} placeholder="Program title" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea rows={3} value={prog.description} onChange={(e) => updateProgram(i, { description: e.target.value })} placeholder="Describe this program…" className="resize-y" />
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Badge Text</Label>
                        <Input value={prog.badge} onChange={(e) => updateProgram(i, { badge: e.target.value })} placeholder="e.g. Ongoing, Annual, 2025–2030" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Badge Colour</Label>
                        <Select value={prog.badgeColor} onValueChange={(v) => updateProgram(i, { badgeColor: v })}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select colour" />
                          </SelectTrigger>
                          <SelectContent>
                            {BADGE_COLOR_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${opt.value}`}>
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-1.5 mt-1" onClick={addProgram}>
                  <Plus className="h-3.5 w-3.5" /> Add Program
                </Button>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2 — MISSION & VISION
              Fields: Mission, Vision, Core Values, Strategic Objectives
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="mission-vision" className="space-y-5 mt-0">

            {/* Mission & Vision side-by-side */}
            <div className="grid gap-5 lg:grid-cols-2">

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/40">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Mission</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Displayed in the Mission card on the Mission &amp; Vision page.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <Textarea
                    id="mission"
                    rows={7}
                    value={form.mission}
                    onChange={(e) => setField("mission", e.target.value)}
                    placeholder="Our mission statement…"
                    className="resize-y"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/40">
                      <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Vision</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Displayed in the Vision card on the Mission &amp; Vision page.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <Textarea
                    id="vision"
                    rows={7}
                    value={form.vision}
                    onChange={(e) => setField("vision", e.target.value)}
                    placeholder="Our vision statement…"
                    className="resize-y"
                  />
                </CardContent>
              </Card>

            </div>

            {/* Core Values */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-900/40">
                    <Heart className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Core Values</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Value cards shown below Mission &amp; Vision. Icons cycle automatically (Heart → Target → Eye).
                    </p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                {form.coreValues.map((val, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Value {i + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setField("coreValues", moveUp(form.coreValues, i))} disabled={i === 0}>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setField("coreValues", moveDown(form.coreValues, i))} disabled={i === form.coreValues.length - 1}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setField("coreValues", removeAt(form.coreValues, i))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Title</Label>
                        <Input value={val.title} onChange={(e) => updateCoreValue(i, { title: e.target.value })} placeholder="e.g. Heritage Preservation" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Description</Label>
                        <Textarea rows={2} value={val.description} onChange={(e) => updateCoreValue(i, { description: e.target.value })} placeholder="Describe this core value…" className="resize-y" />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-1.5 mt-1" onClick={addCoreValue}>
                  <Plus className="h-3.5 w-3.5" /> Add Core Value
                </Button>
              </CardContent>
            </Card>

            {/* Strategic Objectives */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/40">
                    <List className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Strategic Objectives</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Numbered list shown at the bottom of the Mission &amp; Vision page.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-2">
                {form.objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <Input
                      value={obj}
                      onChange={(e) => updateObjective(i, e.target.value)}
                      placeholder={`Objective ${i + 1}…`}
                      className="flex-1"
                    />
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setField("objectives", moveUp(form.objectives, i))} disabled={i === 0}>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setField("objectives", moveDown(form.objectives, i))} disabled={i === form.objectives.length - 1}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" onClick={() => setField("objectives", removeAt(form.objectives, i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-1.5 mt-2" onClick={addObjective}>
                  <Plus className="h-3.5 w-3.5" /> Add Objective
                </Button>
              </CardContent>
            </Card>

          </TabsContent>

        </Tabs>
      </div>
    </main>
  )
}

