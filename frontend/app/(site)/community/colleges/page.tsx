"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { asset } from "@/lib/utils"
import { ArrowLeft, GraduationCap, BookOpen, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { colleges as fallbackColleges, type College } from "@/lib/data/community-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToCollege } from "@/lib/cms-mappers"

const typeBadge: Record<College["type"], string> = {
  state: "bg-blue-100 text-blue-800 border-blue-200",
  private: "bg-purple-100 text-purple-800 border-purple-200",
  technical: "bg-green-100 text-green-800 border-green-200",
}
const typeLabels: Record<College["type"], string> = {
  state: "State University",
  private: "Private Institution",
  technical: "TVET / Technical",
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>(fallbackColleges)

  useEffect(() => {
    apiFetchByLabel("colleges")
      .then((posts) => {
        if (posts && posts.length > 0) {
          setColleges(posts.map(cmsToCollege))
        }
      })
      .catch(() => {})
  }, [])

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
              <GraduationCap className="h-8 w-8 text-blue-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-blue-300">Community</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-2xl">Colleges</h1>
            <p className="text-lg text-white/90 drop-shadow-lg max-w-2xl">
              Tertiary and technical-vocational institutions serving the residents of Bocaue, Bulacan.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Higher Education Institutions</h2>
              <p className="text-muted-foreground">Colleges and TVET centers accessible to Bocaue residents</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => (
              <Card key={college.id} className="border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className={`text-xs ${typeBadge[college.type]}`}>
                      {typeLabels[college.type]}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-2">{college.name}</h3>
                  {college.yearEstablished && (
                    <p className="text-xs text-muted-foreground mb-3">Est. {college.yearEstablished}</p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{college.description}</p>
                  <div className="space-y-3">
                    {college.enrollment && (
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {college.enrollment}
                      </div>
                    )}
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        <BookOpen className="inline h-3 w-3 mr-1" />Programs Offered
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {college.programs.map((p) => (
                          <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    {college.contact && (
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">{college.contact}</p>
                    )}
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
