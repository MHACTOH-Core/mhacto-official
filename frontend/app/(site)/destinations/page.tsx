"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Landmark, BookOpen, Church, Compass, MapPin, Clock, Ticket, Shield, Map, ExternalLink, Star } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GalleryImage } from "@/components/ui/gallery-image"
import { type HeritageSite, type Museum, type ReligiousSite } from "@/lib/data/destinations-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToHeritageSite, cmsToMuseum, cmsToReligiousSite } from "@/lib/cms-mappers"
import { type CMSPost } from "@/lib/data/admin-data"

const museumTypeLabels: Record<string, string> = {
  history: "History & Heritage", art: "Art & Culture",
  natural: "Natural History", house: "House Museum",
}
const museumTypeColor: Record<string, string> = {
  history: "bg-amber-100 text-amber-800 border-amber-200",
  art: "bg-purple-100 text-purple-800 border-purple-200",
  natural: "bg-green-100 text-green-800 border-green-200",
  house: "bg-blue-100 text-blue-800 border-blue-200",
}

const navSections = [
  { id: "heritage-sites", label: "Heritage Sites" },
  { id: "museums", label: "Museums" },
  { id: "religious-sites", label: "Religious Sites" },
]

type MapDestination = {
  name: string
  location: string
  hours: string
  description: string
  details: string[]
  detailsLabel: string
}

