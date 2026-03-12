"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Clock, Store, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Static restaurant data (shared with local-cuisine page)
const featuredRestaurants = [
  {
    id: "aling-nenas",
    name: "Aling Nena's Carinderia",
    tagline: "Classic Filipino comfort food since 1978",
    type: "carinderia" as const,
    address: "123 Rizal Avenue, Bocaue, Bulacan",
    hours: "Mon–Sun · 6:00 AM – 8:00 PM",
    rating: 4.7,
    tags: ["Adobo", "Sinigang", "Sisig", "Bangus"],
    highlight: "Best sinaing na bangus in Bocaue",
  },
  {
    id: "bocaue-lechon",
    name: "Bocaue Lechon House",
    tagline: "Award-winning whole roast pig, lechon manok & liempo",
    type: "restaurant" as const,
    address: "Mc Arthur Highway, Bocaue, Bulacan",
    hours: "Tue–Sun · 10:00 AM – 9:00 PM",
    rating: 4.9,
    tags: ["Lechon", "Liempo", "BBQ"],
    highlight: "Crispy-skin lechon made with native herbs",
  },
  {
    id: "plaza-merienda",
    name: "Plaza Merienda Center",
    tagline: "Street food hub in the heart of the old town plaza",
    type: "eatery" as const,
    address: "Old Town Plaza, Bocaue, Bulacan",
    hours: "Daily · 3:00 PM – 10:00 PM",
    rating: 4.5,
    tags: ["Kwek-Kwek", "Fishball", "Isaw", "Halo-Halo"],
    highlight: "The go-to afternoon merienda spot for locals",
  },
]

const typeColors: Record<string, string> = {
  restaurant: "bg-primary/10 text-primary border-primary/20",
  carinderia: "bg-green-100 text-green-700 border-green-200",
  eatery: "bg-amber-100 text-amber-700 border-amber-200",
  bakery: "bg-rose-100 text-rose-700 border-rose-200",
  kiosk: "bg-blue-100 text-blue-700 border-blue-200",
}

const typeLabel: Record<string, string> = {
  restaurant: "Restaurant",
  carinderia: "Carinderia",
  eatery: "Eatery",
  bakery: "Bakery",
  kiosk: "Kiosk",
}

export function FeaturedRestaurants() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Food & Dining</span>
            </div>
            <h2 className="text-3xl font-black text-foreground sm:text-4xl">Restaurants & Eateries</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              From hearty carinderias to award-winning lechon houses — taste the flavors of Bocaue.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-auto">
            <Link href="/culture/local-cuisine">
              See All Local Cuisine <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredRestaurants.map((r) => (
            <Card
              key={r.id}
              className="group border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <CardContent className="p-5 flex flex-col flex-1">
                {/* Top */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs border ${typeColors[r.type] ?? "bg-muted"}`}
                      >
                        {typeLabel[r.type]}
                      </Badge>
                    </div>
                    <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                      {r.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.tagline}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 flex-shrink-0">
                    <Star className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">{r.rating}</span>
                  </div>
                </div>

                {/* Highlight */}
                <div className="bg-primary/5 rounded-lg px-3 py-2 mb-3 border border-primary/10">
                  <p className="text-xs text-primary font-semibold italic">&ldquo;{r.highlight}&rdquo;</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3 flex-1">
                  {r.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Info */}
                <div className="border-t border-border pt-3 space-y-1.5">
                  <div className="flex items-start gap-2 text-xs text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    {r.address}
                  </div>
                  <div className="flex items-start gap-2 text-xs text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    {r.hours}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
