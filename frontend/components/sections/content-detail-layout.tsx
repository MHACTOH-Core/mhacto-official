"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { resolveMediaUrl } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────

interface Breadcrumb {
  label: string
  href?: string
}

export interface QuickFact {
  icon: ReactNode
  label: string
  value: string
  highlight?: boolean          // renders value in amber
}

export interface ContentDetailLayoutProps {
  /* Hero */
  heroImage: string
  title: string
  heroBadges?: ReactNode       // badges shown over the hero
  heroSubtitle?: string        // small text below title on the hero (e.g. "Est. 1878")

  /* Breadcrumbs */
  breadcrumbs: Breadcrumb[]

  /* Back link */
  backHref: string
  backLabel: string

  /* Images */
  images: string[]             // first = main image, rest = gallery thumbs

  /* Quick facts (left sidebar card) */
  quickFacts?: QuickFact[]

  /* Extra left-column content (e.g. Google Maps link) */
  leftExtra?: ReactNode

  /* Right column */
  badges?: ReactNode           // top badge row
  description?: string
  bodyText?: string            // "About" section
  bodyLabel?: string           // heading for body text (default "About")
  storyText?: string           // second long text section
  storyLabel?: string          // heading for story (default "The Story")
  highlights?: string[]
  highlightsLabel?: string     // default "Highlights"

  /* Bottom CTA */
  cta?: ReactNode

  /* Full-width content after the main grid (e.g. related articles) */
  children?: ReactNode
}

// ─── Component ────────────────────────────────────────────────────

const DEFAULT_PLACEHOLDER = "/images/defaults/no-image.svg"

export default function ContentDetailLayout({
  heroImage,
  title,
  heroBadges,
  heroSubtitle,
  breadcrumbs,
  backHref,
  backLabel,
  images,
  quickFacts,
  leftExtra,
  badges,
  description,
  bodyText,
  bodyLabel = "About",
  storyText,
  storyLabel = "The Story",
  highlights,
  highlightsLabel = "Highlights",
  cta,
  children,
}: ContentDetailLayoutProps) {
  // Resolve images — filter out empty/null, guarantee at least a placeholder
  const resolvedImages = images
    .map((img) => (img && img.trim() ? resolveMediaUrl(img) : ""))
    .filter(Boolean)
  const hasValidImages = resolvedImages.length > 0
  const mainImage = hasValidImages ? resolvedImages[0] : resolveMediaUrl(DEFAULT_PLACEHOLDER)
  const thumbs = resolvedImages.length > 1 ? resolvedImages : null
  const [selectedImage, setSelectedImage] = useState(mainImage)

  // Resolve hero image with fallback
  const resolvedHero = heroImage && heroImage.trim()
    ? resolveMediaUrl(heroImage)
    : resolveMediaUrl(DEFAULT_PLACEHOLDER)

  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div className="relative w-full h-[300px] sm:h-[380px] overflow-hidden bg-muted">
        <Image
          src={resolvedHero}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ minWidth: "100%", minHeight: "100%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 sm:px-10 sm:pb-10 max-w-7xl mx-auto w-full">
          {heroBadges && (
            <div className="flex items-center gap-2 mb-4">{heroBadges}</div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-2xl max-w-3xl">
            {title}
          </h1>
          {heroSubtitle && (
            <p className="mt-2 text-white/70 text-sm font-medium">{heroSubtitle}</p>
          )}
        </div>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">

          {/* Back link */}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to {backLabel}
          </Link>

          <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">

            {/* ── LEFT: image + quick facts ─────────────────── */}
            <div className="space-y-6 reveal-on-scroll reveal-left">

              {/* Main image + thumbnails */}
              <div className="overflow-hidden rounded-2xl border border-border shadow-lg bg-muted">
                <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                  <Image
                    src={selectedImage}
                    alt={title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center transition-all duration-500"
                    style={{ minWidth: "100%", minHeight: "100%" }}
                    priority
                  />
                </div>
                {thumbs && (
                  <div className="flex gap-1.5 p-2 bg-muted/30">
                    {thumbs.map((img, i) => (
                      <button
                        key={`${img}__${i}`}
                        onClick={() => setSelectedImage(img)}
                        className={`relative h-14 flex-1 overflow-hidden rounded-md border-2 transition-all duration-200 bg-muted ${
                          selectedImage === img ? "border-primary" : "border-transparent opacity-55 hover:opacity-90"
                        }`}
                      >
                        <Image src={img} alt={`${title} photo ${i + 1}`} fill sizes="80px" className="object-cover object-center" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick-facts card */}
              {quickFacts && quickFacts.length > 0 && (
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-sm">
                  {quickFacts.map((fact) => (
                    <div key={fact.label} className="flex items-start gap-3 px-5 py-4">
                      <span className="mt-0.5 shrink-0">{fact.icon}</span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{fact.label}</p>
                        <p className={`text-sm mt-0.5 ${fact.highlight ? "text-amber-700 font-medium" : "text-foreground"}`}>
                          {fact.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Extra left content (e.g. map link) */}
              {leftExtra}
            </div>

            {/* ── RIGHT: text content ──────────────────────── */}
            <div className="space-y-8 reveal-on-scroll reveal-right">

              {/* Badge row */}
              {badges && <div className="flex flex-wrap gap-2">{badges}</div>}

              {/* Title + description */}
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight">
                  {title}
                </h2>
                {description && (
                  <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Body text */}
              {bodyText && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {bodyLabel}
                  </h3>
                  <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                    {bodyText}
                  </p>
                </div>
              )}

              {/* Story / secondary text */}
              {storyText && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {storyLabel}
                  </h3>
                  <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                    {storyText}
                  </p>
                </div>
              )}

              {/* Highlights */}
              {highlights && highlights.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5" />
                    {highlightsLabel}
                  </h3>
                  <ul className="space-y-2.5">
                    {highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              {cta}
            </div>

          </div>
        </div>
      </section>

      {/* ── Additional full-width content ──────────────────── */}
      {children}

    </main>
  )
}
