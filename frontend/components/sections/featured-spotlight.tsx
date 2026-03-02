"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { CalendarDays, MapPin, Sparkles, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiFetchSpotlight, type Spotlight, type FeaturedContent } from "@/lib/api"
import { asset } from "@/lib/utils"

// No hardcoded fallback — spotlight comes from backend

export function FeaturedSpotlight() {
  const [spotlightData, setSpotlightData] = useState<Spotlight | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sends GET /api/home/spotlight.php → PHP runs SQL SELECT on featured_content WHERE section='spotlight' → returns JSON
  useEffect(() => {
    apiFetchSpotlight()
      .then((responseData) => {
        if (responseData) {
          setSpotlightData(responseData as unknown as Spotlight)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (!spotlightData) return null

  const spotlightImageUrl = spotlightData.image 
    ? (spotlightData.image.startsWith('/images') ? asset(spotlightData.image) : spotlightData.image)
    : asset("/images/places/river-festival.jpg")

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border shadow-xl reveal-on-scroll">
      {/* Background image */}
      {spotlightImageUrl && (
        <div className="absolute inset-0">
          <Image
            src={spotlightImageUrl}
            alt={spotlightData.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end p-5 sm:p-8 md:p-12 min-h-[300px] sm:min-h-[380px] lg:min-h-[460px]">
        {/* Spotlight badge */}
        <div className="mb-4 animate-fade-in-up delay-200">
          <Badge
            variant="secondary"
            className="bg-primary/90 text-primary-foreground border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm"
          >
            <Sparkles className="mr-1.5 h-3 w-3" />
            Featured Spotlight
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl max-w-2xl leading-tight animate-fade-in-up delay-300 font-heading">
          {spotlightData.title}
        </h3>

        {/* Meta info */}
        <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-white/80 animate-fade-in-up delay-400">
          {spotlightData.date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(new Date(spotlightData.date), "EEEE, MMMM d, yyyy")}
            </span>
          )}
          {spotlightData.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              {spotlightData.location}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 max-w-2xl text-sm text-white/70 leading-relaxed sm:text-base md:text-lg animate-fade-in-up delay-500">
          {spotlightData.description}
        </p>

        {/* CTA */}
        <div className="mt-6 flex flex-wrap gap-3 animate-fade-in-up delay-600">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <Link href="/inquire">
              Plan Your Visit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/60 hover:text-white"
          >
            <Link href="/contact">Learn More</Link>
          </Button>
        </div>

        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
      </div>
    </div>
  )
}
