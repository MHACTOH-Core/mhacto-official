"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { culturalPractices, type CulturalPractice } from "@/lib/data/culture-data"

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
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[380px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(/images/places/Arts.jpg)`,
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
              <Heart className="h-8 w-8 text-pink-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-pink-300">Culture</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
              Cultural Practices &amp; Traditions
            </h1>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              The living intangible heritage of Bocaue — practices passed down through generations that define the community&apos;s identity.
            </p>
          </div>
        </div>
      </section>

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
                <Card key={practice.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  {practice.image && (
                    <div className="relative h-44 overflow-hidden">
                      <Image src={practice.image} alt={practice.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
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
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{practice.description}</p>
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Cultural Significance</p>
                      <p className="text-sm text-foreground leading-relaxed">{practice.significance}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
