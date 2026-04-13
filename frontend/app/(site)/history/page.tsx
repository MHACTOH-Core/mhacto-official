"use client"

import { useState, useEffect } from "react"
import { asset } from "@/lib/utils"
import Image from "next/image"
import { BookOpen, Users, Clock, Calendar, Star, ChevronDown, ChevronUp, Shield, Loader2 } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { personCategoryLabels, type TimelineEvent, type NotablePerson } from "@/lib/data/history-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToTimelineEvent, cmsToNotablePerson } from "@/lib/cms-mappers"

const eraColor: Record<string, string> = {
  "Pre-Colonial Period": "bg-amber-500",
  "Spanish Colonial Period": "bg-orange-500",
  "Philippine Revolution": "bg-red-500",
  "American Colonial Period": "bg-blue-500",
  "World War II": "bg-gray-600",
  "Post-War Republic": "bg-green-600",
  "Contemporary": "bg-primary",
}

const categoryColor: Record<string, string> = {
  "national-hero": "bg-red-100 text-red-800 border-red-200",
  arts: "bg-purple-100 text-purple-800 border-purple-200",
  religion: "bg-amber-100 text-amber-700 border-amber-200",
  government: "bg-blue-100 text-blue-800 border-blue-200",
  education: "bg-green-100 text-green-800 border-green-200",
  sports: "bg-cyan-100 text-cyan-800 border-cyan-200",
}

const navSections = [
  { id: "notable-figures", label: "Remarkable Persons" },
  { id: "timeline", label: "Timeline" },
]



export default function HistoryPage() {
  const [activeSection, setActiveSection] = useState("notable-figures")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [notablePersons, setNotablePersons] = useState<NotablePerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetchByLabel("timeline-of-events").catch(() => null),
      apiFetchByLabel("notable-figures").catch(() => null),
    ]).then(([timelinePosts, figurePosts]) => {
      if (timelinePosts?.length) {
        const events = timelinePosts.map(cmsToTimelineEvent)
        events.sort((a, b) => {
          const yearA = parseInt(a.year.replace(/\D/g, "")) || 0
          const yearB = parseInt(b.year.replace(/\D/g, "")) || 0
          return yearA - yearB
        })
        setTimelineEvents(events)
      }
      if (figurePosts?.length) setNotablePersons(figurePosts.map(cmsToNotablePerson))
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...navSections].reverse()) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= 120) { setActiveSection(s.id); return }
      }
      setActiveSection("notable-figures")
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="history"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="BookOpen"
        fallbackAccentColor="amber-300"
        fallbackLabel="Bocaue Wonders"
        fallbackTitle="History of Bocaue"
        fallbackDescription="A town shaped by faith, revolution, and culture — walk through the centuries that defined Bocaue, Bulacan."
      />

            {/* Sticky nav */}
        <div className="sticky top-[57px] lg:top-[85px] z-40 border-b border-border bg-white/95 backdrop-blur-md shadow-sm">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex gap-1 overflow-x-auto py-1">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* ── Loading / Error ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading history...</span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Unable to load history data.</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {/* ── Remarkable Persons ── */}
      {!loading && !error && (
      <section id="notable-figures" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Remarkable Persons</h2>
              <p className="text-muted-foreground">Remarkable people who shaped Bocaue&apos;s identity</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {notablePersons.map((person) => (
              <Card key={person.id} className="overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                {person.image && (
                  <div className="relative h-36 overflow-hidden">
                    <Image src={person.image} alt={person.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <Badge variant="outline" className={`text-xs ${categoryColor[person.category] ?? ""}`}>
                        {personCategoryLabels[person.category]}
                      </Badge>
                    </div>
                    {person.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary/90 text-primary-foreground border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                          <Star className="h-2.5 w-2.5 mr-1" /> Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  {!person.image && (
                    <Badge variant="outline" className={`text-xs mb-3 self-start ${categoryColor[person.category] ?? ""}`}>
                      {personCategoryLabels[person.category]}
                    </Badge>
                  )}
                  <div className="mb-1 text-xs text-muted-foreground">{person.years}</div>
                  <h3 className="text-lg font-black text-foreground mb-0.5">{person.name}</h3>
                  <p className="text-xs text-primary font-semibold mb-1">{person.title}</p>
                  {person.author && <p className="text-xs text-muted-foreground/70 mb-2">By {person.author}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{person.description}</p>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Star className="h-3 w-3" /> Legacy</p>
                    <p className="text-xs text-foreground leading-relaxed">{person.legacy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Timeline ── */}
      {!loading && !error && (
      <section id="timeline" className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Clock className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Timeline of Events</h2>
              <p className="text-muted-foreground">From pre-colonial roots to the present day</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {timelineEvents.map((event, i) => (
                <div key={`${event.year}-${i}`} className="relative pl-12">
                  <div className={`absolute left-0 top-1.5 h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm ${eraColor[event.era] ?? "bg-primary"}`}>
                    <Calendar className="h-4 w-4" />
                  </div>
                  <Card className="overflow-hidden border-border hover:border-primary/30 hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <Badge variant="outline" className="text-xs font-bold">{event.year}</Badge>
                        <Badge variant="outline" className={`text-xs ${eraColor[event.era] ? eraColor[event.era].replace("bg-", "bg-") + " text-white border-0" : ""}`}>{event.era}</Badge>
                        {event.significance === "major" && <Badge className="text-xs bg-red-500 text-white border-0"><Shield className="h-2.5 w-2.5 mr-1" /> Major Event</Badge>}
                      </div>
                      <h3 className="text-base font-black text-foreground mb-1">{event.title}</h3>
                      {event.author && <p className="text-xs text-muted-foreground/70 mb-1">By {event.author}</p>}
                      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      {event.image && (
                        <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                          <Image src={event.image} alt={event.title} fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />
                        </div>
                      )}
                      <button
                        onClick={() => setExpandedId(expandedId === event.year ? null : event.year)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        {expandedId === event.year ? <><ChevronUp className="h-3.5 w-3.5" /> Hide details</> : <><ChevronDown className="h-3.5 w-3.5" /> Read more</>}
                      </button>
                      {expandedId === event.year && (
                        <p className="mt-3 text-sm text-foreground leading-relaxed border-t border-border pt-3">{event.details}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}
    </main>
  )
}
