"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, MapPin, Clock, CalendarDays, Phone, Tag, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiFetchPostById } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { resolveMediaUrl } from "@/lib/utils"
import ContentDetailLayout, { type QuickFact } from "@/components/sections/content-detail-layout"
import {
  localCuisine,
  festivals,
  culturalPractices,
  artisans,
  peopleWonders,
} from "@/lib/data/culture-data"

// ─── Normalised display model ─────────────────────────────────────

interface Extra {
  label: string
  value: string
}

interface NormalizedItem {
  id: string
  title: string
  bodyText: string
  storyText: string
  image: string[]
  highlights: string[]
  extras: Extra[]
  categoryTag: string
}

function fromCMSPost(post: CMSPost): NormalizedItem {
  return {
    id: post.id,
    title: post.title,
    bodyText: post.body ?? "",
    storyText: post.story ?? "",
    image: post.image ?? [],
    highlights: post.highlights ?? [],
    extras: (
      [
        post.location    ? { label: "Location",    value: post.location }    : null,
        post.hours       ? { label: "Time / Hours", value: post.hours }       : null,
        post.established ? { label: "Established",  value: post.established } : null,
        post.contact     ? { label: "Contact",      value: post.contact }     : null,
      ] as (Extra | null)[]
    ).filter((e): e is Extra => e !== null),
    categoryTag: post.category ?? "",
  }
}

function lookupStaticItem(label: string, id: string): NormalizedItem | null {
  switch (label) {
    case "local-cuisine": {
      const item = localCuisine.find((c) => c.id === id)
      if (!item) return null
      return {
        id: item.id,
        title: item.name,
        bodyText: item.description,
        storyText: item.story,
        image: [item.image, ...(item.gallery ?? [])],
        highlights: [],
        extras: [
          { label: "Where to find", value: item.where.join(" · ") },
          ...(item.bestTime ? [{ label: "Best time", value: item.bestTime }] : []),
        ],
        categoryTag: item.type,
      }
    }
    case "festivals": {
      const item = festivals.find((f) => f.id === id)
      if (!item) return null
      return {
        id: item.id,
        title: item.name,
        bodyText: item.description,
        storyText: item.story,
        image: [item.image, ...(item.gallery ?? [])],
        highlights: item.highlights,
        extras: [{ label: "Date", value: item.date }],
        categoryTag: item.type,
      }
    }
    case "cultural-practices": {
      const item = culturalPractices.find((p) => p.id === id)
      if (!item) return null
      return {
        id: item.id,
        title: item.name,
        bodyText: item.description,
        storyText: item.significance,
        image: item.image ? [item.image, ...(item.gallery ?? [])] : (item.gallery ?? []),
        highlights: [],
        extras: [{ label: "Status", value: item.status }],
        categoryTag: item.category,
      }
    }
    case "crafts-artisan": {
      const item = artisans.find((a) => a.id === id)
      if (!item) return null
      return {
        id: item.id,
        title: item.name,
        bodyText: item.description,
        storyText: "",
        image: item.image ? [item.image, ...(item.gallery ?? [])] : (item.gallery ?? []),
        highlights: [...item.products, ...(item.awards ?? [])],
        extras: [
          { label: "Craft", value: item.craft },
          { label: "Experience", value: item.experience },
          { label: "Location", value: item.location },
        ],
        categoryTag: item.craft,
      }
    }
    case "people-wonders": {
      const item = peopleWonders.find((p) => p.id === id)
      if (!item) return null
      return {
        id: item.id,
        title: item.name,
        bodyText: item.description,
        storyText: item.achievement,
        image: item.image ? [item.image, ...(item.gallery ?? [])] : (item.gallery ?? []),
        highlights: item.awards ?? [],
        extras: [
          { label: "Title", value: item.title },
          { label: "Category", value: item.category },
          ...(item.year ? [{ label: "Year", value: item.year }] : []),
        ],
        categoryTag: item.category,
      }
    }
    default:
      return null
  }
}

// ─── Props ────────────────────────────────────────────────────────

export interface CultureDetailProps {
  id: string
  label: string
  backHref: string
  backLabel: string
  categoryLabel: string
  highlightsLabel?: string
  storyLabel?: string
  hideGallery?: boolean
}

// ─── Icon mapper ──────────────────────────────────────────────────

function iconForLabel(label: string) {
  const l = label.toLowerCase()
  if (l.includes("location") || l.includes("where"))       return <MapPin className="h-4 w-4 text-primary" />
  if (l.includes("time") || l.includes("hours"))            return <Clock className="h-4 w-4 text-primary" />
  if (l.includes("date") || l.includes("year") || l.includes("established")) return <CalendarDays className="h-4 w-4 text-primary" />
  if (l.includes("contact"))                                return <Phone className="h-4 w-4 text-primary" />
  if (l.includes("craft") || l.includes("category") || l.includes("type") || l.includes("status")) return <Tag className="h-4 w-4 text-primary" />
  return <Info className="h-4 w-4 text-primary" />
}

// ─── Component ────────────────────────────────────────────────────

export default function CultureDetailClient({
  id,
  label,
  backHref,
  backLabel,
  categoryLabel,
  highlightsLabel = "Highlights",
  storyLabel = "The Story",
}: CultureDetailProps) {
  const [item, setItem] = useState<NormalizedItem | null>(() => lookupStaticItem(label, id))
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    apiFetchPostById(id)
      .then((post) => setItem(fromCMSPost(post)))
      .catch(() => {})
      .finally(() => setApiLoading(false))
  }, [id])

  if (apiLoading && !item) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading…</span>
      </main>
    )
  }

  if (!item) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Entry not found</h1>
          <p className="text-muted-foreground mb-6">
            This entry doesn&apos;t exist or may have been removed.
          </p>
          <Button asChild>
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {backLabel}
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  const quickFacts: QuickFact[] = item.extras.map((e) => ({
    icon: iconForLabel(e.label),
    label: e.label,
    value: e.value,
  }))

  return (
    <ContentDetailLayout
      heroImage={item.image[0] ?? ""}
      title={item.title}
      heroBadges={
        <Badge className="bg-primary text-primary-foreground text-xs uppercase tracking-wider">
          {categoryLabel}
        </Badge>
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Arts & Culture", href: "/culture" },
        { label: backLabel, href: backHref },
        { label: item.title },
      ]}
      backHref={backHref}
      backLabel={backLabel}
      images={item.image}
      quickFacts={quickFacts.length > 0 ? quickFacts : undefined}
      badges={
        item.categoryTag ? (
          <Badge variant="outline" className="capitalize text-xs">
            {item.categoryTag.replace(/-/g, " ")}
          </Badge>
        ) : undefined
      }
      bodyText={item.bodyText || undefined}
      bodyLabel="About"
      storyText={item.storyText || undefined}
      storyLabel={storyLabel}
      highlights={item.highlights.length > 0 ? item.highlights : undefined}
      highlightsLabel={highlightsLabel}
      cta={
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-bold text-foreground mb-1">Explore More</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Discover more of Bocaue&apos;s rich {categoryLabel.toLowerCase()}.
          </p>
          <Button asChild size="sm" className="gap-2">
            <Link href={backHref}>Browse {backLabel}</Link>
          </Button>
        </div>
      }
    />
  )
}
