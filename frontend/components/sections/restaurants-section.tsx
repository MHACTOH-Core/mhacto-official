"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { UtensilsCrossed, ArrowRight, MapPin, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { asset } from "@/lib/utils"
import { restaurants as fallbackRestaurants, type Restaurant } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToRestaurant } from "@/lib/cms-mappers"

const typeBadge: Record<Restaurant["type"], string> = {
  restaurant: "bg-blue-100 text-blue-800 border-blue-200",
  eatery:     "bg-orange-100 text-orange-800 border-orange-200",
  cafe:       "bg-amber-100 text-amber-800 border-amber-200",
  carinderia: "bg-green-100 text-green-800 border-green-200",
  bakery:     "bg-pink-100 text-pink-800 border-pink-200",
}

const typeLabel: Record<Restaurant["type"], string> = {
  restaurant: "Restaurant",
  eatery:     "Eatery",
  cafe:       "Café",
  carinderia: "Carinderia",
  bakery:     "Bakery",
}

const MAX_DISPLAY = 3

export function RestaurantsSection() {
  const [list, setList] = useState<Restaurant[]>(fallbackRestaurants)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetchByLabel("restaurants")
      .then((posts) => { if (posts?.length) setList(posts.map(cmsToRestaurant)) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const displayed = list.slice(0, MAX_DISPLAY)

  if (!isLoading && displayed.length === 0) return null

  return (
    <section className="relative z-20 bg-muted/40 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <UtensilsCrossed className="h-4 w-4" />
            Where to Eat
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Featured Restaurants &amp; Eateries
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            From heritage carinderias to riverside dining — explore Bocaue's best spots for authentic Bulacan flavors.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((place, idx) => {
            const imageUrl = place.image
              ? (place.image.startsWith("/images") ? asset(place.image) : place.image)
              : asset("/images/places/Food.jpg")

            return (
              <div
                key={place.id}
                className={`group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(idx + 1) * 100}`}
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={place.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] border backdrop-blur-sm ${typeBadge[place.type]}`}
                    >
                      {typeLabel[place.type]}
                    </Badge>
                  </div>
                  {place.isOpen && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-green-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                        Open
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-black text-card-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                    {place.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 mb-3">
                    {place.description}
                  </p>
                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {place.specialties.slice(0, 2).map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 text-[10px] bg-muted rounded-full px-2 py-0.5 text-foreground border border-border">
                        <Star className="h-2.5 w-2.5 text-amber-500 flex-shrink-0" />
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="line-clamp-1">{place.location}</span>
                    </div>
                    {place.hours && (
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="line-clamp-1">{place.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center reveal-on-scroll delay-300">
          <Link
            href="/culture/local-cuisine"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            See All Restaurants &amp; Eateries
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
