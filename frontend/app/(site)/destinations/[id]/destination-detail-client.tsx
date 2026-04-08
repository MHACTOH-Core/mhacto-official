"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  MapPin, Clock, Ticket, Shield, Map,
  Church, BookOpen, Landmark, CalendarDays, ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  type HeritageSite, type Museum, type ReligiousSite,
} from "@/lib/data/destinations-data"
import { type CMSPost } from "@/lib/data/admin-data"
import { apiFetchPostById, apiLogDestinationView } from "@/lib/api"
import { cmsToHeritageSite, cmsToMuseum, cmsToReligiousSite } from "@/lib/cms-mappers"
import ContentDetailLayout from "@/components/sections/content-detail-layout"

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

// ─── Client component ─────────────────────────────────────────────────────
export default function DestinationDetailClient({ id }: { id: string }) {
  const [dest, setDest] = useState<DestType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetchPostById(id)
      .then((post) => {
        if (post) {
          const d = postToDestType(post)
          setDest(d)
          apiLogDestinationView(Number(post.id), undefined, window.location.pathname).catch(() => {})
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

  // ── Build quick facts ──
  const quickFacts: import("@/components/sections/content-detail-layout").QuickFact[] = []
  if (established) quickFacts.push({ icon: <CalendarDays className="h-4 w-4 text-primary" />, label: "Established", value: established })
  if (protectionLevel) quickFacts.push({ icon: <Shield className="h-4 w-4 text-amber-500" />, label: "Status", value: protectionLevel, highlight: true })
  quickFacts.push({ icon: <MapPin className="h-4 w-4 text-primary" />, label: "Location", value: location })
  quickFacts.push({ icon: <Clock className="h-4 w-4 text-primary" />, label: "Hours", value: hours })
  if (admission) quickFacts.push({ icon: <Ticket className="h-4 w-4 text-primary" />, label: "Admission", value: admission })
  if (contact) quickFacts.push({ icon: <ExternalLink className="h-4 w-4 text-primary" />, label: "Contact", value: contact })

  return (
    <ContentDetailLayout
      heroImage={image}
      title={name}
      heroBadges={
        <>
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
        </>
      }
      heroSubtitle={established ? `Est. ${established}` : undefined}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Tourist Wonders", href: "/destinations" },
        { label: name },
      ]}
      backHref="/destinations"
      backLabel="Tourist Wonders"
      images={gallery && gallery.length > 0 ? gallery : [image]}
      quickFacts={quickFacts}
      leftExtra={
        <a
          href={`https://maps.google.com/maps?q=${encodeURIComponent(name + ", Bocaue, Bulacan, Philippines")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
        >
          <Map className="h-4 w-4" />
          View on Google Maps
        </a>
      }
      badges={
        <>
          {established && <Badge variant="outline" className="text-xs">Est. {established}</Badge>}
          {protectionLevel && (
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
              {protectionLevel}
            </Badge>
          )}
          {denomination && <Badge variant="outline" className="text-xs">{denomination}</Badge>}
        </>
      }
      description={description}
      bodyText={bodyText || undefined}
      bodyLabel="About"
      highlights={details.length > 0 ? details : undefined}
      highlightsLabel={detailsLabel}
      cta={
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-bold text-foreground mb-1">Plan a Visit</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Explore guided tour packages that include {name} and other Bocaue landmarks.
          </p>
          <Button asChild size="sm" className="gap-2">
            <Link href="/travel-tours">View Tour Packages</Link>
          </Button>
        </div>
      }
    />
  )
}
