"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { peopleWonders, type PeopleWonder } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToPeopleWonder } from "@/lib/cms-mappers"

const MAX_FEATURED = 3

const categoryColors: Record<PeopleWonder["category"], string> = {
  pageant: "bg-rose-100 text-rose-700 border-rose-200",
  arts: "bg-amber-100 text-amber-700 border-amber-200",
  sports: "bg-blue-100 text-blue-700 border-blue-200",
  civic: "bg-green-100 text-green-700 border-green-200",
  entertainment: "bg-purple-100 text-purple-700 border-purple-200",
  academics: "bg-indigo-100 text-indigo-700 border-indigo-200",
}

const categoryLabel: Record<PeopleWonder["category"], string> = {
  pageant: "Pageantry",
  arts: "Arts",
  sports: "Sports",
  civic: "Civic",
  entertainment: "Entertainment",
  academics: "Academics",
}

export function FeaturedPeopleWonders() {
  const [persons, setPersons] = useState<PeopleWonder[]>(peopleWonders.slice(0, MAX_FEATURED))

  useEffect(() => {
    apiFetchByLabel("people-wonders")
      .then((posts) => {
        if (posts?.length) setPersons(posts.slice(0, MAX_FEATURED).map(cmsToPeopleWonder))
      })
      .catch(() => {})
  }, [])

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Culture</span>
            </div>
            <h2 className="text-3xl font-black text-foreground sm:text-4xl">People Wonders</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              Remarkable Bocaueños who carry the town&apos;s spirit to the national stage and beyond.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-auto">
            <Link href="/culture/people-wonders">
              See All People Wonders <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {persons.map((person) => (
            <Card
              key={person.id}
              className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {person.image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge
                    variant="outline"
                    className={`absolute bottom-3 left-3 text-xs border ${categoryColors[person.category]}`}
                  >
                    {categoryLabel[person.category]}
                  </Badge>
                </div>
              )}
              <CardContent className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                  {person.name}
                </h3>
                <p className="text-xs text-primary font-semibold mt-0.5 mb-2">{person.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                  {person.achievement}
                </p>
                {person.awards && person.awards.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 flex-wrap">
                    <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground line-clamp-1">{person.awards[0]}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
