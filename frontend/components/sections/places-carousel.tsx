"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"

import { type HeritageSite } from "@/lib/data/destinations-data"
import { apiFetchFeaturedByLabel, apiFetchByLabel } from "@/lib/api"
import { cmsToHeritageSite } from "@/lib/cms-mappers"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useRevealOnScroll } from "@/hooks/use-reveal"

/** Seconds between automatic carousel advances */
const AUTOPLAY_INTERVAL_MS = 5000
/** How long auto-play pauses after user interaction */
const AUTOPLAY_RESUME_DELAY_MS = 10000

export function PlacesCarousel() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const isAutoPlayActiveRef = useRef(true)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const sectionHeadingRef = useRevealOnScroll<HTMLDivElement>()
  const [destinations, setDestinations] = useState<HeritageSite[]>([])

  // Fetch featured destinations from API
  useEffect(() => {
    apiFetchFeaturedByLabel("destinations", 2)
      .catch(() => apiFetchByLabel("destinations", 2))
      .then((posts) => { if (posts?.length) setDestinations(posts.slice(0, 2).map(cmsToHeritageSite)) })
      .catch(() => {})
  }, [])

  // Sync active slide index
  useEffect(() => {
    if (!carouselApi) return
    const handleSelect = () => setActiveSlideIndex(carouselApi.selectedScrollSnap())
    carouselApi.on("select", handleSelect)
    handleSelect()
    return () => { carouselApi.off("select", handleSelect) }
  }, [carouselApi])

  // Auto-play
  useEffect(() => {
    if (!carouselApi) return
    const id = setInterval(() => {
      if (isAutoPlayActiveRef.current) carouselApi.scrollNext()
    }, AUTOPLAY_INTERVAL_MS)
    return () => clearInterval(id)
  }, [carouselApi])

  const pauseAutoPlay = useCallback(() => {
    isAutoPlayActiveRef.current = false
    setTimeout(() => { isAutoPlayActiveRef.current = true }, AUTOPLAY_RESUME_DELAY_MS)
  }, [])

  const handlePrev = () => { pauseAutoPlay(); carouselApi?.scrollPrev() }
  const handleNext = () => { pauseAutoPlay(); carouselApi?.scrollNext() }

  if (destinations.length === 0) return null

  return (
    <section className="relative z-10 bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div ref={sectionHeadingRef} className="reveal-on-scroll mb-6 text-center md:mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Tourist Destinations
          </span>
          <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl font-heading">
            Discover Bocaue&apos;s Landmarks
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Explore the heritage sites and cultural landmarks that define Bocaue.
            Slideshow auto-plays, or use the buttons to navigate.
          </p>
        </div>

        <div className="relative">
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: true, align: "center" }}
            className="w-full"
            onMouseEnter={pauseAutoPlay}
            onTouchStart={pauseAutoPlay}
          >
            <CarouselContent className="items-center">
              {destinations.map((site, index) => {
                const isActive = index === activeSlideIndex
                return (
                  <CarouselItem key={site.id} className="basis-[85%] sm:basis-3/4 md:basis-3/5 lg:basis-1/2">
                    <div className="h-[280px] sm:h-[340px] md:h-[400px] flex items-center justify-center">
                      <Link
                        href="/destinations"
                        className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] overflow-hidden rounded-2xl border border-border shadow-sm transition-all duration-500 ease-smooth block"
                        style={{
                          transform: isActive ? "scale(1)" : "scale(0.85)",
                          opacity: isActive ? 1 : 0.45,
                        }}
                      >
                        <Image
                          src={site.image}
                          alt={site.name}
                          fill
                          sizes="(max-width: 640px) 85vw, (max-width: 768px) 75vw, (max-width: 1024px) 60vw, 50vw"
                          loading={index === 0 ? "eager" : "lazy"}
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-card/65 backdrop-blur-sm p-4 sm:p-5 md:p-6">
                          <h3 className="text-lg font-semibold text-card-foreground sm:text-xl md:text-2xl">
                            {site.name}
                          </h3>
                          <p
                            className="mt-1.5 sm:mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg transition-all duration-400 ease-smooth"
                            style={{
                              opacity: isActive ? 1 : 0,
                              transform: isActive ? "translateY(0)" : "translateY(8px)",
                              maxHeight: isActive ? "200px" : "0",
                              overflow: "hidden",
                            }}
                          >
                            {site.description}
                          </p>
                          {isActive && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 text-primary" />
                              {site.location}
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>

            <CarouselPrevious
              className="h-9 w-9 sm:h-10 sm:w-10 -left-2 sm:-left-4 md:-left-12 bg-primary hover:bg-primary/80 text-primary-foreground"
              onClick={handlePrev}
            />
            <CarouselNext
              className="h-9 w-9 sm:h-10 sm:w-10 -right-2 sm:-right-4 md:-right-12 bg-primary hover:bg-primary/80 text-primary-foreground"
              onClick={handleNext}
            />
          </Carousel>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center reveal-on-scroll delay-300">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            View All Destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

