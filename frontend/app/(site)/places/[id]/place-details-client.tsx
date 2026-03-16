"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, MapPin, Phone, CalendarDays, Tag, Loader2, Map } from "lucide-react"

import { apiFetchPostById, type CMSPost } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ContentDetailLayout, { type QuickFact } from "@/components/sections/content-detail-layout"

function categoryLabel(cat?: string) {
  if (!cat) return "Place"
  return cat.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

interface PlaceDetailsPageProps {
  placeId: string
}

export default function PlaceDetailsPage({ placeId }: PlaceDetailsPageProps) {
  const [place, setPlace] = useState<CMSPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetchPostById(placeId)
      .then((data) => setPlace(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [placeId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading...</span>
      </main>
    )
  }

  if (error || !place) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Place not found</h1>
            <p className="mt-2 text-muted-foreground">
              The place you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild className="mt-6">
              <Link href="/places">Back to Places</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const catLabel = categoryLabel(place.category)

  const quickFacts: QuickFact[] = []
  if (place.established) quickFacts.push({ icon: <CalendarDays className="h-4 w-4 text-primary" />, label: "Established", value: place.established })
  quickFacts.push({ icon: <Tag className="h-4 w-4 text-primary" />, label: "Category", value: catLabel })
  if (place.location) quickFacts.push({ icon: <MapPin className="h-4 w-4 text-primary" />, label: "Location", value: place.location })
  if (place.hours) quickFacts.push({ icon: <Clock className="h-4 w-4 text-primary" />, label: "Hours", value: place.hours })
  if (place.contact) quickFacts.push({ icon: <Phone className="h-4 w-4 text-primary" />, label: "Contact", value: place.contact })

  return (
    <ContentDetailLayout
      heroImage={place.image[0] ?? ""}
      title={place.title}
      heroBadges={
        <Badge className="bg-amber-500/90 text-white border-0 text-xs uppercase tracking-wider backdrop-blur-sm">
          {catLabel}
        </Badge>
      }
      heroSubtitle={place.established ? `Est. ${place.established}` : undefined}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Places", href: "/places" },
        { label: place.title },
      ]}
      backHref="/places"
      backLabel="Places"
      images={place.image}
      quickFacts={quickFacts}
      leftExtra={
        place.location ? (
          <a
            href={`https://maps.google.com/maps?q=${encodeURIComponent(place.title + ", Bocaue, Bulacan, Philippines")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
          >
            <Map className="h-4 w-4" />
            View on Google Maps
          </a>
        ) : undefined
      }
      badges={
        <>
          <Badge variant="outline" className="text-xs">{catLabel}</Badge>
          {place.established && <Badge variant="outline" className="text-xs">Est. {place.established}</Badge>}
        </>
      }
      description={place.body || undefined}
      storyText={place.story || undefined}
      storyLabel="The Story"
      highlights={place.highlights?.length ? place.highlights : undefined}
      cta={
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-bold text-foreground mb-1">Discover More</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Explore more places in Bocaue, Bulacan.
          </p>
          <Button asChild size="sm" className="gap-2">
            <Link href="/places">View All Places</Link>
          </Button>
        </div>
      }
    />
  )
}
