"use client"

"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, MapPin, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRevealOnScroll } from "@/hooks/use-reveal"
import { apiFetchPublishedPlaces, type CMSPost } from "@/lib/api"
import { useAPIData } from "@/hooks/use-api-data"

// Derive category labels from the category string
function categoryLabel(cat?: string) {
  if (!cat) return "Place"
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default function PlacesPage() {
  const { data: places = [], isLoading: loading, error } = useAPIData<CMSPost[]>(
    "published-places",
    () => apiFetchPublishedPlaces(),
  )
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [showAll, setShowAll] = useState(false)

  // Derive unique categories from data
  const categories = useMemo(() => {
    const cats = new Set<string>()
    places.forEach((p) => { if (p.category) cats.add(p.category) })
    return Array.from(cats)
  }, [places])

  const filtered = activeCategory === "all"
    ? places
    : places.filter((p) => p.category === activeCategory)

  const INITIAL_COUNT = 8
  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_COUNT)

  const spotsHeadingRef = useRevealOnScroll<HTMLDivElement>()
  const filtersRef = useRevealOnScroll<HTMLDivElement>()

  return (
    <main className="min-h-screen bg-background">

      {/* Page header */}
      <section className="border-b border-border bg-card mt-14 pt-8 pb-8 sm:mt-16 sm:pt-12 sm:pb-10 md:mt-20 md:pt-14 lg:mt-28 lg:pt-18 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-6 gap-1 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <div className="text-center animate-fade-in-up">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Explore
            </span>
            <h1 className="mt-2 text-3xl font-bold text-card-foreground md:text-4xl lg:text-5xl">
              Tourist Spots
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              A complete guide to tourist spots in Bocaue, Bulacan.
            </p>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading places...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Unable to load places.</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && places.length === 0 && (
        <div className="text-center py-20">
          <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No places published yet.</p>
        </div>
      )}

      {/* All places */}
      {!loading && places.length > 0 && (
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
            {categories.length > 1 && (
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
                    {categoryLabel(cat)}
                  </Button>
                ))}
              </div>
            )}

            {/* Place cards */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-start">
              {displayed.map((place, i) => (
                <div
                  key={place.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                >
                  <Link
                    href={`/places/${place.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-muted">
                      {place.image.length > 0 ? (
                        <Image
                          src={place.image[0]}
                          alt={place.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          loading="lazy"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                          <MapPin className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-black/60 text-white border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                          {categoryLabel(place.category)}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {place.title}
                      </h3>
                      <p className="mt-1 text-sm sm:text-base text-muted-foreground line-clamp-2">
                        {place.body}
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
      )}

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
