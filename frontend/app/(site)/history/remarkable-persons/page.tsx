"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Star, Clock } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { personCategoryLabels, type NotablePerson } from "@/lib/data/history-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToNotablePerson } from "@/lib/cms-mappers"

const categoryColors: Record<NotablePerson["category"], string> = {
  "national-hero": "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  arts: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  religion: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  government: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  education: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  sports: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
}

export default function RemarkablePersonsPage() {
  const [remarkablePersons, setRemarkablePersons] = useState<NotablePerson[]>([])

  useEffect(() => {
    apiFetchByLabel("notable-figures")
      .then((posts) => { if (posts?.length) setRemarkablePersons(posts.map(cmsToNotablePerson)) })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="remarkable-persons"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Users"
        fallbackAccentColor="purple-300"
        fallbackLabel="History Wonders"
        fallbackTitle="Remarkable Persons"
        fallbackDescription="The men and women of Bocaue whose lives, work, and sacrifice have shaped the identity and culture of the municipality."
        showBackButton
      />

      {/* Intro stat bar */}
      <section className="border-b border-border bg-muted/40 py-6">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(personCategoryLabels).map(([key, label]) => (
              <span
                key={key}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${categoryColors[key as NotablePerson["category"]]}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Persons grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Recognized Bocaueños</h2>
              <p className="text-muted-foreground">
                Patriots, artists, leaders, and community builders.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {remarkablePersons.map((person) => (
              <Card
                key={person.id}
                className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {person.image && (
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <Badge variant="outline" className={`text-xs ${categoryColors[person.category]}`}>
                        {personCategoryLabels[person.category]}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-5">
                  {!person.image && (
                    <Badge variant="outline" className={`text-xs mb-3 ${categoryColors[person.category]}`}>
                      {personCategoryLabels[person.category]}
                    </Badge>
                  )}
                  <div className="flex items-start gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{person.years}</span>
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-0.5">{person.name}</h3>
                  {person.author && <p className="text-xs text-muted-foreground/70 mb-1">By {person.author}</p>}
                  <p className="text-sm font-semibold text-primary mb-3">{person.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{person.description}</p>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Legacy
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{person.legacy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="mt-16 flex flex-col sm:flex-row gap-4 pt-8 border-t border-border">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/history/timeline">
                <Clock className="h-4 w-4" />
                Timeline of Events
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
