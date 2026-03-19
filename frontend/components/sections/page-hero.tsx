"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Landmark, Sparkles, Scissors, BookOpen, CalendarDays, Megaphone, Building2, Map, Compass, Globe, Heart, Star, Camera, Music, Users, Trophy, Flag, Utensils, Hammer, Clock, Store, Church, GraduationCap, School, Activity, Palette } from "lucide-react"
import { asset, resolveMediaUrl } from "@/lib/utils"
import { apiFetchPageHero } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────

export interface PageHeroData {
  slug: string
  displayName: string
  imageUrl: string
  iconName: string
  accentColor: string
  label: string
  title: string
  description: string
}

export interface PageHeroProps {
  /** The page slug identifier (e.g. "destinations", "culture") */
  pageSlug: string

  /* ── Fallback values (static defaults used before CMS data loads) ── */
  fallbackImage: string
  fallbackIcon?: string
  fallbackAccentColor?: string
  fallbackLabel: string
  fallbackTitle: string
  fallbackDescription: string

  /* ── Optional layout overrides ── */
  /** Show a "Back to home" button */
  showBackButton?: boolean
  /** Custom back href (default "/") */
  backHref?: string
  /** Align content to the bottom of the hero */
  alignBottom?: boolean
  /** Override minimum height class */
  minHeightClass?: string
  /** Additional children to render inside the hero */
  children?: ReactNode
}

// ── Dynamic icon resolver ─────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark, Sparkles, Scissors, BookOpen, CalendarDays, Megaphone,
  Building2, Map, Compass, Globe, Heart, Star, Camera, Music, Users, Trophy, Flag,
  Utensils, Hammer, Clock, Store, Church, GraduationCap, School, Activity, Palette,
}

function resolveIcon(iconName: string | undefined): React.ComponentType<{ className?: string }> | null {
  if (!iconName) return null
  return ICON_MAP[iconName] ?? null
}

// ── Resolve hero image URL ────────────────────────────────────────

function resolveHeroImage(url: string): string {
  if (!url) return asset("/images/defaults/no-image.svg")
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    return resolveMediaUrl(url)
  }
  return asset(url.startsWith("/") ? url : `/${url}`)
}

// ── Component ─────────────────────────────────────────────────────

export function PageHero({
  pageSlug,
  fallbackImage,
  fallbackIcon,
  fallbackAccentColor = "amber-300",
  fallbackLabel,
  fallbackTitle,
  fallbackDescription,
  showBackButton = false,
  backHref = "/",
  alignBottom = false,
  minHeightClass = "min-h-[300px] sm:min-h-[380px]",
  children,
}: PageHeroProps) {
  // Start with fallback values — replaced silently when CMS data loads
  const [hero, setHero] = useState<PageHeroData>({
    slug: pageSlug,
    displayName: fallbackTitle,
    imageUrl: fallbackImage,
    iconName: fallbackIcon ?? "",
    accentColor: fallbackAccentColor,
    label: fallbackLabel,
    title: fallbackTitle,
    description: fallbackDescription,
  })

  useEffect(() => {
    let cancelled = false

    const fetchHero = () => {
      apiFetchPageHero(pageSlug)
        .then((data) => {
          if (!cancelled && data?.slug) setHero(data)
        })
        .catch((err) => {
          // Silently ignore "Failed to fetch" — backend not running, fallback data is used
          if (err instanceof TypeError && err.message.toLowerCase().includes("failed to fetch")) return
          console.warn(`[PageHero] Could not load hero for "${pageSlug}":`, err)
        })
    }

    fetchHero() // initial load

    // Re-fetch when the tab / window regains focus so admin edits
    // show up immediately without a manual hard-refresh.
    const onFocus = () => fetchHero()
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [pageSlug])

  const Icon = resolveIcon(hero.iconName)
  const bgImage = resolveHeroImage(hero.imageUrl)

  // Build accent color class dynamically
  const accentTextClass = `text-${hero.accentColor}`

  return (
    <section
      className={`relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 ${minHeightClass} overflow-hidden ${
        alignBottom ? "flex items-end" : ""
      }`}
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={`relative z-10 mx-auto max-w-7xl ${
          alignBottom ? "w-full" : ""
        } px-4 lg:px-8 flex flex-col ${
          alignBottom ? "justify-end" : "justify-center"
        } py-12 sm:py-16 md:py-24`}
      >
        {/* Back button */}
        {showBackButton && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
        )}

        <div className="space-y-4 max-w-3xl">
          {/* Label row with optional icon */}
          <div className={Icon ? "flex items-center gap-3" : ""}>
            {Icon && <Icon className={`h-8 w-8 ${accentTextClass}`} />}
            <span
              className={`text-sm font-bold uppercase tracking-widest ${accentTextClass}`}
            >
              {hero.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
            {hero.title}
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
            {hero.description}
          </p>
        </div>

        {children}
      </div>
    </section>
  )
}
