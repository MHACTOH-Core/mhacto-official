"use client"

import Image from "next/image"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, BookOpen, Clock, MapPin, Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { museums } from "@/lib/data/destinations-data"

const typeLabels: Record<string, string> = {
  history: "History & Heritage",
  art: "Art & Culture",
  natural: "Natural History",
  house: "House Museum",
}
const typeColor: Record<string, string> = {
  history: "bg-amber-100 text-amber-800 border-amber-200",
  art: "bg-purple-100 text-purple-800 border-purple-200",
  natural: "bg-green-100 text-green-800 border-green-200",
  house: "bg-blue-100 text-blue-800 border-blue-200",
}

export default function MuseumsPage() {
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
              <BookOpen className="h-8 w-8 text-blue-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-blue-300">Destinations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">Museums</h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              Explore Bocaue&apos;s curated collections — history, culture, and achievement displayed for all to discover.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Museums &amp; Galleries</h2>
              <p className="text-muted-foreground">Public and heritage collections in and around Bocaue</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {museums.map((museum) => (
              <Card key={museum.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="relative h-36 overflow-hidden">
                  <Image src={museum.image} alt={museum.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <Badge variant="outline" className={`text-xs ${typeColor[museum.type] ?? ""}`}>
                      {typeLabels[museum.type] ?? museum.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-foreground mb-2">{museum.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{museum.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {museum.location}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {museum.hours}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <Ticket className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {museum.admission}
                    </div>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Collections</p>
                    <ul className="space-y-1">
                      {museum.collections.slice(0, 4).map((c) => (
                        <li key={c} className="text-xs text-foreground flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                      {museum.collections.length > 4 && (
                        <li className="text-xs text-muted-foreground">+{museum.collections.length - 4} more collections</li>
                      )}
                    </ul>
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
