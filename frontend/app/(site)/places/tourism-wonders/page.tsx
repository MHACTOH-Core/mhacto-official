"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Compass, MapPin, Clock, Star, ArrowRight, Phone, ChevronDown, ChevronUp, Search,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  attractions,
  categoryLabels,
  type Place,
  type PlaceCategory,
} from "@/lib/data/places-data"
import { apiFetchPublishedPlaces } from "@/lib/api"

const categoryColors: Record<PlaceCategory, string> = {
  heritage: "bg-amber-100 text-amber-800 border-amber-200",
  religious: "bg-violet-100 text-violet-800 border-violet-200",
  museum: "bg-blue-100 text-blue-800 border-blue-200",
  nature: "bg-green-100 text-green-800 border-green-200",
  festival: "bg-rose-100 text-rose-800 border-rose-200",
  arts: "bg-orange-100 text-orange-800 border-orange-200",
  cuisine: "bg-yellow-100 text-yellow-800 border-yellow-200",
  landmark: "bg-primary/10 text-primary border-primary/20",
  venue: "bg-indigo-100 text-indigo-800 border-indigo-200",
}

function PlaceCard({ place }: { place: Place }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={place.image}
          alt={place.title}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <Badge
            variant="outline"
            className={`text-xs backdrop-blur-sm border ${categoryColors[place.category] ?? "bg-muted"}`}
          >
            {categoryLabels[place.category]}
          </Badge>
          {place.established && (
            <span className="text-[11px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Est. {place.established}
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-black text-foreground mb-1 group-hover:text-primary transition-colors leading-snug">
          {place.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{place.description}</p>

        {place.highlights && place.highlights.length > 0 && (
          <ul className="mb-4 space-y-1">
            {place.highlights.slice(0, 3).map((hl) => (
              <li key={hl} className="flex items-start gap-1.5 text-xs text-foreground">
                <Star className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                {hl}
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-border pt-3 space-y-1.5">
          {place.location && (
            <div className="flex items-start gap-2 text-xs text-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              {place.location}
            </div>
          )}
          {place.hours && (
            <div className="flex items-start gap-2 text-xs text-foreground">
              <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              {place.hours}
            </div>
          )}
          {place.contact && (
            <div className="flex items-start gap-2 text-xs text-foreground">
              <Phone className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              {place.contact}
            </div>
          )}
        </div>

        {(place.fullDescription || place.story) && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {expanded ? (
                <><ChevronUp className="h-3 w-3" /> Less</>
              ) : (
                <><ChevronDown className="h-3 w-3" /> Read full story</>
              )}
            </button>
            {expanded && (
              <div className="mt-3 rounded-xl bg-muted/40 border border-border p-4 space-y-3">
                {place.fullDescription && (
                  <p className="text-sm text-foreground leading-relaxed">{place.fullDescription}</p>
                )}
                {place.story && (
                  <>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">The Story</p>
                    <p className="text-sm text-foreground leading-relaxed">{place.story}</p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function TourismWondersPage() {
  const [places, setPlaces] = useState<Place[]>(attractions)
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | "all">("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    apiFetchPublishedPlaces()
      .then((posts) => {
        if (posts?.length) {
          // API returns full Place objects already; fall back to static if empty
          setPlaces(posts as unknown as Place[])
        }
      })
      .catch(() => {})
  }, [])

  const allCategories: (PlaceCategory | "all")[] = ["all", ...Object.keys(categoryLabels) as PlaceCategory[]]

  const filtered = places.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="tourism-wonders"
        fallbackImage="/images/places/philippine-arena.jpg"
        fallbackIcon="Compass"
        fallbackAccentColor="teal-300"
        fallbackLabel="Tourism Wonders"
        fallbackTitle="Tourism Wonders of Bocaue"
        fallbackDescription="From ancient heritage sites and sacred churches to the world-record Philippine Arena, discover the remarkable attractions waiting for you in Bocaue, Bulacan."
        showBackButton
      />

      {/* Stats bar */}
      <section className="border-b border-border bg-primary/5 py-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
            {[
              { value: `${attractions.length}`, label: "Attractions" },
              { value: `${Object.keys(categoryLabels).length}`, label: "Categories" },
              { value: "1", label: "Guinness Record Site" },
              { value: "235+", label: "Years of Tradition" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center sm:items-start">
                <span className="text-2xl font-black text-primary">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter & search bar */}
      <section className="border-b border-border bg-muted/40 py-3 sticky top-0 z-30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attractions…"
              className="pl-8 h-8 text-sm w-52"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Compass className="h-4 w-4 text-muted-foreground self-center" />
            {allCategories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="text-xs"
              >
                {cat === "all" ? "All" : categoryLabels[cat as PlaceCategory]}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Places grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Compass className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {activeCategory === "all" ? "All Tourism Wonders" : categoryLabels[activeCategory as PlaceCategory]}
              </h2>
              <p className="text-muted-foreground text-sm">
                {filtered.length} attraction{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Compass className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No attractions found</p>
              <p className="text-sm mt-1">Try a different filter or search term.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-primary/5 border-t border-primary/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Ready to visit Bocaue?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Let our tourism office help you plan the perfect trip.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/inquire"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <ArrowRight className="h-4 w-4" /> Plan Your Visit
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors"
            >
              View All Destinations
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
