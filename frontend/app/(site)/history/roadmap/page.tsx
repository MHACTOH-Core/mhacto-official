"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BookOpen, ChevronDown, ChevronUp, MapPin, Calendar, Sparkles,
  ArrowRight, Clock, Shield, Star,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { timelineEvents as fallbackTimeline, timelineEras, type TimelineEvent } from "@/lib/data/history-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToTimelineEvent } from "@/lib/cms-mappers"
import { asset } from "@/lib/utils"

const eraColor: Record<string, string> = {
  "Pre-Colonial Period": "bg-amber-500",
  "Spanish Colonial Period": "bg-orange-500",
  "Philippine Revolution": "bg-red-500",
  "American Colonial Period": "bg-blue-500",
  "World War II": "bg-gray-600",
  "Post-War Republic": "bg-green-600",
  "Contemporary": "bg-primary",
}

const significanceBadge: Record<TimelineEvent["significance"], string> = {
  major: "bg-red-100 text-red-800 border-red-200",
  notable: "bg-blue-100 text-blue-800 border-blue-200",
  cultural: "bg-amber-100 text-amber-800 border-amber-200",
}

const significanceLabel: Record<TimelineEvent["significance"], string> = {
  major: "Major Event",
  notable: "Notable",
  cultural: "Cultural",
}

