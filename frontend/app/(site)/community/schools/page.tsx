"use client"

import Image from "next/image"
import { asset } from "@/lib/utils"
import { useState, useMemo, useEffect } from "react"
import { School, ArrowUpDown, BookOpen, Users } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { allSchools, type SchoolEntry } from "@/lib/data/community-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToSchoolEntry } from "@/lib/cms-mappers"

// ── Label maps ──────────────────────────────────────────────────────
const levelLabel: Record<SchoolEntry["level"], string> = {
  elementary: "Elementary",
  "junior-high": "Junior High",
  "senior-high": "Senior High",
  integrated: "Basic Ed (K–12)",
  college: "College / University",
  "technical-vocational": "Technical–Vocational",
}

const levelOrder: Record<SchoolEntry["level"], number> = {
  elementary: 1,
  "junior-high": 2,
  "senior-high": 3,
  integrated: 4,
  "technical-vocational": 5,
  college: 6,
}

const levelBadgeClass: Record<SchoolEntry["level"], string> = {
  elementary: "bg-green-100 text-green-800 border-green-200",
  "junior-high": "bg-blue-100 text-blue-800 border-blue-200",
  "senior-high": "bg-purple-100 text-purple-800 border-purple-200",
  integrated: "bg-amber-100 text-amber-800 border-amber-200",
  college: "bg-violet-100 text-violet-800 border-violet-200",
  "technical-vocational": "bg-orange-100 text-orange-800 border-orange-200",
}

type SortKey = "name-asc" | "name-desc" | "level-asc" | "public-first" | "private-first"
type FilterKey = "all" | "public" | "private"

const sortLabels: Record<SortKey, string> = {
  "name-asc": "Name (A → Z)",
  "name-desc": "Name (Z → A)",
  "level-asc": "Level (Elementary → College)",
  "public-first": "Ownership (Public First)",
  "private-first": "Ownership (Private First)",
}

// ── School logo / initials fallback ─────────────────────────────────
function SchoolLogo({ name, logo }: { name: string; logo?: string }) {
  const [imgError, setImgError] = useState(false)
  const initials = name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")

  if (logo && !imgError) {
    return (
      <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-white border border-border/50 shadow-sm">
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          className="object-contain p-1"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
      <span className="text-lg font-black text-primary">{initials || "SC"}</span>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolEntry[]>(allSchools)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [sort, setSort] = useState<SortKey>("name-asc")

  // Sends GET /api/posts/read.php?label=schools&status=published → PHP runs SQL SELECT → returns JSON
  useEffect(() => {
    apiFetchByLabel("schools")
      .then((posts) => {
        if (posts && posts.length > 0) {
          setSchools(posts.map(cmsToSchoolEntry))
        }
      })
      .catch(() => {})
  }, [])

  const displayedSchools = useMemo(() => {
    let list = [...schools]

    if (filter === "public") list = list.filter((s) => s.ownership === "public")
    if (filter === "private") list = list.filter((s) => s.ownership === "private")

    list.sort((a, b) => {
      switch (sort) {
        case "name-asc":   return a.name.localeCompare(b.name)
        case "name-desc":  return b.name.localeCompare(a.name)
        case "level-asc":  return levelOrder[a.level] - levelOrder[b.level]
        case "public-first":
          if (a.ownership === b.ownership) return a.name.localeCompare(b.name)
          return a.ownership === "public" ? -1 : 1
        case "private-first":
          if (a.ownership === b.ownership) return a.name.localeCompare(b.name)
          return a.ownership === "private" ? -1 : 1
      }
    })

    return list
  }, [filter, sort])

  const counts = useMemo(() => ({
    all: schools.length,
    public: schools.filter((s) => s.ownership === "public").length,
    private: schools.filter((s) => s.ownership === "private").length,
  }), [schools])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="schools"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackIcon="School"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Community"
        fallbackTitle="Schools in Bocaue"
        fallbackDescription="All public and private educational institutions shaping the next generation of Bocaueños — from elementary to college level."
        showBackButton
        alignBottom
      />

      {/* Controls */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-4 lg:px-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "public", "private"] as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  filter === key
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {key === "all" ? "All" : key === "public" ? "Public" : "Private"}
                <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-xs">
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortLabels[sort]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {sortLabels[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">{displayedSchools.length}</span>{" "}
          school{displayedSchools.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* School cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedSchools.map((school) => (
            <div
              key={school.id}
              className="group flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 overflow-hidden"
            >
              {/* accent bar — blue for public, violet for private */}
              <div
                className={`h-1.5 w-full ${
                  school.ownership === "public"
                    ? "bg-gradient-to-r from-sky-400 to-blue-500"
                    : "bg-gradient-to-r from-violet-400 to-purple-500"
                }`}
              />

              <div className="flex flex-col flex-1 p-5">
                {/* Logo + badges */}
                <div className="flex items-start gap-3 mb-4">
                  <SchoolLogo name={school.name} logo={school.logo} />
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <Badge
                      variant="outline"
                      className={`text-xs w-fit ${levelBadgeClass[school.level]}`}
                    >
                      {levelLabel[school.level]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs w-fit ${
                        school.ownership === "public"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-violet-50 text-violet-700 border-violet-200"
                      }`}
                    >
                      {school.ownership === "public" ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>

                {/* Name & barangay */}
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug mb-0.5">
                  {school.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Barangay {school.barangay}
                </p>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                  {school.description}
                </p>

                {/* Programs */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    <BookOpen className="h-3.5 w-3.5" />
                    Programs
                  </div>
                  <ul className="space-y-0.5">
                    {school.programs.slice(0, 3).map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/50 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                    {school.programs.length > 3 && (
                      <li className="text-xs text-primary font-medium pl-2.5">
                        +{school.programs.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                {/* Footer meta */}
                {(school.enrollment || school.yearEstablished) && (
                  <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {school.enrollment && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {school.enrollment}
                      </span>
                    )}
                    {school.yearEstablished && (
                      <span className="flex items-center gap-1">
                        <School className="h-3 w-3" />
                        Est. {school.yearEstablished}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
