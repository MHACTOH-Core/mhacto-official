"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Activity, Phone, MapPin, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { hospitals as fallbackHospitals, type Hospital } from "@/lib/data/community-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToHospital } from "@/lib/cms-mappers"

const typeBadge: Record<Hospital["type"], string> = {
  government: "bg-blue-100 text-blue-800 border-blue-200",
  private: "bg-purple-100 text-purple-800 border-purple-200",
  "lying-in": "bg-pink-100 text-pink-800 border-pink-200",
  rhu: "bg-green-100 text-green-800 border-green-200",
}
const typeLabels: Record<Hospital["type"], string> = {
  government: "Government",
  private: "Private Hospital",
  "lying-in": "Lying-In / Birthing",
  rhu: "Rural Health Unit",
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>(fallbackHospitals)

  // Sends GET /api/posts/read.php?label=hospitals&status=published → PHP runs SQL SELECT → returns JSON
  useEffect(() => {
    apiFetchByLabel("hospitals")
      .then((posts) => {
        if (posts && posts.length > 0) {
          setHospitals(posts.map(cmsToHospital))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="hospitals"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackIcon="Activity"
        fallbackAccentColor="red-300"
        fallbackLabel="Community"
        fallbackTitle="Hospitals &amp; Health"
        fallbackDescription="Health facilities and medical services available to residents and visitors of Bocaue, Bulacan."
        showBackButton
      />

      {/* Emergency banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex items-center gap-3 justify-center">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-semibold">
            Emergency? Call <strong>911</strong> (national) or <strong>(044) 234-5679</strong> (Sacred Heart Hospital Emergency)
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Health Facilities</h2>
              <p className="text-muted-foreground">Hospitals, clinics, and health centers serving Bocaue</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className={`border-border hover:shadow-lg transition-all duration-300 flex flex-col ${hospital.emergency ? "hover:border-red-300" : "hover:border-primary/30"}`}>
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant="outline" className={`text-xs ${typeBadge[hospital.type]}`}>
                        {typeLabels[hospital.type]}
                      </Badge>
                      {hospital.emergency && (
                        <Badge className="text-xs bg-red-500 text-white border-0 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> 24H Emergency
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-foreground mb-2">{hospital.name}</h3>
                  {hospital.beds && (
                    <p className="text-xs text-muted-foreground mb-2">{hospital.beds}-bed capacity</p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{hospital.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {hospital.location}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <Phone className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {hospital.contact}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {hospital.hours}
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Services</p>
                    <div className="grid grid-cols-1 gap-1">
                      {hospital.services.slice(0, 6).map((s) => (
                        <div key={s} className="flex items-start gap-1.5 text-xs text-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </div>
                      ))}
                      {hospital.services.length > 6 && (
                        <p className="text-xs text-muted-foreground">+{hospital.services.length - 6} more services</p>
                      )}
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