type EraFilter = string | "all"

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const isLeft = index % 2 === 0
  const eraBg = eraColor[event.era] ?? "bg-primary"

  return (
    <div className="relative flex items-start gap-0 md:gap-8 group">
      {/* Left content (md+, left items) */}
      <div className={`hidden md:block md:w-1/2 ${isLeft ? "" : "md:order-last"}`}>
        <div className={`reveal-on-scroll ${isLeft ? "text-right pr-8" : "text-left pl-8"}`}>
          <div className={`rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/30 ${isLeft ? "text-right" : "text-left"}`}>
            {/* Era tag */}
            <div className={`mb-2 flex ${isLeft ? "justify-end" : "justify-start"}`}>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${eraBg}`}>
                {event.era}
              </span>
            </div>

            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary mb-2">
              {event.year}
            </span>

            <div className={`flex items-center gap-2 mb-2 ${isLeft ? "justify-end" : "justify-start"}`}>
              <Badge variant="outline" className={`text-xs ${significanceBadge[event.significance]}`}>
                {significanceLabel[event.significance]}
              </Badge>
            </div>

            <h3 className="text-lg font-black text-foreground mb-2 leading-snug">{event.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>

            {event.image && (
              <div className="relative h-36 mt-4 overflow-hidden rounded-xl">
                <Image src={event.image} alt={event.title} fill sizes="400px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}

            <button
              onClick={() => setExpanded(v => !v)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {expanded ? "Read less" : "Read more"}
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {expanded && (
              <div className={`mt-3 rounded-xl bg-muted/50 border border-border p-4 ${isLeft ? "text-right" : "text-left"}`}>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.details}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center dot */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10 flex flex-col items-center">
        <div className="relative">
          <div className={`h-5 w-5 rounded-full shadow-lg ring-4 ring-background ${eraBg}`} />
          <div className={`absolute inset-0 h-5 w-5 rounded-full opacity-40 animate-ping ${eraBg}`} style={{ animationDuration: "3s", animationIterationCount: "3", animationDelay: `${index * 0.3}s` }} />
        </div>
      </div>

      {/* Right side spacer (md+) */}
      <div className={`hidden md:block md:w-1/2 ${isLeft ? "md:order-last" : ""}`} />

      {/* Mobile content */}
      <div className="md:hidden pl-12 pb-2 w-full">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${eraBg} mb-2`}>
            {event.era}
          </span>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{event.year}</span>
            <Badge variant="outline" className={`text-xs ${significanceBadge[event.significance]}`}>{significanceLabel[event.significance]}</Badge>
          </div>
          <h3 className="text-base font-black text-foreground mb-1 leading-snug">{event.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
          {event.image && (
            <div className="relative h-32 mt-3 overflow-hidden rounded-xl">
              <Image src={event.image} alt={event.title} fill sizes="300px" className="object-cover" />
            </div>
          )}
          <button onClick={() => setExpanded(v => !v)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            {expanded ? "Read less" : "Read more"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expanded && (
            <div className="mt-3 rounded-xl bg-muted/50 border border-border p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{event.details}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const allEras = ["all", ...timelineEras.map(e => e.label)]

export default function HistoricalRoadmapPage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(fallbackTimeline)
  const [activeEra, setActiveEra] = useState<EraFilter>("all")

  useEffect(() => {
    apiFetchByLabel("timeline-of-events")
      .then((posts) => { if (posts?.length) setTimelineEvents(posts.map(cmsToTimelineEvent)) })
      .catch(() => {})
  }, [])

  const filtered = activeEra === "all"
    ? timelineEvents
    : timelineEvents.filter((e) => e.era === activeEra)

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="historical-roadmap"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackIcon="BookOpen"
        fallbackAccentColor="amber-300"
        fallbackLabel="History of Bocaue"
        fallbackTitle="Historical Roadmap"
        fallbackDescription="Walk through the centuries that shaped Bocaue — from pre-colonial settlements on the river's banks to the modern municipality of today."
        showBackButton
      />

      {/* Stats */}
      <section className="border-b border-border bg-primary/5 py-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
            {[
              { value: `${timelineEvents.length}+`, label: "Historical Events" },
              { value: "7", label: "Historical Eras" },
              { value: "c. 900", label: "Earliest Record" },
              { value: `${timelineEvents.filter(e => e.significance === "major").length}`, label: "Major Milestones" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center sm:items-start">
                <span className="text-2xl font-black text-primary">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Era legend */}
      <section className="border-b border-border bg-muted/30 py-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Filter by Era:</span>
            {allEras.map((era) => (
              <button
                key={era}
                onClick={() => setActiveEra(era)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeEra === era
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/40 hover:bg-muted text-muted-foreground"
                }`}
              >
                {era !== "all" && (
                  <span className={`h-2 w-2 rounded-full ${eraColor[era] ?? "bg-primary"}`} />
                )}
                {era === "all" ? "All Eras" : era.replace(" Period", "").replace(" Colonial", " Col.")}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              {filtered.length} Event{filtered.length !== 1 ? "s" : ""}
            </span>
            <h2 className="mt-2 text-3xl font-black text-foreground md:text-4xl lg:text-5xl font-heading">
              {activeEra === "all" ? "The Story of Bocaue" : activeEra}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Trace the journey of a riverside town through centuries of faith, artistry, and resilience.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-border via-primary/30 to-border md:-translate-x-px" />

            <div className="space-y-12">
              {filtered.map((event, index) => (
                <TimelineCard key={`${event.year}-${index}`} event={event} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Era summary */}
      <section className="border-t border-border bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black text-foreground mb-6">Historical Eras at a Glance</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {timelineEras.map((era) => {
              const count = timelineEvents.filter(e => e.era.startsWith(era.label.split(" ")[0])).length
              return (
                <button
                  key={era.label}
                  onClick={() => setActiveEra(timelineEvents.find(e => e.era.includes(era.label.split(" ")[0]))?.era ?? "all")}
                  className="group text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className={`h-2 w-10 rounded-full ${era.color} mb-3`} />
                  <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{era.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{count} event{count !== 1 ? "s" : ""}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-primary/5 border-t border-primary/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Want to explore more of Bocaue&apos;s history?</h3>
            <p className="text-sm text-muted-foreground mt-1">Visit our full history page for notable persons and heritage sites.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/history" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <BookOpen className="h-4 w-4" /> Full History
            </Link>
            <Link href="/history/historical-wonders" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors">
              Historical Wonders <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
