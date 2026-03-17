"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { CMSPost } from "@/lib/data/admin-data"
import { apiFetchFeaturedByLabel } from "@/lib/api"

// ─── Public types ─────────────────────────────────────────────────

export interface SlideConfig {
  /** Label key used to fetch featured CMS posts (e.g. "local-cuisine") */
  label: string
  /** Fallback title shown until CMS data loads */
  fallbackTitle: string
  /** Fallback description */
  fallbackDescription: string
  /** Fallback image (public asset path) */
  fallbackImage: string
  /** Link target when the CTA is clicked */
  href: string
  /** Category eyebrow text */
  categoryLabel: string
  /** CTA button text */
  ctaLabel: string
  /** Icon component rendered in the eyebrow */
  Icon: React.ElementType
  /** Tailwind bg class for the dot indicator (e.g. "bg-orange-400") */
  dot: string
}

export interface FeaturedSliderProps {
  /** Section header icon */
  headerIcon: React.ElementType
  /** Eyebrow text above the title */
  headerLabel: string
  /** Section title */
  headerTitle: string
  /** Section subtitle */
  headerDescription: string
  /** Slide definitions */
  slides: SlideConfig[]
  /** Auto-advance interval in ms (default 6000) */
  duration?: number
  /** Map a CMSPost to { title, description, image } for the slide */
  mapPost?: (post: CMSPost) => { id: string; title: string; description: string; image: string; location?: string; bestTime?: string }
}

// ─── Default mapper ───────────────────────────────────────────────

function defaultMapPost(post: CMSPost) {
  const img = post.image?.[0] ?? ""
  return {
    id: post.id,
    title: post.title,
    description: post.body ?? "",
    image: img,
    location: post.location ?? undefined,
    bestTime: post.hours ?? undefined,
  }
}

// ─── Component ────────────────────────────────────────────────────

interface SlideData {
  id: string
  title: string
  description: string
  image: string
  href: string
  categoryLabel: string
  ctaLabel: string
  Icon: React.ElementType
  dot: string
  location?: string
  bestTime?: string
}

export function FeaturedSlider({
  headerIcon: HeaderIcon,
  headerLabel,
  headerTitle,
  headerDescription,
  slides: slideConfigs,
  duration = 6000,
  mapPost = defaultMapPost,
}: FeaturedSliderProps) {
  const [slides, setSlides] = useState<SlideData[]>(() =>
    slideConfigs.map((cfg) => ({
      id: cfg.label,
      title: cfg.fallbackTitle,
      description: cfg.fallbackDescription,
      image: cfg.fallbackImage,
      href: cfg.href,
      categoryLabel: cfg.categoryLabel,
      ctaLabel: cfg.ctaLabel,
      Icon: cfg.Icon,
      dot: cfg.dot,
    }))
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [fading, setFading] = useState(false)

  // Fetch one featured post per slide
  useEffect(() => {
    slideConfigs.forEach((cfg, idx) => {
      apiFetchFeaturedByLabel(cfg.label, 1)
        .then((posts) => {
          if (posts?.length) {
            const mapped = mapPost(posts[0])
            setSlides((prev) => {
              const next = [...prev]
              next[idx] = {
                ...next[idx],
                id: mapped.id,
                title: mapped.title,
                description: mapped.description,
                image: mapped.image || next[idx].image,
                location: mapped.location,
                bestTime: mapped.bestTime,
              }
              return next
            })
          }
        })
        .catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, duration)
    return () => clearInterval(timer)
  }, [next, duration])

  if (slides.length === 0) return null

  const slide = slides[activeIndex]

  return (
    <section className="relative bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        {/* Section header */}
        <div className="mb-10 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <HeaderIcon className="h-4 w-4" />
            {headerLabel}
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            {headerTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground sm:text-lg">
            {headerDescription}
          </p>
        </div>

        {/* Slider */}
        <div className="flex items-center">
          <div
            className="relative w-full overflow-hidden rounded-2xl aspect-[3/2] sm:aspect-[16/9] md:aspect-[16/8]"
            style={{ boxShadow: "0 32px 80px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)" }}
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
                  className="object-cover scale-[1.02] transition-transform duration-8000 ease-out"
                  priority={i === 0}
                />
              </div>
            ))}

            {/* Gradient overlays */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
            <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Slide counter — top right */}
            <div className="hidden sm:flex absolute top-6 right-7 z-30 items-center gap-2">
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

            {/* Main content — bottom left */}
            <div
              className={`absolute bottom-0 left-0 z-30 px-4 pb-12 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12 max-w-[90%] sm:max-w-[70%] lg:max-w-[60%] transition-all duration-500 ${
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
              <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-2 sm:mb-4 drop-shadow-2xl">
                {slide.title}
              </h3>

              {/* Divider */}
              <div className="h-px w-16 bg-white/25 mb-4" />

              {/* Description — short only, no story */}
              <p className="text-xs sm:text-sm md:text-base text-white/75 leading-relaxed mb-3 sm:mb-6 line-clamp-2 max-w-lg">
                {slide.description}
              </p>

              {/* Location & Best Time */}
              {(slide.location || slide.bestTime) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 sm:mb-5 text-xs sm:text-sm text-white/60">
                  {slide.location && (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-white/40">📍</span> {slide.location}
                    </span>
                  )}
                  {slide.bestTime && (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-white/40">🕐</span> {slide.bestTime}
                    </span>
                  )}
                </div>
              )}

              {/* CTA */}
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:bg-blue-600 hover:text-white transition-all duration-300 hover:gap-4 hover:shadow-[0_8px_30px_rgba(37,99,235,0.5)]"
              >
                {slide.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Bottom bar: dots + progress */}
            <div className="absolute bottom-0 left-0 right-0 z-30">
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
              <div className="h-[2px] bg-white/10">
                <div
                  key={activeIndex}
                  className="h-full bg-blue-500"
                  style={{ animation: `featuredSliderGrow ${duration}ms linear forwards` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes featuredSliderGrow {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  )
}
