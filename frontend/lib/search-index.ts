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
  { id: "page-history",        title: "History Wonders",               subtitle: "Bocaue history overview",              href: "/history",                       category: "Page", keywords: "history bocaue overview wonders" },
  { id: "page-culture",        title: "Arts & Culture Wonders",        subtitle: "Culture overview page",                href: "/culture",                       category: "Page", keywords: "arts culture bocaue wonders" },
  { id: "page-destinations",   title: "Tourist Wonders",       subtitle: "Places to visit in Bocaue",           href: "/destinations",                  category: "Page", keywords: "destinations tourist wonders places visit" },
  { id: "page-travel",         title: "Travel & Tours",        subtitle: "Tour packages in Bocaue",             href: "/travel-tours",                  category: "Page", keywords: "travel tours packages" },
  { id: "page-schools",        title: "Schools",               subtitle: "Schools in Bocaue",                   href: "/community/schools",             category: "Page", keywords: "schools education community" },
  { id: "page-hospitals",      title: "Hospitals",             subtitle: "Hospitals & clinics in Bocaue",       href: "/community/hospitals",           category: "Page", keywords: "hospitals clinics health community" },
  { id: "page-local-business", title: "Local Businesses",      subtitle: "Businesses in Bocaue",                href: "/community/local-business",      category: "Page", keywords: "local business commerce" },
  { id: "page-events",         title: "Events",                subtitle: "Upcoming and past events",            href: "/events",                        category: "Page", keywords: "events calendar" },
  { id: "page-news",           title: "News",                  subtitle: "Latest news from Bocaue",             href: "/news",                          category: "Page", keywords: "news updates latest" },
  { id: "page-tourism-office", title: "About MHACTO",          subtitle: "Tourism office overview",             href: "/tourism-office",                category: "Page", keywords: "mhacto tourism office about" },
  { id: "page-mission-vision", title: "Mission & Vision",      subtitle: "MHACTO mission and vision",           href: "/mission-vision",                category: "Page", keywords: "mission vision goals" },
  { id: "page-inquire",        title: "Inquiry",               subtitle: "Contact & inquiries",                 href: "/inquire",                       category: "Page", keywords: "inquiry contact us" },
  { id: "page-cuisine",        title: "Culinary Wonders",     subtitle: "Food & delicacies of Bocaue",         href: "/culture/culinary-wonders",         category: "Page", keywords: "cuisine food delicacies local culinary wonders" },
  { id: "page-festivals",      title: "Festivals & Celebrations", subtitle: "Cultural festivals of Bocaue",     href: "/culture/festivals-celebrations",category: "Page", keywords: "festivals celebrations pagoda fiestas" },
  { id: "page-pagoda",         title: "Pagoda Festival",       subtitle: "The iconic river procession of Bocaue", href: "/pagoda",                     category: "Page", keywords: "pagoda festival river procession holy cross wawa" },
  { id: "page-practices",      title: "Cultural Practices",    subtitle: "Traditions and customs",              href: "/culture/practices-traditions",  category: "Page", keywords: "cultural practices traditions customs" },
  { id: "page-crafts",         title: "Art Wonders",           subtitle: "Handcrafts and artisans",             href: "/culture/art-wonders",          category: "Page", keywords: "crafts artisan handmade weaving pottery art wonders" },
  { id: "page-people-wonders", title: "People Wonders",        subtitle: "Notable living Bocaueños",            href: "/culture/people-wonders",        category: "Page", keywords: "people wonders notable living bocauenos" },
  { id: "page-timeline",       title: "Timeline of Events",    subtitle: "Historical timeline of Bocaue",       href: "/history/timeline",              category: "Page", keywords: "timeline events history" },
  { id: "page-notable",        title: "Remarkable Persons",    subtitle: "Historical figures of Bocaue",        href: "/history/remarkable-persons",    category: "Page", keywords: "notable remarkable persons figures historical" },

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
