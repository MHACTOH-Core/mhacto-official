"use client"

import { useState, useEffect } from "react"
import { asset } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Utensils, Sparkles, Flame, MapPin, Clock, Star, CheckCircle, AlertTriangle, RefreshCw, Hammer, Users, Calendar, ChevronRight, Award, ShoppingBag, ArrowRight } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { localCuisine as fallbackCuisine, festivals as fallbackFestivals, culturalPractices as fallbackPractices, artisans as fallbackArtisans, peopleWonders as fallbackPeople, type CuisineItem, type Festival, type CulturalPractice, type Artisan, type PeopleWonder } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToCuisineItem, cmsToFestival, cmsToCulturalPractice, cmsToArtisan, cmsToPeopleWonder } from "@/lib/cms-mappers"

const subPages = [
  { label: "Local Cuisine", href: "/culture/local-cuisine", icon: Utensils, desc: "Delicacies & food traditions", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  { label: "Festivals & Celebrations", href: "/culture/festivals-celebrations", icon: Calendar, desc: "Annual events & festivities", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  { label: "Cultural Practices", href: "/culture/practices-traditions", icon: Flame, desc: "Living customs & traditions", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  { label: "Crafts & Artisan", href: "/culture/crafts-artisan", icon: Hammer, desc: "Master craftspeople of Bocaue", color: "bg-stone-100 text-stone-700 dark:bg-stone-900/20 dark:text-stone-400" },
  { label: "People Wonders", href: "/culture/people-wonders", icon: Users, desc: "Notable Bocaueños making their mark", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
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
  const [localCuisine, setLocalCuisine] = useState<CuisineItem[]>(fallbackCuisine)
  const [festivals, setFestivals] = useState<Festival[]>(fallbackFestivals)
  const [culturalPractices, setCulturalPractices] = useState<CulturalPractice[]>(fallbackPractices)
  const [artisansList, setArtisansList] = useState<Artisan[]>(fallbackArtisans)
  const [peopleWonders, setPeopleWonders] = useState<PeopleWonder[]>(fallbackPeople)

  // Each call sends GET /api/posts/read.php?label={label}&status=published → PHP runs SQL SELECT with label JOIN → returns JSON
  useEffect(() => {
    apiFetchByLabel("local-cuisine")     // → PHP: SELECT * ... WHERE label_key='local-cuisine' AND status='published'
      .then((posts) => { if (posts?.length) setLocalCuisine(posts.map(cmsToCuisineItem)) })
      .catch(() => {})
    apiFetchByLabel("festivals")         // → PHP: SELECT * ... WHERE label_key='festivals' AND status='published'
      .then((posts) => { if (posts?.length) setFestivals(posts.map(cmsToFestival)) })
      .catch(() => {})
    apiFetchByLabel("cultural-practices") // → PHP: SELECT * ... WHERE label_key='cultural-practices' AND status='published'
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
        <div className="sticky top-[57px] lg:top-[78px] z-40 border-b border-border bg-white/95 backdrop-blur-md shadow-sm">
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
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Local Cuisine</h2>
              <p className="text-muted-foreground">Flavors and foodways that define Bocaue&apos;s table</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {localCuisine.map((item) => (
              <Card key={item.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="relative h-36 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <Badge className="text-xs bg-orange-500 text-white border-0 capitalize">{item.type}</Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-foreground mb-0.5">{item.name}</h3>
                  {item.tagalogName && item.tagalogName !== item.name && <p className="text-xs text-muted-foreground italic mb-2">{item.tagalogName}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{item.description}</p>
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <div className="flex items-start gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /><span>{item.where.join(" · ")}</span></div>
                    {item.bestTime && <div className="flex items-start gap-2 text-xs"><Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /><span>{item.bestTime}</span></div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/culture/local-cuisine">See More Local Cuisine <ArrowRight className="h-4 w-4" /></Link>
            </Button>
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
              <Card key={fest.id} className="overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className={`grid gap-0 ${idx % 2 === 0 ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]"}`}>
                  {idx % 2 === 0 && (
                    <div className="relative h-64 md:h-auto overflow-hidden min-h-[260px]">
                      <Image src={fest.image} alt={fest.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <Badge variant="outline" className={`text-xs ${festivalTypeColor[fest.type] ?? ""}`}>{fest.type}</Badge>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-start">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">{fest.date}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">{fest.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{fest.description}</p>
                    <p className="text-sm text-foreground leading-relaxed mb-4">{fest.story}</p>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Star className="h-3 w-3" /> Highlights</p>
                      <ul className="space-y-1">{fest.highlights.map((h) => <li key={h} className="text-sm text-foreground flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />{h}</li>)}</ul>
                    </div>
                  </CardContent>
                  {idx % 2 !== 0 && (
                    <div className="relative h-64 md:h-auto overflow-hidden min-h-[260px] order-first md:order-last">
                      <Image src={fest.image} alt={fest.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 right-4">
                        <Badge variant="outline" className={`text-xs ${festivalTypeColor[fest.type] ?? ""}`}>{fest.type}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/culture/festivals-celebrations">See More Festivals <ArrowRight className="h-4 w-4" /></Link>
            </Button>
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
                <Card key={practice.id} className="overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                  {practice.image && (
                    <div className="relative h-36 overflow-hidden">
                      <Image src={practice.image} alt={practice.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">{practice.category.replace("-", " ")}</Badge>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${statusConfig[practice.status].color}`}>
                        <StatusIcon className="h-3 w-3" />{statusConfig[practice.status].label}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-2">{practice.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{practice.description}</p>
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Significance</p>
                      <p className="text-xs text-foreground leading-relaxed">{practice.significance}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/culture/practices-traditions">See More Cultural Practices <ArrowRight className="h-4 w-4" /></Link>
            </Button>
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
              <Card key={artisan.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                {artisan.image && (
                  <div className="relative h-44 overflow-hidden">
                    <Image src={artisan.image} alt={artisan.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200 backdrop-blur-sm">{artisan.craft}</Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-black text-foreground">{artisan.name}</h3>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">{artisan.experience}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{artisan.description}</p>
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex items-start gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{artisan.location}</div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> Products</p>
                      <div className="flex flex-wrap gap-1">
                        {artisan.products.map((p) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                      </div>
                    </div>
                    {artisan.awards && artisan.awards.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Award className="h-3 w-3" /> Awards</p>
                        <ul className="space-y-0.5">{artisan.awards.map((a) => <li key={a} className="text-xs text-foreground flex items-start gap-1.5"><span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 flex-shrink-0" />{a}</li>)}</ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/culture/crafts-artisan">See More Crafts & Artisans <ArrowRight className="h-4 w-4" /></Link>
            </Button>
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
              <p className="text-muted-foreground">Notable Bocaueños making their mark</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {peopleWonders.map((person) => (
              <Card key={person.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                {person.image && (
                  <div className="relative h-44 overflow-hidden">
                    <Image src={person.image} alt={person.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <Badge variant="outline" className="text-xs capitalize bg-blue-100 text-blue-800 border-blue-200 backdrop-blur-sm">{person.category}</Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-foreground mb-0.5">{person.name}</h3>
                  <p className="text-xs text-primary font-semibold mb-2">{person.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{person.achievement}</p>
                  {person.awards && person.awards.length > 0 && (
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Award className="h-3 w-3" /> Awards</p>
                      <ul className="space-y-0.5">{person.awards.map((a) => <li key={a} className="text-xs text-foreground flex items-start gap-1.5"><span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 flex-shrink-0" />{a}</li>)}</ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/culture/people-wonders">See More People Wonders <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Dive Deeper ── */}
      <section className="py-12 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Explore Culture</h2>
              <p className="text-muted-foreground">Discover all aspects of Bocaue&apos;s rich cultural heritage</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {subPages.map((page) => {
              const Icon = page.icon
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-background p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${page.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors leading-snug">{page.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{page.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ChevronRight className="h-3 w-3" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
