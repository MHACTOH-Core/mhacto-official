"use client"

import Image from "next/image"
import Link from "next/link"
import { Compass, ArrowRight, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { apiFetchByLabel } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"

const MAX_RESTAURANTS_DISPLAY = 4


export function RestaurantsSection() {
  const [restaurants, setRestaurants] = useState<CMSPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetchByLabel("restaurants")
      .then((items) => {
        if (items && items.length > 0) setRestaurants(items)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const displayed = restaurants.slice(0, MAX_RESTAURANTS_DISPLAY)
  if (!isLoading && displayed.length === 0) return null

  return (
    <section className="relative z-20 bg-muted/40 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Compass className="h-4 w-4" />
            Featured Restaurants & Eateries
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Taste Bocaue&apos;s Local Flavors
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            Discover the best places to eat in Bocaue — from family-run eateries to local favorites.
          </p>
        </div>

        {/* Cards — up to 4 items */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-start">
          {displayed.map((item, idx) => (
            <Link
              key={item.id}
              href="/places/restaurants"
              className={`group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(idx + 1) * 100}`}
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={item.image?.[0] || "/images/places/restaurant.jpg"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="outline"
                    className="text-[10px] border backdrop-blur-sm bg-orange-100 text-orange-800 border-orange-200"
                  >
                    {item.category || "Restaurant"}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-black text-card-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 mb-3">
                  {item.body}
                </p>
                <div className="border-t border-border pt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    {item.location || "Bocaue"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        {displayed.length > 0 && (
          <div className="mt-10 text-center reveal-on-scroll delay-300">
            <Link
              href="/places/restaurants"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              See All Restaurants
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
