"use client"

import { useState, useEffect } from "react"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { Utensils, Sparkles, Flame, MapPin, Clock, CheckCircle, AlertTriangle, RefreshCw, Hammer, Users, Calendar, ChevronRight } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GalleryImage } from "@/components/ui/gallery-image"
import { type CuisineItem, type Festival, type CulturalPractice, type Artisan, type PeopleWonder } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToCuisineItem, cmsToFestival, cmsToCulturalPractice, cmsToArtisan, cmsToPeopleWonder } from "@/lib/cms-mappers"

const subPages = [
  { label: "Local Cuisine", href: "/culture/local-cuisine", icon: Utensils, desc: "Delicacies & food traditions", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  { label: "Festivals & Celebrations", href: "/culture/festivals-celebrations", icon: Calendar, desc: "Annual events & festivities", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  { label: "Cultural Practices", href: "/culture/practices-traditions", icon: Flame, desc: "Living customs & traditions", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  { label: "Crafts & Artisan", href: "/culture/crafts-artisan", icon: Hammer, desc: "Master craftspeople of Bocaue", color: "bg-stone-100 text-stone-700 dark:bg-stone-900/20 dark:text-stone-400" },
  { label: "People Wonders", href: "/culture/people-wonders", icon: Users, desc: "Notable living Bocaueños", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
]

const festivalTypeColor: Record<string, string> = {
  religious: "bg-amber-100 text-amber-800 border-amber-200",
  cultural: "bg-purple-100 text-purple-800 border-purple-200",
  civic: "bg-blue-100 text-blue-800 border-blue-200",
  seasonal: "bg-green-100 text-green-800 border-green-200",
}

const statusConfig = {
  active: { icon: CheckCircle, color: "text-green-600", label: "Active" },
  endangered: { icon: AlertTriangle, color: "text-amber-500", label: "Endangered" },
  revived: { icon: RefreshCw, color: "text-blue-500", label: "Revived" },
}

const navSections = [
  { id: "cuisine", label: "Local Cuisine" },
  { id: "festivals", label: "Festivals" },
  { id: "practices", label: "Cultural Practices" },
  { id: "crafts-artisans", label: "Crafts & Artisans" },
  { id: "people-wonders", label: "People Wonders" },
]

export default function CulturePage() {
  const [activeSection, setActiveSection] = useState("cuisine")
  const [localCuisine, setLocalCuisine] = useState<CuisineItem[]>([])
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [culturalPractices, setCulturalPractices] = useState<CulturalPractice[]>([])
  const [artisansList, setArtisansList] = useState<Artisan[]>([])
  const [peopleWonders, setPeopleWonders] = useState<PeopleWonder[]>([])

  useEffect(() => {
    apiFetchByLabel("local-cuisine")
      .then((posts) => { if (posts?.length) setLocalCuisine(posts.map(cmsToCuisineItem)) })
      .catch(() => {})
    apiFetchByLabel("festivals")
      .then((posts) => { if (posts?.length) setFestivals(posts.map(cmsToFestival)) })
      .catch(() => {})
    apiFetchByLabel("cultural-practices")
      .then((posts) => { if (posts?.length) setCulturalPractices(posts.map(cmsToCulturalPractice)) })
      .catch(() => {})
    apiFetchByLabel("crafts-artisan")
      .then((posts) => { if (posts?.length) setArtisansList(posts.map(cmsToArtisan)) })
      .catch(() => {})
    apiFetchByLabel("people-wonders")
      .then((posts) => { if (posts?.length) setPeopleWonders(posts.map(cmsToPeopleWonder)) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...navSections].reverse()) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= 120) { setActiveSection(s.id); return }
      }
      setActiveSection("cuisine")
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="culture"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackIcon="Sparkles"
        fallbackAccentColor="amber-300"
        fallbackLabel="Bocaue Wonders"
        fallbackTitle="Arts & Culture"
        fallbackDescription="Immerse yourself in the rich heritage, living traditions, and vibrant festivals that make Bocaue a cultural treasure of Bulacan."
      />

              {/* Sticky nav */}
        <div className="sticky top-[57px] lg:top-[67px] z-40 border-b border-border bg-white/95 backdrop-blur-md shadow-sm">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex gap-1 overflow-x-auto py-1">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* ── Local Cuisine ── */}
      <section id="cuisine" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Utensils className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Culinary Wonders</h2>
              <p className="text-muted-foreground">Flavors and foodways that define Bocaue&apos;s table</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {localCuisine.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/culture/local-cuisine/${item.id}`} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer">
                <GalleryImage
                  src={item.image}
                  gallery={item.gallery}
                  alt={item.name}
                  className="relative h-36 overflow-hidden"
                  imageClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <Badge className="text-xs bg-orange-500 text-white border-0 capitalize">{item.type}</Badge>
                  </div>
                </GalleryImage>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-foreground mb-0.5">{item.name}</h3>
                  {item.author && <p className="text-xs text-muted-foreground/70 mb-1">By {item.author}</p>}
                  {item.tagalogName && item.tagalogName !== item.name && <p className="text-xs text-muted-foreground italic mb-2">{item.tagalogName}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{item.description}</p>
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <div className="flex items-start gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /><span>{item.where.join(" · ")}</span></div>
                    {item.bestTime && <div className="flex items-start gap-2 text-xs"><Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /><span>{item.bestTime}</span></div>}
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/culture/local-cuisine"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              See More
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Festivals ── */}
      <section id="festivals" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Festivals &amp; Celebrations</h2>
              <p className="text-muted-foreground">Annual events that bring the community together</p>
            </div>
          </div>
          <div className="space-y-8">
            {festivals.map((fest, idx) => (
              <Link key={fest.id} href={`/culture/festivals-celebrations/${fest.id}`} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className={`grid gap-0 ${idx % 2 === 0 ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]"}`}>
                  {idx % 2 === 0 && (
                    <GalleryImage
                      src={fest.image}
                      gallery={fest.gallery}
                      alt={fest.name}
                      outerClassName="h-full"
                      className="relative flex-1 overflow-hidden min-h-[260px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <Badge variant="outline" className={`text-xs ${festivalTypeColor[fest.type] ?? ""}`}>{fest.type}</Badge>
                      </div>
                    </GalleryImage>
                  )}
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-start">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">{fest.date}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">{fest.name}</h3>
                    {fest.author && <p className="text-xs text-muted-foreground/70 mb-2">By {fest.author}</p>}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{fest.description}</p>
                    <p className="text-xs text-primary/70 font-medium mt-3">Click card for full details →</p>
                  </CardContent>
                  {idx % 2 !== 0 && (
                    <GalleryImage
                      src={fest.image}
                      gallery={fest.gallery}
                      alt={fest.name}
                      outerClassName="h-full order-first md:order-last"
                      className="relative flex-1 overflow-hidden min-h-[260px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 right-4">
                        <Badge variant="outline" className={`text-xs ${festivalTypeColor[fest.type] ?? ""}`}>{fest.type}</Badge>
                      </div>
                    </GalleryImage>
                  )}
                </div>
              </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/culture/festivals-celebrations"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              See More
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cultural Practices ── */}
      <section id="practices" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Flame className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Cultural Practices &amp; Traditions</h2>
              <p className="text-muted-foreground">Living customs that define Bocaue&apos;s identity</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {culturalPractices.map((practice) => {
              const StatusIcon = statusConfig[practice.status].icon
              return (
                <Link key={practice.id} href={`/culture/practices-traditions/${practice.id}`} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer">
                  {practice.image && (
                    <GalleryImage
                      src={practice.image}
                      gallery={practice.gallery}
                      alt={practice.name}
                      className="relative h-36 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </GalleryImage>
                  )}
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">{practice.category.replace("-", " ")}</Badge>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${statusConfig[practice.status].color}`}>
                        <StatusIcon className="h-3 w-3" />{statusConfig[practice.status].label}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-2">{practice.name}</h3>
                    {practice.author && <p className="text-xs text-muted-foreground/70 mb-1">By {practice.author}</p>}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-3">{practice.description}</p>
                    <p className="text-xs text-primary/70 font-medium">Click card for full details →</p>
                  </CardContent>
                </Card>
                </Link>
              )
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/culture/practices-traditions"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              See More
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Crafts & Artisans ── */}
      <section id="crafts-artisans" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Hammer className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Crafts &amp; Artisans</h2>
              <p className="text-muted-foreground">Master craftspeople keeping Bocaue&apos;s traditions alive</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artisansList.map((artisan) => (
              <Link key={artisan.id} href={`/culture/crafts-artisan/${artisan.id}`} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer">
                {artisan.image && (
                  <GalleryImage
                    src={artisan.image}
                    gallery={artisan.gallery}
                    alt={artisan.name}
                    className="relative h-44 overflow-hidden"
                    imageClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200 backdrop-blur-sm">{artisan.craft}</Badge>
                    </div>
                  </GalleryImage>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-black text-foreground">{artisan.name}</h3>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">{artisan.experience}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{artisan.description}</p>
                  {artisan.author && <p className="text-xs text-muted-foreground/70 mb-2">By {artisan.author}</p>}
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <div className="flex items-start gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{artisan.location}</div>
                    <div className="flex flex-wrap gap-1">
                      {artisan.products.slice(0, 3).map((p) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/culture/crafts-artisan"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              See More
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── People Wonders ── */}
      <section id="people-wonders" className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">People Wonders</h2>
              <p className="text-muted-foreground">Notable living Bocaueños making their mark</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {peopleWonders.slice(0, 3).map((person) => (
              <Link key={person.id} href={`/culture/people-wonders/${person.id}`} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer">
                {person.image && (
                  <GalleryImage
                    src={person.image}
                    gallery={person.gallery}
                    alt={person.name}
                    className="relative h-44 overflow-hidden"
                    imageClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <Badge variant="outline" className="text-xs capitalize bg-blue-100 text-blue-800 border-blue-200 backdrop-blur-sm">{person.category}</Badge>
                    </div>
                  </GalleryImage>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-foreground mb-0.5">{person.name}</h3>
                  <p className="text-xs text-primary font-semibold mb-2">{person.title}</p>
                  {person.author && <p className="text-xs text-muted-foreground/70 mb-1">By {person.author}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-3">{person.achievement}</p>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/culture/people-wonders"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              See More
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
