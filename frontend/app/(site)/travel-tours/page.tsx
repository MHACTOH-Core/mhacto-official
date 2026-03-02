"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Map, Clock, Users, Star, Phone, Mail, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[380px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.40)), url(${asset('/images/places/river-festival.jpg')})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 flex flex-col justify-center py-12 sm:py-16 md:py-24">
          <Link href="/" className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Map className="h-8 w-8 text-cyan-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-cyan-300">Tourism</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">Travel &amp; Tours</h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              Curated tour packages by MHACTO Bocaue — guided experiences through history, culture, cuisine, and festival.
            </p>
          </div>
        </div>
      </section>

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
                  <div className="relative min-h-[280px] overflow-hidden">
                    <Image src={pkg.image} alt={pkg.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-black/20" />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge variant="outline" className={`text-xs ${typeBadge[pkg.type]}`}>
                        {typeLabels[pkg.type]}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${difficultyColor[pkg.difficulty]}`}>
                        {difficultyLabel[pkg.difficulty]}
                      </Badge>
                    </div>
                  </div>
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

                    {/* Itinerary */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Itinerary</p>
                      <div className="space-y-2">
                        {pkg.itinerary.map((item) => (
                          <div key={item.time} className="flex items-start gap-3">
                            <span className="flex-shrink-0 text-xs font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5 mt-0.5">
                              {item.time}
                            </span>
                            <span className="text-sm text-foreground">{item.activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Includes */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Included
                      </p>
                      <ul className="space-y-1">
                        {pkg.includes.map((inc) => (
                          <li key={inc} className="text-sm text-foreground flex items-start gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Booking */}
                    <div className="border-t border-border pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Booking &amp; Inquiries</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-foreground">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          {pkg.bookingContact.split("|")[0].trim()}
                        </span>
                        {pkg.bookingContact.includes("|") && (
                          <span className="flex items-center gap-1.5 text-xs text-foreground">
                            <Mail className="h-3.5 w-3.5 text-primary" />
                            {pkg.bookingContact.split("|")[1].trim()}
                          </span>
                        )}
                      </div>
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
