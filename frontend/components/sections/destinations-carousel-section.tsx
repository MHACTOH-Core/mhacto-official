"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin, Compass, Clock, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useRevealOnScroll } from "@/hooks/use-reveal"
import {
  heritageSites,
  tourPackages,
  type HeritageSite,
  type TourPackage,
} from "@/lib/data/destinations-data"

const AUTOPLAY_MS = 4000
const PAUSE_MS = 8000

type SlideItem =
  | { kind: "destination"; data: HeritageSite; href: "/destinations" }
  | { kind: "tour"; data: TourPackage; href: "/travel-tours" }

// Pick first 2 destinations + first 2 tours → 4 slides
const slides: SlideItem[] = [
  ...heritageSites.slice(0, 2).map(
    (d): SlideItem => ({ kind: "destination", data: d, href: "/destinations" }),
  ),
  ...tourPackages.slice(0, 2).map(
    (t): SlideItem => ({ kind: "tour", data: t, href: "/travel-tours" }),
  ),
]

export function DestinationsCarouselSection() {
  const [api, setApi] = useState<CarouselApi>()
  const autoRef = useRef(true)
  const [active, setActive] = useState(0)
  const headingRef = useRevealOnScroll<HTMLDivElement>()

  useEffect(() => {
    if (!api) return
    const onSelect = () => setActive(api.selectedScrollSnap())
    api.on("select", onSelect)
    onSelect()
    return () => { api.off("select", onSelect) }
  }, [api])

  useEffect(() => {
    if (!api) return
    const id = setInterval(() => { if (autoRef.current) api.scrollNext() }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [api])

  const pause = useCallback(() => {
    autoRef.current = false
    setTimeout(() => { autoRef.current = true }, PAUSE_MS)
  }, [])

  return (
    <section className="relative z-10 bg-background py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div ref={headingRef} className="reveal-on-scroll mb-10 text-center md:mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary sm:text-sm">
            <Compass className="h-4 w-4" />
            Tourist Destinations &amp; Travel Tours
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Discover Bocaue&apos;s Must-See Spots
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
            Heritage landmarks and curated travel packages &mdash; explore
            the destinations and tours that make Bocaue unforgettable.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{ loop: true, align: "center" }}
            className="w-full"
            onMouseEnter={pause}
            onTouchStart={pause}
          >
            <CarouselContent className="items-center -ml-4">
              {slides.map((slide, i) => {
                const isActive = i === active
                const isDest = slide.kind === "destination"
                const name = isDest ? slide.data.name : slide.data.name
                const image = slide.data.image
                const description = slide.data.description

                return (
                  <CarouselItem
                    key={`${slide.kind}-${slide.data.id}`}
                    className="pl-4 basis-[88%] sm:basis-[70%] md:basis-[55%] lg:basis-[40%]"
                  >
                    <div className="flex items-center justify-center py-2">
                      <Link
                        href={slide.href}
                        className="relative block w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:border-primary/30 hover:shadow-xl"
                        style={{
                          transform: isActive ? "scale(1)" : "scale(0.88)",
                          opacity: isActive ? 1 : 0.45,
                        }}
                      >
                        {/* Image */}
                        <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
                          <Image
                            src={image}
                            alt={name}
                            fill
                            sizes="(max-width: 640px) 88vw, (max-width: 768px) 70vw, (max-width: 1024px) 55vw, 40vw"
                            loading={i === 0 ? "eager" : "lazy"}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge
                              variant="secondary"
                              className={`border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm text-white ${
                                isDest ? "bg-primary/90" : "bg-amber-600/90"
                              }`}
                            >
                              {isDest ? "Destination" : "Travel & Tour"}
                            </Badge>
                          </div>

                          {isDest && (slide.data as HeritageSite).location && (
                            <div className="absolute bottom-3 left-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                <MapPin className="h-3 w-3" />
                                {(slide.data as HeritageSite).location.split(",")[0]}
                              </span>
                            </div>
                          )}

                          {!isDest && (
                            <div className="absolute bottom-3 left-3 flex gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                <Clock className="h-3 w-3" />
                                {(slide.data as TourPackage).duration}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div
                          className="p-5 transition-all duration-500"
                          style={{
                            opacity: isActive ? 1 : 0.6,
                            transform: isActive ? "translateY(0)" : "translateY(4px)",
                          }}
                        >
                          <h3 className="text-lg font-bold text-card-foreground sm:text-xl">
                            {name}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                            {description}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                            {isDest ? "View All Destinations" : "Browse Tour Packages"}
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>

            <CarouselPrevious
              className="h-9 w-9 sm:h-10 sm:w-10 -left-2 sm:-left-4 md:-left-12 bg-primary hover:bg-primary/80 text-primary-foreground"
              onClick={() => { pause(); api?.scrollPrev() }}
            />
            <CarouselNext
              className="h-9 w-9 sm:h-10 sm:w-10 -right-2 sm:-right-4 md:-right-12 bg-primary hover:bg-primary/80 text-primary-foreground"
              onClick={() => { pause(); api?.scrollNext() }}
            />
          </Carousel>

          {/* Dot indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => { pause(); api?.scrollTo(idx) }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === active ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA row — two buttons */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 reveal-on-scroll delay-300">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full gap-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Link href="/destinations">
              <MapPin className="h-4 w-4" />
              All Destinations
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full gap-2 border-amber-500/30 hover:bg-amber-600 hover:text-white transition-all"
          >
            <Link href="/travel-tours">
              <Route className="h-4 w-4" />
              Browse Tours
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
