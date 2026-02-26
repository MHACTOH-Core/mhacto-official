"use client"

import Image from "next/image"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Sparkles, Calendar, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { festivals, type Festival } from "@/lib/data/culture-data"

const typeBadge: Record<Festival["type"], string> = {
  religious: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  cultural: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  civic: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
  seasonal: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300",
}
const typeLabels: Record<Festival["type"], string> = {
  religious: "Religious",
  cultural: "Cultural",
  civic: "Civic",
  seasonal: "Seasonal",
}

export default function FestivalsCelebrationsPage() {
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
            <span className="text-sm font-medium">Back to home</span>
          </Link>
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-amber-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-amber-300">Culture</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
              Festivals &amp; Celebrations
            </h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              The annual traditions and celebrations that bring Bocaue alive — from world-famous river festivals to
              intimate Christmas dawn masses.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Annual Festivals of Bocaue</h2>
              <p className="text-muted-foreground">Celebrations that define the community calendar</p>
            </div>
          </div>

          <div className="space-y-10">
            {festivals.map((festival, idx) => (
              <Card key={festival.id} className="overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className={`grid gap-0 ${idx % 2 === 0 ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]"}`}>
                  {idx % 2 === 0 && (
                    <div className="relative h-64 md:h-auto overflow-hidden">
                      <Image src={festival.image} alt={festival.name} fill className="object-cover" />
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className={`text-xs ${typeBadge[festival.type]}`}>
                        {typeLabels[festival.type]}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {festival.date}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">{festival.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{festival.description}</p>
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Story &amp; Background</p>
                      <p className="text-sm text-foreground leading-relaxed">{festival.story}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Star className="h-3 w-3" /> Highlights
                      </p>
                      <ul className="space-y-1">
                        {festival.highlights.map((h) => (
                          <li key={h} className="text-sm text-foreground flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  {idx % 2 !== 0 && (
                    <div className="relative h-64 md:h-auto overflow-hidden order-first md:order-last">
                      <Image src={festival.image} alt={festival.name} fill className="object-cover" />
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
