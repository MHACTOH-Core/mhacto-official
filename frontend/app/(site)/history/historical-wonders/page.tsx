"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { asset } from "@/lib/utils"
import { Landmark, MapPin, Clock, Shield, Star, ChevronDown, ChevronUp, BookOpen, Building2 } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type HeritageSite } from "@/lib/data/destinations-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToHeritageSite } from "@/lib/cms-mappers"
import { type CMSPost } from "@/lib/data/admin-data"

const categoryConfig: Record<HeritageSite["category"], { label: string; color: string }> = {
  church:      { label: "Church",        color: "bg-amber-100 text-amber-800 border-amber-200" },
  monument:    { label: "Monument",      color: "bg-purple-100 text-purple-800 border-purple-200" },
  building:    { label: "Building",      color: "bg-blue-100 text-blue-800 border-blue-200" },
  streetscape: { label: "Streetscape",   color: "bg-green-100 text-green-800 border-green-200" },
  bridge:      { label: "Bridge",        color: "bg-stone-100 text-stone-800 border-stone-200" },
}

const filterButtons: { value: HeritageSite["category"] | "all"; label: string }[] = [
  { value: "all",           label: "All" },
  { value: "church",        label: "Churches" },
  { value: "monument",      label: "Monuments" },
  { value: "building",      label: "Buildings" },
  { value: "bridge",        label: "Bridges" },
  { value: "streetscape",   label: "Streetscapes" },
]

function HeritageCard({ site }: { site: HeritageSite }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(site.image)
  const cfg = categoryConfig[site.category]
  const thumbs = site.gallery && site.gallery.length > 0 ? site.gallery : [site.image]

  return (
    <Card className="group overflow-hidden border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={selectedImage}
          alt={site.name}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge variant="outline" className={`text-xs border backdrop-blur-sm ${cfg.color}`}>
            {cfg.label}
          </Badge>
          {site.isProtected && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Shield className="h-2.5 w-2.5" /> Protected
            </span>
          )}
        </div>
        {site.established && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
              Est. {site.established}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-base font-black text-white leading-snug drop-shadow-md">{site.name}</h3>
        </div>
      </div>

      {/* Thumbnail strip */}
      {thumbs.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-2.5 pb-0">
          {thumbs.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(img)}
              className={`relative h-14 flex-1 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                selectedImage === img ? "border-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <Image src={img} alt={`${site.name} photo ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <CardContent className="p-5 flex flex-col flex-1">
        {site.author && <p className="text-xs text-muted-foreground/70 mb-2">By {site.author}</p>}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{site.description}</p>

        <div className="border-t border-border pt-3 space-y-1.5 mb-4">
          {site.location && (
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{site.location}</span>
            </div>
          )}
          {site.hours && (
            <div className="flex items-start gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{site.hours}</span>
            </div>
          )}
          {site.protectionLevel && (
            <div className="flex items-start gap-2 text-xs">
              <Shield className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{site.protectionLevel}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <span className="uppercase tracking-wider">Historical Story</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            {site.story && (
              <div className="rounded-xl bg-muted/40 border border-border p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">The Story</p>
                <p className="text-xs text-foreground leading-relaxed">{site.story}</p>
              </div>
            )}
            {site.highlights && site.highlights.length > 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                  <Star className="h-3 w-3" /> Highlights
                </p>
                <ul className="space-y-1">
                  {site.highlights.map((h) => (
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

export default function HistoricalWondersPage() {
  const [sites, setSites] = useState<HeritageSite[]>([])
  const [activeFilter, setActiveFilter] = useState<HeritageSite["category"] | "all">("all")

  useEffect(() => {
    apiFetchByLabel("destinations")
      .then((posts: CMSPost[]) => {
        const heritage = posts?.filter(p => (p.category ?? "").toLowerCase().includes("heritage"))
        if (heritage?.length) setSites(heritage.map(cmsToHeritageSite))
      })
      .catch(() => {})
  }, [])

  const filtered = activeFilter === "all"
    ? sites
    : sites.filter((s) => s.category === activeFilter)

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="historical-wonders"
        fallbackImage="/images/places/church-bocaue.jpg"
        fallbackIcon="Landmark"
        fallbackAccentColor="amber-300"
        fallbackLabel="Heritage & History"
        fallbackTitle="Historical Wonders of Bocaue"
        fallbackDescription="Step into the living history of Bocaue — where centuries-old churches, colonial monuments, and heritage buildings tell the story of a town shaped by faith, revolution, and resilience."
        showBackButton
      />

      {/* Stats */}
      <section className="py-8 bg-gradient-to-b from-muted/40 to-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            {[
              { icon: <Building2 className="h-5 w-5" />, label: "Heritage Structures", value: `${sites.length}+` },
              { icon: <Shield className="h-5 w-5" />,    label: "Protected Sites",    value: `${sites.filter(s => s.isProtected).length}+` },
              { icon: <BookOpen className="h-5 w-5" />,  label: "Years of History",   value: "400+" },
              { icon: <Star className="h-5 w-5" />,      label: "Cultural Layers",    value: "7" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <div className="text-primary">{s.icon}</div>
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
            <Landmark className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {filterButtons.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value as HeritageSite["category"] | "all")}
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
                {activeFilter === "all" ? "All Historical Wonders" : categoryConfig[activeFilter as HeritageSite["category"]]?.label ?? ""}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filtered.length} site{filtered.length !== 1 ? "s" : ""} — click &quot;Historical Story&quot; to learn more
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No sites in this category.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((site) => (
                <HeritageCard key={site.id} site={site} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom nav */}
      <section className="py-10 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-foreground">Explore more of Bocaue's history</h3>
            <p className="text-sm text-muted-foreground mt-1">Follow the historical roadmap from pre-colonial times to today.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/history/timeline"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Historical Roadmap
            </Link>
            <Link
              href="/history/notable-persons"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors"
            >
              Notable Persons
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
