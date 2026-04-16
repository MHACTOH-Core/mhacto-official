"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GalleryImage } from "@/components/ui/gallery-image"
import { CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type CulturalPractice } from "@/lib/data/culture-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToCulturalPractice } from "@/lib/cms-mappers"

const categoryLabels: Record<CulturalPractice["category"], string> = {
  religion: "Religious",
  community: "Community",
  lifecycle: "Life Cycle",
  crafts: "Crafts & Livelihood",
  "performing-arts": "Performing Arts",
}

const categoryColor: Record<CulturalPractice["category"], string> = {
  religion: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  community: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
  lifecycle: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300",
  crafts: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300",
  "performing-arts": "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
}

const statusConfig: Record<CulturalPractice["status"], { label: string; icon: typeof CheckCircle; className: string }> = {
  active: { label: "Active", icon: CheckCircle, className: "text-green-600" },
  endangered: { label: "Endangered", icon: AlertTriangle, className: "text-red-500" },
  revived: { label: "Revived", icon: RefreshCw, className: "text-blue-500" },
}

export default function PracticesTraditionsPage() {
  const [culturalPractices, setCulturalPractices] = useState<CulturalPractice[]>([])

  useEffect(() => {
    apiFetchByLabel("cultural-practices")
      .then((posts) => { if (posts?.length) setCulturalPractices(posts.map(cmsToCulturalPractice)) })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="practices-traditions"
        fallbackImage="/images/defaults/no-image.svg"
        fallbackIcon="Heart"
        fallbackAccentColor="pink-300"
        fallbackLabel="Culture"
        fallbackTitle="Cultural Practices & Traditions"
        fallbackDescription="The living intangible heritage of Bocaue — practices passed down through generations that define the community's identity."
        showBackButton
      />

      {/* Status legend */}
      <section className="border-b border-border bg-muted/40 py-5">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-wrap gap-4 justify-center">
          {Object.entries(statusConfig).map(([key, { label, icon: Icon, className }]) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${className}`} />
              <span className="text-sm text-foreground font-medium">{label}</span>
            </div>
          ))}
          <span className="text-xs text-muted-foreground self-center">— Heritage status per MHACTO assessment</span>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {culturalPractices.map((practice) => {
              const status = statusConfig[practice.status]
              const StatusIcon = status.icon
              return (
                <Link key={practice.id} id={`item-${practice.id}`} href={`/culture/practices-traditions/${practice.id}`} className="block">
                <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  {practice.image && (
                    <GalleryImage
                      src={practice.image}
                      gallery={practice.gallery}
                      alt={practice.name}
                      className="relative h-36 overflow-hidden"
                      imageClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </GalleryImage>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="outline" className={`text-xs ${categoryColor[practice.category]}`}>
                        {categoryLabels[practice.category]}
                      </Badge>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${status.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-2">{practice.name}</h3>
                    {practice.author && <p className="text-xs text-muted-foreground/70 mb-1">By {practice.author}</p>}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{practice.description}</p>
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Cultural Significance</p>
                      <p className="text-sm text-foreground leading-relaxed">{practice.significance}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Read full detail →
                      </span>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
