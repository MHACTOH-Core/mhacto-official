"use client"

import React, { useState, useEffect, useCallback } from "react"
import { asset } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, Utensils, Clock, MapPin, ChevronDown,
  ChevronUp, ChevronLeft, ChevronRight, Star, Flame, Leaf, UtensilsCrossed, Coffee,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { localCuisine, type CuisineItem } from "@/lib/data/culture-data"

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
  dessert: <Star className="h-4 w-4" />,
  drink: <Coffee className="h-4 w-4" />,
}

// extra inline data for richer presentation
const cuisineExtras: Record<string, { emoji: string; rating: number; bestFor: string; season: string }> = {
  "puto-seko":     { emoji: "🍪", rating: 4.9, bestFor: "Pasalubong & gifts",       season: "Year-round" },
  "bocaue-taho":  { emoji: "🥛", rating: 4.8, bestFor: "Morning energy boost",     season: "Daily mornings" },
  "bibingka-atbp":{ emoji: "🎄", rating: 4.9, bestFor: "Christmas tradition",       season: "December" },
  "lechon-bulacan":{ emoji: "🐷", rating: 5.0, bestFor: "Fiesta centerpiece",       season: "Fiesta season" },
  "kakanin-spread":{ emoji: "🍡", rating: 4.7, bestFor: "Weekend markets",           season: "Weekends" },
}

type TypeFilter = CuisineItem["type"] | "all"

