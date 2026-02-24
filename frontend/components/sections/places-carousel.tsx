"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"

import { attractions } from "@/lib/data/places-data"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useRevealOnScroll } from "@/hooks/use-reveal"

export function PlacesCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const headingRef = useRevealOnScroll<HTMLDivElement>()

  // Track active slide
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap())
    }

    api.on("select", onSelect)
    onSelect()

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  // Auto-play functionality
  useEffect(() => {
    if (!api || !isPlaying) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [api, isPlaying])

  // Pause auto-play on user interaction
  const handleUserInteraction = useCallback(() => {
    setIsPlaying(false)
    setTimeout(() => setIsPlaying(true), 10000)
  }, [])

  const handlePrevious = () => {
    handleUserInteraction()
    api?.scrollPrev()
  }

  const handleNext = () => {
    handleUserInteraction()
    api?.scrollNext()
  }

  return (
    <section className="relative z-10 bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          ref={headingRef}
          className="reveal-on-scroll mb-6 text-center md:mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Featured Places
          </span>
          <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
            Slide through Bocaue&apos;s landmarks
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Browse each place one by one. Slideshow auto-plays, or use the
            previous and next buttons to navigate manually.
          </p>
        </div>

        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{
              loop: true,
              align: "center",
            }}
            className="w-full"
            onMouseEnter={handleUserInteraction}
            onTouchStart={handleUserInteraction}
          >
            <CarouselContent className="items-center">
              {attractions.map((place, index) => {
                const isActive = index === activeIndex

                return (
                  <CarouselItem
                    key={place.id}
                    className="basis-[85%] sm:basis-3/4 md:basis-3/5 lg:basis-1/2"
                  >
                    <div className="h-[280px] sm:h-[340px] md:h-[400px] flex items-center justify-center">
                      <article
                        className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] overflow-hidden rounded-2xl border border-border shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                        style={{
                          transform: isActive ? "scale(1)" : "scale(0.85)",
                          opacity: isActive ? 1 : 0.45,
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
                              opacity: isActive ? 1 : 0,
                              transform: isActive ? "translateY(0)" : "translateY(8px)",
                              maxHeight: isActive ? "200px" : "0",
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
              onClick={handlePrevious}
            />
            <CarouselNext
              className="h-9 w-9 sm:h-10 sm:w-10 -right-2 sm:-right-4 md:-right-12 bg-primary hover:bg-primary/80 text-primary-foreground"
              onClick={handleNext}
            />
          </Carousel>
        </div>
      </div>
    </section>
  )
}

