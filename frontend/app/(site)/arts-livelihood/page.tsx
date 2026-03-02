"use client"

import { useState, useEffect } from "react"
import { asset } from "@/lib/utils"
import Image from "next/image"
import { Store, Scissors, MapPin, Award, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { localBusinesses, artisans } from "@/lib/data/culture-data"

const businessTypeColor: Record<string, string> = {
  food: "bg-orange-100 text-orange-800 border-orange-200",
  crafts: "bg-purple-100 text-purple-800 border-purple-200",
  retail: "bg-blue-100 text-blue-800 border-blue-200",
  services: "bg-green-100 text-green-800 border-green-200",
  agri: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

const navSections = [
  { id: "local-business", label: "Local Business" },
  { id: "crafts-artisans", label: "Crafts & Artisans" },
]

export default function ArtsLivelihoodPage() {
  const [activeSection, setActiveSection] = useState("local-business")

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...navSections].reverse()) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= 120) { setActiveSection(s.id); return }
      }
      setActiveSection("local-business")
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
              <Scissors className="h-8 w-8 text-amber-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-amber-300">Community</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">Arts &amp; Livelihood</h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              Explore the craft traditions and local industries that sustain Bocaue&apos;s vibrant community.
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

      {/* ── Local Business ── */}
      <section id="local-business" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Store className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Local Business</h2>
              <p className="text-muted-foreground">Enterprises and industries that power Bocaue&apos;s economy</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {localBusinesses.map((biz) => (
              <Card key={biz.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                {biz.image && (
                  <div className="relative h-36 overflow-hidden">
                    <Image src={biz.image} alt={biz.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <Badge variant="outline" className={`text-xs capitalize ${businessTypeColor[biz.type] ?? ""}`}>{biz.type}</Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-black text-foreground">{biz.name}</h3>
                    {biz.yearEstablished && <span className="text-xs text-muted-foreground whitespace-nowrap">Est. {biz.yearEstablished}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{biz.description}</p>
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex items-start gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{biz.location}</div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Products</p>
                      <div className="flex flex-wrap gap-1">
                        {biz.products.map((p) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Crafts & Artisans ── */}
      <section id="crafts-artisans" className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Scissors className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Crafts &amp; Artisans</h2>
              <p className="text-muted-foreground">Skilled hands keeping Bocaue&apos;s craft traditions alive</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {artisans.map((artisan) => (
              <Card key={artisan.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                {artisan.image && (
                  <div className="relative h-36 overflow-hidden">
                    <Image src={artisan.image} alt={artisan.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-black text-foreground">{artisan.name}</h3>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">{artisan.experience}</Badge>
                  </div>
                  <p className="text-xs text-primary font-semibold mb-2">{artisan.craft}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{artisan.description}</p>
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex items-start gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{artisan.location}</div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Star className="h-3 w-3" /> Products</p>
                      <ul className="space-y-0.5">{artisan.products.map((p) => <li key={p} className="text-xs text-foreground flex items-start gap-1.5"><span className="mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />{p}</li>)}</ul>
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
        </div>
      </section>
    </main>
  )
}
