"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Landmark, MapPin, Clock, BookOpen, ChevronDown, ChevronUp,
  ArrowRight, Star, Shield, Calendar,
} from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { timelineEvents as fallbackTimeline, notablePersons as fallbackPersons, type TimelineEvent, type NotablePerson } from "@/lib/data/history-data"
import { apiFetchByLabel } from "@/lib/api"
import { cmsToTimelineEvent, cmsToNotablePerson } from "@/lib/cms-mappers"
import { asset } from "@/lib/utils"

// ── Static Heritage Sites ─────────────────────────────────────────────
const heritageSites = [
  {
    id: "st-martin-church",
    name: "St. Martin of Tours Parish Church",
    period: "1609 – Present",
    category: "Religious Heritage",
    significance: "major",
    description: "One of Bulacan's oldest Baroque stone churches, originally established by Augustinian missionaries in 1609. The present stone structure dates from the mid-1800s and features a twin bell-tower façade with hand-carved retablos inside.",
    details: "The church survived the Philippine Revolution, Japanese occupation, and multiple earthquakes, making it one of the most resilient structures in the province. Its massive stone walls, circa-1850 carved altarpiece, and colonial-era religious paraphernalia are protected as national cultural heritage under the NHCP.",
    image: asset("/images/places/Church.jpg"),
    location: "Bocaue Town Center, near the river",
    visitHours: "Daily · 6:00 AM – 7:00 PM",
    heritage: "NHCP National Cultural Treasure",
    tags: ["Baroque", "Church", "Colonial", "Religious"],
  },
  {
    id: "bocaue-river",
    name: "Bocaue River & Pagoda Route",
    period: "c. 900 – Present",
    category: "Natural & Cultural Heritage",
    significance: "major",
    description: "The life-giving river that gave Bocaue its name. The site of the miraculous cross discovery in the 18th century and the route of the annual Pagoda Festival fluvial procession. The river waterfront is a living heritage landscape.",
    details: "Pre-colonial Tagalog communities built their first settlements along this river, drawn by its abundant fish and fertile banks. For over 230 years, the Pagoda Festival fluvial procession has moved along this sacred waterway, making it inseparable from Bocaue's collective memory and spiritual life.",
    image: asset("/images/places/river-festival.jpg"),
    location: "Bocaue River, beside the town church",
    visitHours: "Public waterfront open daily",
    heritage: "NCCA Recognized Cultural Tradition",
    tags: ["River", "Festival", "Natural", "UNESCO Potential"],
  },
  {
    id: "jose-corazon-plaza",
    name: "José Corazón de Jesús Town Plaza",
    period: "Spanish Colonial – Present",
    category: "Civic Heritage",
    significance: "notable",
    description: "The historic town plaza named in honor of Bocaue's most celebrated poet, 'Huseng Batute' (José Corazón de Jesús). The plaza has been the center of civic life for centuries.",
    details: "Originally a colonial-era gathering place beside the parish church, the plaza has witnessed patriotic proclamations, civic parades, Christmas celebrations, and festival gatherings. The poet Jose Corazon de Jesus — born in Bocaue in 1896 — is immortalized in a marker here. The plaza remains a living public space used for community events, markets, and cultural performances.",
    image: asset("/images/places/Arts.jpg"),
    location: "Bocaue Town Center, fronting the church",
    visitHours: "Open daily",
    heritage: "Municipal Heritage Site",
    tags: ["Plaza", "Civic", "Poetry", "Community"],
  },
  {
    id: "philippine-arena",
    name: "Philippine Arena",
    period: "2014 – Present",
    category: "Modern Wonder",
    significance: "major",
    description: "The world's largest indoor arena, with a seating capacity of 55,000. Located in Ciudad de Victoria, Bocaue, the Philippine Arena earned a Guinness World Record on its inaugural day in 2014 and put Bocaue on the global map.",
    details: "Designed by the world-renowned architectural firm Populous and built by the Iglesia ni Cristo to commemorate their centennial year, the Philippine Arena is a feat of modern engineering. Its cable-supported roof spans 170,000 square meters. The building is part of the 750-hectare Ciudad de Victoria integrated complex, which also includes a stadium, hotel, mall, and medical city.",
    image: asset("/images/places/philippine-arena.jpg"),
    location: "Ciudad de Victoria, Bocaue, Bulacan",
    visitHours: "Event-based; tours available",
    heritage: "Guinness World Record Holder",
    tags: ["Arena", "Guinness Record", "Modern", "Architecture"],
  },
  {
    id: "old-bocaue-cemetery",
    name: "Old Bocaue Municipal Cemetery",
    period: "Spanish Colonial – Present",
    category: "Historical Heritage",
    significance: "notable",
    description: "A colonial-era cemetery containing the graves of Bocaue's notable historical figures, revolutionaries, and civic leaders. The cemetery features Spanish-era mausoleums and ornate funerary art.",
    details: "Many of the graves in this cemetery date back to the 1800s, and several historical figures — including local heroes of the Philippine Revolution — are interred here. The cemetery's old sections feature distinctive Baroque funerary chapels, ornate iron railings, and marble markers inscribed in Spanish. The NHCP has identified several structures within the cemetery as having heritage value.",
    image: asset("/images/places/oldtownbocaue.jpg"),
    location: "Bocaue Town Center",
    visitHours: "Daily · 6:00 AM – 6:00 PM",
    heritage: "Pending NHCP Documentation",
    tags: ["Cemetery", "Colonial", "Monuments"],
  },
  {
    id: "fireworks-industry-zone",
    name: "Bocaue Fireworks Heritage Zone",
    period: "Spanish Colonial – Present",
    category: "Industrial & Cultural Heritage",
    significance: "cultural",
    description: "The designated zone where Bocaue's centuries-old fireworks industry continues its craft. A living museum of Filipino pyrotechnics tradition, Bocaue has been the 'Fireworks Capital of the Philippines' for generations.",
    details: "Families in Bocaue have been crafting fireworks for over 200 years, a tradition traceable to Chinese merchant settlers during the colonial period. The industry today operates under strict safety regulations while maintaining its cultural identity. Artisan workshops in the heritage zone create elaborate displays for major Philippine festivals and civic events. The New Year's fireworks created by Bocaue craftsmen light up cities across the country.",
    image: asset("/images/places/fireworks.jpg"),
    location: "Bocaue Fireworks Zone, Bulacan",
    visitHours: "Guided tours available; contact MHACTO",
    heritage: "Living Industrial Heritage",
    tags: ["Fireworks", "Industry", "Tradition", "Crafts"],
  },
]

