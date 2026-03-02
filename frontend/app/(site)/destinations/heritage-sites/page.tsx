"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Landmark, Clock, MapPin, Star, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { heritageSites as fallbackSites, type HeritageSite } from "@/lib/data/destinations-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToHeritageSite, filterHeritage } from "@/lib/cms-mappers"

export default function HeritageSitesPage() {
  const [sites, setSites] = useState<HeritageSite[]>(fallbackSites)

  // Sends GET /api/posts/read.php?label=destinations&status=published → PHP runs SQL SELECT → returns JSON
  // Then client-side filters to only heritage sites
  useEffect(() => {
    apiFetchByLabel("destinations")
      .then((posts) => {
        const heritage = filterHeritage(posts)
        if (heritage.length > 0) setSites(heritage.map(cmsToHeritageSite))
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[380px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${asset('/images/places/oldtownbocaue.jpg')})`,
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
              <Landmark className="h-8 w-8 text-amber-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-amber-300">Destinations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">Heritage Sites</h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              Bocaue&apos;s built heritage — historic churches, civic monuments, and streetscapes that tell the story of centuries.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Landmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Heritage Sites of Bocaue</h2>
              <p className="text-muted-foreground">Tangible history preserved for future generations</p>
            </div>
          </div>

          <div className="space-y-8">
            {sites.map((site, idx) => (
              <Card key={site.id} className="overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className={`grid gap-0 ${idx % 2 === 0 ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]"}`}>
                  {idx % 2 === 0 && (
                    <div className="relative h-64 md:h-auto overflow-hidden min-h-[260px]">
                      <Image src={site.image} alt={site.name} fill className="object-cover" />
                      {site.isProtected && (
                        <div className="absolute top-3 left-3">
                          <Badge className="text-xs bg-amber-500 text-white border-0 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Protected
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-start">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Established {site.established}</Badge>
                      {site.protectionLevel && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                          {site.protectionLevel}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">{site.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{site.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-xs text-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {site.location}
                      </div>
                      <div className="flex items-start gap-2 text-xs text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {site.hours}
                      </div>
                    </div>
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About</p>
                      <p className="text-sm text-foreground leading-relaxed">{site.story}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Star className="h-3 w-3" /> Highlights
                      </p>
                      <ul className="space-y-1">
                        {site.highlights.map((h) => (
                          <li key={h} className="text-sm text-foreground flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  {idx % 2 !== 0 && (
                    <div className="relative h-64 md:h-auto overflow-hidden min-h-[260px] order-first md:order-last">
                      <Image src={site.image} alt={site.name} fill className="object-cover" />
                      {site.isProtected && (
                        <div className="absolute top-3 right-3">
                          <Badge className="text-xs bg-amber-500 text-white border-0 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Protected
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
