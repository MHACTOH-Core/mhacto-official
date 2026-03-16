"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Compass, ArrowRight, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { tourPackages as staticTourPackages, type TourPackage } from "@/lib/data/destinations-data"
import { apiFetchFeaturedByLabel, apiFetchByLabel } from "@/lib/api"
import { cmsToTourPackage } from "@/lib/cms-mappers"

const typeBadge: Record<TourPackage["type"], string> = {
  heritage: "bg-amber-100 text-amber-800 border-amber-200",
  food:     "bg-orange-100 text-orange-800 border-orange-200",
  festival: "bg-rose-100 text-rose-800 border-rose-200",
  nature:   "bg-green-100 text-green-800 border-green-200",
  custom:   "bg-blue-100 text-blue-800 border-blue-200",
}

const typeLabel: Record<TourPackage["type"], string> = {
  heritage: "Heritage", food: "Food", festival: "Festival", nature: "Nature", custom: "Custom",
}

export function RestaurantsSection() {
  const [tours, setTours] = useState<TourPackage[]>([])

  useEffect(() => {
    // First try featured travel-tours; fallback to all travel-tours; then static data
    apiFetchFeaturedByLabel("travel-tours", 4)
      .then((posts) => {
        if (posts?.length) {
          setTours(posts.map(cmsToTourPackage))
        } else {
          // No featured items — fetch all travel-tours instead
          return apiFetchByLabel("travel-tours", 4).then((allPosts) => {
            if (allPosts?.length) {
              setTours(allPosts.map(cmsToTourPackage))
            } else {
              setTours(staticTourPackages.slice(0, 2))
            }
          })
        }
      })
      .catch(() => {
        setTours(staticTourPackages.slice(0, 2))
      })
  }, [])

  if (tours.length === 0) return null

  return (
    <section className="relative z-20 bg-muted/40 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Compass className="h-4 w-4" />
            Travel &amp; Tours
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Featured Tour Packages
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            From heritage walks to festival immersions — experience Bocaue through guided tours crafted by MHACTO.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 items-start">
          {tours.map((tour, idx) => (
            <Link
              key={tour.id}
              href="/travel-tours"
              target="_blank"
              rel="noopener noreferrer"
              className={`group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(idx + 1) * 100}`}
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={tour.image}
                  alt={tour.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="outline"
                    className={`text-[10px] border backdrop-blur-sm ${typeBadge[tour.type]}`}
                  >
                    {typeLabel[tour.type]}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-black text-card-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                  {tour.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 mb-3">
                  {tour.description}
                </p>
                <div className="border-t border-border pt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    {tour.duration}
                  </div>
                  {tour.highlights?.[0] && (
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      {tour.highlights[0]}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center reveal-on-scroll delay-300">
          <Link
            href="/travel-tours"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            See All Tour Packages
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
