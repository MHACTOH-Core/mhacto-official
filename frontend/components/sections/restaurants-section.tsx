"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, UtensilsCrossed, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { asset } from "@/lib/utils"
import { apiFetchByLabel } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"

/** Maximum restaurant cards shown on the homepage */
const MAX_DISPLAY = 4

export function RestaurantsSection() {
  const [restaurants, setRestaurants] = useState<CMSPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetchByLabel("restaurants")
      .then((items) => {
        if (items && items.length > 0) {
          setRestaurants(items)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const displayed = restaurants.slice(0, MAX_DISPLAY)

  if (!isLoading && displayed.length === 0) return null

  return (
    <section className="relative z-20 bg-background py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <UtensilsCrossed className="h-4 w-4" />
            Taste of Bocaue
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Featured Restaurants &amp; Eateries
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            From beloved hole-in-the-wall spots to family restaurants, discover where the locals eat in Bocaue.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {displayed.map((item, cardIndex) => {
            const imageUrl = item.image?.[0]
              ? (item.image[0].startsWith("/images") ? asset(item.image[0]) : item.image[0])
              : asset("/images/places/local-delicacies.jpg")

            return (
              <div
                key={item.id}
                className={`group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(cardIndex + 1) * 100}`}
              >
                {/* Image */}
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {item.category && (
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-primary/90 text-primary-foreground border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm"
                      >
                        {item.category}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {item.body}
                  </p>

                  {/* Meta */}
                  {(item.location || item.hours) && (
                    <div className="mt-3 border-t border-border pt-3 space-y-1.5">
                      {item.location && (
                        <div className="flex items-center gap-2 text-xs text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                      {item.hours && (
                        <div className="flex items-center gap-2 text-xs text-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{item.hours}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    href="/culture/local-cuisine"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary"
                  >
                    View More
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        {restaurants.length > 0 && (
          <div className="mt-10 text-center reveal-on-scroll delay-300">
            <Link
              href="/culture/local-cuisine"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"
            >
              Discover All Eateries
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
