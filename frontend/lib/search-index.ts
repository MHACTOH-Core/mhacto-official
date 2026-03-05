import { localCuisine, festivals, culturalPractices, artisans, peopleWonders, localBusinesses } from "@/lib/data/culture-data"
import { timelineEvents, notablePersons } from "@/lib/data/history-data"
import { heritageSites, museums, religiousSites, tourPackages } from "@/lib/data/destinations-data"
import { allSchools, hospitals } from "@/lib/data/community-data"
import { newsArticles } from "@/lib/data/news-data"

export interface SearchResult {
  id: string
  title: string
  subtitle: string
  href: string
  category: string
  keywords: string // concatenated searchable text
}

// ── Build the flat index ─────────────────────────────────────────────
export const searchIndex: SearchResult[] = [

  // ── Pages / Sections ───────────────────────────────────────────────
  { id: "page-home",           title: "Home",                  subtitle: "MHACTO Bocaue homepage",               href: "/",                              category: "Page", keywords: "home mhacto bocaue" },
  { id: "page-history",        title: "History",               subtitle: "Bocaue history overview",              href: "/history",                       category: "Page", keywords: "history bocaue overview" },
  { id: "page-culture",        title: "Arts & Culture",        subtitle: "Culture overview page",                href: "/culture",                       category: "Page", keywords: "arts culture bocaue" },
  { id: "page-destinations",   title: "Tourist Destinations",  subtitle: "Places to visit in Bocaue",           href: "/destinations",                  category: "Page", keywords: "destinations tourist places visit" },
  { id: "page-travel",         title: "Travel & Tours",        subtitle: "Tour packages in Bocaue",             href: "/travel-tours",                  category: "Page", keywords: "travel tours packages" },
  { id: "page-schools",        title: "Schools",               subtitle: "Schools in Bocaue",                   href: "/community/schools",             category: "Page", keywords: "schools education community" },
  { id: "page-hospitals",      title: "Hospitals",             subtitle: "Hospitals & clinics in Bocaue",       href: "/community/hospitals",           category: "Page", keywords: "hospitals clinics health community" },
  { id: "page-arts-livelihood",title: "Arts & Livelihood",     subtitle: "Arts and livelihood programs",        href: "/arts-livelihood",               category: "Page", keywords: "arts livelihood programs" },
  { id: "page-local-business", title: "Local Business",        subtitle: "Businesses in Bocaue",                href: "/arts-livelihood/local-business", category: "Page", keywords: "local business commerce" },
  { id: "page-events",         title: "Events",                subtitle: "Upcoming and past events",            href: "/events",                        category: "Page", keywords: "events calendar" },
  { id: "page-news",           title: "News",                  subtitle: "Latest news from Bocaue",             href: "/news",                          category: "Page", keywords: "news updates latest" },
  { id: "page-tourism-office", title: "About MHACTO",          subtitle: "Tourism office overview",             href: "/tourism-office",                category: "Page", keywords: "mhacto tourism office about" },
  { id: "page-mission-vision", title: "Mission & Vision",      subtitle: "MHACTO mission and vision",           href: "/mission-vision",                category: "Page", keywords: "mission vision goals" },
  { id: "page-inquire",        title: "Inquiry",               subtitle: "Contact & inquiries",                 href: "/inquire",                       category: "Page", keywords: "inquiry contact us" },
  { id: "page-cuisine",        title: "Local Cuisine",         subtitle: "Food & delicacies of Bocaue",         href: "/culture/local-cuisine",         category: "Page", keywords: "cuisine food delicacies local" },
  { id: "page-festivals",      title: "Festivals & Celebrations", subtitle: "Cultural festivals of Bocaue",     href: "/culture/festivals-celebrations",category: "Page", keywords: "festivals celebrations pagoda fiestas" },
  { id: "page-practices",      title: "Cultural Practices",    subtitle: "Traditions and customs",              href: "/culture/practices-traditions",  category: "Page", keywords: "cultural practices traditions customs" },
  { id: "page-crafts",         title: "Crafts & Artisan",      subtitle: "Handcrafts and artisans",             href: "/culture/crafts-artisan",        category: "Page", keywords: "crafts artisan handmade weaving pottery" },
  { id: "page-people-wonders", title: "People Wonders",        subtitle: "Notable living Bocaueños",            href: "/culture/people-wonders",        category: "Page", keywords: "people wonders notable living bocauenos" },
  { id: "page-timeline",       title: "Timeline of Events",    subtitle: "Historical timeline of Bocaue",       href: "/history/timeline",              category: "Page", keywords: "timeline events history" },
  { id: "page-notable",        title: "Notable Persons",       subtitle: "Historical figures of Bocaue",        href: "/history/notable-persons",       category: "Page", keywords: "notable persons figures historical" },

  // ── Local Cuisine ──────────────────────────────────────────────────
  ...localCuisine.map((c) => ({
    id: `cuisine-${c.id}`,
    title: c.name,
    subtitle: c.description.slice(0, 80) + "…",
    href: "/culture/local-cuisine",
    category: "Cuisine",
    keywords: `${c.name} ${c.tagalogName ?? ""} ${c.type} ${c.description} ${c.where.join(" ")}`.toLowerCase(),
  })),

  // ── Festivals ──────────────────────────────────────────────────────
  ...festivals.map((f) => ({
    id: `festival-${f.id}`,
    title: f.name,
    subtitle: f.date,
    href: "/culture/festivals-celebrations",
    category: "Festival",
    keywords: `${f.name} ${f.type} ${f.description} ${f.highlights.join(" ")}`.toLowerCase(),
  })),

  // ── Cultural Practices ─────────────────────────────────────────────
  ...culturalPractices.map((p) => ({
    id: `practice-${p.id}`,
    title: p.name,
    subtitle: p.category.replace("-", " "),
    href: "/culture/practices-traditions",
    category: "Cultural Practice",
    keywords: `${p.name} ${p.category} ${p.description} ${p.significance}`.toLowerCase(),
  })),

  // ── Artisans ───────────────────────────────────────────────────────
  ...artisans.map((a) => ({
    id: `artisan-${a.id}`,
    title: a.name,
    subtitle: `${a.craft} · ${a.experience}`,
    href: "/culture/crafts-artisan",
    category: "Artisan",
    keywords: `${a.name} ${a.craft} ${a.description} ${a.products.join(" ")} ${a.location}`.toLowerCase(),
  })),

  // ── People Wonders ─────────────────────────────────────────────────
  ...peopleWonders.map((p) => ({
    id: `people-${p.id}`,
    title: p.name,
    subtitle: p.title,
    href: "/culture/people-wonders",
    category: "People Wonder",
    keywords: `${p.name} ${p.title} ${p.category} ${p.achievement} ${p.description}`.toLowerCase(),
  })),

  // ── Local Businesses ───────────────────────────────────────────────
  ...localBusinesses.map((b) => ({
    id: `business-${b.id}`,
    title: b.name,
    subtitle: b.location,
    href: "/arts-livelihood/local-business",
    category: "Local Business",
    keywords: `${b.name} ${b.type} ${b.description} ${b.products.join(" ")} ${b.location}`.toLowerCase(),
  })),

  // ── History Timeline ───────────────────────────────────────────────
  ...timelineEvents.map((e) => ({
    id: `timeline-${e.year.replace(/\s/g, "")}`,
    title: e.title,
    subtitle: `${e.year} · ${e.era}`,
    href: "/history/timeline",
    category: "History",
    keywords: `${e.year} ${e.era} ${e.title} ${e.description} ${e.details}`.toLowerCase(),
  })),

  // ── Notable Persons (Historical) ───────────────────────────────────
  ...notablePersons.map((p) => ({
    id: `notable-${p.id}`,
    title: p.name,
    subtitle: `${p.years} · ${p.title}`,
    href: "/history/notable-persons",
    category: "Notable Person",
    keywords: `${p.name} ${p.title} ${p.category} ${p.description} ${p.legacy}`.toLowerCase(),
  })),

  // ── Heritage Sites ─────────────────────────────────────────────────
  ...heritageSites.map((s) => ({
    id: `heritage-${s.id}`,
    title: s.name,
    subtitle: `${s.category} · Est. ${s.established}`,
    href: "/destinations",
    category: "Heritage Site",
    keywords: `${s.name} ${s.category} ${s.description} ${s.location}`.toLowerCase(),
  })),

  // ── Museums ────────────────────────────────────────────────────────
  ...museums.map((m) => ({
    id: `museum-${m.id}`,
    title: m.name,
    subtitle: m.location,
    href: "/destinations",
    category: "Museum",
    keywords: `${m.name} ${m.description} ${m.location}`.toLowerCase(),
  })),

  // ── Religious Sites ────────────────────────────────────────────────
  ...religiousSites.map((r) => ({
    id: `religious-${r.id}`,
    title: r.name,
    subtitle: r.location,
    href: "/destinations",
    category: "Religious Site",
    keywords: `${r.name} ${r.description} ${r.location}`.toLowerCase(),
  })),

  // ── Tour Packages ──────────────────────────────────────────────────
  ...tourPackages.map((t) => ({
    id: `tour-${t.id}`,
    title: t.name,
    subtitle: t.duration,
    href: "/travel-tours",
    category: "Tour Package",
    keywords: `${t.name} ${t.description} ${t.duration} ${t.highlights?.join(" ") ?? ""}`.toLowerCase(),
  })),

  // ── Schools ────────────────────────────────────────────────────────
  ...allSchools.map((s) => ({
    id: `school-${s.id}`,
    title: s.name,
    subtitle: `${s.level.replace("-", " ")} · ${s.barangay}`,
    href: "/community/schools",
    category: "School",
    keywords: `${s.name} ${s.level} ${s.barangay} ${s.description} ${s.programs.join(" ")}`.toLowerCase(),
  })),

  // ── Hospitals ──────────────────────────────────────────────────────
  ...hospitals.map((h) => ({
    id: `hospital-${h.id}`,
    title: h.name,
    subtitle: h.location,
    href: "/community/hospitals",
    category: "Hospital",
    keywords: `${h.name} ${h.description} ${h.location} ${h.services?.join(" ") ?? ""}`.toLowerCase(),
  })),

  // ── News ───────────────────────────────────────────────────────────
  ...newsArticles.map((n) => ({
    id: `news-${n.id}`,
    title: n.title,
    subtitle: `${n.date} · ${n.category}`,
    href: "/news",
    category: "News",
    keywords: `${n.title} ${n.summary} ${n.category} ${n.places.join(" ")}`.toLowerCase(),
  })),
]

