"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiFetchByLabel, type CMSPost } from "@/lib/api"
import {
  notablePersons as fallbackPersons,
  personCategoryLabels,
  type NotablePerson,
} from "@/lib/data/history-data"
import { cmsToNotablePerson } from "@/lib/cms-mappers"

const MAX_DISPLAY = 2

const categoryColor: Record<string, string> = {
  "national-hero": "bg-red-500",
  arts: "bg-purple-500",
  religion: "bg-amber-500",
  government: "bg-blue-500",
  education: "bg-green-500",
  sports: "bg-cyan-500",
}

export function HistoryHighlightsSection() {
  const [persons, setPersons] = useState<NotablePerson[]>(fallbackPersons)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetchByLabel("notable-figures")
      .then((posts) => {
        if (posts?.length) setPersons(posts.map(cmsToNotablePerson))
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Pick the first 2 (featured) notable figures
  const displayed = persons.slice(0, MAX_DISPLAY)

  if (!isLoading && displayed.length === 0) return null

  return (
    <section className="relative z-20 bg-muted/40 py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-12 sm:mb-16 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Users className="h-4 w-4" />
            Bocaue Wonders
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Notable Figures of Bocaue
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            Meet the remarkable people who shaped the identity and pride of
            Bocaue &mdash; from national heroes to celebrated artists.
          </p>
        </div>

        {/* Cards — always 2 side-by-side on sm+ */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {displayed.map((person, idx) => {
            const colorClass = categoryColor[person.category] ?? "bg-primary"
            const placeholderImg = "/images/places/Arts.jpg"

            return (
              <Link
                key={person.id}
                href="/history"
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 reveal-on-scroll delay-${(idx + 1) * 100}`}
              >
                {/* Image */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                  <Image
                    src={person.image ?? placeholderImg}
                    alt={person.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${colorClass} text-white border-0 text-[10px] uppercase tracking-wider`}>
                      {personCategoryLabels[person.category]}
                    </Badge>
                  </div>

                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg sm:text-2xl">
                      {person.name}
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">{person.title}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    {person.years}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 flex-1">
                    {person.description}
                  </p>

                  {/* Legacy */}
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Legacy
                    </p>
                    <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                      {person.legacy}
                    </p>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    View Full History
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center reveal-on-scroll delay-300">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full gap-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Link href="/history">
              Explore Full History
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
