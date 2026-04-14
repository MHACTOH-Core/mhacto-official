export interface SearchResult {
  id: string
  title: string
  subtitle: string
  href: string
  category: string
  keywords: string // concatenated searchable text
}

// ── Label → route prefix mapping ────────────────────────────────────
// `hasDetail: true` means a /[id] detail page exists; false = list-only page
const labelRouteMap: Record<string, { prefix: string; category: string; hasDetail: boolean }> = {
  "destinations":        { prefix: "/destinations",                category: "Heritage Site",      hasDetail: true },
  "travel-tours":        { prefix: "/travel-tours",                category: "Tour Package",       hasDetail: false },
  "local-cuisine":       { prefix: "/culture/culinary-wonders",    category: "Cuisine",            hasDetail: false },
  "festivals":           { prefix: "/culture/festivals-celebrations", category: "Festival",        hasDetail: false },
  "cultural-practices":  { prefix: "/culture/practices-traditions",   category: "Cultural Practice", hasDetail: false },
  "crafts-artisan":      { prefix: "/culture/art-wonders",         category: "Artisan",            hasDetail: false },
  "people-wonders":      { prefix: "/culture/people-wonders",      category: "People Wonder",      hasDetail: false },
  "restaurants":         { prefix: "/culture/culinary-wonders",    category: "Cuisine",            hasDetail: false },
  "timeline-of-events":  { prefix: "/history/timeline",            category: "History",            hasDetail: false },
  "notable-figures":     { prefix: "/history/remarkable-persons",  category: "Notable Person",     hasDetail: false },
  "schools":             { prefix: "/community/schools",           category: "School",             hasDetail: false },
  "hospitals":           { prefix: "/community/hospitals",         category: "Hospital",           hasDetail: false },
  "barangay":            { prefix: "/community/barangays",         category: "Barangay",           hasDetail: false },
  "local-business":      { prefix: "/community/local-business",    category: "Local Business",     hasDetail: false },
  "pagoda":              { prefix: "/pagoda",                      category: "Festival",           hasDetail: false },
  "news":                { prefix: "/news",                        category: "News",               hasDetail: true },
  "events":              { prefix: "/events",                      category: "Festival",           hasDetail: true },
}

/** Convert a CMSPost from the API to a SearchResult the overlay can render. */
export function mapCMSPostToSearchResult(post: {
  id: string
  title: string
  body?: string
  label?: string
  postType?: string
}): SearchResult {
  const label = post.label ?? "destinations"
  const mapping = labelRouteMap[label]

  // Build detail href — label mapping takes priority over postType;
  // for list-only pages, append #item-{id} so the browser scrolls to the card
  let href: string
  if (mapping && !mapping.hasDetail)  href = `${mapping.prefix}#item-${post.id}`
  else if (mapping?.hasDetail)        href = `${mapping.prefix}/${post.id}`
  else if (post.postType === "news")  href = `/news/${post.id}`
  else if (post.postType === "event") href = `/events/${post.id}`
  else                                href = `/places#item-${post.id}`

  const category = mapping?.category ?? "Page"
  const subtitle = post.body
    ? post.body.length > 80 ? post.body.slice(0, 80) + "…" : post.body
    : ""

  return {
    id: `cms-${post.id}`,
    title: post.title,
    subtitle,
    href,
    category,
    keywords: `${post.title} ${post.body ?? ""}`.toLowerCase(),
  }
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

// ── Backend search function (async) ───────────────────────────────────
/**
 * Search backend for posts, tour guides, and other public content.
 * This searches the live database content instead of the static index.
 */
export async function searchContentAsync(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  try {
    const params = new URLSearchParams({ q: query })
    const response = await fetch(`/api/search?${params}`)

    if (!response.ok) {
      console.warn('Backend search failed, falling back to static index')
      return searchContent(query)
    }

    const data = await response.json()
    const results: any[] = Array.isArray(data) ? data : (data.data?.results ?? data.results ?? [])

    return results.map((item: any) =>
      mapCMSPostToSearchResult({
        id: String(item.id),
        title: item.title ?? '',
        body: item.description ?? '',
        label: item.label ?? undefined,
        postType: item.post_type ?? undefined,
      })
    )
  } catch (error) {
    console.warn('Backend search error, falling back to static index', error)
    return searchContent(query)
  }
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
