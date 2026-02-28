"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { asset } from "@/lib/utils"
import { apiFetchHeroSlides, type HeroSlide } from "@/lib/api"

// No hardcoded fallback — hero slides come from backend

const SLIDE_INTERVAL = 6000

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1)
}

export function HeroSection() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [loaded, setLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [prevSlide, setPrevSlide] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Fetch slides from API
  useEffect(() => {
    apiFetchHeroSlides()
      .then((slides) => {
        if (slides && slides.length > 0) {
          // Add asset prefix to image paths if needed
          const processedSlides = slides.map(slide => ({
            ...slide,
            src: slide.src.startsWith('/') && !slide.src.startsWith('/images') 
              ? asset(slide.src) 
              : slide.src.startsWith('/images') 
                ? asset(slide.src)
                : slide.src
          }))
          setCurrentSlide(0)
          setPrevSlide(null)
          setHeroSlides(processedSlides)
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const total = sectionRef.current.offsetHeight - window.innerHeight
      const progress = Math.min(Math.max(-rect.top / total, 0), 1)
      setScrollProgress(progress)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const imageScale = lerp(1.35, 1, scrollProgress / 0.5)
  const overlayOpacity = lerp(0.35, 0.5, scrollProgress / 0.4)
  const textOpacity = lerp(1, 0, scrollProgress / 0.3)
  const textY = lerp(0, -60, scrollProgress / 0.4)
  const scrollIndicatorOpacity = lerp(1, 0, scrollProgress / 0.08)

  const nextSlide = useCallback(() => {
    if (heroSlides.length === 0) return
    setCurrentSlide((prev) => {
      setPrevSlide(prev)
      return (prev + 1) % heroSlides.length
    })
  }, [heroSlides.length])

  useEffect(() => {
    const timer = setInterval(nextSlide, SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [nextSlide])

  // Clear previous slide after crossfade completes
  useEffect(() => {
    if (prevSlide === null) return
    const timeout = setTimeout(() => setPrevSlide(null), 1200)
    return () => clearTimeout(timeout)
  }, [prevSlide])

  const slide = heroSlides.length > 0 ? (heroSlides[currentSlide] ?? heroSlides[0]) : null

  const handleScrollDown = () => {
    if (sectionRef.current) {
      const scrollTarget = sectionRef.current.offsetHeight - window.innerHeight
      window.scrollTo({ top: scrollTarget, behavior: "smooth" })
    }
  }

  return (
    <section id="home" ref={sectionRef} className="relative z-0 h-[180svh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `scale(${imageScale})` }}
          src={asset("/images/Video2.mp4")}
          autoPlay
          loop
          muted
          playsInline
          poster={asset("/images/heroes/hero-bocaue.jpg")}
        />

        {/* Dynamic overlay */}
        <div
          className="absolute inset-0 bg-foreground"
          style={{ opacity: overlayOpacity }}
        />

        {/* Hero text */}
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center"
          style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}
        >
          {/* MHACTO Bocaue Tagline — always visible */}
          <p className="mb-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-white/60 border border-white/20 rounded-full px-4 py-1 backdrop-blur-sm bg-black/20">
            MHACTO Bocaue &mdash; History, Arts, Culture &amp; Tourism
          </p>

          {slide ? (
          <div key={currentSlide} className="flex flex-col items-center animate-hero-text-in">
            <p className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-secondary">
              {slide.subtitle}
            </p>
            <h1 className="max-w-3xl text-balance text-3xl font-bold leading-tight text-card sm:text-5xl md:text-6xl lg:text-7xl font-heading">
              {slide.title}{" "}
              <span className="text-primary">{slide.highlight}</span>
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-sm text-card/85 sm:text-base md:text-lg lg:text-xl">
              {slide.description}
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

            {/* Pagination dots — inside text block to avoid overlap */}
            <div className="mt-8 flex items-center gap-3">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrevSlide(currentSlide)
                    setCurrentSlide(i)
                  }}
                  className={`rounded-full border-2 transition-all duration-500 ${
                    i === currentSlide
                      ? "h-3.5 w-3.5 border-white bg-white scale-110"
                      : "h-3 w-3 border-white/60 bg-transparent hover:border-white hover:bg-white/30"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
          ) : !loaded ? (
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="h-4 w-48 rounded bg-white/20" />
              <div className="h-12 w-80 rounded bg-white/20" />
              <div className="h-4 w-64 rounded bg-white/10" />
            </div>
          ) : null}
        </div>

        {/* Scroll down indicator */}
        <button
          onClick={handleScrollDown}
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
