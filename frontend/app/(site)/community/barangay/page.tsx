"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Users, ChevronRight } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { barangays as fallbackBarangays, type Barangay } from "@/lib/data/community-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToBarangay } from "@/lib/cms-mappers"
import { asset } from "@/lib/utils"

export default function BarangayPage() {
  const [barangays, setBarangays] = useState<Barangay[]>(fallbackBarangays)

  useEffect(() => {
    apiFetchByLabel("barangay")
      .then((posts) => {
        if (posts?.length) setBarangays(posts.map(cmsToBarangay))
      })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="barangay"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="MapPin"
        fallbackAccentColor="emerald-300"
        fallbackLabel="Community"
        fallbackTitle="Barangays of Bocaue"
        fallbackDescription="Discover the vibrant barangays that make up the municipality of Bocaue, Bulacan — each with its own unique story, heritage, and community spirit."
        showBackButton
      />

      {/* Count bar */}
      <section className="border-b border-border bg-muted/40 py-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{barangays.length}</span>{" "}
            barangay{barangays.length !== 1 ? "s" : ""}
          </p>
          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            <MapPin className="h-3 w-3 mr-1" /> Bocaue, Bulacan
          </Badge>
        </div>
      </section>

      {/* Blog-style card grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {barangays.map((brgy) => (
              <a
                key={brgy.id}
                href={`/community/barangay/${brgy.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <article className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    <Image
                      src={brgy.image ? brgy.image : asset("/images/defaults/no-image.svg")}
                      alt={brgy.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    {brgy.isFeatured && (
                      <Badge className="absolute top-3 left-3 bg-emerald-500 text-white border-0 text-xs">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-black text-white leading-tight drop-shadow-md">
                        {brgy.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {brgy.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                      {brgy.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary" />
                          {brgy.location}
                        </span>
                      )}
                      {brgy.population && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-primary" />
                          {brgy.population}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      Read more <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
