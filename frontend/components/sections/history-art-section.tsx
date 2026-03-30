"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { apiFetchMilestones, type Milestone } from "@/lib/api"

/** Milestone data shape used by the timeline UI */
interface TimelineMilestone {
  milestoneId?: number
  year: string
  title: string
  description: string
  detail: string
  side: "left" | "right"
}

function TimelineItem({ event, index }: { event: TimelineMilestone; index: number }) {
  const isLeft = event.side === "left"
  const href = event.milestoneId ? `/story/${event.milestoneId}` : "#"

  return (
    <div className="relative flex items-start gap-0 md:gap-8">
      {/* Left content (visible on md+ for left-side items) */}
      <div className={`hidden md:block md:w-1/2 ${isLeft ? "" : "md:order-last"}`}>
        <div className={`reveal-on-scroll ${isLeft ? "text-right pr-8" : "text-left pl-8"}`}>
          <Link href={href} className="block group">
            <div className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30 ${isLeft ? "text-right" : "text-left"}`}>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
                {event.year}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                Read full story
                <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Center dot on the line */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10 flex flex-col items-center">
        <div className="relative reveal-on-scroll">
          <div className="h-5 w-5 rounded-full bg-primary shadow-lg shadow-primary/30 ring-4 ring-background" />
          <div className="absolute inset-0 h-5 w-5 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "3s", animationIterationCount: "3", animationDelay: `${index * 0.5}s` }} />
        </div>
      </div>

      {/* Spacer for the other side (md+) */}
      <div className={`hidden md:block md:w-1/2 ${isLeft ? "md:order-last" : ""}`} />

      {/* Mobile content (visible below md) */}
      <div className="md:hidden pl-12 pb-2 w-full">
        <div className="reveal-on-scroll">
          <Link href={href} className="block group">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
                {event.year}
              </span>
              <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                Read full story
                <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function HistoryArtSection() {
  const [timelineMilestones, setTimelineMilestones] = useState<TimelineMilestone[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Sends GET /api/home/milestones.php → PHP runs SQL SELECT on milestone table → returns JSON
  useEffect(() => {
    apiFetchMilestones()
      .then((milestones) => {
        if (milestones && milestones.length > 0) {
          // Convert API Milestone shape to the timeline UI format
          const mappedMilestones: TimelineMilestone[] = milestones.map((milestone, idx) => ({
            milestoneId: milestone.milestoneId,
            year: milestone.year,
            title: milestone.title,
            description: milestone.description,
            detail: milestone.detail,
            side: milestone.side ?? (idx % 2 === 0 ? "left" : "right"),
          }))
          // Sort ascending by year
          mappedMilestones.sort((a, b) => {
            const yearA = parseInt(a.year.replace(/\D/g, "")) || 0
            const yearB = parseInt(b.year.replace(/\D/g, "")) || 0
            return yearA - yearB
          })
          setTimelineMilestones(mappedMilestones)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Don't render if no milestones loaded
  if (!isLoading && timelineMilestones.length === 0) return null

  return (
    <section id="story-of-bocaue" className="relative bg-background py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center reveal-on-scroll">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Heritage &amp; Culture
          </span>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl font-heading">
            The Story of Bocaue
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground">
            Trace the journey of a riverside town through centuries of faith, artistry, and resilience &mdash; from its founding in 1580 to the world stage today.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          {/* Static glowing line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/60 to-transparent md:-translate-x-px" />

          <div className="space-y-12 md:space-y-16">
            {timelineMilestones.slice(0, 3).map((milestone, milestoneIndex) => (
              <TimelineItem key={milestone.milestoneId ?? `milestone-${milestoneIndex}`} event={milestone} index={milestoneIndex} />
            ))}
          </div>

          {/* End cap */}
          <div className="absolute left-4 md:left-1/2 bottom-0 md:-translate-x-1/2 -translate-x-1/2">
            <div className="h-3 w-3 rounded-full bg-primary/40 ring-4 ring-background" />
          </div>
        </div>

        {/* See Full Story CTA */}
        <div className="mt-12 text-center reveal-on-scroll">
          <Link
            href="/history/timeline"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
          >
            See Full Story
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
