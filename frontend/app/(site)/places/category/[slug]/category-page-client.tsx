"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRevealOnScroll } from "@/hooks/use-reveal"
import type { CategoryType, CategoryPlace } from "@/lib/data/category-data"

interface CategoryPageClientProps {
  category: CategoryType
  categoryInfo: {
    title: string
    icon: string
    description: string
  }
  places: CategoryPlace[]
  heroImage: string
}

export default function CategoryPageClient({
  category,
  categoryInfo,
  places,
  heroImage,
}: CategoryPageClientProps) {
  const [selectedPlace, setSelectedPlace] = useState<CategoryPlace | null>(null)
  const headerRef = useRevealOnScroll<HTMLDivElement>()
  const descriptionRef = useRevealOnScroll<HTMLDivElement>()
  const cardsRef = useRevealOnScroll<HTMLDivElement>()

  const getCategoryColor = () => {
    return "from-blue-400 "
  }

  const getCategoryStyles = (): { badge: string; border: string } => {
    return { badge: "bg-blue-100 text-blue-800", border: "border-blue-200" }
  }

  const styles = getCategoryStyles()

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <section className="relative mt-12 sm:mt-14 md:mt-20 lg:mt-28 min-h-[350px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <Image
          src={heroImage}
          alt={categoryInfo.title}
          fill
          className="absolute inset-0 object-cover"
          priority
        />
        
        {/* Overlay Gradient - Professional dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50" />
        
        {/* Animated accent blur effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 h-full flex flex-col justify-center py-8 sm:py-12 md:py-20 lg:py-32">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 w-fit mb-6 sm:mb-8 px-3 sm:px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all transform hover:scale-105 duration-200 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Places</span>
          </button>

          <div ref={headerRef} className="reveal-on-scroll space-y-4 sm:space-y-6 max-w-3xl">
            <div className="flex items-start sm:items-center gap-2 sm:gap-4 animate-fade-in">
              <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg flex-shrink-0">
                {categoryInfo.icon}
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white drop-shadow-2xl leading-tight">
                {categoryInfo.title}
              </h1>
            </div>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/90 drop-shadow-lg leading-relaxed">
              {categoryInfo.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          {/* Stats/Info Section */}
          <div ref={descriptionRef} className="reveal-on-scroll mb-12 sm:mb-16 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <Card className="bg-gradient-to-br from-card to-card/80 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">
                      Total Attractions
                    </p>
                    <p className="mt-2 sm:mt-3 text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">{places.length}</p>
                  </div>
                  <Sparkles className="h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 text-primary/20 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-card to-card/80 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">
                      Category
                    </p>
                    <p className="mt-2 sm:mt-3 text-sm sm:text-lg lg:text-2xl font-bold text-foreground line-clamp-2">{categoryInfo.title}</p>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">{categoryInfo.icon}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-card to-card/80 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Location
                  </p>
                  <p className="mt-2 sm:mt-3 text-sm sm:text-lg lg:text-2xl font-bold text-foreground">Bocaue, Bulacan</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Places Grid */}
          <div ref={cardsRef} className="reveal-on-scroll">
            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
                <Sparkles className="h-6 sm:h-8 w-6 sm:w-8 text-primary flex-shrink-0" />
                <span>Featured Attractions</span>
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-muted-foreground">
                Discover the best places to visit in this category
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place, index) => (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className="group h-full text-left transition-all duration-300 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className={`h-full overflow-hidden border-2 ${styles.border} hover:shadow-2xl transition-all duration-300 bg-card`}>
                    <div className="relative overflow-hidden bg-muted h-40 sm:h-52 md:h-60 lg:h-64">
                      <Image
                        src={place.image}
                        alt={place.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                      <Badge className={`mb-2 sm:mb-3 ${styles.badge} font-semibold text-xs`}>{place.category}</Badge>
                      <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl group-hover:text-primary transition-colors duration-200 line-clamp-2">
                        {place.title}
                      </CardTitle>
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-3">
                        {place.shortDescription}
                      </p>

                      {place.location && (
                        <div className="mt-3 sm:mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{place.location}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedPlace ? (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPlace(null)}
        >
          <Card
            className="w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-40 sm:h-56 md:h-72 overflow-hidden">
              <Image
                src={selectedPlace.image}
                alt={selectedPlace.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 text-lg"
              >
                ✕
              </button>
            </div>

            <CardContent className="pt-4 sm:pt-8 pb-4 sm:pb-8 px-4 sm:px-0 space-y-4 sm:space-y-6">
              <div>
                <Badge className={`${styles.badge} font-semibold text-xs`}>{selectedPlace.category}</Badge>
                <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-foreground line-clamp-2">
                  {selectedPlace.title}
                </h2>
              </div>

              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                {selectedPlace.description}
              </p>

              {selectedPlace.location ? (
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-widest">Location</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{selectedPlace.location}</p>
                  </div>
                </div>
              ) : null}

              {selectedPlace.highlights && selectedPlace.highlights.length > 0 ? (
                <div className="pt-2 space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-widest">Highlights</p>
                  <ul className="space-y-2">
                    {selectedPlace.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground p-2 rounded hover:bg-accent/50 transition-colors">
                        <span className="text-primary font-bold text-base sm:text-lg flex-shrink-0">✓</span>
                        <span className="pt-0.5">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlace(null)}
                  className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                >
                  Close
                </Button>
                <Button asChild className="flex-1 text-xs sm:text-sm h-9 sm:h-10">
                  <Link href="/contact?subject=inquiry">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  )
}
