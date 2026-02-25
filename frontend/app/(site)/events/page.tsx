"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft, CalendarDays, MapPin, Ticket, Filter,
  LayoutGrid, CalendarRange, ChevronDown, ChevronUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { municipalEvents, type MunicipalEvent } from "@/lib/data/community-data"

const categoryBadge: Record<MunicipalEvent["category"], string> = {
  festival: "bg-amber-100 text-amber-800 border-amber-200",
  civic: "bg-blue-100 text-blue-800 border-blue-200",
  sports: "bg-green-100 text-green-800 border-green-200",
  cultural: "bg-purple-100 text-purple-800 border-purple-200",
  religious: "bg-orange-100 text-orange-800 border-orange-200",
  health: "bg-red-100 text-red-800 border-red-200",
}
const categoryLabels: Record<MunicipalEvent["category"], string> = {
  festival: "Festival",
  civic: "Civic",
  sports: "Sports",
  cultural: "Cultural",
  religious: "Religious",
  health: "Health",
}

const categoryColor: Record<MunicipalEvent["category"], string> = {
  festival: "#d97706",
  civic: "#2563eb",
  sports: "#16a34a",
  cultural: "#9333ea",
  religious: "#ea580c",
  health: "#dc2626",
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

function getEventMonth(dateStr: string) {
  return new Date(dateStr).getMonth()
}

// ── Calendar Month Card ──────────────────────────────────────────────
function MonthCard({ month, monthIndex, events }: { month: string; monthIndex: number; events: MunicipalEvent[] }) {
  const [expanded, setExpanded] = useState(false)
  const hasEvents = events.length > 0

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        hasEvents
          ? "border-primary/30 bg-card shadow-sm hover:shadow-md cursor-pointer"
          : "border-border bg-muted/30 opacity-60"
      }`}
      onClick={() => hasEvents && setExpanded((v) => !v)}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${hasEvents ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {monthIndex + 1}
          </div>
          <div>
            <p className={`text-sm font-bold ${hasEvents ? "text-foreground" : "text-muted-foreground"}`}>{month}</p>
            <p className="text-xs text-muted-foreground">
              {events.length === 0 ? "No events" : `${events.length} event${events.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {hasEvents && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {events.map((e) => (
                <span
                  key={e.id}
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoryColor[e.category] }}
                />
              ))}
            </div>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </div>

      {expanded && hasEvents && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <Badge variant="outline" className={`text-[10px] ${categoryBadge[ev.category]}`}>
                  {categoryLabels[ev.category]}
                </Badge>
                {ev.ticketed && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ticket className="h-3 w-3" /> {ev.price}
                  </span>
                )}
              </div>
              <p className="text-sm font-black text-foreground leading-snug">{ev.title}</p>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3 text-primary flex-shrink-0" />
                  {formatDate(ev.date, ev.endDate)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                  {ev.location}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">{ev.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr: string, endDateStr?: string) {
  const d = new Date(dateStr)
  const formatted = d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
  if (!endDateStr) return formatted
  const e = new Date(endDateStr)
  const formattedEnd = e.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
  return `${formatted} — ${formattedEnd}`
}

type CategoryFilter = MunicipalEvent["category"] | "all"
type ViewMode = "grid" | "calendar"

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")

  const categories: CategoryFilter[] = ["all","festival","religious","cultural","civic","sports","health"]
  const filtered = activeCategory === "all"
    ? municipalEvents
    : municipalEvents.filter((e) => e.category === activeCategory)

  const eventsByMonth = useMemo(() => {
    const map: Record<number, MunicipalEvent[]> = {}
    for (let i = 0; i < 12; i++) map[i] = []
    for (const ev of filtered) map[getEventMonth(ev.date)].push(ev)
    return map
  }, [filtered])

  const activeMonths = Object.values(eventsByMonth).filter((a) => a.length > 0).length

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[380px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.40)), url(/images/places/river-festival.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 flex flex-col justify-center py-12 sm:py-16 md:py-24">
          <Link href="/" className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-cyan-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-cyan-300">Events</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
              Municipal Events
            </h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              Festivals, civic programs, sports competitions, and cultural celebrations throughout the Bocaue calendar year.
            </p>
          </div>
        </div>
      </section>

      {/* ── Controls bar ── */}
      <section className="border-b border-border bg-muted/40 py-3 sticky top-0 z-30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="text-xs capitalize"
                >
                  {cat === "all" ? "All Events" : categoryLabels[cat as MunicipalEvent["category"]]}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "calendar" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Grid
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Calendar of Activities ── */}
      {viewMode === "calendar" && (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarRange className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Calendar of Activities</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">Year 2026 Event Schedule</h2>
                <p className="text-muted-foreground mt-1 text-sm">Click any highlighted month to expand event details.</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-primary">{filtered.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Events</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-primary">{activeMonths}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Months</p>
                </div>
              </div>
            </div>

            {/* Category legend */}
            <div className="mb-8 flex flex-wrap gap-4">
              {(Object.entries(categoryLabels) as [MunicipalEvent["category"], string][]).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColor[key] }} />
                  {label}
                </div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-16">No events in this category.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {MONTHS.map((month, idx) => (
                  <MonthCard key={month} month={month} monthIndex={idx} events={eventsByMonth[idx] ?? []} />
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* ── Grid View ── */}
      {viewMode === "grid" && (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-16">No events in this category.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((event) => (
                  <Card key={event.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="outline" className={`text-xs ${categoryBadge[event.category]}`}>
                          {categoryLabels[event.category]}
                        </Badge>
                        {event.ticketed && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Ticket className="h-3 w-3" /> {event.price}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-foreground mb-2 leading-snug">{event.title}</h3>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-start gap-2 text-xs text-foreground">
                          <CalendarDays className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          {formatDate(event.date, event.endDate)}
                        </div>
                        <div className="flex items-start gap-2 text-xs text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          {event.location}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{event.description}</p>
                      <div className="border-t border-border pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Highlights</p>
                        <ul className="space-y-1">
                          {event.highlights.slice(0, 3).map((h) => (
                            <li key={h} className="text-xs text-foreground flex items-start gap-1.5">
                              <span className="mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                              {h}
                            </li>
                          ))}
                          {event.highlights.length > 3 && (
                            <li className="text-xs text-muted-foreground">+{event.highlights.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border">
                        Organized by {event.organizer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
