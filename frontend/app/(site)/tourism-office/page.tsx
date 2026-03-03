"use client"

import Link from "next/link"
import { asset } from "@/lib/utils"
import { ArrowLeft, Building2, Phone, Mail, Clock, MapPin, Users } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const staff = [
  { name: "Office of the Mayor", role: "Chief Executive", note: "oversees MHACTO direction" },
  { name: "Tourism Officer", role: "Department Head", note: "leads tourism planning & programs" },
  { name: "Heritage & Culture Division", role: "Documentation & Preservation", note: "archives, research, intangible heritage" },
  { name: "Arts & Events Division", role: "Programs & Events", note: "festivals, exhibits, cultural programs" },
  { name: "Tourism Promotions Division", role: "Marketing & Partnerships", note: "tour packages, accreditation, DOT liaison" },
  { name: "Administrative Division", role: "Administration & Records", note: "permits, coordination, records management" },
]

const programs = [
  {
    title: "Heritage Gallery & Archives",
    description: "Maintains the MHACTO Heritage Gallery in the Old Municipal Hall, housing historical photographs, artifacts, documents, and oral history recordings spanning Bocaue's entire history.",
    badge: "Ongoing",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
  },
  {
    title: "Living Cultural Heritage Bearer Program",
    description: "Identifies, recognizes, and supports master practitioners of Bocaue's endangered traditional arts — including weaving, woodcarving, and traditional performing arts.",
    badge: "Ongoing",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
  },
  {
    title: "Pagoda Festival Coordination",
    description: "Leads the annual coordination of the Bocaue Pagoda Festival in partnership with the Parish of St. Martin of Tours, the NCCA, and barangay governments.",
    badge: "Annual",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    title: "Heritage Tourism Package Development",
    description: "Designs and operates guided heritage tours, food trails, and festival immersion packages for individual visitors, school groups, and corporate tours.",
    badge: "Ongoing",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
  },
  {
    title: "Bocaue Tourism Master Plan 2025–2030",
    description: "Implements the strategic roadmap for Bocaue's tourism development, including the Bocaue River Esplanade Project, heritage marker installation, and digital heritage archiving.",
    badge: "2025–2030",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    title: "School Heritage Education Program",
    description: "Partners with public schools in Bocaue to deliver heritage and culture modules in classrooms, organize school visits to the Heritage Gallery, and support student arts competitions.",
    badge: "Annual",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
]

export default function TourismOfficePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <PageHero
        pageSlug="tourism-office"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackIcon="Building2"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Organization"
        fallbackTitle="Tourism Office"
        fallbackDescription="The Municipal History, Arts, Culture and Tourism Office (MHACTO) of Bocaue, Bulacan — your gateway to heritage tourism and cultural programming."
        showBackButton
      />

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl mb-4">About MHACTO</h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  The Municipal History, Arts, Culture and Tourism Office (MHACTO) is a department of the Bocaue Local Government Unit tasked with the preservation, promotion, and development of the municipality&apos;s historical, artistic, cultural, and tourism resources.
                </p>
                <p>
                  Established under the Local Government Code and reinforced by municipal ordinances, MHACTO serves as the primary body for coordinating cultural programs, managing heritage assets, developing tourism products, and connecting Bocaue to national agencies such as the Department of Tourism (DOT), the National Commission for Culture and the Arts (NCCA), and the National Historical Commission of the Philippines (NHCP).
                </p>
                <p>
                  MHACTO is committed to the principle that culture and tourism are powerful engines for both economic development and community well-being — and that the only sustainable tourism is tourism that preserves what makes Bocaue unique.
                </p>
              </div>
            </div>

            {/* Contact Card */}
            <Card className="h-fit border-primary/20 shadow-md">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-black text-foreground text-lg">Contact MHACTO</h3>
                {[
                  { icon: MapPin, text: "Bocaue Municipal Hall, Rizal Ave., Bocaue, Bulacan" },
                  { icon: Phone, text: "(044) 123-4567" },
                  { icon: Mail, text: "mhacto.bocaue@bocaue.gov.ph" },
                  { icon: Clock, text: "Mon–Fri: 8:00 AM – 5:00 PM" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Org Structure */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Organizational Structure</h2>
                <p className="text-muted-foreground">Key divisions and their responsibilities</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((s) => (
                <Card key={s.name} className="border-border hover:border-primary/30 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <p className="font-bold text-foreground text-sm">{s.name}</p>
                    <p className="text-xs text-primary font-semibold mt-0.5">{s.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Programs &amp; Initiatives</h2>
                <p className="text-muted-foreground">What MHACTO currently runs</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {programs.map((prog) => (
                <Card key={prog.title} className="border-border hover:border-primary/30 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-foreground">{prog.title}</h3>
                      <Badge variant="outline" className={`text-xs flex-shrink-0 ${prog.badgeColor}`}>
                        {prog.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{prog.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
