"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { UtensilsCrossed, ArrowRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { CuisineItem } from "@/lib/data/culture-data"
import { apiFetchFeaturedByLabel } from "@/lib/api"
import { cmsToCuisineItem } from "@/lib/cms-mappers"

const MAX_FEATURED = 3

const typeColors: Record<CuisineItem["type"], string> = {
  main:    "bg-orange-100 text-orange-700 border-orange-200",
  snack:   "bg-amber-100 text-amber-700 border-amber-200",
  dessert: "bg-pink-100 text-pink-700 border-pink-200",
  drink:   "bg-sky-100 text-sky-700 border-sky-200",
}

const typeLabel: Record<CuisineItem["type"], string> = {
  main:    "Main Dish",
  snack:   "Snack",
  dessert: "Dessert",
  drink:   "Drink",
}

export function CulinarySection() {
  const [items, setItems] = useState<CuisineItem[]>([])

  useEffect(() => {
    apiFetchFeaturedByLabel("local-cuisine", MAX_FEATURED)
      .then((posts) => {
        if (posts?.length) setItems(posts.slice(0, MAX_FEATURED).map(cmsToCuisineItem))
      })
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <UtensilsCrossed className="h-4 w-4" />
            Local Cuisine
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Culinary Wonders
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            Signature flavors of Bocaue — from heritage recipes passed down for generations to beloved street food classics.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <Link key={item.id} href={`/culture/local-cuisine/${item.id}`} className={`block reveal-on-scroll reveal-delay-${idx + 1}`}>
            <Card
              className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer h-full"
            >
              {item.image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge
                    variant="outline"
                    className={`absolute bottom-3 left-3 text-xs border ${typeColors[item.type]}`}
                  >
                    {typeLabel[item.type]}
                  </Badge>
                </div>
              )}
              <CardContent className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.name}
                </h3>
                {item.tagalogName && item.tagalogName !== item.name && (
                  <p className="text-xs text-primary font-semibold mt-0.5 mb-2 italic">{item.tagalogName}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                  {item.description}
                </p>
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 flex-wrap">
                    <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground line-clamp-1">{item.ingredients.slice(0, 3).join(", ")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
        {/* CTA */}
        <div className="mt-10 text-center reveal-on-scroll">
          <Link
            href="/culture/local-cuisine"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            See All Cuisine
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>      </div>
    </section>
  )
}
