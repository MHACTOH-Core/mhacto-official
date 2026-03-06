"use client"

import Image from "next/image"
import Link from "next/link"
import { Landmark, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { asset } from "@/lib/utils"
import {
  notablePersons,
  personCategoryLabels,
  type NotablePerson,
} from "@/lib/data/history-data"

const categoryBadge: Record<NotablePerson["category"], string> = {
  "national-hero": "bg-red-100 text-red-800 border-red-200",
  arts:            "bg-purple-100 text-purple-800 border-purple-200",
  religion:        "bg-blue-100 text-blue-800 border-blue-200",
  government:      "bg-amber-100 text-amber-800 border-amber-200",
  education:       "bg-sky-100 text-sky-800 border-sky-200",
  sports:          "bg-green-100 text-green-800 border-green-200",
}

/**
 * Two featured notable figures — auto-selected.
 * Change these indices to pick different ones.
 */
const FEATURED_FIGURES: NotablePerson[] = [
  notablePersons[0], // Gen. Proceso Into
  notablePersons[1], // Jose Corazon de Jesus
].filter(Boolean)

export function CulinarySection() {
  if (FEATURED_FIGURES.length === 0) return null

  return (
    <section
      id="notable-figures"
      className="relative z-20 bg-muted/40 py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Landmark className="h-4 w-4" />
            History of Bocaue
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Notable Figures
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            Meet the remarkable individuals who shaped Bocaue&apos;s identity — from revolutionary heroes to literary icons.
          </p>
        </div>

        {/* Cards — 2 items */}
        <div className="grid gap-6 sm:grid-cols-2 items-start">
          {FEATURED_FIGURES.map((person, idx) => {
            const imageUrl = person.image ?? asset("/images/placeholder-user.jpg")

            return (
              <Link
                key={person.id}
                href="/history/notable-persons"
                className={`group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(idx + 1) * 100}`}
              >
                {/* Image */}
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={person.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] border backdrop-blur-sm ${categoryBadge[person.category]}`}
                    >
                      {personCategoryLabels[person.category]}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-base font-black text-white leading-snug drop-shadow-md">
                      {person.name}
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">{person.title}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {person.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Learn More
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center reveal-on-scroll delay-300">
          <Link
            href="/history/notable-persons"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            View All Notable Figures
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
