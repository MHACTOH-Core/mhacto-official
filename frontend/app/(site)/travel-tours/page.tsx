"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Map, Clock, Users, Phone, Mail, CheckCircle, ArrowRight } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export default function TravelToursPage() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>(fallbackPackages)

  useEffect(() => {
    apiFetchByLabel("travel-tours")
      .then((posts) => { if (posts?.length) setTourPackages(posts.map(cmsToTourPackage)) })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
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

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">

          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">MHACTO Tour Packages</h2>
              <p className="text-muted-foreground text-sm">Book directly with the MHACTO office</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tourPackages.map((pkg) => (
              <Card key={pkg.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className={`text-xs border ${typeBadge[pkg.type]}`}>
                      {typeLabels[pkg.type]}
                    </Badge>
                  </div>
                 
                </div>

                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {pkg.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />{pkg.duration}
                    </span>
                  </div>

                  {/* Includes */}
                  {pkg.includes.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {pkg.includes.slice(0, 3).map((inc) => (
                        <li key={inc} className="flex items-start gap-2 text-xs text-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Booking contact */}
                  <div className="border-t border-border pt-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-xs text-foreground">
                      <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      {pkg.bookingContact.split("|")[0].trim()}
                    </span>
                    {pkg.bookingContact.includes("|") && (
                      <span className="flex items-center gap-1.5 text-xs text-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        {pkg.bookingContact.split("|")[1].trim()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/10 px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-black text-foreground">Want a custom tour?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Contact the MHACTO office and we&apos;ll tailor a package just for you.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0">
              <Link href="/inquire">
                Send an Inquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

        </div>
      </section>
    </main>
  )
}
