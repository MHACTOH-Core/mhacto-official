"use client"

import Image from "next/image"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Store, MapPin, Phone, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { localBusinesses, type LocalBusiness } from "@/lib/data/culture-data"

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
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[380px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.40)), url(${asset('/images/places/Food.jpg')})`,
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
              <Store className="h-8 w-8 text-green-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-green-300">Arts &amp; Livelihood</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">Local Business</h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              The enterprises and industries rooted in Bocaue&apos;s culture and heritage, sustaining livelihoods for generations.
            </p>
          </div>
        </div>
      </section>

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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {localBusinesses.map((biz) => (
              <Card key={biz.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                {biz.image && (
                  <div className="relative h-36 overflow-hidden">
                    <Image src={biz.image} alt={biz.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