export default function DestinationsPage() {
  const [heritageSites, setHeritageSites] = useState<HeritageSite[]>([])
  const [museums, setMuseums] = useState<Museum[]>([])
  const [religiousSites, setReligiousSites] = useState<ReligiousSite[]>([])
  const [activeSection, setActiveSection] = useState("heritage-sites")
  const [mapDest, setMapDest] = useState<MapDestination | null>(null)

  useEffect(() => {
    apiFetchByLabel("destinations")
      .then((posts: CMSPost[]) => {
        if (!posts?.length) return
        const heritage = posts.filter(p => (p.category ?? "").toLowerCase().includes("heritage"))
        const museum = posts.filter(p => (p.category ?? "").toLowerCase().includes("museum"))
        const religious = posts.filter(p => (p.category ?? "").toLowerCase().includes("religious"))
        // Fallback: if no sub-category matches, show all posts as heritage sites
        if (!heritage.length && !museum.length && !religious.length) {
          setHeritageSites(posts.map(cmsToHeritageSite))
        } else {
          if (heritage.length) setHeritageSites(heritage.map(cmsToHeritageSite))
          if (museum.length) setMuseums(museum.map(cmsToMuseum))
          if (religious.length) setReligiousSites(religious.map(cmsToReligiousSite))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...navSections].reverse()) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= 120) { setActiveSection(s.id); return }
      }
      setActiveSection("heritage-sites")
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
        pageSlug="destinations"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Landmark"
        fallbackAccentColor="amber-300"
        fallbackLabel="Bocaue Wonders"
        fallbackTitle="Tourist Wonders"
        fallbackDescription="From heritage churches to riverside views — explore Bocaue's most iconic sites and sacred places."
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

      {/* ── Heritage Sites ── */}
      <section id="heritage-sites" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Landmark className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Heritage Sites</h2>
              <p className="text-muted-foreground">Tangible history preserved for future generations</p>
            </div>
          </div>
          <div className="space-y-8">
            {heritageSites.map((site, idx) => (
              <Card key={site.id} className="relative overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <Link href={`/destinations/${site.id}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={site.name} />
                <div className={`grid gap-0 ${idx % 2 === 0 ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]"}`}>
                  {idx % 2 === 0 && (
                    <GalleryImage
                      src={site.image}
                      gallery={site.gallery}
                      alt={site.name}
                      outerClassName="h-full"
                      className="relative flex-1 overflow-hidden min-h-[260px]"
                    >
                      {site.isProtected && <div className="absolute top-3 left-3"><Badge className="text-xs bg-amber-500 text-white border-0 flex items-center gap-1"><Shield className="h-3 w-3" /> Protected</Badge></div>}
                    </GalleryImage>
                  )}
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">Est. {site.established}</Badge>
                        {site.protectionLevel && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">{site.protectionLevel}</Badge>}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">{site.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{site.description}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2 text-xs text-foreground"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{site.location}</div>
                        <div className="flex items-start gap-2 text-xs text-foreground"><Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{site.hours}</div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-3 relative z-20">
                      <Button size="sm" variant="outline" className="gap-2"
                        onClick={(e) => { e.preventDefault(); setMapDest({ name: site.name, location: site.location, hours: site.hours, description: site.description, details: site.highlights, detailsLabel: "Highlights" }) }}>
                        <Map className="h-4 w-4" /> View on Map
                      </Button>
                      <span className="text-xs text-primary font-semibold">Click card for full details →</span>
                    </div>
                  </CardContent>
                  {idx % 2 !== 0 && (
                    <GalleryImage
                      src={site.image}
                      gallery={site.gallery}
                      alt={site.name}
                      outerClassName="h-full order-first md:order-last"
                      className="relative flex-1 overflow-hidden min-h-[260px]"
                    >
                      {site.isProtected && <div className="absolute top-3 right-3"><Badge className="text-xs bg-amber-500 text-white border-0 flex items-center gap-1"><Shield className="h-3 w-3" /> Protected</Badge></div>}
                    </GalleryImage>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Museums ── */}
      <section id="museums" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Museums &amp; Galleries</h2>
              <p className="text-muted-foreground">Public and heritage collections in and around Bocaue</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {museums.map((museum) => (
              <Card key={museum.id} className="relative group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer">
                <Link href={`/destinations/${museum.id}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={museum.name} />
                <GalleryImage
                  src={museum.image}
                  gallery={museum.gallery}
                  alt={museum.name}
                  className="relative h-48 overflow-hidden"
                  imageClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <Badge variant="outline" className={`text-xs ${museumTypeColor[museum.type] ?? ""}`}>{museumTypeLabels[museum.type] ?? museum.type}</Badge>
                  </div>
                </GalleryImage>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-foreground mb-2">{museum.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">{museum.description}</p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-start gap-2 text-xs text-foreground"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{museum.location}</div>
                    <div className="flex items-start gap-2 text-xs text-foreground"><Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{museum.hours}</div>
                    <div className="flex items-start gap-2 text-xs text-foreground"><Ticket className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{museum.admission}</div>
                  </div>
                  <Button size="sm" variant="outline" className="relative z-20 gap-2 w-full"
                    onClick={(e) => { e.preventDefault(); setMapDest({ name: museum.name, location: museum.location, hours: museum.hours, description: museum.description, details: museum.collections.slice(0, 5), detailsLabel: "Collections" }) }}>
                    <Map className="h-4 w-4" /> View on Map
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Religious Sites ── */}
      <section id="religious-sites" className="py-12 sm:py-16 lg:py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Church className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Religious &amp; Pilgrimage Sites</h2>
              <p className="text-muted-foreground">Sacred places in Bocaue open to pilgrims and visitors</p>
            </div>
          </div>
          <div className="space-y-8">
            {religiousSites.map((site) => (
              <Card key={site.id} className="relative overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <Link href={`/destinations/${site.id}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={site.name} />
                <div className="grid gap-0 md:grid-cols-[2fr_3fr]">
                  <GalleryImage
                    src={site.image}
                    gallery={site.gallery}
                    alt={site.name}
                    outerClassName="h-full"
                    className="relative flex-1 overflow-hidden min-h-[260px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4"><Badge className="text-xs bg-amber-500 text-white border-0">{site.denomination}</Badge></div>
                  </GalleryImage>
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full">
                    <div>
                      <div className="mb-2"><span className="text-xs text-muted-foreground font-medium">Est. {site.established}</span></div>
                      <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">{site.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{site.description}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2 text-xs text-foreground"><MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{site.location}</div>
                        <div className="flex items-start gap-2 text-xs text-foreground"><Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{site.hours}</div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-3 relative z-20">
                      <Button size="sm" variant="outline" className="gap-2"
                        onClick={(e) => { e.preventDefault(); setMapDest({ name: site.name, location: site.location, hours: site.hours, description: site.description, details: site.highlights, detailsLabel: "Highlights" }) }}>
                        <Map className="h-4 w-4" /> View on Map
                      </Button>
                      <span className="text-xs text-primary font-semibold">Click card for full details →</span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Travel & Tours CTA ── */}
      <section className="py-14 bg-muted/40 border-t border-border">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
            <Compass className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3">Plan Your Visit</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Explore curated tour packages and travel guides that take you through Bocaue&apos;s storied streets, waterways, and cultural landmarks.
          </p>
          <Link href="/travel-tours" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            <Compass className="h-4 w-4" /> View Travel &amp; Tours
          </Link>
        </div>
      </section>

      {/* ── Map Modal ── */}
      <Dialog open={!!mapDest} onOpenChange={(open) => { if (!open) setMapDest(null) }}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <Map className="h-5 w-5 text-primary" />
              {mapDest?.name}
            </DialogTitle>
          </DialogHeader>
          {mapDest && (
            <div className="grid md:grid-cols-[1fr_1fr] min-h-[420px]">
              <div className="relative bg-muted min-h-[300px] md:min-h-0 flex flex-col">
                <iframe
                  title={`Map of ${mapDest.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapDest.name + ", Bocaue, Bulacan, Philippines")}&output=embed&z=16`}
                  className="w-full flex-1 min-h-[260px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(mapDest.name + ", Bocaue, Bulacan, Philippines")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-3 hover:bg-primary/90 transition-colors"
                >
                  <Map className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </div>
              <div className="p-6 overflow-y-auto max-h-[520px] flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{mapDest.location}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{mapDest.hours}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">About</p>
                  <p className="text-sm text-foreground leading-relaxed">{mapDest.description}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Star className="h-3 w-3" /> {mapDest.detailsLabel}
                  </p>
                  <ul className="space-y-1">
                    {mapDest.details.map((d) => (
                      <li key={d} className="text-sm text-foreground flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />{d}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(mapDest.name + ", Bocaue, Bulacan, Philippines")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" /> Open in Google Maps
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
