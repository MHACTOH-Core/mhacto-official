"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Phone, Calendar, Store, X } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  useEffect(() => {
    apiFetchByLabel("local-business")
      .then((posts) => { if (posts?.length) setLocalBusinesses(posts.map(cmsToLocalBusiness)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="local-business"
        fallbackImage="/images/defaults/no-image.svg"
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

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 items-start">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : localBusinesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Store className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No businesses listed yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for local business listings.</p>
            </div>
          ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 items-start">
            {localBusinesses.map((biz, idx) => (
              <Card key={biz.id} className={`reveal-on-scroll group overflow-hidden border-border transition-all duration-300 ${idx % 2 === 0 ? "" : "reveal-delay-1"}`}>
                {biz.images && biz.images.length > 1 ? (
                  <div className={`grid gap-0.5 h-36 overflow-hidden ${biz.images.length <= 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {biz.images.slice(0, 6).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setExpandedImage(img)}
                        className="relative overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
                        aria-label={`View image ${idx + 1} of ${biz.name}`}
                      >
                        <Image src={img} alt={`${biz.name} ${idx + 1}`} fill sizes="(max-width: 640px) 33vw, 20vw" className="object-cover transition-transform hover:scale-110" />
                      </button>
                    ))}
                  </div>
                ) : biz.image ? (
                  <button
                    type="button"
                    onClick={() => setExpandedImage(biz.image!)}
                    className="relative h-36 w-full overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
                    aria-label={`View ${biz.name} image`}
                  >
                    <Image src={biz.image} alt={biz.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition-transform hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${typeColor[biz.type]}`}>
                        {typeLabels[biz.type]}
                      </Badge>
                      {biz.isFeatured && (
                        <Badge className="text-xs bg-amber-500 text-white border-0">Featured</Badge>
                      )}
                    </div>
                  </button>
                ) : null}
                <CardContent className="p-5">
                  {!biz.image && (!biz.images || biz.images.length === 0) && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={`text-xs ${typeColor[biz.type]}`}>
                        {typeLabels[biz.type]}
                      </Badge>
                      {biz.isFeatured && (
                        <Badge className="text-xs bg-amber-500 text-white border-0">Featured</Badge>
                      )}
                    </div>
                  )}
                  {(biz.images && biz.images.length > 1) && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={`text-xs ${typeColor[biz.type]}`}>
                        {typeLabels[biz.type]}
                      </Badge>
                      {biz.isFeatured && (
                        <Badge className="text-xs bg-amber-500 text-white border-0">Featured</Badge>
                      )}
                    </div>
                  )}
                  <h3 className="text-lg font-black text-foreground mb-2">{biz.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 break-words">{biz.description}</p>
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
          )}
        </div>
      </section>

      {/* Image lightbox — plain fixed overlay, no scroll lock */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div className="relative max-w-2xl w-[90vw] aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image src={expandedImage} alt="Business image" fill className="object-contain rounded-lg" sizes="(max-width: 768px) 90vw, 640px" />
          </div>
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </main>
  )
}
