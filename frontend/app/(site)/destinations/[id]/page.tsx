"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft, MapPin, Clock, Ticket, Star, Shield, Map,
  Church, BookOpen, Landmark, CalendarDays, ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  type HeritageSite, type Museum, type ReligiousSite,
} from "@/lib/data/destinations-data"
import { type CMSPost } from "@/lib/data/admin-data"
import { apiFetchPostById } from "@/lib/api"
import { cmsToHeritageSite, cmsToMuseum, cmsToReligiousSite } from "@/lib/cms-mappers"

// ─── Unified lookup ────────────────────────────────────────────────────────
type DestType = { kind: "heritage"; data: HeritageSite }
              | { kind: "museum";   data: Museum }
              | { kind: "religious"; data: ReligiousSite }

function postToDestType(post: CMSPost): DestType {
  const cat = (post.category ?? "").toLowerCase()
  if (cat.includes("museum"))    return { kind: "museum",   data: cmsToMuseum(post) }
  if (cat.includes("religious")) return { kind: "religious", data: cmsToReligiousSite(post) }
  return { kind: "heritage", data: cmsToHeritageSite(post) }
}

function sectionLabel(kind: string) {
  if (kind === "heritage") return "Heritage Sites"
  if (kind === "museum")   return "Museums & Galleries"
  return "Religious Sites"
}

function sectionIcon(kind: string) {
  if (kind === "heritage") return <Landmark className="h-4 w-4" />
  if (kind === "museum")   return <BookOpen className="h-4 w-4" />
  return <Church className="h-4 w-4" />
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [dest, setDest] = useState<DestType | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>("")

  useEffect(() => {
    apiFetchPostById(id)
      .then((post) => {
        if (post) {
          const d = postToDestType(post)
          setDest(d)
          setSelectedImage(d.data.image)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (!dest) notFound()

  const { kind, data } = dest

  // ── Normalise fields across all three types ──
  const name        = data.name
  const image       = data.image
  const location    = data.location
  const hours       = data.hours
  const description = data.description

  const established  = "established"  in data ? data.established  : undefined
  const story        = "story"        in data ? data.story        : undefined
  const significance = "significance" in data ? data.significance  : undefined
  const highlights   = "highlights"   in data ? data.highlights   : undefined
  const collections  = "collections"  in data ? data.collections  : undefined
  const admission    = "admission"    in data ? data.admission    : undefined
  const denomination = "denomination" in data ? data.denomination : undefined
  const isProtected  = "isProtected"  in data ? data.isProtected  : undefined
  const protectionLevel = "protectionLevel" in data ? data.protectionLevel : undefined
  const contact      = "contact"      in data ? data.contact      : undefined

  const bodyText = story ?? significance ?? ""
  const details  = highlights ?? collections ?? []
  const detailsLabel = collections ? "Collections" : "Highlights"
  const gallery   = "gallery" in data ? (data as { gallery?: string[] }).gallery : undefined
  const thumbs    = gallery && gallery.length > 1 ? gallery : null

  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="relative w-full h-[300px] sm:h-[380px] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 sm:px-10 sm:pb-10 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4">
            {isProtected && (
              <Badge className="bg-amber-500/90 text-white border-0 text-xs flex items-center gap-1 backdrop-blur-sm">
                <Shield className="h-3 w-3" /> Protected
              </Badge>
            )}
            {denomination && (
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                {denomination}
              </Badge>
            )}
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs flex items-center gap-1">
              {sectionIcon(kind)}
              {sectionLabel(kind)}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-2xl max-w-3xl">
            {name}
          </h1>
          {established && (
            <p className="mt-2 text-white/70 text-sm font-medium">Est. {established}</p>
          )}
        </div>
      </div>

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/destinations" className="hover:text-foreground transition-colors">Tourist Destinations</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{name}</span>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">

          {/* Back link */}
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Tourist Destinations
          </Link>

          <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">

            {/* ── LEFT: image + quick facts ─────────────────────────── */}
            <div className="space-y-6">

              {/* Main image + thumbnails */}
              <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
                <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                  <Image
                    src={selectedImage}
                    alt={name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-all duration-500"
                    priority
                  />
                </div>
                {thumbs && (
                  <div className="flex gap-1.5 p-2 bg-muted/30">
                    {thumbs.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className={`relative h-14 flex-1 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                          selectedImage === img ? "border-primary" : "border-transparent opacity-55 hover:opacity-90"
                        }`}
                      >
                        <Image src={img} alt={`${name} photo ${i + 1}`} fill sizes="80px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick-facts card */}
              <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-sm">
                {established && (
                  <div className="flex items-start gap-3 px-5 py-4">
                    <CalendarDays className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Established</p>
                      <p className="text-sm text-foreground mt-0.5">{established}</p>
                    </div>
                  </div>
                )}
                {protectionLevel && (
                  <div className="flex items-start gap-3 px-5 py-4">
                    <Shield className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                      <p className="text-sm text-amber-700 font-medium mt-0.5">{protectionLevel}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 px-5 py-4">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground mt-0.5">{location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-5 py-4">
                  <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hours</p>
                    <p className="text-sm text-foreground mt-0.5">{hours}</p>
                  </div>
                </div>
                {admission && (
                  <div className="flex items-start gap-3 px-5 py-4">
                    <Ticket className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admission</p>
                      <p className="text-sm text-foreground mt-0.5">{admission}</p>
                    </div>
                  </div>
                )}
                {contact && (
                  <div className="flex items-start gap-3 px-5 py-4">
                    <ExternalLink className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</p>
                      <p className="text-sm text-foreground mt-0.5">{contact}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* View on map */}
              <a
                href={`https://maps.google.com/maps?q=${encodeURIComponent(name + ", Bocaue, Bulacan, Philippines")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
              >
                <Map className="h-4 w-4" />
                View on Google Maps
              </a>
            </div>

            {/* ── RIGHT: text content ───────────────────────────────── */}
            <div className="space-y-8">

              {/* Badge row */}
              <div className="flex flex-wrap gap-2">
                {established && (
                  <Badge variant="outline" className="text-xs">Est. {established}</Badge>
                )}
                {protectionLevel && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                    {protectionLevel}
                  </Badge>
                )}
                {denomination && (
                  <Badge variant="outline" className="text-xs">{denomination}</Badge>
                )}
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight">
                  {name}
                </h2>
                <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* About / story / significance */}
              {bodyText && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    About
                  </h3>
                  <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                    {bodyText}
                  </p>
                </div>
              )}

              {/* Highlights / Collections */}
              {details.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5" />
                    {detailsLabel}
                  </h3>
                  <ul className="space-y-2.5">
                    {details.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Travel & Tours CTA */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <h3 className="font-bold text-foreground mb-1">Plan a Visit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore guided tour packages that include {name} and other Bocaue landmarks.
                </p>
                <Button asChild size="sm" className="gap-2">
                  <Link href="/travel-tours">View Tour Packages</Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
