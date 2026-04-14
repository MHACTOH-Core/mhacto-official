"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Utensils, Clock, MapPin,
  ChevronLeft, ChevronRight, Flame, Leaf, UtensilsCrossed, Coffee, Store, Star,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GalleryImage } from "@/components/ui/gallery-image"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { type CuisineItem, type Restaurant } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToCuisineItem, cmsToRestaurant } from "@/lib/cms-mappers"

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
  "\u20b1": "Budget-friendly",
  "\u20b1\u20b1": "Mid-range",
  "\u20b1\u20b1\u20b1": "Premium",
}

// ── type helpers ────────────────────────────────────────────────────
const typeLabels: Record<CuisineItem["type"], string> = {
  main: "Main Dish",
  snack: "Snack",
  dessert: "Dessert & Sweets",
  drink: "Drink",
}

const typeBadge: Record<CuisineItem["type"], string> = {
  main: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  snack: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  dessert: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  drink: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
}

const typeIcon: Record<CuisineItem["type"], React.ReactNode> = {
  main: <Flame className="h-4 w-4" />,
  snack: <Leaf className="h-4 w-4" />,
  dessert: <UtensilsCrossed className="h-4 w-4" />,
  drink: <Coffee className="h-4 w-4" />,
}

type TypeFilter = CuisineItem["type"] | "all"

