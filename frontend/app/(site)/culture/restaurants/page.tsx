"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Store, MapPin, Clock, Star,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GalleryImage } from "@/components/ui/gallery-image"
import { type Restaurant } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToRestaurant } from "@/lib/cms-mappers"

// ── Restaurant type config ───────────────────────────────────────────
const restaurantTypeLabel: Record<Restaurant["type"], string> = {
  restaurant: "Restaurant",
  eatery: "Eatery",
  cafe: "Café",
  carinderia: "Carinderia",
  bakery: "Bakery",
}

const restaurantTypeBadge: Record<Restaurant["type"], string> = {
  restaurant: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
  eatery: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300",
  cafe: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  carinderia: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300",
  bakery: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300",
}

const priceLabel: Record<string, string> = {
  "₱": "Budget-friendly",
  "₱₱": "Mid-range",
  "₱₱₱": "Premium",
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  useEffect(() => {
    apiFetchByLabel("restaurants")
      .then((posts) => { if (posts?.length) setRestaurants(posts.map(cmsToRestaurant)) })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <PageHero
        pageSlug="restaurants"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Store"
        fallbackAccentColor="red-300"
        fallbackLabel="Dining"
        fallbackTitle="Restaurants & Eateries"
        fallbackDescription="From beloved carinderias to cozy cafés — discover the best places to eat in Bocaue."
        showBackButton
      />

      {/* ── Restaurants list ── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Where to Eat in Bocaue</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {restaurants.length} place{restaurants.length !== 1 ? "s" : ""} — from heritage kitchens to street-side carinderias
              </p>
            </div>
          </div>

          {restaurants.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">No restaurants found.</p>
          ) : (
            <div className="space-y-8">
              {restaurants.map((place, idx) => (
                <Link key={place.id} href={`/culture/restaurants/${place.id}`} className="block">
                  <Card className="relative overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                    <div className={`grid gap-0 ${idx % 2 === 0 ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]"}`}>
                      {idx % 2 === 0 && (
                        <GalleryImage
                          src={place.image ?? "/images/defaults/no-image.svg"}
                          alt={place.name}
                          outerClassName="h-full"
                          className="relative flex-1 overflow-hidden min-h-[260px]"
                          imageClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs border backdrop-blur-sm ${restaurantTypeBadge[place.type]}`}>
                              {restaurantTypeLabel[place.type]}
                            </Badge>
                            {place.priceRange && (
                              <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                {place.priceRange}
                              </span>
                            )}
                          </div>
                          {place.isOpen && (
                            <div className="absolute top-3 right-3">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-green-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                                Open
                              </span>
                            </div>
                          )}
                        </GalleryImage>
                      )}

                      <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className={`text-xs border ${restaurantTypeBadge[place.type]}`}>
                              {restaurantTypeLabel[place.type]}
                            </Badge>
                            {place.priceRange && (
                              <Badge variant="outline" className="text-xs">
                                {place.priceRange} · {priceLabel[place.priceRange]}
                              </Badge>
                            )}
                            {place.isOpen && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                Open
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">
                            {place.name}
                          </h3>
                          {place.author && <p className="text-xs text-muted-foreground/70 mb-2">By {place.author}</p>}
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                            {place.description}
                          </p>
                          {place.specialties.length > 0 && (
                            <div className="mb-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-500" /> Specialties
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {place.specialties.slice(0, 4).map((s) => (
                                  <span key={s} className="text-[11px] bg-muted rounded-full px-2.5 py-0.5 text-foreground border border-border">
                                    {s}
                                  </span>
                                ))}
                                {place.specialties.length > 4 && (
                                  <span className="text-[11px] bg-muted rounded-full px-2.5 py-0.5 text-muted-foreground border border-border">
                                    +{place.specialties.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2 text-xs text-foreground">
                              <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                              {place.location}
                            </div>
                            {place.hours && (
                              <div className="flex items-start gap-2 text-xs text-foreground">
                                <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                                {place.hours}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      {idx % 2 !== 0 && (
                        <GalleryImage
                          src={place.image ?? "/images/defaults/no-image.svg"}
                          alt={place.name}
                          outerClassName="h-full order-first md:order-last"
                          className="relative flex-1 overflow-hidden min-h-[260px]"
                          imageClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs border backdrop-blur-sm ${restaurantTypeBadge[place.type]}`}>
                              {restaurantTypeLabel[place.type]}
                            </Badge>
                            {place.priceRange && (
                              <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                {place.priceRange}
                              </span>
                            )}
                          </div>
                          {place.isOpen && (
                            <div className="absolute top-3 left-3">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-green-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                                Open
                              </span>
                            </div>
                          )}
                        </GalleryImage>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