// ── Search function ──────────────────────────────────────────────────
export function searchContent(query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()
  const tokens = q.split(/\s+/)

  const scored = searchIndex
    .map((item) => {
      const titleLower = item.title.toLowerCase()
      const subtitleLower = item.subtitle.toLowerCase()
      let score = 0

      for (const token of tokens) {
        if (titleLower.startsWith(token)) score += 10
        else if (titleLower.includes(token)) score += 6
        else if (subtitleLower.includes(token)) score += 4
        else if (item.keywords.includes(token)) score += 2
        else score -= 5 // token not found at all
      }

      return { item, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ item }) => item)

  return scored
}

// ── Category icon helper (string name to pass to front-end) ─────────
export const categoryIconMap: Record<string, string> = {
  Page: "FileText",
  Cuisine: "Utensils",
  Festival: "Sparkles",
  "Cultural Practice": "Flame",
  Artisan: "Hammer",
  "People Wonder": "Users",
  "Local Business": "ShoppingBag",
  History: "Clock",
  "Notable Person": "UserCheck",
  "Heritage Site": "Landmark",
  Museum: "Building2",
  "Religious Site": "Church",
  "Tour Package": "MapPin",
  School: "GraduationCap",
  Hospital: "Cross",
  News: "Newspaper",
}