const significanceBadge: Record<string, string> = {
  major: "bg-red-100 text-red-800 border-red-200",
  notable: "bg-blue-100 text-blue-800 border-blue-200",
  cultural: "bg-amber-100 text-amber-800 border-amber-200",
}

const categoryColor: Record<string, string> = {
  "Religious Heritage": "bg-amber-100 text-amber-800",
  "Natural & Cultural Heritage": "bg-green-100 text-green-800",
  "Civic Heritage": "bg-blue-100 text-blue-800",
  "Modern Wonder": "bg-purple-100 text-purple-800",
  "Historical Heritage": "bg-stone-100 text-stone-800",
  "Industrial & Cultural Heritage": "bg-red-100 text-red-800",
}

function SiteCard({ site }: { site: typeof heritageSites[0] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col">
      {site.image && (
        <div className="relative h-56 overflow-hidden">
          <Image src={site.image} alt={site.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <Badge variant="outline" className={`text-xs backdrop-blur-sm border-0 ${categoryColor[site.category] ?? "bg-muted"}`}>
              {site.category}
            </Badge>
            <Badge variant="outline" className={`text-xs backdrop-blur-sm ${significanceBadge[site.significance]}`}>
              {site.significance === "major" ? "★ Major" : site.significance === "cultural" ? "♦ Cultural" : "Notable"}
            </Badge>
          </div>
        </div>
      )}
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-2 mb-1">
          <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">{site.period}</span>
        </div>
        <h3 className="text-lg font-black text-foreground mb-2 group-hover:text-primary transition-colors">{site.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{site.description}</p>

        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-start gap-2 text-xs text-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{site.location}
          </div>
          <div className="flex items-start gap-2 text-xs text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{site.visitHours}
          </div>
          <div className="flex items-start gap-2 text-xs">
            <Shield className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-amber-700 dark:text-amber-400 font-semibold">{site.heritage}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {site.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">{tag}</span>
            ))}
          </div>
        </div>

        <button onClick={() => setExpanded(v => !v)} className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          {expanded ? <><ChevronUp className="h-3 w-3" /> Less detail</> : <><ChevronDown className="h-3 w-3" /> Full details</>}
        </button>
        {expanded && (
          <div className="mt-3 rounded-xl bg-muted/40 border border-border p-4">
            <p className="text-sm text-foreground leading-relaxed">{site.details}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function HistoricalWondersPage() {
  const [notablePersons, setNotablePersons] = useState<NotablePerson[]>(fallbackPersons)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  useEffect(() => {
    apiFetchByLabel("notable-figures")
      .then((posts) => { if (posts?.length) setNotablePersons(posts.map(cmsToNotablePerson)) })
      .catch(() => {})
  }, [])

  const categories = ["all", ...Array.from(new Set(heritageSites.map((s) => s.category)))]
  const filteredSites = activeCategory === "all" ? heritageSites : heritageSites.filter(s => s.category === activeCategory)

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        pageSlug="historical-wonders"
        fallbackImage="/images/places/Church.jpg"
        fallbackIcon="Landmark"
        fallbackAccentColor="amber-300"
        fallbackLabel="Heritage of Bocaue"
        fallbackTitle="Historical Wonders"
        fallbackDescription="Discover the historical landmarks, sacred sites, and enduring monuments that define Bocaue's remarkable heritage spanning over four centuries."
        showBackButton
      />

      {/* Stats */}
      <section className="border-b border-border bg-primary/5 py-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
            {[
              { value: `${heritageSites.length}`, label: "Heritage Sites" },
              { value: "400+", label: "Years of History" },
              { value: "2", label: "National Treasures" },
              { value: "1", label: "Guinness Record Site" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center sm:items-start">
                <span className="text-2xl font-black text-primary">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="border-b border-border bg-muted/40 py-3 sticky top-0 z-30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="text-xs"
              >
                {cat === "all" ? "All Sites" : cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage Sites Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Landmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {activeCategory === "all" ? "Heritage Sites & Landmarks" : activeCategory}
              </h2>
              <p className="text-muted-foreground text-sm">{filteredSites.length} site{filteredSites.length !== 1 ? "s" : ""} found</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map((site) => <SiteCard key={site.id} site={site} />)}
          </div>
        </div>
      </section>

      {/* Notable Historical Figures */}
      <section className="py-12 sm:py-16 border-t border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">Historical Figures</h2>
              <p className="text-muted-foreground text-sm">Bocaueños who shaped history</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notablePersons.slice(0, 6).map((person) => (
              <Card key={person.id} className="group border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">{person.name}</h3>
                      <p className="text-xs text-primary font-semibold">{person.title}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{person.years}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{person.description}</p>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Legacy</p>
                    <p className="text-xs text-foreground leading-relaxed line-clamp-3">{person.legacy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/history">See All Historical Figures <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-primary/5 border-t border-primary/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-foreground">Explore Bocaue&apos;s full history</h3>
            <p className="text-sm text-muted-foreground mt-1">Dive into the timeline of events that shaped this remarkable town.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/history/roadmap" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Clock className="h-4 w-4" /> Historical Roadmap
            </Link>
            <Link href="/inquire" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors">
              Plan a Heritage Visit
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
