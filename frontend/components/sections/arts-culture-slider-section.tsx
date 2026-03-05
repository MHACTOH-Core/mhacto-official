"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, ArrowRight,
  UtensilsCrossed, Calendar, Sparkles, Hammer, Crown,
} from "lucide-react"
import { asset } from "@/lib/utils"
import { apiFetchByLabel } from "@/lib/api"
import {
  cmsToCuisineItem, cmsToFestival, cmsToCulturalPractice,
  cmsToArtisan, cmsToPeopleWonder,
} from "@/lib/cms-mappers"
import {
  localCuisine, festivals, culturalPractices, artisans, peopleWonders,
} from "@/lib/data/culture-data"

interface SlideData {
  id: string
  title: string
  description: string
  image: string
  href: string
  categoryLabel: string
  ctaLabel: string
  Icon: React.ElementType
  accent: string   // Tailwind gradient from-color
  dot: string      // dot highlight bg
}

const SLIDE_DURATION = 6000 // 6 s slow auto-advance

/** Build initial slides from static fallback data */
function buildFallbackSlides(): SlideData[] {
  return [
    {
      id: localCuisine[0]?.id ?? "cuisine",
      title: localCuisine[0]?.name ?? "Local Cuisine",
      description: localCuisine[0]?.description ?? "",
      image: localCuisine[0]?.image ?? asset("/images/places/Food.jpg"),
      href: "/culture/local-cuisine",
      categoryLabel: "Local Cuisine",
      ctaLabel: "Explore Local Cuisine",
      Icon: UtensilsCrossed,
      accent: "from-orange-900/70",
      dot: "bg-orange-400",
    },
    {
      id: festivals[0]?.id ?? "festivals",
      title: festivals[0]?.name ?? "Festivals",
      description: festivals[0]?.description ?? "",
      image: festivals[0]?.image ?? asset("/images/places/river-festival.jpg"),
      href: "/culture/festivals-celebrations",
      categoryLabel: "Festivals",
      ctaLabel: "View Festivals",
      Icon: Calendar,
      accent: "from-purple-900/70",
      dot: "bg-purple-400",
    },
    {
      id: culturalPractices[0]?.id ?? "practices",
      title: culturalPractices[0]?.name ?? "Cultural Practices",
      description: culturalPractices[0]?.description ?? "",
      image: culturalPractices[0]?.image ?? asset("/images/places/Arts.jpg"),
      href: "/culture/practices-traditions",
      categoryLabel: "Cultural Practices",
      ctaLabel: "Explore Practices",
      Icon: Sparkles,
      accent: "from-teal-900/70",
      dot: "bg-teal-400",
    },
    {
      id: artisans[0]?.id ?? "crafts",
      title: artisans[0]?.name ?? "Crafts & Artisan",
      description: artisans[0]?.description ?? "",
      image: artisans[0]?.image ?? asset("/images/places/Arts.jpg"),
      href: "/culture/crafts-artisan",
      categoryLabel: "Crafts & Artisan",
      ctaLabel: "Meet Our Artisans",
      Icon: Hammer,
      accent: "from-amber-900/70",
      dot: "bg-amber-400",
    },
    {
      id: peopleWonders[0]?.id ?? "wonders",
      title: peopleWonders[0]?.name ?? "People Wonders",
      description: peopleWonders[0]?.description ?? "",
      image: peopleWonders[0]?.image ?? asset("/images/places/Arts.jpg"),
      href: "/culture/people-wonders",
      categoryLabel: "People Wonders",
      ctaLabel: "Meet Our Wonders",
      Icon: Crown,
      accent: "from-rose-900/70",
      dot: "bg-rose-400",
    },
  ]
}

