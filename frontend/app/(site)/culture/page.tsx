"use client"

import { useState, useEffect } from "react"
import { asset } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Utensils, Sparkles, Flame, MapPin, Clock, Star, CheckCircle, AlertTriangle, RefreshCw, Hammer, Users, Calendar, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { localCuisine, festivals, culturalPractices } from "@/lib/data/culture-data"

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
]

export default function CulturePage() {
  const [activeSection, setActiveSection] = useState("cuisine")

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
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[380px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${asset('/images/places/oldtownbocaue.jpg')})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 flex flex-col justify-center py-12 sm:py-16 md:py-24">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-amber-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-amber-300">Bocaue Wonders</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">Arts &amp; Culture</h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              Immerse yourself in the rich heritage, living traditions, and vibrant festivals that make Bocaue a cultural treasure of Bulacan.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky nav */}
      <div className="sticky top-[60px] sm:top-16 lg:top-[72px] z-40 border-b border-border bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-1">
            {navSections.map((s) => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  activeSection === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
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
        </div>
      </section>

      {/* ── Cultural Practices ── */}
      <section id="practices" className="py-12 sm:py-16 lg:py-20">
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
