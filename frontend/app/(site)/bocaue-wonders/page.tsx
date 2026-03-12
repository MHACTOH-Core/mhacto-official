"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { asset } from "@/lib/utils"
import {
  Users, Trophy, Crown, Palette, GraduationCap, Heart, Mic2, Dumbbell, Star, Award, ChevronDown, ChevronUp, ChevronRight,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type PeopleWonder } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToPeopleWonder } from "@/lib/cms-mappers"

// Category config
type Category = PeopleWonder["category"] | "all"

const categoryConfig: Record<
  PeopleWonder["category"],
  { label: string; icon: React.ReactNode; badge: string }
> = {
  pageant: {
    label: "Pageant",
    icon: <Crown className="h-3.5 w-3.5" />,
    badge: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300",
  },
  arts: {
    label: "Arts",
    icon: <Palette className="h-3.5 w-3.5" />,
    badge: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  },
  sports: {
    label: "Sports",
    icon: <Dumbbell className="h-3.5 w-3.5" />,
    badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300",
  },
  civic: {
    label: "Civic",
    icon: <Heart className="h-3.5 w-3.5" />,
    badge: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
  },
  entertainment: {
    label: "Entertainment",
    icon: <Mic2 className="h-3.5 w-3.5" />,
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  },
  academics: {
    label: "Academics",
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    badge: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300",
  },
}

const filterButtons: { value: Category; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: <Users className="h-3.5 w-3.5" /> },
  { value: "pageant", label: "Pageant", icon: <Crown className="h-3.5 w-3.5" /> },
  { value: "arts", label: "Arts", icon: <Palette className="h-3.5 w-3.5" /> },
  { value: "sports", label: "Sports", icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { value: "entertainment", label: "Entertainment", icon: <Mic2 className="h-3.5 w-3.5" /> },
  { value: "civic", label: "Civic", icon: <Heart className="h-3.5 w-3.5" /> },
  { value: "academics", label: "Academics", icon: <GraduationCap className="h-3.5 w-3.5" /> },
]

function PersonCard({ person }: { person: PeopleWonder }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = categoryConfig[person.category]

  return (
    <a href={`/culture/people-wonders/${person.id}`} target="_blank" rel="noopener noreferrer" className="block">
    <Card className="group overflow-hidden border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">
      <div className="relative h-56 overflow-hidden bg-muted">
        <Image
          src={person.image ?? asset("/images/placeholder-user.jpg")}
          alt={person.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm ${cfg.badge}`}>
            {cfg.icon}
            {cfg.label}
          </span>
        </div>
        {person.year && (
          <div className="absolute top-3 right-3">
            <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {person.year}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-black text-white leading-snug drop-shadow-lg">{person.name}</h3>
          <p className="text-xs text-white/80 leading-tight mt-0.5 line-clamp-1">{person.title}</p>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        {person.author && <p className="text-xs text-muted-foreground/70 mb-2">By {person.author}</p>}
        <div className="flex items-start gap-2 mb-3">
          <Trophy className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm font-semibold text-foreground leading-snug">{person.achievement}</p>
        </div>
        <div className={`text-sm text-muted-foreground leading-relaxed overflow-hidden transition-all duration-300 ${expanded ? "max-h-none" : "max-h-20"}`}>
          {person.description}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded((v) => !v) }}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> Read more</>
          )}
        </button>
        {person.awards && person.awards.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Award className="h-3 w-3" /> Awards & Recognition
            </p>
            <ul className="space-y-1.5">
              {person.awards.map((award) => (
                <li key={award} className="flex items-start gap-2 text-xs text-foreground leading-snug">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 mt-0.5 shrink-0" />
                  {award}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
    </a>
  )
}

export default function BocaueWondersPage() {
  const [peopleWonders, setPeopleWonders] = useState<PeopleWonder[]>([])
  const [activeFilter, setActiveFilter] = useState<Category>("all")

  useEffect(() => {
    apiFetchByLabel("people-wonders")
      .then((posts) => { if (posts?.length) setPeopleWonders(posts.map(cmsToPeopleWonder)) })
      .catch(() => {})
  }, [])

  const filtered =
    activeFilter === "all"
      ? peopleWonders
      : peopleWonders.filter((p) => p.category === activeFilter)

  const counts = {
    all: peopleWonders.length,
    pageant: peopleWonders.filter((p) => p.category === "pageant").length,
    arts: peopleWonders.filter((p) => p.category === "arts").length,
    sports: peopleWonders.filter((p) => p.category === "sports").length,
    entertainment: peopleWonders.filter((p) => p.category === "entertainment").length,
    civic: peopleWonders.filter((p) => p.category === "civic").length,
    academics: peopleWonders.filter((p) => p.category === "academics").length,
  }

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="bocaue-wonders"
        fallbackImage="/images/places/Arts.jpg"
        fallbackIcon="Users"
        fallbackAccentColor="pink-300"
        fallbackLabel="Bocaue, Bulacan"
        fallbackTitle="Bocaue Wonders"
        fallbackDescription="Celebrating the remarkable living individuals of Bocaue  pageant queens, champion athletes, award-winning artists, civic heroes, and achievers who carry the pride of the town to the world."
        showBackButton
      />

      <section className="bg-background border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setActiveFilter(btn.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 border ${
                  activeFilter === btn.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {btn.icon}
                {btn.label}
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                    activeFilter === btn.value ? "bg-white/20" : "bg-border"
                  }`}
                >
                  {counts[btn.value]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {activeFilter === "all"
                  ? "All Notable Bocaueños"
                  : `${categoryConfig[activeFilter as PeopleWonder["category"]]?.label} Achievers`}
              </h2>
              <p className="text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "person" : "people"} featured
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-semibold">No entries in this category yet.</p>
              <p className="text-sm mt-1">Check back soon as we continue to document Bocaue&apos;s remarkable people.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, 3).map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          )}

          {filtered.length > 3 && (
            <div className="mt-8 text-center">
              <Link
                href="/culture/people-wonders"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                See All People Wonders
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
