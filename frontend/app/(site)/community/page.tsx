"use client"

import Image from "next/image"
import { asset } from "@/lib/utils"
import { useState, useMemo, useEffect } from "react"
import {
  School, Activity, ArrowUpDown, BookOpen, Users,
  Phone, MapPin, Clock, AlertTriangle, CheckCircle,
} from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { type SchoolEntry, type Hospital } from "@/lib/data/community-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToSchoolEntry, cmsToHospital } from "@/lib/cms-mappers"

//  School config 
const levelLabel: Record<SchoolEntry["level"], string> = {
  elementary: "Elementary",
  "junior-high": "Junior High",
  "senior-high": "Senior High",
  integrated: "Basic Ed (K-12)",
  college: "College / University",
  "technical-vocational": "Technical-Vocational",
}
const levelOrder: Record<SchoolEntry["level"], number> = {
  elementary: 1, "junior-high": 2, "senior-high": 3, integrated: 4, "technical-vocational": 5, college: 6,
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
  "name-asc": "Name (A to Z)",
  "name-desc": "Name (Z to A)",
  "level-asc": "Level (Elementary to College)",
  "public-first": "Ownership (Public First)",
  "private-first": "Ownership (Private First)",
}

//  Hospital config 
const typeBadge: Record<Hospital["type"], string> = {
  government: "bg-blue-100 text-blue-800 border-blue-200",
  private: "bg-purple-100 text-purple-800 border-purple-200",
  "lying-in": "bg-pink-100 text-pink-800 border-pink-200",
  rhu: "bg-green-100 text-green-800 border-green-200",
}
const typeLabels: Record<Hospital["type"], string> = {
  government: "Government",
  private: "Private Hospital",
  "lying-in": "Lying-In / Birthing",
  rhu: "Rural Health Unit",
}

//  School logo fallback 
function SchoolLogo({ name, logo }: { name: string; logo?: string }) {
  const [imgError, setImgError] = useState(false)
  const initials = name
    .split(/\s+/).filter((w) => w.length > 2).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("")
  if (logo && !imgError) {
    return (
      <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-white border border-border/50 shadow-sm">
        <Image src={logo} alt={`${name} logo`} fill className="object-contain p-1" onError={() => setImgError(true)} />
      </div>
    )
  }
  return (
    <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
      <span className="text-lg font-black text-primary">{initials || "SC"}</span>
    </div>
  )
}

