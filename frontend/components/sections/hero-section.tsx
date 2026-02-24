"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { asset } from "@/lib/utils"

const heroSlides = [
  {
    src: asset("/images/places/river-festival.jpg"),
    alt: "Pagoda sa Wawa — Bocaue River Festival",
    subtitle: "Bocaue's Grandest Tradition",
    title: "The Iconic",
    highlight: "Pagoda Festival",
    description:
      "Experience the Pagoda sa Wawa \u2014 a centuries-old fluvial celebration of faith, color, and community spirit on the historic Bocaue River.",
    href: "/places/bocaue-river-festival",
  },
  {
    src: asset("/images/heroes/hero-bocaue.jpg"),
    alt: "Scenic view of Bocaue, Bulacan",
    subtitle: "Bocaue, Bulacan",
    title: "Explore The River",
    highlight: "Town Wonders",
    description:
      "Where rich heritage meets vibrant culture \u2014 explore centuries of tradition, lively festivals, and the warm hospitality of Bocaue.",
    href: "/places",
  },
  {
    src: asset("/images/places/church-bocaue.jpg"),
    alt: "St. Martin of Tours Parish Church",
    subtitle: "Heritage & Faith",
    title: "St. Martin of Tours",
    highlight: "Parish Church",
    description:
      "A centuries-old landmark standing as a testament to Bocaue\u2019s enduring faith and Spanish colonial heritage.",
    href: "/places/st-martin-church",
  },
  {
    src: asset("/images/places/philippine-arena.jpg"),
    alt: "Philippine Arena",
    subtitle: "Modern Landmarks",
    title: "The Iconic",
    highlight: "Philippine Arena",
    description:
      "Home to the world\u2019s largest indoor arena, Bocaue is where tradition meets modernity on a grand scale.",
    href: "/places/philippine-arena",
  },
  {
    src: asset("/images/places/fireworks.jpg"),
    alt: "Fireworks in Bocaue",
    subtitle: "The Fireworks Capital",
    title: "Bocaue\u2019s Famous",
    highlight: "Pyrotechnic Arts",
    description:
      "Known nationwide as the fireworks capital of the Philippines, Bocaue lights up the sky with dazzling displays year-round.",
    href: "/places",
  },
]

const SLIDE_INTERVAL = 6000

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1)
}

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [prevSlide, setPrevSlide] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

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
    setCurrentSlide((prev) => {
      setPrevSlide(prev)
      return (prev + 1) % heroSlides.length
    })
  }, [])

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

  const slide = heroSlides[currentSlide]

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
            MHACTO Bocaue &mdash; Heritage, Arts, Culture &amp; Tourism
          </p>

          <div key={currentSlide} className="flex flex-col items-center animate-hero-text-in">
            <p className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-secondary">
              {slide.subtitle}
            </p>
            <h1 className="max-w-3xl text-balance text-3xl font-bold leading-tight text-card sm:text-5xl md:text-6xl lg:text-7xl">
              {slide.title}{" "}
              <span className="text-primary">{slide.highlight}</span>
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-sm text-card/85 sm:text-base md:text-lg lg:text-xl">
              {slide.description}
            </p>
            <Link href={slide.href} className="mt-6 sm:mt-8">
              <Button
                size="lg"
                className="group gap-2 rounded-full bg-primary px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Circle pagination dots */}
        <div
          className="absolute bottom-20 sm:bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-3"
          style={{ opacity: textOpacity }}
        >
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
