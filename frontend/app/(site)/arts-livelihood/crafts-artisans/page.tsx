"use client"

import Image from "next/image"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Palette, Star, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { artisans } from "@/lib/data/culture-data"

export default function CraftsArtisansPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[380px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${asset('/images/places/Arts.jpg')})`,
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
              <Palette className="h-8 w-8 text-purple-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-purple-300">Arts &amp; Livelihood</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
              Crafts &amp; Artisans
            </h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              The master craftspeople of Bocaue — keeping traditional arts alive through skilled hands and generational knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Master Artisans of Bocaue</h2>
              <p className="text-muted-foreground">Recognized craft practitioners and their heritage</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {artisans.map((artisan) => (
              <Card key={artisan.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                {artisan.image && (
                  <div className="relative h-52 overflow-hidden">
                    <Image src={artisan.image} alt={artisan.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <span className="text-white font-black text-lg drop-shadow-lg">{artisan.name}</span>
                      <span className="text-xs text-white/80 bg-black/40 rounded-full px-2 py-0.5 backdrop-blur-sm">
                        {artisan.experience}
                      </span>
                    </div>
                  </div>
                )}
                <CardContent className="p-5">
                  {!artisan.image && (
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-black text-foreground">{artisan.name}</h3>
                      <span className="text-xs text-muted-foreground">{artisan.experience}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300">
                      {artisan.craft}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{artisan.description}</p>
                  {artisan.awards && artisan.awards.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Award className="h-3 w-3" /> Awards &amp; Recognition
                      </p>
                      <div className="space-y-1">
                        {artisan.awards.map((a) => (
                          <div key={a} className="flex items-center gap-2 text-xs text-foreground">
                            <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
                            {a}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Products</p>
                    <div className="flex flex-wrap gap-1.5">
                      {artisan.products.map((p) => (
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