//  Page 
type Tab = "schools" | "hospitals"

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("schools")

  // Schools state
  const [schools, setSchools] = useState<SchoolEntry[]>([])
  const [filter, setFilter] = useState<FilterKey>("all")
  const [sort, setSort] = useState<SortKey>("name-asc")

  // Hospitals state
  const [hospitals, setHospitals] = useState<Hospital[]>([])

  useEffect(() => {
    apiFetchByLabel("schools")
      .then((posts) => { if (posts?.length) setSchools(posts.map(cmsToSchoolEntry)) })
      .catch(() => {})
    apiFetchByLabel("hospitals")
      .then((posts) => { if (posts?.length) setHospitals(posts.map(cmsToHospital)) })
      .catch(() => {})
  }, [])

  const displayedSchools = useMemo(() => {
    let list = [...schools]
    if (filter === "public") list = list.filter((s) => s.ownership === "public")
    if (filter === "private") list = list.filter((s) => s.ownership === "private")
    list.sort((a, b) => {
      switch (sort) {
        case "name-asc": return a.name.localeCompare(b.name)
        case "name-desc": return b.name.localeCompare(a.name)
        case "level-asc": return levelOrder[a.level] - levelOrder[b.level]
        case "public-first":
          if (a.ownership === b.ownership) return a.name.localeCompare(b.name)
          return a.ownership === "public" ? -1 : 1
        case "private-first":
          if (a.ownership === b.ownership) return a.name.localeCompare(b.name)
          return a.ownership === "private" ? -1 : 1
      }
    })
    return list
  }, [filter, sort, schools])

  const schoolCounts = useMemo(() => ({
    all: schools.length,
    public: schools.filter((s) => s.ownership === "public").length,
    private: schools.filter((s) => s.ownership === "private").length,
  }), [schools])

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="community"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackIcon="Users"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Bocaue"
        fallbackTitle="Community"
        fallbackDescription="Explore the schools, health facilities, and public services that make Bocaue a vibrant and caring community."
        showBackButton
        alignBottom
      />

      {/* Sticky tab nav */}
      <section className="sticky top-0 z-30 bg-background border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("schools")}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
                activeTab === "schools"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <School className="h-4 w-4" />
              Schools
              <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === "schools" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {schools.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("hospitals")}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
                activeTab === "hospitals"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="h-4 w-4" />
              Hospitals & Health
              <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === "hospitals" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {hospitals.length}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/*  Schools tab  */}
      {activeTab === "schools" && (
        <>
          <section className="mx-auto max-w-7xl px-6 pt-10 pb-4 lg:px-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                      {schoolCounts[key]}
                    </span>
                  </button>
                ))}
              </div>
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
                      <DropdownMenuRadioItem key={key} value={key}>{sortLabels[key]}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{displayedSchools.length}</span>{" "}
              school{displayedSchools.length !== 1 ? "s" : ""}
            </p>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-16">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {displayedSchools.map((school) => (
                <div
                  key={school.id}
                  className="flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
                >
                  <div className={`h-1.5 w-full ${school.ownership === "public" ? "bg-gradient-to-r from-sky-400 to-blue-500" : "bg-gradient-to-r from-violet-400 to-purple-500"}`} />
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <SchoolLogo name={school.name} logo={school.logo} />
                      <div className="flex flex-col gap-1.5 pt-0.5">
                        <Badge variant="outline" className={`text-xs w-fit ${levelBadgeClass[school.level]}`}>
                          {levelLabel[school.level]}
                        </Badge>
                        <Badge variant="outline" className={`text-xs w-fit ${school.ownership === "public" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-violet-50 text-violet-700 border-violet-200"}`}>
                          {school.ownership === "public" ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="text-base font-black text-foreground leading-snug mb-0.5">{school.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">Barangay {school.barangay}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">{school.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                        <BookOpen className="h-3.5 w-3.5" /> Programs
                      </div>
                      <ul className="space-y-0.5">
                        {school.programs.slice(0, 3).map((p) => (
                          <li key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/50 flex-shrink-0" />{p}
                          </li>
                        ))}
                        {school.programs.length > 3 && (
                          <li className="text-xs text-primary font-medium pl-2.5">+{school.programs.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                    {(school.enrollment || school.yearEstablished) && (
                      <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {school.enrollment && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{school.enrollment}</span>}
                        {school.yearEstablished && <span className="flex items-center gap-1"><School className="h-3 w-3" />Est. {school.yearEstablished}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/*  Hospitals tab  */}
      {activeTab === "hospitals" && (
        <>
          <div className="bg-red-600 text-white py-3">
            <div className="mx-auto max-w-7xl px-4 lg:px-8 flex items-center gap-3 justify-center">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-semibold">
                Emergency? Call <strong>911</strong> (national) or <strong>(044) 234-5679</strong> (Sacred Heart Hospital Emergency)
              </p>
            </div>
          </div>

          <section className="py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground sm:text-3xl">Health Facilities</h2>
                  <p className="text-muted-foreground">Hospitals, clinics, and health centers serving Bocaue</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 items-start">
                {hospitals.map((hospital) => (
                  <Card key={hospital.id} className={`border-border flex flex-col`}>
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge variant="outline" className={`text-xs ${typeBadge[hospital.type]}`}>
                            {typeLabels[hospital.type]}
                          </Badge>
                          {hospital.emergency && (
                            <Badge className="text-xs bg-red-500 text-white border-0 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> 24H Emergency
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-foreground mb-2">{hospital.name}</h3>
                      {hospital.beds && <p className="text-xs text-muted-foreground mb-2">{hospital.beds}-bed capacity</p>}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{hospital.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-xs text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{hospital.location}
                        </div>
                        <div className="flex items-start gap-2 text-xs text-foreground">
                          <Phone className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{hospital.contact}
                        </div>
                        <div className="flex items-start gap-2 text-xs text-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{hospital.hours}
                        </div>
                      </div>
                      <div className="border-t border-border pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Services</p>
                        <div className="grid grid-cols-1 gap-1">
                          {hospital.services.slice(0, 6).map((s) => (
                            <div key={s} className="flex items-start gap-1.5 text-xs text-foreground">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{s}
                            </div>
                          ))}
                          {hospital.services.length > 6 && (
                            <p className="text-xs text-muted-foreground">+{hospital.services.length - 6} more services</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
