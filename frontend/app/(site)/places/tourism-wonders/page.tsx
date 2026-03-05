"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { asset } from "@/lib/utils"
import { Compass, MapPin, Clock, Ticket, ChevronDown, ChevronUp, Star, ExternalLink } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { attractions as fallbackAttractions, categoryLabels, type Place, type PlaceCategory } from "@/lib/data/places-data"
import { apiFetchByLabel } from "@/lib/api"

// Category color config
const categoryColor: Record<PlaceCategory, string> = {
  heritage:  "bg-amber-100 text-amber-800 border-amber-200",
  religious: "bg-yellow-100 text-yellow-800 border-yellow-200",
  museum:    "bg-purple-100 text-purple-800 border-purple-200",
  nature:    "bg-green-100 text-green-800 border-green-200",
  festival:  "bg-red-100 text-red-800 border-red-200",
  arts:      "bg-pink-100 text-pink-800 border-pink-200",
  cuisine:   "bg-orange-100 text-orange-800 border-orange-200",
  landmark:  "bg-blue-100 text-blue-800 border-blue-200",
  venue:     "bg-indigo-100 text-indigo-800 border-indigo-200",
}

const categoryFilters: { value: PlaceCategory | "all"; label: string }[] = [
  { value: "all",       label: "All Wonders" },
  { value: "heritage",  label: "Heritage" },
  { value: "religious", label: "Religious" },
  { value: "museum",    label: "Museums" },
  { value: "nature",    label: "Nature" },
  { value: "festival",  label: "Festivals" },
  { value: "landmark",  label: "Landmarks" },
  { value: "arts",      label: "Arts" },
  { value: "cuisine",   label: "Food" },
]

function PlaceCard({ place }: { place: Place }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="group overflow-hidden border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={place.image}
          alt={place.title}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className={`text-xs border backdrop-blur-sm ${categoryColor[place.category]}`}>
            {categoryLabels[place.category]}
          </Badge>
        </div>
        {place.established && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
              Est. {place.established}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-base font-black text-white leading-snug drop-shadow-md">{place.title}</h3>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{place.description}</p>

        <div className="border-t border-border pt-3 space-y-1.5 mb-4">
          {place.location && (
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{place.location}</span>
            </div>
          )}
          {place.hours && (
            <div className="flex items-start gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{place.hours}</span>
            </div>
          )}
        </div>

        {/* Expandable story */}
        {(place.story || place.highlights) && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <span className="uppercase tracking-wider">Explore More</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}

        {expanded && (
          <div className="mt-3 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            {place.story && (
              <div className="rounded-xl bg-muted/40 border border-border p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">The Story</p>
                <p className="text-xs text-foreground leading-relaxed">{place.story}</p>
              </div>
            )}
            {place.highlights && place.highlights.length > 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                  <Star className="h-3 w-3" /> Highlights
                </p>
                <ul className="space-y-1">
                  {place.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function TourismWondersPage() {
  const [places, setPlaces] = useState<Place[]>(fallbackAttractions)
  const [activeFilter, setActiveFilter] = useState<PlaceCategory | "all">("all")

  // Fetch from CMS — falls back to static data if API is unavailable
  useEffect(() => {
    apiFetchByLabel("tourism-wonders")
      .then((posts) => {
        if (posts && posts.length > 0) {
          // Map CMS posts to Place type
          const mapped: Place[] = posts.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.body?.substring(0, 250) ?? "",
            fullDescription: p.body ?? "",
            story: p.story ?? "",
            image: p.image?.[0]
              ? (p.image[0].startsWith("/images") ? asset(p.image[0]) : p.image[0])
              : asset("/images/places/oldtownbocaue.jpg"),
            category: (p.category?.toLowerCase() as PlaceCategory) ?? "landmark",
            location: p.location ?? "",
            hours: p.hours ?? "",
            established: p.established ?? "",
            highlights: p.highlights ?? [],
          }))
          setPlaces(mapped)
        }
      })
      .catch(() => {})
  }, [])

  const filtered = activeFilter === "all"
    ? places
    : places.filter((p) => p.category === activeFilter)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="tourism-wonders"
        fallbackImage="/images/places/philippine-arena.jpg"
        fallbackIcon="Compass"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Bocaue Tourism"
        fallbackTitle="Tourism Wonders of Bocaue"
        fallbackDescription="From centuries-old heritage churches to the world's largest indoor arena — discover every wonder that makes Bocaue a must-visit destination in Bulacan."
        showBackButton
      />

      {/* Stats bar */}
      <section className="py-8 bg-gradient-to-b from-muted/40 to-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            {[
              { icon: "🏛️", label: "Heritage Sites",  value: "4+" },
              { icon: "🎭", label: "Cultural Venues", value: "6+" },
              { icon: "🌿", label: "Nature Spots",    value: "3+" },
              { icon: "🏟️", label: "Landmarks",       value: "2+" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-xl font-black text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b border-border bg-muted/40 py-3 sticky top-0 z-30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {categoryFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  activeFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                {activeFilter === "all" ? "All Tourism Wonders" : categoryLabels[activeFilter as PlaceCategory]}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filtered.length} wonder{filtered.length !== 1 ? "s" : ""} — click &quot;Explore More&quot; for the full story
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No wonders found in this category.</p>
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
            <h3 className="text-lg font-black text-foreground">Plan your visit to Bocaue</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Contact the MHACTO Tourism Office or submit an inquiry to start your journey.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/inquire"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Ticket className="h-4 w-4" />
              Inquire a Tour
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
