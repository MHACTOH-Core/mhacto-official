"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, Loader2, ImageOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiFetchPostById } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { resolveMediaUrl } from "@/lib/utils"
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

// ─── Component ────────────────────────────────────────────────────

export default function CultureDetailClient({
  id,
  label,
  backHref,
  backLabel,
  categoryLabel,
  highlightsLabel = "Highlights",
  storyLabel = "The Story",
  hideGallery = false,
}: CultureDetailProps) {
  // Immediately seed from static data — no loading flash for known static IDs
  const [item, setItem] = useState<NormalizedItem | null>(() => lookupStaticItem(label, id))
  const [apiLoading, setApiLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState("")

  // Try to enhance / override with live CMS data
  useEffect(() => {
    apiFetchPostById(id)
      .then((post) => setItem(fromCMSPost(post)))
      .catch(() => {
        // API unavailable or ID not found — static fallback already loaded
      })
      .finally(() => setApiLoading(false))
  }, [id])

  // Sync hero image whenever item changes
  useEffect(() => {
    if (item?.image?.[0]) setSelectedImg(resolveMediaUrl(item.image[0]))
  }, [item])

  // Only show full-screen spinner when we have NO data yet
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

  const heroImage  = selectedImg || resolveMediaUrl(item.image[0])
  const gallery    = item.image.slice(1).filter(Boolean)
  const bodyParas  = item.bodyText.split("\n\n").filter(Boolean)
  const storyParas = item.storyText.split("\n\n").filter(Boolean)

  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] mt-14 sm:mt-16 lg:mt-20 xl:mt-28 overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={item.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <ImageOff className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-5xl px-4 pb-8 sm:pb-12 lg:px-8">
            <Badge className="mb-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider">
              {categoryLabel}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-2xl max-w-3xl">
              {item.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/culture" className="hover:text-foreground transition-colors">Arts &amp; Culture</Link>
          <span>/</span>
          <Link href={backHref} className="hover:text-foreground transition-colors">{backLabel}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{item.title}</span>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">

          <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              Back to {backLabel}
            </Link>
          </Button>

          <div className="grid gap-10 lg:grid-cols-[1fr_280px]">

            {/* ── Article body ─────────────────────────────────── */}
            <article>
              {bodyParas.length > 0 && (
                <div className="space-y-4 text-base leading-relaxed text-foreground/90">
                  {bodyParas.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}

              {storyParas.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h2 className="text-xl font-bold text-foreground mb-4">{storyLabel}</h2>
                  <div className="space-y-4 text-base leading-relaxed text-foreground/90">
                    {storyParas.map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </div>
              )}

              {item.highlights.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h2 className="text-xl font-bold text-foreground mb-4">{highlightsLabel}</h2>
                  <ul className="space-y-2.5">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-foreground/85">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {gallery.length > 0 && !hideGallery && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h2 className="text-xl font-bold text-foreground mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((img, i) => {
                      const resolved = resolveMediaUrl(img)
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedImg(resolved)}
                          className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.02] ${
                            selectedImg === resolved ? "border-primary shadow-md" : "border-transparent"
                          }`}
                        >
                          <Image
                            src={resolved}
                            alt={`${item.title} — photo ${i + 2}`}
                            fill
                            sizes="(max-width: 640px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </article>

            {/* ── Sidebar ──────────────────────────────────────── */}
            <aside className="space-y-4">
              {item.extras.length > 0 && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
                  {item.extras.map(({ label: l, value }, i) => (
                    <div key={i} className="px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{l}</p>
                      <p className="text-sm text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {item.categoryTag && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Type</p>
                  <Badge variant="outline" className="capitalize">{item.categoryTag.replace(/-/g, " ")}</Badge>
                </div>
              )}

              <Button asChild variant="outline" className="w-full gap-2">
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4" />
                  Browse {backLabel}
                </Link>
              </Button>
            </aside>

          </div>
        </div>
      </section>

    </main>
  )
}
