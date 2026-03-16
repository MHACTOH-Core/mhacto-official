"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Users, ArrowRight, Crown, Palette, Dumbbell, Mic2, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { asset } from "@/lib/utils"
import { peopleWonders as fallbackPeople, type PeopleWonder } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToPeopleWonder } from "@/lib/cms-mappers"

const categoryConfig: Record<PeopleWonder["category"], { label: string; badge: string; icon: React.ReactNode }> = {
  pageant:       { label: "Pageant",       badge: "bg-rose-100 text-rose-800 border-rose-200",   icon: <Crown className="h-3 w-3" /> },
  arts:          { label: "Arts",          badge: "bg-purple-100 text-purple-800 border-purple-200", icon: <Palette className="h-3 w-3" /> },
  sports:        { label: "Sports",        badge: "bg-green-100 text-green-800 border-green-200", icon: <Dumbbell className="h-3 w-3" /> },
  entertainment: { label: "Entertainment", badge: "bg-amber-100 text-amber-800 border-amber-200",icon: <Mic2 className="h-3 w-3" /> },
  academics:     { label: "Academics",     badge: "bg-sky-100 text-sky-800 border-sky-200",      icon: <GraduationCap className="h-3 w-3" /> },
}

/** Maximum cards shown on the homepage */
const MAX_DISPLAY = 3

export function HumanWondersSection() {
  const [people, setPeople] = useState<PeopleWonder[]>(fallbackPeople)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetchByLabel("people-wonders")
      .then((posts) => { if (posts?.length) setPeople(posts.map(cmsToPeopleWonder)) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const displayed = people.slice(0, MAX_DISPLAY)

  if (!isLoading && displayed.length === 0) return null

  return (
    <section className="relative z-20 bg-background py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Users className="h-4 w-4" />
            Bocaue's Finest
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            People Wonders of Bocaue
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            Celebrating the outstanding Bocaueños who carry the town's legacy forward — in sports, arts, academics, and service.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((person, idx) => {
            const cfg = categoryConfig[person.category]
            const imageUrl = person.image
              ? (person.image.startsWith("/images") ? asset(person.image) : person.image)
              : asset("/images/placeholder-user.jpg")

            return (
              <div
                key={person.id}
                className={`group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(idx + 1) * 100}`}
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={person.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] border backdrop-blur-sm ${cfg.badge} flex items-center gap-1`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-base font-black text-white leading-snug drop-shadow-md">{person.name}</p>
                    <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{person.title}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {person.achievement}
                  </p>
                  {person.awards && person.awards.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {person.awards.slice(0, 2).map((a) => (
                        <span key={a} className="text-[10px] bg-muted rounded-full px-2 py-0.5 text-foreground border border-border line-clamp-1 max-w-[180px] truncate">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center reveal-on-scroll delay-300">
          <Link
            href="/culture/people-wonders"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            See All People Wonders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
