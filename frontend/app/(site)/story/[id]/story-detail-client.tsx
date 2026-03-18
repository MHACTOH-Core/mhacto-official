"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { apiFetchMilestones, type Milestone } from "@/lib/api"

export default function StoryDetailClient({ id }: { id: number }) {
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetchMilestones()
      .then((milestones) => {
        const found = milestones.find((m) => m.milestoneId === id)
        setMilestone(found ?? null)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-12 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    )
  }

  if (!milestone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold text-foreground">Story not found</h1>
        <Link href="/#story-of-bocaue" className="text-primary hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to timeline
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <Link
            href="/#story-of-bocaue"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to The Story of Bocaue
          </Link>

          <div className="flex items-center gap-3 mb-4 reveal-on-scroll">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              <Calendar className="h-3.5 w-3.5" />
              {milestone.year}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-heading leading-tight reveal-on-scroll">
            {milestone.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {milestone.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-none reveal-on-scroll">
          <div className="text-foreground leading-relaxed whitespace-pre-line text-base md:text-lg">
            {milestone.detail}
          </div>
        </article>

        {/* Bottom navigation */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link
            href="/#story-of-bocaue"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to The Story of Bocaue
          </Link>
        </div>
      </div>
    </div>
  )
}
