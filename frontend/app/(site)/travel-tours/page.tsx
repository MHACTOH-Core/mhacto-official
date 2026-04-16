"use client"

import { useState, useEffect } from "react"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { Map, Clock, Users, Loader2 } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GalleryImage } from "@/components/ui/gallery-image"
import { type TourPackage } from "@/lib/data/destinations-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToTourPackage } from "@/lib/cms-mappers"

const typeBadge: Record<TourPackage["type"], string> = {
  heritage: "bg-amber-100 text-amber-800 border-amber-200",
  food: "bg-orange-100 text-orange-800 border-orange-200",
  festival: "bg-purple-100 text-purple-800 border-purple-200",
  nature: "bg-green-100 text-green-800 border-green-200",
  custom: "bg-blue-100 text-blue-800 border-blue-200",
}
const typeLabels: Record<TourPackage["type"], string> = {
  heritage: "Heritage Tour",
  food: "Food Trail",
  festival: "Festival Package",
  nature: "Nature Tour",
  custom: "Custom",
}
const difficultyLabel: Record<TourPackage["difficulty"], string> = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
  active: "Active",
}
const difficultyColor: Record<TourPackage["difficulty"], string> = {
  easy: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-amber-100 text-amber-800 border-amber-200",
  challenging: "bg-orange-100 text-orange-800 border-orange-200",
  active: "bg-red-100 text-red-800 border-red-200",
}

export default function TravelToursPage() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetchByLabel("travel-tours")
      .then((posts) => { if (posts?.length) setTourPackages(posts.map(cmsToTourPackage)) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="travel-tours"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Map"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Tourism"
        fallbackTitle="Travel & Tours"
        fallbackDescription="Curated tour packages by MHACTO Bocaue — guided experiences through history, culture, cuisine, and festival."
        showBackButton
      />

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">MHACTO Tour Packages</h2>
              <p className="text-muted-foreground">Book directly with the MHACTO office</p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading tours...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Unable to load tour packages.</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && tourPackages.length === 0 && (
            <div className="text-center py-20">
              <Map className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">No tour packages available yet.</p>
            </div>
          )}

          <div className="space-y-10">
            {tourPackages.map((pkg) => (
              <Card key={pkg.id} id={`item-${pkg.id}`} className="overflow-hidden border-border transition-all duration-300">
                <div className="grid gap-0 md:grid-cols-[1fr_2fr]">
                  <GalleryImage
                    src={pkg.image}
          
                    alt={pkg.name}
                    outerClassName="h-full"
                    className="relative flex-1 overflow-hidden min-h-[280px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-black/20" />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge variant="outline" className={`text-xs ${typeBadge[pkg.type]}`}>
                        {typeLabels[pkg.type]}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${difficultyColor[pkg.difficulty]}`}>
                        {difficultyLabel[pkg.difficulty]}
                      </Badge>
                    </div>
                  </GalleryImage>
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">{pkg.name}</h3>
                    {pkg.author && <p className="text-xs text-muted-foreground/70 mb-2">By {pkg.author}</p>}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pkg.description}</p>

                    <div className="flex flex-wrap gap-4 mb-5 text-sm">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        {pkg.duration}
                      </div>
                      {pkg.bookingContact && (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          {pkg.bookingContact}
                        </div>
                      )}
                    </div>

                    {pkg.includes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Includes</p>
                        <ul className="space-y-1">
                          {pkg.includes.slice(0, 4).map((item) => (
                            <li key={item} className="text-sm text-foreground flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="border-t border-border pt-4 mt-4">
                      <Link
                        href="/inquire"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Book This Tour
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
