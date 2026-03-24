"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  CalendarDays, Loader2,
  ChevronDown,
  Sparkles, TrendingUp, Star, Flame,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { apiFetchPublishedEvents, type NewsArticleAPI } from "@/lib/api"
import { useAPIData } from "@/hooks/use-api-data"

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const QUARTER_LABELS = ["Q1 · First Quarter","Q2 · Second Quarter","Q3 · Third Quarter","Q4 · Fourth Quarter"]
const QUARTER_COLORS = [
  "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
  "from-amber-500/10 to-amber-500/5 border-amber-500/20",
  "from-sky-500/10 to-sky-500/5 border-sky-500/20",
  "from-rose-500/10 to-rose-500/5 border-rose-500/20",
]
const QUARTER_DOT = ["bg-emerald-500","bg-amber-500","bg-sky-500","bg-rose-500"]

function getEventMonth(ev: NewsArticleAPI) {
  const dateStr = ev.newsDate ?? ev.createdAt
  return new Date(dateStr).getMonth()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
}

// ── Calendar Month Card ──────────────────────────────────────────────
function MonthCard({ month, monthIndex, events, quarterColor }: { month: string; monthIndex: number; events: NewsArticleAPI[]; quarterColor: string }) {
  const [expanded, setExpanded] = useState(false)
  const hasEvents = events.length > 0
  const isCurrentMonth = new Date().getMonth() === monthIndex

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
        hasEvents
          ? "border-primary/20 bg-card shadow-sm cursor-pointer"
          : "border-border/50 bg-muted/20"
      } ${isCurrentMonth && hasEvents ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}`}
      onClick={() => hasEvents && setExpanded((v) => !v)}
    >
      {/* Active month top accent bar */}
      {hasEvents && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
      )}

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Month number badge */}
            <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black transition-all duration-300 ${
              hasEvents
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted/60 text-muted-foreground/50"
            }`}>
              <span className="text-lg">{monthIndex + 1}</span>
              {isCurrentMonth && hasEvents && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                  <Star className="h-2.5 w-2.5 text-amber-900 fill-amber-900" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold tracking-wide ${hasEvents ? "text-foreground" : "text-muted-foreground/60"}`}>
                  {month}
                </p>
                {isCurrentMonth && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Now</span>
                )}
              </div>
              <p className={`text-xs ${hasEvents ? "text-primary font-semibold" : "text-muted-foreground/50"}`}>
                {events.length === 0 ? "No scheduled events" : `${events.length} event${events.length > 1 ? "s" : ""} scheduled`}
              </p>
            </div>
          </div>
          {hasEvents && (
            <div className="flex items-center gap-2">
              {/* Event count pill */}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                {events.length}
              </span>
              <div className={`rounded-full p-1 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Compact event preview dots */}
        {hasEvents && !expanded && (
          <div className="mt-3 flex items-center gap-1.5">
            {events.map((e) => (
              <span
                key={e.id}
                className={`h-1.5 flex-1 rounded-full ${quarterColor} transition-all`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expanded event list */}
      <div className={`grid transition-all duration-500 ease-out ${expanded && hasEvents ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="border-t border-border/60 px-4 pb-4 pt-3 space-y-2.5">
            {events.map((ev) => {
              const dateStr = ev.newsDate ?? ev.createdAt
              return (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/evt flex items-start gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-background to-muted/20 p-3 hover:border-primary/30 hover:shadow-md hover:from-primary/5 hover:to-background transition-all duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${quarterColor} text-[10px] font-bold text-foreground`}>
                    {formatDateShort(dateStr).split(" ")[1]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground leading-snug group-hover/evt:text-primary transition-colors line-clamp-1">{ev.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <CalendarDays className="h-3 w-3 text-primary/60 flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground">{formatDate(dateStr)}</span>
                    </div>
                    {ev.body && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-1">{ev.body}</p>
                    )}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 -rotate-90 mt-1 flex-shrink-0 group-hover/evt:text-primary transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { data: events = [], isLoading: loading, error } = useAPIData<NewsArticleAPI[]>(
    "published-events",
    () => apiFetchPublishedEvents(),
  )

  const eventsByMonth = useMemo(() => {
    const map: Record<number, NewsArticleAPI[]> = {}
    for (let i = 0; i < 12; i++) map[i] = []
    const seen = new Set<string>()
    for (const ev of events) {
      if (seen.has(ev.id)) continue
      seen.add(ev.id)
      map[getEventMonth(ev)].push(ev)
    }
    return map
  }, [events])

  const activeMonths = Object.values(eventsByMonth).filter((a) => a.length > 0).length

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <PageHero
        pageSlug="events"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="CalendarDays"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Events"
        fallbackTitle="Municipal Events"
        fallbackDescription="Festivals, civic programs, sports competitions, and cultural celebrations throughout the Bocaue calendar year."
        showBackButton
      />

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
      {!loading && events.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {/* ── Header ── */}
            <div className="mb-14 reveal-on-scroll">
              <div className="flex flex-col lg:flex-row lg:items-end gap-8 justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                      Calendar of Activities · {new Date().getFullYear()}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
                    Discover What&apos;s
                    <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                      Happening in Bocaue
                    </span>
                  </h2>
                  <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
                    From vibrant festivals to community celebrations — click any active month to explore upcoming events and plan your visit.
                  </p>
                </div>

                {/* Stats cards */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center rounded-2xl border-2 border-primary/15 bg-gradient-to-b from-primary/5 to-transparent px-6 py-4 min-w-[100px]">
                    <Flame className="h-4 w-4 text-primary mb-1" />
                    <p className="text-3xl font-black bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">{events.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Events</p>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border-2 border-primary/15 bg-gradient-to-b from-primary/5 to-transparent px-6 py-4 min-w-[100px]">
                    <TrendingUp className="h-4 w-4 text-primary mb-1" />
                    <p className="text-3xl font-black bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">{activeMonths}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Active Months</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Quarterly month grid ── */}
            <div className="space-y-10">
              {[0, 1, 2, 3].map((q) => {
                const qMonths = [q * 3, q * 3 + 1, q * 3 + 2]
                const qEvents = qMonths.reduce((sum, m) => sum + (eventsByMonth[m]?.length ?? 0), 0)
                return (
                  <div key={q} className="reveal-on-scroll">
                    {/* Quarter header */}
                    <div className={`flex items-center gap-3 mb-4 pb-3 border-b border-border/40`}>
                      <div className={`h-2.5 w-2.5 rounded-full ${QUARTER_DOT[q]}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{QUARTER_LABELS[q]}</span>
                      {qEvents > 0 && (
                        <span className="ml-auto rounded-full bg-primary/10 px-3 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                          {qEvents} event{qEvents > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
                      {qMonths.map((idx) => (
                        <MonthCard
                          key={MONTHS[idx]}
                          month={MONTHS[idx]}
                          monthIndex={idx}
                          events={eventsByMonth[idx] ?? []}
                          quarterColor={QUARTER_DOT[q]}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}
