"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Calendar, Star } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GalleryImage } from "@/components/ui/gallery-image"
import { type Festival } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToFestival } from "@/lib/cms-mappers"

const typeBadge: Record<Festival["type"], string> = {
  religious: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  cultural: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  civic: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
  seasonal: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300",
}
const typeLabels: Record<Festival["type"], string> = {
  religious: "Religious",
  cultural: "Cultural",
  civic: "Civic",
  seasonal: "Seasonal",
}

export default function FestivalsCelebrationsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])

  useEffect(() => {
    apiFetchByLabel("festivals")
      .then((posts) => { if (posts?.length) setFestivals(posts.map(cmsToFestival)) })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="festivals-celebrations"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Sparkles"
        fallbackAccentColor="amber-300"
        fallbackLabel="Culture"
        fallbackTitle="Festivals & Celebrations"
        fallbackDescription="The annual traditions and celebrations that bring Bocaue alive — from world-famous river festivals to intimate Christmas dawn masses."
        showBackButton
      />

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Annual Festivals of Bocaue</h2>
              <p className="text-muted-foreground">Celebrations that define the community calendar</p>
            </div>
          </div>

          <div className="space-y-10">
            {festivals.map((festival, idx) => (
              <Link key={festival.id} href={`/culture/festivals-celebrations/${festival.id}`} className="block">
              <Card className="overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className={`grid gap-0 ${idx % 2 === 0 ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]"}`}>
                  {idx % 2 === 0 && (
                    <GalleryImage
                      src={festival.image}
                      gallery={festival.gallery}
                      alt={festival.name}
                      outerClassName="h-full"
                      className="relative flex-1 overflow-hidden min-h-[260px]"
                    />
                  )}
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className={`text-xs ${typeBadge[festival.type]}`}>
                        {typeLabels[festival.type]}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {festival.date}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">{festival.name}</h3>
                    {festival.author && <p className="text-xs text-muted-foreground/70 mb-2">By {festival.author}</p>}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{festival.description}</p>
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Story &amp; Background</p>
                      <p className="text-sm text-foreground leading-relaxed">{festival.story}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Star className="h-3 w-3" /> Highlights
                      </p>
                      <ul className="space-y-1">
                        {festival.highlights.map((h) => (
                          <li key={h} className="text-sm text-foreground flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border">
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Read full article →
                      </span>
                    </div>
                  </CardContent>
                  {idx % 2 !== 0 && (
                    <GalleryImage
                      src={festival.image}
                      gallery={festival.gallery}
                      alt={festival.name}
                      outerClassName="h-full order-first md:order-last"
                      className="relative flex-1 overflow-hidden min-h-[260px]"
                    />
                  )}
                </div>
              </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
