"use client"

import Link from "next/link"
import { asset } from "@/lib/utils"
import { ArrowLeft, School, Users, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { publicSchools, type PublicSchool } from "@/lib/data/community-data"

const levelLabels: Record<PublicSchool["level"], string> = {
  elementary: "Elementary School",
  "junior-high": "Junior High School",
  "senior-high": "Senior High School",
  integrated: "Integrated School (JHS & SHS)",
}
const levelColor: Record<PublicSchool["level"], string> = {
  elementary: "bg-green-100 text-green-800 border-green-200",
  "junior-high": "bg-blue-100 text-blue-800 border-blue-200",
  "senior-high": "bg-purple-100 text-purple-800 border-purple-200",
  integrated: "bg-amber-100 text-amber-800 border-amber-200",
}

export default function PublicSchoolsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[280px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${asset('/images/places/Arts.jpg')})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 flex flex-col justify-center py-12 sm:py-16 md:py-20">
          <Link href="/" className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <School className="h-8 w-8 text-green-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-green-300">Community</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-2xl">Public Schools</h1>
            <p className="text-lg text-white/90 drop-shadow-lg max-w-2xl">
              DepEd-accredited public elementary and secondary schools serving the communities of Bocaue, Bulacan.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <School className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Public Schools in Bocaue</h2>
              <p className="text-muted-foreground">DepEd Bulacan — Division of Bocaue schools</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {publicSchools.map((school) => (
              <Card key={school.id} className="border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <School className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className={`text-xs mt-1 ${levelColor[school.level]}`}>
                      {levelLabels[school.level]}
                    </Badge>
                  </div>
                  <h3 className="text-base font-black text-foreground mb-1">{school.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">Barangay {school.barangay}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{school.description}</p>
                  <div className="space-y-3">
                    {school.enrollmentRange && (
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {school.enrollmentRange}
                      </div>
                    )}
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        <BookOpen className="inline h-3 w-3 mr-1" />Programs
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {school.programs.map((p) => (
                          <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            {p}
                          </span>
                        ))}
                      </div>
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
