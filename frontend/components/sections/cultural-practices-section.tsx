"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Scroll, ArrowRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { CulturalPractice } from "@/lib/data/culture-data"
import { apiFetchFeaturedByLabel } from "@/lib/api"
import { cmsToCulturalPractice } from "@/lib/cms-mappers"
import { asset } from "@/lib/utils"

const MAX_FEATURED = 3

const statusColors: Record<CulturalPractice["status"], string> = {
  active:     "bg-green-100 text-green-700 border-green-200",
  endangered: "bg-red-100 text-red-700 border-red-200",
  revived:    "bg-blue-100 text-blue-700 border-blue-200",
}

const statusLabel: Record<CulturalPractice["status"], string> = {
  active:     "Active",
  endangered: "Endangered",
  revived:    "Revived",
}

export function CulturalPracticesSection() {
  const [items, setItems] = useState<CulturalPractice[]>([])

  useEffect(() => {
    apiFetchFeaturedByLabel("cultural-practices", MAX_FEATURED)
      .then((posts) => {
        if (posts?.length) setItems(posts.slice(0, MAX_FEATURED).map(cmsToCulturalPractice))
      })
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Scroll className="h-4 w-4" />
            Living Heritage
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Cultural Practices
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            Time-honored traditions that define Bocaue&apos;s cultural identity — from sacred processions to artisan crafts.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image || asset("/images/places/Arts.jpg")}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge
                  variant="outline"
                  className={`absolute bottom-3 left-3 text-xs border ${statusColors[item.status]}`}
                >
                  {statusLabel[item.status]}
                </Badge>
              </div>
              <CardContent className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.name}
                </h3>
                <p className="text-xs text-primary font-semibold mt-0.5 mb-2 capitalize">{item.category.replace("-", " ")}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                  {item.description}
                </p>
                {item.significance && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 flex-wrap">
                    <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground line-clamp-1">{item.significance}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/culture/practices-traditions"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            See All Traditions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>      </div>
    </section>
  )
}