// ── Expandable cuisine card ──────────────────────────────────────────
function CuisineCard({ item, featured }: { item: CuisineItem; featured?: boolean }) {
  return (
    <Link href={`/culture/culinary-wonders/${item.id}`} className="block">
    <Card
      className={`group overflow-hidden border-border transition-all duration-300 flex flex-col ${
        featured
          ? "hover:shadow-2xl hover:border-primary/50 shadow-lg"
          : "hover:shadow-lg hover:border-primary/30"
      }`}
    >
      {/* Image */}
      <GalleryImage
        src={item.image}
        alt={item.name}
        className={`relative overflow-hidden ${featured ? "h-72 sm:h-80" : "h-52"}`}
        imageClassName="object-cover group-hover:scale-105 transition-transform duration-700"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {featured && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
              ✨ Featured Delicacy
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <Badge variant="outline" className={`text-xs border ${typeBadge[item.type]} backdrop-blur-sm`}>
            {typeLabels[item.type]}
          </Badge>
        </div>
      </GalleryImage>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="mb-1">
          <h3 className={`font-black text-foreground leading-snug group-hover:text-primary transition-colors ${featured ? "text-xl" : "text-lg"}`}>
            {item.name}
          </h3>
          {item.tagalogName && item.tagalogName !== item.name && (
            <p className="text-xs text-muted-foreground italic">{item.tagalogName}</p>
          )}
          {item.author && <p className="text-xs text-muted-foreground/70 mt-0.5">By {item.author}</p>}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-2 mb-4">{item.description}</p>

        {/* Where & time */}
        <div className="border-t border-border pt-3 space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-foreground">{item.where.join(" · ")}</p>
          </div>
          {item.bestTime && (
            <div className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-foreground">{item.bestTime}</p>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
    </Link>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default function CulinaryWondersPage() {
  const [culinaryWonders, setCulinaryWonders] = useState<CuisineItem[]>([])
  const [restaurantList, setRestaurantList] = useState<Restaurant[]>([])
  const [activeType, setActiveType] = useState<TypeFilter>("all")
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [isPlaying, setIsPlaying] = useState(true)

  const types: TypeFilter[] = ["all", "main", "snack", "dessert", "drink"]
  const filtered = activeType === "all" ? culinaryWonders : culinaryWonders.filter((c) => c.type === activeType)

  // Featured items for carousel (fall back to all if none marked)
  const featuredItems = culinaryWonders.filter((c) => c.isFeatured)
  const carouselItems = featuredItems.length > 0 ? featuredItems : culinaryWonders
  const canLoop = carouselItems.length >= 3
  const currentCarouselItem = carouselItems[featuredIndex] ?? carouselItems[0]
  const rest = filtered.filter((c) => c.id !== currentCarouselItem?.id)

  // Sync carousel API → featuredIndex
  useEffect(() => {
    if (!carouselApi) return
    const onSelect = () => setFeaturedIndex(carouselApi.selectedScrollSnap())
    carouselApi.on("select", onSelect)
    return () => { carouselApi.off("select", onSelect) }
  }, [carouselApi])

  // Auto-play
  useEffect(() => {
    if (!carouselApi || !isPlaying || carouselItems.length <= 1) return
    const id = setInterval(() => {
      if (canLoop || carouselApi.canScrollNext()) {
        carouselApi.scrollNext()
      } else {
        carouselApi.scrollTo(0)
      }
    }, 5000)
    return () => clearInterval(id)
  }, [carouselApi, isPlaying, canLoop, carouselItems.length])

  const pauseAutoPlay = useCallback(() => {
    setIsPlaying(false)
    setTimeout(() => setIsPlaying(true), 10000)
  }, [])

  useEffect(() => {
    Promise.all([
      apiFetchByLabel("local-cuisine").catch(() => null),
      apiFetchByLabel("restaurants").catch(() => null),
    ]).then(([cuisine, restaurants]) => {
      if (cuisine?.length) setCulinaryWonders(cuisine.map(cmsToCuisineItem))
      if (restaurants?.length) setRestaurantList(restaurants.map(cmsToRestaurant))
    })
  }, [])

  const handlePrev = () => {
    pauseAutoPlay()
    if (carouselApi) {
      if (canLoop || carouselApi.canScrollPrev()) {
        carouselApi.scrollPrev()
      } else {
        carouselApi.scrollTo(carouselItems.length - 1)
      }
    }
  }
  const handleNext = () => {
    pauseAutoPlay()
    if (carouselApi) {
      if (canLoop || carouselApi.canScrollNext()) {
        carouselApi.scrollNext()
      } else {
        carouselApi.scrollTo(0)
      }
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <PageHero
        pageSlug="culinary-wonders"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Utensils"
        fallbackAccentColor="amber-300"
        fallbackLabel="Local Culinary"
        fallbackTitle="Taste of Bocaue"
        fallbackDescription="From legendary crispy chicharon to generations-old kakanin — explore the flavors, stories, and traditions behind Bocaue's most beloved delicacies."
        showBackButton
      />

      {/* ── Sticky filter bar ── */}
      <section className="border-b border-border bg-muted/40 py-3 sticky top-0 z-30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            {types.map((t) => (
              <Button
                key={t}
                variant={activeType === t ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveType(t)}
                className="text-xs capitalize gap-1.5"
              >
                {t !== "all" && <span>{typeIcon[t as CuisineItem["type"]]}</span>}
                {t === "all" ? "All Delicacies" : typeLabels[t as CuisineItem["type"]]}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured spotlight — roundabout carousel ── */}
      {activeType === "all" && carouselItems.length > 0 && (
        <section className="py-14 sm:py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {/* Section heading */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 mb-4">
                <Utensils className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Featured Delicacy</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Top Picks from Bocaue&apos;s Kitchen</h2>
              <p className="text-sm text-muted-foreground mt-1">Slide through the iconic flavors that define Bocaue.</p>
            </div>

            {/* Carousel */}
            <div className="relative px-8 sm:px-12" onMouseEnter={pauseAutoPlay} onTouchStart={pauseAutoPlay}>
              <Carousel
                setApi={setCarouselApi}
                opts={{ loop: canLoop, align: "center" }}
                className="w-full"
              >
                <CarouselContent className="items-stretch">
                  {carouselItems.map((item, index) => {
                    const isActive = index === featuredIndex
                    return (
                      <CarouselItem
                        key={`${item.id}-${index}`}
                        className="basis-[85%] sm:basis-3/4 md:basis-[60%] lg:basis-[50%]"
                      >
                        <Link href={`/culture/culinary-wonders/${item.id}`} className="block h-full">
                          <div
                            className="transition-all duration-500 ease-out h-full"
                            style={{
                              transform: isActive ? "scale(1)" : "scale(0.92)",
                              opacity: isActive ? 1 : 0.5,
                            }}
                          >
                            <Card className="overflow-hidden border-border shadow-xl h-full flex flex-col group cursor-pointer hover:shadow-2xl transition-shadow duration-300">
                              {/* Image */}
                              <GalleryImage
                                src={item.image}
                                alt={item.name}
                                outerClassName="shrink-0"
                                className="relative h-52 sm:h-64 md:h-72 overflow-hidden"
                                imageClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width:640px) 85vw, (max-width:1024px) 60vw, 50vw"
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {/* Badge top-left */}
                                <div className="absolute top-3 left-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${typeBadge[item.type]}`}>
                                    {typeIcon[item.type]}
                                    {typeLabels[item.type]}
                                  </span>
                                </div>

                                {/* Title on image */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">
                                    {item.name}
                                  </h3>
                                  {item.tagalogName && item.tagalogName !== item.name && (
                                    <p className="text-xs text-white/70 italic mt-0.5">{item.tagalogName}</p>
                                  )}
                                </div>
                              </GalleryImage>

                              {/* Content */}
                              <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                                  {item.description}
                                </p>

                                {/* Where & time */}
                                <div className="mt-auto border-t border-border pt-3 space-y-1.5">
                                  {item.where.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-foreground">
                                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                      {item.where[0]}
                                    </div>
                                  )}
                                  {item.bestTime && (
                                    <div className="flex items-center gap-2 text-xs text-foreground">
                                      <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                      {item.bestTime}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </Link>
                      </CarouselItem>
                    )
                  })}
                </CarouselContent>
              </Carousel>

              {/* Side arrows — only when more than 1 item */}
              {carouselItems.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-muted hover:shadow-lg transition-all"
                    aria-label="Previous delicacy"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-muted hover:shadow-lg transition-all"
                    aria-label="Next delicacy"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </button>
                </>
              )}
            </div>

            {/* Dots + counter — only when more than 1 item */}
            {carouselItems.length > 1 && (
            <div className="mt-7 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5">
                {carouselItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { pauseAutoPlay(); carouselApi?.scrollTo(i) }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === featuredIndex
                        ? "w-7 bg-amber-500"
                        : "w-1.5 bg-border hover:bg-muted-foreground/40"
                    }`}
                    aria-label={`Go to ${carouselItems[i].name}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {featuredIndex + 1} / {carouselItems.length}
              </span>
            </div>
            )}
          </div>
        </section>
      )}

      {/* ── Delicacies grid ── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                {activeType === "all" ? "All Local Delicacies" : typeLabels[activeType as CuisineItem["type"]]}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filtered.length} dish{filtered.length !== 1 ? "es" : ""} — click a dish to learn more
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">No dishes in this category.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(activeType === "all" ? rest : filtered).map((item) => (
                <div key={item.id} id={`item-${item.id}`}><CuisineCard item={item} /></div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Restaurants & Eateries ── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Restaurants &amp; Eateries</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Where to eat in Bocaue — from heritage kitchens to street-side carinderias</p>
            </div>
          </div>

          <div className="space-y-8 mt-8">
            {restaurantList.map((place, idx) => (
              <Card
                key={place.id}
                className="relative overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* ── Where to find CTA ── */}
      <section className="py-10 bg-primary/5 border-t border-primary/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Ready to taste the Wonders of Bocaue?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Visit the Bocaue Public Market, MacArthur Highway stalls, or the churchyard bazaar during fiesta season.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Explore Destinations
            </Link>
            <Link
              href="/culture"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors"
            >
              Discover Culture
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
