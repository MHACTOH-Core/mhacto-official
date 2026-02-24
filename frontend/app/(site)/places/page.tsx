"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Clock, Star } from "lucide-react"
import { format } from "date-fns"
import {
  attractions,
  getEventDates,
  getPastEvents,
  getUpcomingEvents,
  getCategories,
  getAttractionsByCategory,
  categoryLabels,
  type PlaceCategory,
} from "@/lib/data/places-data"
import { FeaturedSpotlight } from "@/components/sections/featured-spotlight"
import { FeaturedEventsPortrait } from "@/components/sections/featured-events-portrait"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRevealOnScroll } from "@/hooks/use-reveal"

const eventDates = getEventDates()
const today = new Date()

export default function PlacesPage() {
  const upcoming = getUpcomingEvents(today)
  const past = getPastEvents(today)
  const categories = getCategories()
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | "all">("all")
  const [showAll, setShowAll] = useState(false)

  const filtered = getAttractionsByCategory(activeCategory)
  const INITIAL_COUNT = 4
  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_COUNT)

  const highlightsRef = useRevealOnScroll<HTMLDivElement>()
  const spotsHeadingRef = useRevealOnScroll<HTMLDivElement>()
  const filtersRef = useRevealOnScroll<HTMLDivElement>()
  const calendarHeadingRef = useRevealOnScroll<HTMLDivElement>()
  const calendarRef = useRevealOnScroll<HTMLDivElement>()
  const upcomingRef = useRevealOnScroll<HTMLDivElement>()
  const pastRef = useRevealOnScroll<HTMLDivElement>()

  return (
    <main className="min-h-screen bg-background">

      {/* Page header */}
      <section className="border-b border-border bg-card mt-14 pt-8 pb-8 sm:mt-16 sm:pt-12 sm:pb-10 md:mt-20 md:pt-14 lg:mt-28 lg:pt-18 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-6 gap-1 text-muted-foreground">
            <Link href="/#attractions">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <div className="text-center animate-fade-in-up">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Explore
            </span>
            <h1 className="mt-2 text-3xl font-bold text-card-foreground md:text-4xl lg:text-5xl">
              Places &amp; Events
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              A complete guide to tourist spots and the events calendar in Bocaue.
            </p>
          </div>
        </div>
      </section>

      {/* Spotlight & Highlights */}
      <section className="border-b border-border bg-muted/40 py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div ref={highlightsRef} className="reveal-on-scroll mb-6 sm:mb-10">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
                  Spotlight &amp; Highlights
                </h2>
                <p className="text-muted-foreground">Featured places &amp; upcoming events</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] items-start">
            <FeaturedSpotlight />
            <FeaturedEventsPortrait />
          </div>
        </div>
      </section>

      {/* All places overview */}
      <section className="py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div ref={spotsHeadingRef} className="reveal-on-scroll mb-8 sm:mb-10 text-center">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
              All Tourist Spots in Bocaue
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover every must-see place in town — from heritage sites and nature walks to festivals, artisan crafts, and cuisine.
            </p>
          </div>

          {/* Category filter tabs */}
          <div ref={filtersRef} className="reveal-on-scroll mb-6 sm:mb-8 flex flex-wrap justify-center gap-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => { setActiveCategory("all"); setShowAll(false) }}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => { setActiveCategory(cat); setShowAll(false) }}
              >
                {categoryLabels[cat]}
              </Button>
            ))}
          </div>

          {/* Place cards */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {displayed.map((place, i) => (
              <div
                key={place.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                <Link
                  href={`/places/${place.id}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={place.image}
                      alt={place.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-black/60 text-white border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                        {categoryLabels[place.category]}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {place.title}
                    </h3>
                    <p className="mt-1 text-sm sm:text-base text-muted-foreground line-clamp-2">
                      {place.description}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      {place.established && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Est. {place.established}
                        </span>
                      )}
                      {place.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{place.location.split(",")[0]}</span>
                        </span>
                      )}
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Read the full story
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* View All button */}
          {!showAll && filtered.length > INITIAL_COUNT && (
            <div className="mt-10 text-center animate-fade-in-up">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full gap-2"
                onClick={() => setShowAll(true)}
              >
                View All {filtered.length} Places
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {showAll && filtered.length > INITIAL_COUNT && (
            <div className="mt-10 text-center animate-fade-in">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShowAll(false)}
              >
                Show fewer
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Events calendar + past & future lists */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div ref={calendarHeadingRef} className="reveal-on-scroll mb-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Events Calendar
              </h2>
              <p className="text-muted-foreground">
                Past and upcoming events in Bocaue
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:gap-10 grid-cols-1 lg:grid-cols-3">
            {/* Calendar */}
            <div ref={calendarRef} className="reveal-on-scroll lg:col-span-1">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Calendar</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Days with events are highlighted.
                  </p>
                </CardHeader>
                <CardContent className="flex justify-center overflow-x-auto">
                  <Calendar
                    mode="single"
                    defaultMonth={today}
                    modifiers={{
                      event: eventDates,
                    }}
                    modifiersClassNames={{
                      event: "bg-primary/20 text-primary font-medium ring-1 ring-primary/30",
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Upcoming & Past events lists */}
            <div className="space-y-8 lg:col-span-2">
              <div ref={upcomingRef} className="reveal-on-scroll delay-100">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Upcoming events
                </h3>
                <div className="space-y-3">
                  {upcoming.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      No upcoming events at the moment. Check back later.
                    </p>
                  ) : (
                    upcoming.map((event) => (
                      <Card
                        key={event.id}
                        className="border-border bg-card"
                      >
                        <CardContent className="flex flex-wrap items-start justify-between gap-2 p-4 sm:flex-nowrap">
                          <div>
                            <p className="font-medium text-card-foreground">
                              {event.title}
                            </p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {format(event.date, "EEEE, MMMM d, yyyy")}
                              {event.location && ` · ${event.location}`}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            Upcoming
                          </span>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              <div ref={pastRef} className="reveal-on-scroll delay-200">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Past events
                </h3>
                <div className="space-y-3">
                  {past.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      No past events listed.
                    </p>
                  ) : (
                    past.map((event) => (
                      <Card
                        key={event.id}
                        className="border-border bg-muted/20"
                      >
                        <CardContent className="p-4">
                          <p className="font-medium text-card-foreground">
                            {event.title}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {format(event.date, "EEEE, MMMM d, yyyy")}
                            {event.location && ` · ${event.location}`}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <p className="text-muted-foreground">
            Plan your visit to Bocaue.{" "}
            <Link
              href="/inquire"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Submit an Inquiry
            </Link>{" "}
            or{" "}
            <Link
              href="/#contact"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
