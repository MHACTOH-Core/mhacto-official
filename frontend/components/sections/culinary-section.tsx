"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { asset } from "@/lib/utils"
import { apiFetchCulinaryItems, type CulinaryItem } from "@/lib/api"

// No hardcoded fallback — culinary items come from backend

const MAX_DISPLAY = 4

export function CulinarySection() {
  const [delicacies, setDelicacies] = useState<CulinaryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetchCulinaryItems()
      .then((items) => {
        if (items && items.length > 0) {
          setDelicacies(items)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Limit to MAX_DISPLAY items
  const displayItems = delicacies.slice(0, MAX_DISPLAY)

  // Don't render if no content loaded yet after API call
  if (!loading && displayItems.length === 0) return null

  return (
    <section
      id="cuisine"
      className="relative z-20 bg-muted/40 py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <UtensilsCrossed className="h-4 w-4" />
            Taste of Bocaue
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Featured Culinary Delicacies
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            From legendary crispy chicharon to generations-old kakanin, Bocaue's flavours
            tell a story of culture, craft, and community.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item, i) => {
            const imageUrl = item.image 
              ? (item.image.startsWith('/images') ? asset(item.image) : item.image)
              : asset("/images/places/local-delicacies.jpg")
            
            return (
              <div
                key={item.itemId}
                className={`group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(i + 1) * 100}`}
              >
                {/* Image */}
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className="bg-primary/90 text-primary-foreground border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm"
                    >
                      {item.tag}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>
                  <Link
                    href="/culture/local-cuisine"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary"
                  >
                    Explore Cuisine
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA - Show only if there are items */}
        {delicacies.length > 0 && (
          <div className="mt-10 text-center reveal-on-scroll delay-300">
            <Button asChild variant="outline" size="lg" className="rounded-full gap-2">
              <Link href="/culture/local-cuisine">
                Discover All Delicacies
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
