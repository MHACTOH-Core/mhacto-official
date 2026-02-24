"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Utensils, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { localCuisine, type CuisineItem } from "@/lib/data/culture-data"

const typeLabels: Record<CuisineItem["type"], string> = {
  main: "Main Dish",
  snack: "Snack",
  dessert: "Dessert & Sweets",
  drink: "Drink",
}

const typeBadge: Record<CuisineItem["type"], string> = {
  main: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  snack: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  dessert: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  drink: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
}

export default function LocalCuisinePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[380px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.40)), url(/images/places/Food.jpg)`,
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
              <Utensils className="h-8 w-8 text-amber-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-amber-300">Culture</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">Local Cuisine</h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              A taste of Bocaue — traditional flavors, beloved delicacies, and the food stories that define community life.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Utensils className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Bocaue&apos;s Culinary Heritage</h2>
              <p className="text-muted-foreground">Traditional foods and the stories behind them</p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {localCuisine.map((item) => (
              <Card key={item.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <Badge variant="outline" className={`text-xs ${typeBadge[item.type]}`}>
                      {typeLabels[item.type]}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-black text-foreground mb-1">{item.name}</h3>
                  {item.tagalogName && item.tagalogName !== item.name && (
                    <p className="text-xs text-muted-foreground italic mb-2">{item.tagalogName}</p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground">{item.where.join(" · ")}</p>
                    </div>
                    {item.bestTime && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-foreground">{item.bestTime}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">The Story</p>
                    <p className="text-sm text-foreground leading-relaxed">{item.story}</p>
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
