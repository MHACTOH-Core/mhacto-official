"use client"

import { useState, useEffect } from "react"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { Map, Clock, Users } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GalleryImage } from "@/components/ui/gallery-image"
import { tourPackages as fallbackPackages, type TourPackage } from "@/lib/data/destinations-data"
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
  active: "Active",
}
const difficultyColor: Record<TourPackage["difficulty"], string> = {
  easy: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-red-100 text-red-800 border-red-200",
}

export default function TravelToursPage() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>(fallbackPackages)

  // Sends GET /api/posts/read.php?label=travel-tours&status=published → PHP runs SQL SELECT with label JOIN → returns JSON
  useEffect(() => {
    apiFetchByLabel("travel-tours")
      .then((posts) => { if (posts?.length) setTourPackages(posts.map(cmsToTourPackage)) })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="travel-tours"
        fallbackImage="/images/places/river-festival.jpg"
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

          <div className="space-y-10">
            {tourPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="grid gap-0 md:grid-cols-[1fr_2fr]">
                  <GalleryImage
                    src={pkg.image}
                    gallery={pkg.gallery}
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
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pkg.description}</p>

                    <div className="flex flex-wrap gap-4 mb-5 text-sm">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        {pkg.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        {pkg.groupSize}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-primary">
                        {pkg.price}
                      </div>
                    </div>

                    <p className="text-xs text-primary/70 font-medium mt-auto">
                      Contact the MHACTO office to book this tour →
                    </p>
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
