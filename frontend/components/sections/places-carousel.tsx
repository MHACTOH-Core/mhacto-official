"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"

import { type Place } from "@/lib/data/places-data"
import { apiFetchPublishedPlaces, type CMSPost } from "@/lib/api"
import { asset } from "@/lib/utils"
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

/** Map a CMS post to the Place shape used by the carousel */
function mapCmsPostToPlace(post: CMSPost): Place {
  const firstImageUrl = post.image?.[0] ?? ""
  return {
    id: post.id,
    title: post.title,
    description: post.body?.substring(0, 200) || "",
    image: firstImageUrl.startsWith("/images")
      ? asset(firstImageUrl)
      : firstImageUrl || asset("/images/heroes/hero-bocaue.jpg"),
    category: "landmark",
    location: post.location ?? undefined,
    established: post.established ?? undefined,
  }
}

export function PlacesCarousel() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  /** Ref-based flag — avoids re-renders when toggling auto-play on/off */
  const isAutoPlayActiveRef = useRef(true)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [places, setPlaces] = useState<Place[]>([])
  const sectionHeadingRef = useRevealOnScroll<HTMLDivElement>()

  // Fetch places from backend API
  // Sends GET /api/posts/read.php?type=places&limit=10 → PHP runs SQL SELECT → returns JSON
  useEffect(() => {
    apiFetchPublishedPlaces(10)
      .then((posts) => {
        if (posts && posts.length > 0) {
          setPlaces(posts.map(mapCmsPostToPlace))
        }
      })
      .catch(() => {})
  }, [])

  // Sync active slide index with the carousel's internal state
  useEffect(() => {
    if (!carouselApi) return

    const handleSlideSelect = () => {
      setActiveSlideIndex(carouselApi.selectedScrollSnap())
    }

    carouselApi.on("select", handleSlideSelect)
    handleSlideSelect()

    return () => {
      carouselApi.off("select", handleSlideSelect)
    }
  }, [carouselApi])

  // Auto-play: advance slides on a timer (uses ref to avoid re-render loop)
  useEffect(() => {
    if (!carouselApi) return

    const autoPlayInterval = setInterval(() => {
      if (isAutoPlayActiveRef.current) {
        carouselApi.scrollNext()
      }
    }, AUTOPLAY_INTERVAL_MS)

    return () => clearInterval(autoPlayInterval)
  }, [carouselApi])

  /** Temporarily pause auto-play when the user interacts manually */
  const pauseAutoPlayOnInteraction = useCallback(() => {
    isAutoPlayActiveRef.current = false
    setTimeout(() => {
      isAutoPlayActiveRef.current = true
    }, AUTOPLAY_RESUME_DELAY_MS)
  }, [])

  const handlePreviousSlide = () => {
    pauseAutoPlayOnInteraction()
    carouselApi?.scrollPrev()
  }

  const handleNextSlide = () => {
    pauseAutoPlayOnInteraction()
    carouselApi?.scrollNext()
  }

  // Don't render if no places loaded
  if (places.length === 0) return null

  return (
    <section className="relative z-10 bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          ref={sectionHeadingRef}
          className="reveal-on-scroll mb-6 text-center md:mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Featured Places
          </span>
          <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl font-heading">
            Slide through Bocaue&apos;s landmarks
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Browse each place one by one. Slideshow auto-plays, or use the
            previous and next buttons to navigate manually.
          </p>
        </div>

        <div className="relative">
          <Carousel
            setApi={setCarouselApi}
            opts={{
              loop: true,
              align: "center",
            }}
            className="w-full"
            onMouseEnter={pauseAutoPlayOnInteraction}
            onTouchStart={pauseAutoPlayOnInteraction}
          >
            <CarouselContent className="items-center">
              {places.map((place, index) => {
                const isActiveSlide = index === activeSlideIndex

                return (
                  <CarouselItem
                    key={place.id}
                    className="basis-[85%] sm:basis-3/4 md:basis-3/5 lg:basis-1/2"
                  >
                    <div className="h-[280px] sm:h-[340px] md:h-[400px] flex items-center justify-center">
                      <article
                        className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] overflow-hidden rounded-2xl border border-border shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                        style={{
                          transform: isActiveSlide ? "scale(1)" : "scale(0.85)",
                          opacity: isActiveSlide ? 1 : 0.45,
                        }}
                      >
                        {/* Landscape image - fixed height, fills entire card */}
                        <Image
                          src={place.image}
                          alt={place.title}
                          fill
                          sizes="(max-width: 640px) 85vw, (max-width: 768px) 75vw, (max-width: 1024px) 60vw, 50vw"
                          loading={index === 0 ? "eager" : "lazy"}
                          className="object-cover"
                        />

                        {/* Content overlay at bottom with 65% opacity */}
                        <div className="absolute bottom-0 left-0 right-0 bg-card/65 backdrop-blur-sm p-4 sm:p-5 md:p-6">
                          <h3 className="text-lg font-semibold text-card-foreground sm:text-xl md:text-2xl">
                            {place.title}
                          </h3>
                          <p
                            className="mt-1.5 sm:mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                            style={{
                              opacity: isActiveSlide ? 1 : 0,
                              transform: isActiveSlide ? "translateY(0)" : "translateY(8px)",
                              maxHeight: isActiveSlide ? "200px" : "0",
                              overflow: "hidden",
                            }}
                          >
                            {place.description}
                          </p>
                        </div>
                      </article>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>

            <CarouselPrevious
              className="h-9 w-9 sm:h-10 sm:w-10 -left-2 sm:-left-4 md:-left-12 bg-primary hover:bg-primary/80 text-primary-foreground"
              onClick={handlePreviousSlide}
            />
            <CarouselNext
              className="h-9 w-9 sm:h-10 sm:w-10 -right-2 sm:-right-4 md:-right-12 bg-primary hover:bg-primary/80 text-primary-foreground"
              onClick={handleNextSlide}
            />
          </Carousel>
        </div>
      </div>
    </section>
  )
}

