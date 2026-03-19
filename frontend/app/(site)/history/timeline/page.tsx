"use client"

import { useState, useEffect } from "react"
import { asset } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BookOpen, Clock, Star, ChevronDown, ChevronUp } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type TimelineEvent } from "@/lib/data/history-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToTimelineEvent } from "@/lib/cms-mappers"

const significanceBadge: Record<TimelineEvent["significance"], { label: string; className: string }> = {
  major: { label: "Major Event", className: "bg-primary/10 text-primary border-primary/20" },
  notable: { label: "Notable", className: "bg-secondary/20 text-secondary-foreground border-secondary/30" },
  cultural: { label: "Cultural", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800" },
}

export default function TimelinePage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Sends GET /api/posts/read.php?label=timeline-of-events&status=published → PHP runs SQL SELECT → returns JSON
  useEffect(() => {
    apiFetchByLabel("timeline-of-events")
      .then((posts) => { if (posts?.length) setTimelineEvents(posts.map(cmsToTimelineEvent)) })
      .catch(() => {})
  }, [])

  const toggle = (year: string) =>
    setExpandedId((prev) => (prev === year ? null : year))

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="timeline"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Clock"
        fallbackAccentColor="amber-300"
        fallbackLabel="History"
        fallbackTitle="Historical Roadmap of Bocaue"
        fallbackDescription="Trace Bocaue's journey from pre-colonial river settlements to a world-record-holding modern municipality — a living roadmap through over 1,000 years of heritage."
        showBackButton
      />

      {/* Intro */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-muted/40 to-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3 text-center">
            {[
              { icon: Clock, label: "1,000+ Years of History", sub: "From c. 900 CE to the present" },
              { icon: BookOpen, label: "11 Documented Eras", sub: "Pre-colonial to Contemporary" },
              { icon: Star, label: "Rich Living Heritage", sub: "Traditions preserved to this day" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-bold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Historical Roadmap</h2>
              <p className="text-muted-foreground">Click any milestone to read the full story</p>
            </div>
          </div>

          {/* Vertical timeline */}
          <div className="relative">
            {/* Center line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border sm:left-8" />

            <div className="space-y-8">
              {timelineEvents.map((event, idx) => {
                const isExpanded = expandedId === `${event.year}-${idx}`
                const badge = significanceBadge[event.significance]

                return (
                  <div key={`${event.year}-${idx}`} className="relative pl-16 sm:pl-20">
                    {/* Dot */}
                    <div
                      className={`absolute left-4 sm:left-6 top-4 h-4 w-4 rounded-full border-2 border-background ring-2 ${
                        event.significance === "major"
                          ? "bg-primary ring-primary/30"
                          : event.significance === "cultural"
                          ? "bg-amber-500 ring-amber-300/40"
                          : "bg-secondary ring-secondary/30"
                      }`}
                    />

                    <Card
                      className={`overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md border-border ${
                        isExpanded ? "shadow-lg border-primary/30" : ""
                      }`}
                      onClick={() => toggle(`${event.year}-${idx}`)}
                    >
                      <CardContent className="p-0">
                        {/* Card header */}
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-lg sm:text-xl font-black text-primary">{event.year}</span>
                                <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted">
                                  {event.era}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${badge.className}`}
                                >
                                  {badge.label}
                                </Badge>
                              </div>
                              <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                                {event.title}
                              </h3>
                              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                                {event.description}
                              </p>
                            </div>
                            <button
                              className="flex-shrink-0 mt-1 text-muted-foreground hover:text-primary transition-colors"
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-border px-4 pb-5 sm:px-5 pt-4 bg-muted/30 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                            {event.image && (
                              <div className="relative h-52 sm:h-64 w-full overflow-hidden rounded-lg mb-4">
                                <Image
                                  src={event.image}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <p className="text-sm text-foreground leading-relaxed">{event.details}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom nav */}
          <div className="mt-16 flex flex-col sm:flex-row gap-4 pt-8 border-t border-border">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/history/remarkable-persons">
                <BookOpen className="h-4 w-4" />
                Remarkable Persons of Bocaue
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