export function ArtsCultureSliderSection() {
  const [slides, setSlides] = useState<SlideData[]>(buildFallbackSlides)
  const [activeIndex, setActiveIndex] = useState(0)
  const [fading, setFading] = useState(false)

  // Patch slides from CMS — fetch 1 item per category
  useEffect(() => {
    const fetches: [string, (posts: unknown[]) => Partial<SlideData>][] = [
      ["local-cuisine", (posts) => {
        const item = (posts as Parameters<typeof cmsToCuisineItem>[0][]).map(cmsToCuisineItem)[0]
        return { id: item.id, title: item.name, description: item.description, image: item.image || asset("/images/places/Food.jpg") }
      }],
      ["festivals", (posts) => {
        const item = (posts as Parameters<typeof cmsToFestival>[0][]).map(cmsToFestival)[0]
        return { id: item.id, title: item.name, description: item.description, image: item.image || asset("/images/places/river-festival.jpg") }
      }],
      ["cultural-practices", (posts) => {
        const item = (posts as Parameters<typeof cmsToCulturalPractice>[0][]).map(cmsToCulturalPractice)[0]
        return { id: item.id, title: item.name, description: item.description, image: item.image || asset("/images/places/Arts.jpg") }
      }],
      ["crafts-artisan", (posts) => {
        const item = (posts as Parameters<typeof cmsToArtisan>[0][]).map(cmsToArtisan)[0]
        return { id: item.id, title: item.name, description: item.description, image: item.image || asset("/images/places/Arts.jpg") }
      }],
      ["people-wonders", (posts) => {
        const item = (posts as Parameters<typeof cmsToPeopleWonder>[0][]).map(cmsToPeopleWonder)[0]
        return { id: item.id, title: item.name, description: item.description, image: item.image || asset("/images/places/Arts.jpg") }
      }],
    ]

    fetches.forEach(([label, mapper], idx) => {
      apiFetchByLabel(label, 1)
        .then((posts) => {
          if (posts?.length) {
            const patch = mapper(posts as unknown[])
            setSlides((prev) => {
              const next = [...prev]
              next[idx] = { ...next[idx], ...patch }
              return next
            })
          }
        })
        .catch(() => {})
    })
  }, [])

  const goTo = useCallback(
    (index: number) => {
      if (fading) return
      setFading(true)
      setTimeout(() => {
        setActiveIndex(index)
        setFading(false)
      }, 500)
    },
    [fading]
  )

  const next = useCallback(
    () => goTo((activeIndex + 1) % slides.length),
    [activeIndex, slides.length, goTo]
  )
  const prev = useCallback(
    () => goTo((activeIndex - 1 + slides.length) % slides.length),
    [activeIndex, slides.length, goTo]
  )

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[activeIndex]
  const { Icon } = slide

  return (
    <section className="relative bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        {/* Section header */}
        <div className="mb-10 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" />
            Arts &amp; Culture
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            The Living Culture of Bocaue
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground sm:text-lg">
            From celebrated cuisine to living artisans — explore five facets of Bocaue's cultural identity.
          </p>
        </div>

        {/* Slider + outside arrows */}
        <div className="flex items-center gap-5">

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg text-white transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#229DBE", borderColor: "#1a7d97" }}
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        {/* Slider */}
        <div
          className="relative flex-1 min-w-0 overflow-hidden rounded-2xl"
          style={{ aspectRatio: "16 / 8", boxShadow: "0 32px 80px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          {/* Background images — crossfade */}
          {slides.map((s, i) => (
            <div
              key={s.id + i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              aria-hidden={i !== activeIndex}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                sizes="(max-width: 768px) 100vw, 1280px"
                className="object-cover scale-[1.02] transition-transform duration-[8000ms] ease-out"
                priority={i === 0}
              />
            </div>
          ))}

          {/* Layered gradient overlays for depth */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Slide counter — top right */}
          <div className="absolute top-6 right-7 z-30 flex items-center gap-2">
            <span className="font-mono text-3xl font-black text-white/90 leading-none tabular-nums drop-shadow-lg">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-[3px] items-center">
              <div className="h-px w-5 bg-white/40" />
              <span className="font-mono text-xs text-white/40 leading-none tabular-nums">
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Category tabs — top left */}
          <div className="absolute top-6 left-7 z-30 flex items-center gap-2 flex-wrap">
            {slides.map((s, i) => {
              const TabIcon = s.Icon
              return (
                <button
                  key={s.categoryLabel}
                  onClick={() => goTo(i)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 ${
                    i === activeIndex
                      ? "bg-white text-gray-900 shadow-[0_4px_20px_rgba(255,255,255,0.3)]"
                      : "bg-white/10 text-white/60 hover:bg-white/18 hover:text-white backdrop-blur-sm border border-white/15"
                  }`}
                >
                  <TabIcon className="h-3 w-3" />
                  {s.categoryLabel}
                </button>
              )
            })}
          </div>

          {/* Main content — bottom left */}
          <div
            className={`absolute bottom-0 left-0 z-30 px-8 pb-10 sm:px-12 sm:pb-12 max-w-[60%] transition-all duration-500 ${
              fading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            {/* Category eyebrow */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-px w-8 bg-blue-400" />
              <span className="text-blue-300 text-xs font-bold uppercase tracking-[0.2em]">
                {slide.categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-4 drop-shadow-2xl">
              {slide.title}
            </h3>

            {/* Divider */}
            <div className="h-px w-16 bg-white/25 mb-4" />

            {/* Description */}
            <p className="text-sm sm:text-base text-white/75 leading-relaxed mb-6 line-clamp-2 max-w-lg">
              {slide.description}
            </p>

            {/* CTA */}
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2.5 rounded-full bg-white text-gray-900 px-6 py-2.5 text-sm font-bold shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:bg-blue-600 hover:text-white transition-all duration-300 hover:gap-4 hover:shadow-[0_8px_30px_rgba(37,99,235,0.5)]"
            >
              {slide.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bottom bar: progress + dots */}
          <div className="absolute bottom-0 left-0 right-0 z-30">
            {/* Dot nav */}
            <div className="absolute bottom-4 right-7 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex ? "h-1.5 w-8 bg-white" : "h-1.5 w-1.5 bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-[2px] bg-white/10">
              <div
                key={activeIndex}
                className="h-full bg-blue-500"
                style={{ animation: `growWidth ${SLIDE_DURATION}ms linear forwards` }}
              />
            </div>
          </div>
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next"
          className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg text-white transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#229DBE", borderColor: "#1a7d97" }}
        >
          <ChevronRight className="h-7 w-7" />
        </button>

        </div>{/* end flex row */}

      </div>

      {/* Progress bar keyframes */}
      <style>{`
        @keyframes growWidth {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  )
}
