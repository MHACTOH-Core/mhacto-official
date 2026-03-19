"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { asset } from "@/lib/utils"
import {
  Hammer, Star, Award, MapPin, Clock, ChevronDown, ChevronUp, Sparkles, ShoppingBag,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GalleryImage } from "@/components/ui/gallery-image"
import { type Artisan, type CulturalPractice } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToArtisan, cmsToCulturalPractice } from "@/lib/cms-mappers"

// ── Craft category badge colours ─────────────────────────────────────
// Artisan.craft is a free string so we do broad keyword matching
function getCraftBadge(craft: string): string {
  const lower = craft.toLowerCase()
  if (lower.includes("weav")) return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300"
  if (lower.includes("carv") || lower.includes("wood")) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300"
  if (lower.includes("clay") || lower.includes("potter")) return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300"
  if (lower.includes("pyro") || lower.includes("firework")) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300"
  return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300"
}

// ── Artisan card ──────────────────────────────────────────────────────
function ArtisanCard({ artisan, featured }: { artisan: Artisan; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Link href={`/culture/crafts-artisan/${artisan.id}`} target="_blank" rel="noopener noreferrer" className="block">
    <Card
      className={`group overflow-hidden border-border transition-all duration-300 flex flex-col cursor-pointer ${
        featured
          ? "hover:shadow-2xl hover:border-amber-400/50 shadow-lg ring-1 ring-amber-200/50"
          : "hover:shadow-lg hover:border-primary/30"
      }`}
    >
      <GalleryImage
        src={artisan.image ?? asset("/images/defaults/no-image.svg")}
        gallery={artisan.gallery}
        alt={artisan.name}
        className={`relative overflow-hidden bg-muted ${featured ? "h-72" : "h-52"}`}
        imageClassName="object-cover group-hover:scale-105 transition-transform duration-700"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {featured && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
              <Star className="h-3 w-3" /> Master Artisan
            </span>
          </div>
        )}

        {/* craft badge */}
        <div className={`absolute ${featured ? "top-10 left-3 mt-1" : "top-3 left-3"}`}>
          <Badge
            variant="outline"
            className={`text-[10px] backdrop-blur-sm border ${getCraftBadge(artisan.craft)} ${featured ? "mt-1" : ""}`}
          >
            {artisan.craft}
          </Badge>
        </div>

        {/* name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className={`font-black text-white leading-snug drop-shadow-lg ${featured ? "text-xl" : "text-lg"}`}>
            {artisan.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="h-3 w-3 text-white/70" />
            <span className="text-xs text-white/80">{artisan.experience} of experience</span>
          </div>
        </div>
      </GalleryImage>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1">
        {artisan.author && <p className="text-xs text-muted-foreground/70 mb-2">By {artisan.author}</p>}
        {/* Description */}
        <div
          className={`text-sm text-muted-foreground leading-relaxed overflow-hidden transition-all duration-300 ${
            expanded ? "max-h-none" : "max-h-[5rem]"
          }`}
        >
          {artisan.description}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded((v) => !v) }}
          className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> Read more</>
          )}
        </button>

        {/* Products */}
        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <ShoppingBag className="h-3 w-3" /> Products & Works
          </p>
          <div className="flex flex-wrap gap-1.5">
            {artisan.products.map((p) => (
              <span
                key={p}
                className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground border border-border"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mt-4 flex items-start gap-2 text-xs text-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <span>{artisan.location}</span>
        </div>

        {/* Awards */}
        {artisan.awards && artisan.awards.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Award className="h-3 w-3" /> Recognition
            </p>
            <ul className="space-y-1">
              {artisan.awards.map((award) => (
                <li key={award} className="flex items-start gap-1.5 text-xs text-foreground leading-snug">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 mt-0.5 shrink-0" />
                  {award}
                </li>
              ))}
            </ul>
          </div>
        )}

      </CardContent>
    </Card>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────
export default function CraftsArtisanPage() {
  const [artisanList, setArtisanList] = useState<Artisan[]>([])
  const [practiceList, setPracticeList] = useState<CulturalPractice[]>([])

  useEffect(() => {
    apiFetchByLabel("crafts-artisan")      // → PHP: SELECT * ... WHERE label_key='crafts-artisan' AND status='published'
      .then((posts) => { if (posts?.length) setArtisanList(posts.map(cmsToArtisan)) })
      .catch(() => {})
    apiFetchByLabel("cultural-practices")  // → PHP: SELECT * ... WHERE label_key='cultural-practices' AND status='published'
      .then((posts) => { if (posts?.length) setPracticeList(posts.map(cmsToCulturalPractice)) })
      .catch(() => {})
  }, [])

  // The featured artisan is the first one (longest experience / most decorated)
  const featured = artisanList[0] ?? null
  const rest = artisanList.slice(1)

  // Craft-related cultural practices for the spotlight strip
  const craftPractices = practiceList.filter(
    (p) => p.category === "crafts"
  )

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <PageHero
        pageSlug="crafts-artisan"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Hammer"
        fallbackAccentColor="amber-300"
        fallbackLabel="Arts & Culture"
        fallbackTitle="Crafts & Artisan"
        fallbackDescription="Meet the master craftspeople of Bocaue — weavers, woodcarvers, potters, and pyrotechnics artists who keep centuries-old traditions alive with their hands and their hearts."
        showBackButton
        backHref="/culture"
      />

      {/* ── Craft Traditions Strip ──────────────────────────────── */}
      {craftPractices.length > 0 && (
        <section className="border-b border-border bg-muted/30 py-8">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Living Craft Traditions of Bocaue
            </p>
            <div className="grid gap-4 sm:grid-cols-2 items-start">
              {craftPractices.map((practice) => (
                <div
                  key={practice.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-background p-4 hover:border-amber-300/60 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                    <Hammer className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm font-black text-foreground">{practice.name}</h4>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          practice.status === "active"
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                            : practice.status === "revived"
                            ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                            : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                      >
                        {practice.status.charAt(0).toUpperCase() + practice.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{practice.description}</p>
                    <p className="text-xs text-foreground leading-relaxed mt-1.5">{practice.significance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Artisan ────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Spotlight Artisan</h2>
              <p className="text-muted-foreground">MHACTO-recognized Living Cultural Heritage Bearer</p>
            </div>
          </div>

          {/* Featured card – wider */}
          {featured && (
          <div className="max-w-2xl">
            <ArtisanCard artisan={featured} featured />
          </div>
          )}
        </div>
      </section>

      {/* ── All Artisans ────────────────────────────────────────── */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Hammer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Our Artisans</h2>
              <p className="text-muted-foreground">Masters of traditional crafts in Bocaue</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {rest.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-12 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-6">
              <Hammer className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-3" />
              <h3 className="text-lg font-black text-foreground mb-2">Support Local Artisans</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Purchase handmade crafts directly from Bocaue&apos;s master artisans at the MHACTO gallery
                or the Bocaue Public Market. Every purchase helps preserve these irreplaceable traditions.
              </p>
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6">
              <Sparkles className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-black text-foreground mb-2">Know an Artisan?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Is there a craftsperson in Bocaue whose work deserves recognition? Contact the MHACTO office
                to nominate them for our Artisan Spotlight program.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
