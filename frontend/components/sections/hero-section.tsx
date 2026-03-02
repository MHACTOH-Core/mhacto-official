"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { asset } from "@/lib/utils"
import { apiFetchHeroSlides, type HeroSlide } from "@/lib/api"

/** Milliseconds between automatic slide transitions */
const SLIDE_AUTO_ADVANCE_INTERVAL_MS = 6000

/**
 * Linear interpolation between two values, clamped to [0, 1].
 * Used to smoothly transition visual properties based on scroll progress.
 */
function linearInterpolation(start: number, end: number, progress: number): number {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  return start + (end - start) * clampedProgress
}

export function HeroSection() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [previousSlideIndex, setPreviousSlideIndex] = useState<number | null>(null)
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  /** Ref to prevent redundant rAF calls during scroll */
  const scrollRafIdRef = useRef<number | null>(null)

  // Fetch hero slides from the CMS backend
  // Sends GET /api/home/hero.php → PHP runs SQL SELECT on site_settings → returns JSON
  useEffect(() => {
    apiFetchHeroSlides()
      .then((slides) => {
        if (slides && slides.length > 0) {
          // Normalise image paths — prefix local assets with basePath
          const normalizedSlides = slides.map((slide) => ({
            ...slide,
            src: slide.src.startsWith("/")
              ? asset(slide.src)
              : slide.src,
          }))
          setActiveSlideIndex(0)
          setPreviousSlideIndex(null)
          setHeroSlides(normalizedSlides)
        }
      })
      .catch(() => {})
      .finally(() => setIsDataLoaded(true))
  }, [])

  // Throttled scroll tracking via requestAnimationFrame to avoid excessive re-renders
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRafIdRef.current !== null) return // already scheduled
      scrollRafIdRef.current = requestAnimationFrame(() => {
        scrollRafIdRef.current = null
        if (!heroSectionRef.current) return
        const sectionRect = heroSectionRef.current.getBoundingClientRect()
        const scrollableHeight = heroSectionRef.current.offsetHeight - window.innerHeight
        const normalizedProgress = Math.min(Math.max(-sectionRect.top / scrollableHeight, 0), 1)
        setScrollProgress(normalizedProgress)
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollRafIdRef.current !== null) cancelAnimationFrame(scrollRafIdRef.current)
    }
  }, [])

  // Derive parallax / fade values from scroll progress (memoised to avoid recalc on unrelated re-renders)
  const backgroundImageScale = useMemo(
    () => linearInterpolation(1.35, 1, scrollProgress / 0.5),
    [scrollProgress],
  )
  const darkOverlayOpacity = useMemo(
    () => linearInterpolation(0.35, 0.5, scrollProgress / 0.4),
    [scrollProgress],
  )
  const heroTextOpacity = useMemo(
    () => linearInterpolation(1, 0, scrollProgress / 0.3),
    [scrollProgress],
  )
  const heroTextTranslateY = useMemo(
    () => linearInterpolation(0, -60, scrollProgress / 0.4),
    [scrollProgress],
  )
  const scrollIndicatorOpacity = useMemo(
    () => linearInterpolation(1, 0, scrollProgress / 0.08),
    [scrollProgress],
  )

  /** Advance to the next slide, wrapping around to the first */
  const advanceToNextSlide = useCallback(() => {
    if (heroSlides.length === 0) return
    setActiveSlideIndex((currentIndex) => {
      setPreviousSlideIndex(currentIndex)
      return (currentIndex + 1) % heroSlides.length
    })
  }, [heroSlides.length])

  // Auto-advance slides on a timer
  useEffect(() => {
    const autoAdvanceTimer = setInterval(advanceToNextSlide, SLIDE_AUTO_ADVANCE_INTERVAL_MS)
    return () => clearInterval(autoAdvanceTimer)
  }, [advanceToNextSlide])

  // Clear the previous-slide reference after the crossfade animation completes
  useEffect(() => {
    if (previousSlideIndex === null) return
    const crossfadeTimeout = setTimeout(() => setPreviousSlideIndex(null), 1200)
    return () => clearTimeout(crossfadeTimeout)
  }, [previousSlideIndex])

  const currentSlideData = heroSlides.length > 0
    ? (heroSlides[activeSlideIndex] ?? heroSlides[0])
    : null

  /** Smoothly scroll past the hero section */
  const handleScrollDownClick = useCallback(() => {
    if (heroSectionRef.current) {
      const scrollTarget = heroSectionRef.current.offsetHeight - window.innerHeight
      window.scrollTo({ top: scrollTarget, behavior: "smooth" })
    }
  }, [])

  return (
    <section id="home" ref={heroSectionRef} className="relative z-0 h-[180svh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Background video — parallax zoom driven by scroll */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `scale(${backgroundImageScale})` }}
          src={asset("/images/Video2.mp4")}
          autoPlay
          loop
          muted
          playsInline
          poster={asset("/images/heroes/hero-bocaue.jpg")}
        />

        {/* Dynamic dark overlay — intensifies as user scrolls */}
        <div
          className="absolute inset-0 bg-foreground"
          style={{ opacity: darkOverlayOpacity }}
        />

        {/* Hero text content — fades and shifts up on scroll */}
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
          style={{ opacity: heroTextOpacity, transform: `translateY(${heroTextTranslateY}px)` }}
        >
          {/* Persistent MHACTO branding pill */}
          <p className="mb-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-white/60 border border-white/20 rounded-full px-4 py-1 backdrop-blur-sm bg-black/20">
            MHACTO Bocaue &mdash; History, Arts, Culture &amp; Tourism
          </p>

          {currentSlideData ? (
          <div key={activeSlideIndex} className="flex flex-col items-center animate-hero-text-in">
            <p className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-secondary">
              {currentSlideData.subtitle}
            </p>
            <h1 className="max-w-3xl text-balance text-3xl font-bold leading-tight text-card sm:text-5xl md:text-6xl lg:text-7xl font-heading">
              {currentSlideData.title}{" "}
              <span className="text-primary">{currentSlideData.highlight}</span>
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-sm text-card/85 sm:text-base md:text-lg lg:text-xl">
              {currentSlideData.description}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/tourism-office">
                <Button
                  size="lg"
                  className="group gap-2 rounded-full bg-primary px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/destinations">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/60 hover:text-white px-6 sm:px-8 text-sm sm:text-base font-semibold transition-all"
                >
                  Explore Bocaue
                </Button>
              </Link>
            </div>

            {/* Slide pagination dots */}
            <div className="mt-8 flex items-center gap-3">
              {heroSlides.map((_, slideIndex) => (
                <button
                  key={slideIndex}
                  onClick={() => {
                    setPreviousSlideIndex(activeSlideIndex)
                    setActiveSlideIndex(slideIndex)
                  }}
                  className={`rounded-full border-2 transition-all duration-500 ${
                    slideIndex === activeSlideIndex
                      ? "h-3.5 w-3.5 border-white bg-white scale-110"
                      : "h-3 w-3 border-white/60 bg-transparent hover:border-white hover:bg-white/30"
                  }`}
                  aria-label={`Go to slide ${slideIndex + 1}`}
                />
              ))}
            </div>
          </div>
          ) : !isDataLoaded ? (
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="h-4 w-48 rounded bg-white/20" />
              <div className="h-12 w-80 rounded bg-white/20" />
              <div className="h-4 w-64 rounded bg-white/10" />
            </div>
          ) : null}
        </div>

        {/* Scroll-down indicator — fades out quickly on first scroll */}
        <button
          onClick={handleScrollDownClick}
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Scroll down"
        >
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em]">
            Scroll Down
          </span>
          <div className="animate-bounce-y">
            <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </button>
      </div>
    </section>
  )
}
