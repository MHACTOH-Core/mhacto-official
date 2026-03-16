"use client"

import Image from "next/image"
import { useState, useMemo, useEffect, useRef } from "react"
import { Landmark, MapPin, Phone, Users, Search, X } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { type Barangay } from "@/lib/data/community-data"
import { apiFetchByLabel } from "@/lib/api"

// ── Logo / initials fallback ────────────────────────────────────────
function BarangayLogo({ name, image }: { name: string; image?: string }) {
  const [imgError, setImgError] = useState(false)
  const initials = name
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")

  if (image && !imgError) {
    return (
      <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-white border border-border/50 shadow-sm">
        <Image
          src={image}
          alt={`Barangay ${name}`}
          fill
          className="object-contain p-1"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200/60 dark:border-emerald-700/40 flex items-center justify-center shadow-sm">
      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{initials || "BG"}</span>
    </div>
  )
}

// ── Search bar with suggestions ─────────────────────────────────────
function SearchBar({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder: string
}) {
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const showSuggestions = focused && value.length > 0 && suggestions.length > 0

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-72">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="w-full rounded-full border border-border bg-muted/50 py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showSuggestions && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-background shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => { onChange(s); setFocused(false) }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default function BarangaysPage() {
  const [barangayList, setBarangayList] = useState<Barangay[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    apiFetchByLabel("barangays")
      .then((posts) => {
        if (posts && posts.length > 0) {
          setBarangayList(
            posts.map((p: { id: string | number; title: string; body?: string; category?: string; image?: string[] }) => ({
              id: String(p.id),
              name: p.title,
              captain: p.category ?? "",
              address: "",
              description: p.body ?? "",
              image: p.image?.[0],
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return barangayList
    const q = search.toLowerCase()
    return barangayList.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.captain.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    )
  }, [search, barangayList])

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return barangayList
      .filter((b) => b.name.toLowerCase().includes(q))
      .map((b) => b.name)
      .slice(0, 5)
  }, [search, barangayList])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero — CMS-connected via pageSlug */}
      <PageHero
        pageSlug="barangays"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackIcon="Landmark"
        fallbackAccentColor="emerald-300"
        fallbackLabel="Community"
        fallbackTitle="Barangays of Bocaue"
        fallbackDescription="Explore the 14 barangays that make up the Municipality of Bocaue, Bulacan — each with its own identity, leadership, and community character."
        showBackButton
        alignBottom
      />

      {/* Controls */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-4 lg:px-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground shadow">
              All
              <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-xs">
                {filtered.length}
              </span>
            </Badge>
          </div>

          <SearchBar
            value={search}
            onChange={setSearch}
            suggestions={suggestions}
            placeholder="Search barangay..."
          />
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          barangay{filtered.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* Barangay cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {filtered.map((barangay) => (
            <div
              key={barangay.id}
              className="flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
            >
              {/* accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-green-500" />

              <div className="flex flex-col flex-1 p-5">
                {/* Logo + badge */}
                <div className="flex items-start gap-3 mb-4">
                  <BarangayLogo name={barangay.name} image={barangay.image} />
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <Badge
                      variant="outline"
                      className="text-xs w-fit bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/40"
                    >
                      Barangay
                    </Badge>
                    {barangay.population && (
                      <Badge
                        variant="outline"
                        className="text-xs w-fit bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {barangay.population}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-base font-black text-foreground leading-snug mb-0.5">
                  Barangay {barangay.name}
                </h3>

                {/* Captain */}
                {barangay.captain && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Barangay Captain: {barangay.captain}
                  </p>
                )}

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                  {barangay.description}
                </p>

                {/* Footer: address & contact */}
                <div className="mt-auto pt-3 border-t border-border/50 space-y-2">
                  {barangay.address && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{barangay.address}</span>
                    </div>
                  )}
                  {barangay.contact && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{barangay.contact}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Landmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No barangays found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
          </div>
        )}
      </section>
    </main>
  )
}
