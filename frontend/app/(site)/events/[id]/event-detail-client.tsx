"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CalendarDays, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiFetchPostById, apiLogDestinationView } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { asset } from "@/lib/utils"

export default function EventDetailClient({ id }: { id: string }) {
  const [event, setEvent] = useState<CMSPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetchPostById(id)
      .then((data) => {
        setEvent(data)
        apiLogDestinationView(Number(data.id), undefined, window.location.pathname).catch(() => {})
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-4 w-full max-w-3xl px-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded-xl w-full" />
          <div className="h-12 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
        <Link href="/events" className="text-primary hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </div>
    )
  }

  const dateStr = event.newsDate ?? event.createdAt
  const formattedDate = new Date(dateStr).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const heroImage = event.image?.[0]
    ? (event.image[0].startsWith("/images") ? asset(event.image[0]) : event.image[0])
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image */}
      {heroImage && (
        <div className="relative w-full h-64 sm:h-80 md:h-96 bg-muted">
          <Image src={heroImage} alt={event.title} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        {/* Back link */}
        <div className={heroImage ? "-mt-16 relative z-10" : "pt-24"}>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Event</Badge>
            {event.isFeatured && (
              <Badge className="bg-red-500/90 text-white border-0">Featured</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-heading leading-tight reveal-on-scroll">
            {event.title}
          </h1>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formattedDate}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {event.location}
              </span>
            )}
            {event.hours && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                {event.hours}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <article className="py-10 md:py-14">
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-line reveal-on-scroll">
            {event.body}
          </div>

          {/* Additional images */}
          {event.image && event.image.length > 1 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {event.image.slice(1).map((img, i) => {
                const src = img.startsWith("/images") ? asset(img) : img
                return (
                  <div key={img} className="relative h-48 sm:h-56 rounded-xl overflow-hidden bg-muted">
                    <Image src={src} alt={`${event.title} - Image ${i + 2}`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                  </div>
                )
              })}
            </div>
          )}
        </article>

        {/* Bottom navigation */}
        <div className="pb-12 pt-4 border-t border-border">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  )
}
