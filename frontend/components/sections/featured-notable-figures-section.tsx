"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRevealOnScroll } from "@/hooks/use-reveal"
import {
  notablePersons as fallbackPersons,
  personCategoryLabels,
  type NotablePerson,
} from "@/lib/data/history-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToNotablePerson } from "@/lib/cms-mappers"

const categoryColor: Record<string, string> = {
  "national-hero": "bg-red-100 text-red-800 border-red-200",
  arts: "bg-purple-100 text-purple-800 border-purple-200",
  religion: "bg-amber-100 text-amber-700 border-amber-200",
  government: "bg-blue-100 text-blue-800 border-blue-200",
  education: "bg-green-100 text-green-800 border-green-200",
  sports: "bg-cyan-100 text-cyan-800 border-cyan-200",
}

export function FeaturedNotableFiguresSection() {
  const [featured, setFeatured] = useState<NotablePerson[]>(
    fallbackPersons.filter((p) => p.featured).slice(0, 2),
  )
  const headingRef = useRevealOnScroll<HTMLDivElement>()

  useEffect(() => {
    apiFetchByLabel("notable-figures")
      .then((posts) => {
        if (posts?.length) {
          const all = posts.map(cmsToNotablePerson)
          const cms = all.filter((p) => p.featured).slice(0, 2)
          if (cms.length) setFeatured(cms)
        }
      })
      .catch(() => {})
  }, [])

  if (featured.length === 0) return null

  return (
    <section className="relative z-10 bg-muted/40 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div ref={headingRef} className="reveal-on-scroll mb-10 text-center sm:mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary sm:text-sm">
            <BookOpen className="h-4 w-4" />
            Bocaue Wonders &middot; History
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Notable Figures of Bocaue
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
            Meet the remarkable people whose courage, artistry, and vision shaped
            Bocaue&apos;s identity through the centuries.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
          {featured.map((person, i) => (
            <Link key={person.id} href="/history" className="group">
              <Card
                className={`overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col reveal-on-scroll delay-${(i + 1) * 100}`}
              >
                {person.image && (
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs border ${categoryColor[person.category] ?? ""}`}
                      >
                        {personCategoryLabels[person.category]}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary/90 text-primary-foreground border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                        <Star className="h-2.5 w-2.5 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="text-xs text-muted-foreground mb-1">{person.years}</div>
                  <h3 className="text-lg font-black text-card-foreground group-hover:text-primary transition-colors">
                    {person.name}
                  </h3>
                  <p className="text-xs text-primary font-semibold mb-3">{person.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {person.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" /> Legacy
                    </p>
                    <p className="text-xs text-foreground leading-relaxed line-clamp-2">{person.legacy}</p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    Learn More About Bocaue&apos;s History
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex items-center justify-center reveal-on-scroll delay-300">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full gap-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Link href="/history">
              <Users className="h-4 w-4" />
              View All Notable Figures
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
