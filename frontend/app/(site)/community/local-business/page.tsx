"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Phone, Calendar, Store } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type LocalBusiness } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToLocalBusiness } from "@/lib/cms-mappers"

const typeLabels: Record<LocalBusiness["type"], string> = {
  food: "Food & Bakery",
  crafts: "Crafts & Industry",
  retail: "Retail",
  services: "Services",
  agri: "Agriculture",
}

const typeColor: Record<LocalBusiness["type"], string> = {
  food: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300",
  crafts: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  retail: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
  services: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300",
  agri: "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/20 dark:text-lime-300",
}

export default function LocalBusinessPage() {
  const [localBusinesses, setLocalBusinesses] = useState<LocalBusiness[]>([])

  useEffect(() => {
    apiFetchByLabel("local-business")
      .then((posts) => { if (posts?.length) setLocalBusinesses(posts.map(cmsToLocalBusiness)) })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="local-business"
        fallbackImage="/images/places/Food.jpg"
        fallbackIcon="Store"
        fallbackAccentColor="green-300"
        fallbackLabel="Community"
        fallbackTitle="Local Businesses"
        fallbackDescription="The enterprises and industries rooted in Bocaue's culture and heritage, sustaining livelihoods for generations."
        showBackButton
      />

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Featured Local Businesses</h2>
              <p className="text-muted-foreground">Heritage-rooted enterprises in Bocaue</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 items-start">
            {localBusinesses.map((biz) => (
              <Card key={biz.id} className="group overflow-hidden border-border transition-all duration-300">
                {biz.image && (
                  <div className="relative h-36 overflow-hidden">
                    <Image src={biz.image} alt={biz.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <Badge variant="outline" className={`text-xs ${typeColor[biz.type]}`}>
                        {typeLabels[biz.type]}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-5">
                  {!biz.image && (
                    <Badge variant="outline" className={`text-xs mb-3 ${typeColor[biz.type]}`}>
                      {typeLabels[biz.type]}
                    </Badge>
                  )}
                  <h3 className="text-lg font-black text-foreground mb-2">{biz.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{biz.description}</p>
                  <div className="space-y-2 mb-4">
                    {biz.yearEstablished && (
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Established {biz.yearEstablished}
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {biz.location}
                    </div>
                    {biz.contact && (
                      <div className="flex items-start gap-2 text-xs text-foreground">
                        <Phone className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {biz.contact}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Products &amp; Services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {biz.products.map((p) => (
                        <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
