"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, CalendarDays, Loader2,
  LayoutGrid, CalendarRange, ChevronDown, ChevronUp,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { asset } from "@/lib/utils"
import { apiFetchPublishedEvents, type NewsArticleAPI } from "@/lib/api"

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

function getEventMonth(ev: NewsArticleAPI) {
  const dateStr = ev.newsDate ?? ev.createdAt
  return new Date(dateStr).getMonth()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
}

// ── Calendar Month Card ──────────────────────────────────────────────
function MonthCard({ month, monthIndex, events }: { month: string; monthIndex: number; events: NewsArticleAPI[] }) {
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
                  className="h-2 w-2 rounded-full bg-primary flex-shrink-0"
                />
              ))}
            </div>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </div>

      {expanded && hasEvents && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {events.map((ev) => {
            const dateStr = ev.newsDate ?? ev.createdAt
            return (
              <div key={ev.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-800 border-blue-200">
                    Event
                  </Badge>
                </div>
                <p className="text-sm font-black text-foreground leading-snug">{ev.title}</p>
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3 text-primary flex-shrink-0" />
                    {formatDate(dateStr)}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">{ev.body}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

type ViewMode = "grid" | "calendar"

export default function EventsPage() {
  const [events, setEvents] = useState<NewsArticleAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")

  // Sends GET /api/posts/read.php?type=events → PHP runs SQL SELECT on content WHERE post_type='event' → returns JSON
  useEffect(() => {
    apiFetchPublishedEvents()
      .then((data) => setEvents(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const eventsByMonth = useMemo(() => {
    const map: Record<number, NewsArticleAPI[]> = {}
    for (let i = 0; i < 12; i++) map[i] = []
    for (const ev of events) map[getEventMonth(ev)].push(ev)
    return map
  }, [events])

  const activeMonths = Object.values(eventsByMonth).filter((a) => a.length > 0).length

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <PageHero
        pageSlug="events"
        fallbackImage="/images/places/river-festival.jpg"
        fallbackIcon="CalendarDays"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Events"
        fallbackTitle="Municipal Events"
        fallbackDescription="Festivals, civic programs, sports competitions, and cultural celebrations throughout the Bocaue calendar year."
        showBackButton
      />

      {/* ── Controls bar ── */}
      <section className="border-b border-border bg-muted/40 py-3 sticky top-0 z-30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-end">
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

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading events...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Unable to load events.</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-20">
          <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No events published yet.</p>
        </div>
      )}

      {/* ── Calendar View ── */}
      {!loading && events.length > 0 && viewMode === "calendar" && (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarRange className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Calendar of Activities</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">Event Schedule</h2>
                <p className="text-muted-foreground mt-1 text-sm">Click any highlighted month to expand event details.</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-primary">{events.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Events</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-primary">{activeMonths}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Months</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
              {MONTHS.map((month, idx) => (
                <MonthCard key={month} month={month} monthIndex={idx} events={eventsByMonth[idx] ?? []} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Grid View ── */}
      {!loading && events.length > 0 && viewMode === "grid" && (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {events.map((event) => {
                const dateStr = event.newsDate ?? event.createdAt
                return (
                  <Card key={event.id} className="group overflow-hidden border-border transition-all duration-300 flex flex-col">
                    {/* Image */}
                    {event.image.length > 0 && (
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <Image
                          src={event.image[0]}
                          alt={event.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                          loading="lazy"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        {event.isFeatured && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-red-500/90 text-white border-0 text-xs">Featured</Badge>
                          </div>
                        )}
                      </div>
                    )}
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                          Event
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(dateStr)}
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-foreground mb-2 leading-snug">{event.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">{event.body}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
