"use client"

import Link from "next/link"
import { Building2, Phone, Mail, Clock, MapPin, Users, Layers, Target, ArrowRight, CheckCircle } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
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
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  {
    title: "Living Cultural Heritage Bearer Program",
    description: "Identifies, recognizes, and supports master practitioners of Bocaue's endangered traditional arts — including weaving, woodcarving, and traditional performing arts.",
    badge: "Ongoing",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  {
    title: "Pagoda Festival Coordination",
    description: "Leads the annual coordination of the Bocaue Pagoda Festival in partnership with the Parish of St. Martin of Tours, the NCCA, and barangay governments.",
    badge: "Annual",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300",
  },
  {
    title: "Heritage Tourism Package Development",
    description: "Designs and operates guided heritage tours, food trails, and festival immersion packages for individual visitors, school groups, and corporate tours.",
    badge: "Ongoing",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  {
    title: "Bocaue Tourism Master Plan 2025–2030",
    description: "Implements the strategic roadmap for Bocaue's tourism development, including the Bocaue River Esplanade Project, heritage marker installation, and digital heritage archiving.",
    badge: "2025–2030",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  },
  {
    title: "School Heritage Education Program",
    description: "Partners with public schools in Bocaue to deliver heritage and culture modules in classrooms, organize school visits to the Heritage Gallery, and support student arts competitions.",
    badge: "Annual",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300",
  },
]

export default function TourismOfficePage() {
  return (
    <main className="min-h-screen bg-background">
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

      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-cyan-50/40 dark:to-cyan-950/10" />
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-100/40 blur-3xl dark:bg-cyan-900/10" />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16 items-start">

            {/* ── Left sidebar ── */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-primary/20">
                  <Building2 className="h-3 w-3" />
                  About MHACTO
                </span>
                <h2 className="mt-4 text-3xl font-black text-foreground md:text-4xl leading-tight">
                  Preserving<br />
                  <span className="text-primary">Bocaue&apos;s Legacy</span>
                </h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    The Municipal History, Arts, Culture and Tourism Office (MHACTO) is a department of the Bocaue Local Government Unit tasked with the preservation, promotion, and development of the municipality&apos;s historical, artistic, cultural, and tourism resources.
                  </p>
                  <p>
                    MHACTO is committed to the principle that culture and tourism are powerful engines for both economic development and community well-being — and that the only sustainable tourism is tourism that preserves what makes Bocaue unique.
                  </p>
                </div>
              </div>

              {/* Contact card */}
              <div className="rounded-3xl border border-border bg-card shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-cyan-500 px-6 py-4">
                  <h3 className="text-base font-black text-white">Contact MHACTO</h3>
                  <p className="text-xs text-white/80 mt-0.5">Reach us during office hours</p>
                </div>
                <div className="p-5 space-y-2">
                  {[
                    { icon: MapPin, text: "Bocaue Municipal Hall, Rizal Ave., Bocaue, Bulacan" },
                    { icon: Phone,  text: "(044) 123-4567" },
                    { icon: Mail,   text: "mhacto.bocaue@bocaue.gov.ph" },
                    { icon: Clock,  text: "Mon–Fri: 8:00 AM – 5:00 PM" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm text-foreground leading-snug pt-0.5">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission & Vision link */}
              <Link
                href="/mission-vision"
                className="group flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 transition-all hover:bg-primary/10 hover:border-primary/40"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">Mission &amp; Vision</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Our guiding principles</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* ── Right main ── */}
            <div className="lg:col-span-3 space-y-8">

              {/* Org Structure */}
              <div className="rounded-3xl border border-border bg-card shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-cyan-500 px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Organizational Structure</h2>
                      <p className="text-xs text-white/80">Key divisions and their responsibilities</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {staff.map((s, i) => (
                      <div
                        key={s.name}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug">{s.name}</p>
                          <p className="text-xs text-primary font-semibold mt-0.5">{s.role}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Programs */}
              <div className="rounded-3xl border border-border bg-card shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-primary px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                      <Layers className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Programs &amp; Initiatives</h2>
                      <p className="text-xs text-white/80">What MHACTO currently runs</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {programs.map((prog) => (
                      <div
                        key={prog.title}
                        className="flex flex-col rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                            <Target className="h-3.5 w-3.5" />
                          </div>
                          <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${prog.badgeColor}`}>
                            {prog.badge}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1.5">{prog.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{prog.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Inquiry CTA */}
                  <div className="mt-6 flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <CheckCircle className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">Planning a visit or partnership?</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Submit an inquiry and our team will get back to you within 1–2 business days.</p>
                    </div>
                    <Link
                      href="/inquire"
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                    >
                      Inquire
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
