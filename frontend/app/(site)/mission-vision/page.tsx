"use client"

import Image from "next/image"
import { asset } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Target, Eye, Heart } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Card, CardContent } from "@/components/ui/card"

const values = [
  {
    icon: Heart,
    title: "Heritage Preservation",
    description:
      "We protect and promote Bocaue's tangible and intangible cultural heritage — from its 400-year-old church to its living traditions of weaving, balagtasan, and the Pagoda Festival.",
  },
  {
    icon: Target,
    title: "Inclusive Tourism",
    description:
      "We develop tourism programs that benefit the whole community — ensuring that economic growth from tourism creates livelihoods for local artisans, food vendors, guides, and service providers.",
  },
  {
    icon: Eye,
    title: "Cultural Education",
    description:
      "We partner with schools, libraries, and youth organizations to cultivate pride in Bocaue's history and culture among the next generation of Bocaueños.",
  },
]

const objectives = [
  "Develop and manage heritage tourism programs that highlight Bocaue's historical and cultural assets.",
  "Document and preserve the municipality's tangible and intangible cultural heritage.",
  "Support local artisans, craftspeople, and culture bearers through recognition programs and market access.",
  "Promote Bocaue as a premier heritage tourism destination in Bulacan and Central Luzon.",
  "Foster community-based tourism through capacity building and livelihood programs.",
  "Coordinate with national agencies (NCCA, DOT, NHCP) for the protection of Bocaue's cultural properties.",
  "Organize and support cultural festivals, arts exhibitions, and civic heritage programs.",
  "Maintain and expand the MHACTO Heritage Gallery and community archives.",
]

export default function MissionVisionPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="mission-vision"
        fallbackImage="/images/places/river-festival.jpg"
        fallbackAccentColor="cyan-300"
        fallbackLabel="MHACTO Bocaue"
        fallbackTitle="Mission & Vision"
        fallbackDescription="Guiding principles of the Municipal History, Arts, Culture and Tourism Office of Bocaue, Bulacan."
        showBackButton
      />

      {/* Mission & Vision cards */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission */}
            <Card className="overflow-hidden border-primary/20 shadow-lg">
              <div className="h-2 bg-primary w-full" />
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground">Our Mission</h2>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  To document, preserve, and promote the history, arts, culture, and tourism of the Municipality of
                  Bocaue, Bulacan — fostering a deep sense of community identity and pride while developing
                  sustainable tourism programs that improve the quality of life of all Bocaueños.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="overflow-hidden border-secondary/30 shadow-lg">
              <div className="h-2 bg-secondary w-full" />
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                    <Eye className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground">Our Vision</h2>
                </div>
                <p className="text-foreground leading-relaxed text-base">
                  A Bocaue that is recognized as a premier cultural heritage destination in the Philippines —
                  where its rich past is celebrated, its living traditions are cherished, and its community is
                  empowered through arts, culture, and tourism.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Core Values</h2>
                <p className="text-muted-foreground">The principles that guide our work</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {values.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="border-border hover:border-primary/30 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Strategic Objectives</h2>
                <p className="text-muted-foreground">What MHACTO commits to deliver</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {objectives.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border"
                >
                  <span className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{obj}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
