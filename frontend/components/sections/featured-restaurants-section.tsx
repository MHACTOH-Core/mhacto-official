"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Store, ArrowRight, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Restaurant } from "@/lib/data/culture-data"
import { apiFetchFeaturedByLabel, apiFetchByLabel } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { cmsToRestaurant } from "@/lib/cms-mappers"

const MAX_FEATURED = 3

const typeColors: Record<Restaurant["type"], string> = {
  restaurant: "bg-red-100 text-red-700 border-red-200",
  eatery:     "bg-orange-100 text-orange-700 border-orange-200",
  cafe:       "bg-amber-100 text-amber-700 border-amber-200",
  carinderia: "bg-yellow-100 text-yellow-700 border-yellow-200",
  bakery:     "bg-pink-100 text-pink-700 border-pink-200",
}

const typeLabel: Record<Restaurant["type"], string> = {
  restaurant: "Restaurant",
  eatery:     "Eatery",
  cafe:       "Café",
  carinderia: "Carinderia",
  bakery:     "Bakery",
}

export function FeaturedRestaurantsSection() {
  const [items, setItems] = useState<Restaurant[]>([])

  useEffect(() => {
    apiFetchFeaturedByLabel("restaurants", MAX_FEATURED)
      .then((posts: CMSPost[]) => {
        if (posts?.length) {
          setItems(posts.slice(0, MAX_FEATURED).map(cmsToRestaurant))
        } else {
          // Fallback: fetch any restaurants if none are featured
          return apiFetchByLabel("restaurants", MAX_FEATURED).then((all: CMSPost[]) => {
            if (all?.length) setItems(all.slice(0, MAX_FEATURED).map(cmsToRestaurant))
          })
        }
      })
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Store className="h-4 w-4" />
            Dine in Bocaue
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Restaurants &amp; Eateries
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            From beloved local carinderias to modern dining — discover the best places to eat in Bocaue, Bulacan.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <Link key={item.id} href={`/culture/local-cuisine`} className={`block reveal-on-scroll reveal-delay-${idx + 1}`}>
            <Card
              className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer h-full"
            >
              {item.image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs border ${typeColors[item.type]}`}
                    >
                      {typeLabel[item.type]}
                    </Badge>
                    {item.priceRange && (
                      <Badge variant="outline" className="text-xs border bg-white/90 text-foreground border-white/50">
                        {item.priceRange}
                      </Badge>
                    )}
                  </div>
                  {item.isOpen && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/90 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        Open
                      </span>
                    </div>
                  )}
                </div>
              )}
              <CardContent className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3 mt-1.5">
                  {item.description}
                </p>
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  {item.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground line-clamp-1">{item.location}</span>
                    </div>
                  )}
                  {item.hours && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground line-clamp-1">{item.hours}</span>
                    </div>
                  )}
                  {item.specialties && item.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.specialties.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
        {/* CTA */}
        <div className="mt-10 text-center reveal-on-scroll">
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