// ── Expandable cuisine card ──────────────────────────────────────────
function CuisineCard({ item, featured }: { item: CuisineItem; featured?: boolean }) {
  const [storyOpen, setStoryOpen] = useState(false)
  const extra = cuisineExtras[item.id]

  return (
    <Card
      className={`group overflow-hidden border-border transition-all duration-300 flex flex-col ${
        featured
          ? "hover:shadow-2xl hover:border-primary/50 shadow-lg"
          : "hover:shadow-lg hover:border-primary/30"
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? "h-72 sm:h-80" : "h-52"}`}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {featured && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
              <Star className="h-3 w-3" /> Featured Delicacy
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <Badge variant="outline" className={`text-xs border ${typeBadge[item.type]} backdrop-blur-sm`}>
            {typeLabels[item.type]}
          </Badge>
          {extra && (
            <span className="text-2xl drop-shadow-lg">{extra.emoji}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className={`font-black text-foreground leading-snug group-hover:text-primary transition-colors ${featured ? "text-xl" : "text-lg"}`}>
              {item.name}
            </h3>
            {item.tagalogName && item.tagalogName !== item.name && (
              <p className="text-xs text-muted-foreground italic">{item.tagalogName}</p>
            )}
          </div>
          {extra && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-foreground">{extra.rating}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-2 mb-4">{item.description}</p>

        {/* Key facts row */}
        {extra && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Best For</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{extra.bestFor}</p>
            </div>
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Season</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{extra.season}</p>
            </div>
          </div>
        )}

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

        {/* Expandable story */}
        <button
          onClick={() => setStoryOpen((v) => !v)}
          className="mt-auto flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <span className="uppercase tracking-wider">The Story</span>
          {storyOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {storyOpen && (
          <div className="mt-3 rounded-xl bg-muted/40 p-4 border border-border">
            <p className="text-sm text-foreground leading-relaxed">{item.story}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default function LocalCuisinePage() {
  const [activeType, setActiveType] = useState<TypeFilter>("all")
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [isPlaying, setIsPlaying] = useState(true)

  const types: TypeFilter[] = ["all", "main", "snack", "dessert", "drink"]
  const filtered = activeType === "all" ? localCuisine : localCuisine.filter((c) => c.type === activeType)
  const featured = localCuisine[featuredIndex]
  const rest = filtered.filter((c) => c.id !== featured.id)

  // Sync carousel API → featuredIndex
  useEffect(() => {
    if (!carouselApi) return
    const onSelect = () => setFeaturedIndex(carouselApi.selectedScrollSnap())
    carouselApi.on("select", onSelect)
    return () => { carouselApi.off("select", onSelect) }
  }, [carouselApi])

  // Auto-play
  useEffect(() => {
    if (!carouselApi || !isPlaying) return
    const id = setInterval(() => carouselApi.scrollNext(), 5000)
    return () => clearInterval(id)
  }, [carouselApi, isPlaying])

  const pauseAutoPlay = useCallback(() => {
    setIsPlaying(false)
    setTimeout(() => setIsPlaying(true), 10000)
  }, [])

  const handlePrev = () => { pauseAutoPlay(); carouselApi?.scrollPrev() }
  const handleNext = () => { pauseAutoPlay(); carouselApi?.scrollNext() }

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[380px] sm:min-h-[480px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.35)), url(${asset('/images/places/Food.jpg')})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 flex flex-col justify-center py-16 sm:py-20 md:py-28">
          <Link href="/" className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Utensils className="h-8 w-8 text-amber-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-amber-300">Local Culinary</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
              Taste of Bocaue
            </h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              From legendary crispy chicharon to generations-old kakanin — explore the flavors, stories, and traditions behind Bocaue&apos;s most beloved delicacies.
            </p>
          </div>
          {/* Quick stat pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { label: "5 Signature Dishes", icon: "🍽️" },
              { label: "Centuries of Tradition", icon: "📜" },
              { label: "Local Vendors & Markets", icon: "🏪" },
            ].map((s) => (
              <span key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold border border-white/20">
                {s.icon} {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

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

      {/* ── Featured spotlight ── */}
      {activeType === "all" && (
        <section className="py-14 sm:py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {/* Section heading */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 mb-4">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Featured Delicacy</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Top Picks from Bocaue&apos;s Kitchen</h2>
              <p className="text-sm text-muted-foreground mt-1">Slide through the iconic flavors that define Bocaue.</p>
            </div>

            {/* Carousel */}
            <div className="relative px-8 sm:px-12" onMouseEnter={pauseAutoPlay} onTouchStart={pauseAutoPlay}>
              <Carousel
                setApi={setCarouselApi}
                opts={{ loop: true, align: "center" }}
                className="w-full"
              >
                <CarouselContent className="items-stretch">
                  {localCuisine.map((item, index) => {
                    const extra = cuisineExtras[item.id]
                    const isActive = index === featuredIndex
                    return (
                      <CarouselItem
                        key={item.id}
                        className="basis-[92%] sm:basis-4/5 md:basis-[68%] lg:basis-[60%]"
                      >
                        <div
                          className="transition-all duration-500 ease-out h-full"
                          style={{
                            transform: isActive ? "scale(1)" : "scale(0.9)",
                            opacity: isActive ? 1 : 0.4,
                            pointerEvents: isActive ? "auto" : "none",
                          }}
                        >
                          <div className="overflow-hidden rounded-2xl bg-card border border-border shadow-xl h-full flex flex-col">
                            {/* Cinematic image */}
                            <div className="relative h-56 sm:h-72 md:h-80 shrink-0 overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width:640px) 92vw, (max-width:1024px) 68vw, 60vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              {/* Dark gradient from bottom */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                              {/* Badge top-left */}
                              <div className="absolute top-4 left-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${typeBadge[item.type]}`}>
                                  {typeIcon[item.type]}
                                  {typeLabels[item.type]}
                                </span>
                              </div>

                              {/* Rating top-right */}
                              {extra && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-bold text-white">{extra.rating}</span>
                                </div>
                              )}

                              {/* Title overlaid on image bottom */}
                              <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                                  {item.name}
                                </h2>
                                {item.tagalogName && item.tagalogName !== item.name && (
                                  <p className="text-xs text-white/70 italic mt-0.5">{item.tagalogName}</p>
                                )}
                              </div>
                            </div>

                            {/* Detail panel */}
                            <div className="flex flex-col flex-1 p-5 sm:p-6">
                              <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
                                {item.description}
                              </p>

                              {/* Info pills row */}
                              <div className="grid grid-cols-2 gap-2.5 mb-5">
                                {[
                                  { icon: <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />, label: "Where to find", val: item.where[0] },
                                  { icon: <Clock className="h-3.5 w-3.5 text-primary shrink-0" />, label: "Best time", val: item.bestTime ?? "Year-round" },
                                  { icon: <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />, label: "Rating", val: `${extra?.rating ?? "—"} / 5.0` },
                                  { icon: <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />, label: "Best for", val: extra?.bestFor ?? "All occasions" },
                                ].map((row) => (
                                  <div key={row.label} className="flex items-center gap-2.5 rounded-xl bg-muted/60 border border-border/60 px-3 py-2.5">
                                    {row.icon}
                                    <div className="min-w-0">
                                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {row.label}
                                      </p>
                                      <p className="text-xs font-semibold text-foreground truncate">{row.val}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Story teaser */}
                              <div className="mt-auto rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1.5">
                                  The Story
                                </p>
                                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">{item.story}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    )
                  })}
                </CarouselContent>
              </Carousel>

              {/* Side arrows */}
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
            </div>

            {/* Dots + counter */}
            <div className="mt-7 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5">
                {localCuisine.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { pauseAutoPlay(); carouselApi?.scrollTo(i) }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === featuredIndex
                        ? "w-7 bg-amber-500"
                        : "w-1.5 bg-border hover:bg-muted-foreground/40"
                    }`}
                    aria-label={`Go to ${localCuisine[i].name}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {featuredIndex + 1} / {localCuisine.length}
              </span>
            </div>
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
                {filtered.length} dish{filtered.length !== 1 ? "es" : ""} — click &quot;The Story&quot; to learn more
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">No dishes in this category.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(activeType === "all" ? rest : filtered).map((item) => (
                <CuisineCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Seasonal food calendar ── */}
      <section className="border-t border-border bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black text-foreground">Seasonal Food Guide</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { season: "Summer (Mar–May)",    icon: "☀️", dishes: ["Taho (dawn vendors)", "Bibingka pockets", "Cold halo-halo"] },
              { season: "Pagoda Season (Aug)", icon: "🚣", dishes: ["Puto Seko (fiesta)", "Lechon Bulacan", "Street food fair"] },
              { season: "Fiesta (November)",   icon: "🎉", dishes: ["Lechon Bulacan", "Kakanin spread", "Traditional nilaga"] },
              { season: "Christmas (Dec)",      icon: "🎄", dishes: ["Bibingka", "Puto Bumbong", "Simbang Gabi bazaar"] },
            ].map((s) => (
              <div key={s.season} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{s.icon}</div>
                <p className="text-sm font-black text-foreground mb-3">{s.season}</p>
                <ul className="space-y-1.5">
                  {s.dishes.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where to find CTA ── */}
      <section className="py-10 bg-primary/5 border-t border-primary/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Ready to taste Bocaue?</h3>
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
