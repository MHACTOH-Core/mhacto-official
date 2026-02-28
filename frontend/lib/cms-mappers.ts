/**
 * cms-mappers.ts — Maps CMSPost objects from the backend API
 * to the specific data types used by each tourist site page.
 *
 * Every page follows the pattern:
 *   1. Import static data as fallback
 *   2. Fetch from API by label
 *   3. Map API posts → page data type using these mappers
 *   4. If API returns data → use it; else keep static fallback
 */

import type { CMSPost } from "@/lib/data/admin-data"
import { asset } from "@/lib/utils"
import type { HeritageSite, Museum, ReligiousSite, TourPackage } from "@/lib/data/destinations-data"
import type { CuisineItem, Festival, CulturalPractice, Artisan, PeopleWonder, LocalBusiness } from "@/lib/data/culture-data"
import type { TimelineEvent, NotablePerson } from "@/lib/data/history-data"
import type { SchoolEntry, College, PublicSchool, Hospital } from "@/lib/data/community-data"

// ─── Image helper ─────────────────────────────────────────────────

function resolveImage(post: CMSPost, fallback = "/images/heroes/hero-bocaue.jpg"): string {
  const img = post.image?.[0] ?? ""
  if (!img) return asset(fallback)
  return img.startsWith("/images") ? asset(img) : img
}

// ─── Destinations mappers ─────────────────────────────────────────

export function cmsToHeritageSite(post: CMSPost): HeritageSite {
  return {
    id: post.id,
    name: post.title,
    established: post.established ?? "",
    category: (post.category?.toLowerCase().includes("church") ? "church"
      : post.category?.toLowerCase().includes("monument") ? "monument"
      : post.category?.toLowerCase().includes("bridge") ? "bridge"
      : post.category?.toLowerCase().includes("building") ? "building"
      : "streetscape") as HeritageSite["category"],
    description: post.body?.substring(0, 300) ?? "",
    story: post.story ?? "",
    location: post.location ?? "",
    hours: post.hours ?? "",
    highlights: post.highlights ?? [],
    image: resolveImage(post, "/images/places/oldtownbocaue.jpg"),
    isProtected: post.isFeatured ?? false,
    protectionLevel: post.isFeatured ? "Heritage Site" : undefined,
  }
}

export function cmsToMuseum(post: CMSPost): Museum {
  const cat = (post.category ?? "").toLowerCase()
  const type: Museum["type"] = cat.includes("art") ? "art"
    : cat.includes("natural") ? "natural"
    : cat.includes("house") ? "house"
    : "history"
  return {
    id: post.id,
    name: post.title,
    type,
    description: post.body ?? "",
    collections: post.highlights ?? [],
    location: post.location ?? "",
    hours: post.hours ?? "",
    admission: post.contact ?? "Contact for details",
    image: resolveImage(post, "/images/places/oldtownbocaue.jpg"),
  }
}

export function cmsToReligiousSite(post: CMSPost): ReligiousSite {
  return {
    id: post.id,
    name: post.title,
    denomination: post.category ?? "Roman Catholic",
    established: post.established ?? "",
    description: post.body?.substring(0, 300) ?? "",
    significance: post.story ?? "",
    location: post.location ?? "",
    hours: post.hours ?? "",
    highlights: post.highlights ?? [],
    image: resolveImage(post, "/images/places/Church.jpg"),
  }
}

export function cmsToTourPackage(post: CMSPost): TourPackage {
  const cat = (post.category ?? "").toLowerCase()
  const type: TourPackage["type"] = cat.includes("food") ? "food"
    : cat.includes("festival") ? "festival"
    : cat.includes("nature") ? "nature"
    : cat.includes("custom") ? "custom"
    : "heritage"
  return {
    id: post.id,
    name: post.title,
    duration: post.hours ?? "Full Day",
    type,
    difficulty: "easy",
    groupSize: "2–30 persons",
    price: "Contact for pricing",
    description: post.body ?? "",
    itinerary: [],
    includes: post.highlights ?? [],
    highlights: post.highlights ?? [],
    image: resolveImage(post, "/images/places/Church.jpg"),
    bookingContact: post.contact ?? "MHACTO Office",
  }
}

// ─── Culture mappers ──────────────────────────────────────────────

export function cmsToCuisineItem(post: CMSPost): CuisineItem {
  const cat = (post.category ?? "").toLowerCase()
  const type: CuisineItem["type"] = cat.includes("snack") ? "snack"
    : cat.includes("dessert") || cat.includes("sweet") ? "dessert"
    : cat.includes("drink") || cat.includes("beverage") ? "drink"
    : "main"
  return {
    id: post.id,
    name: post.title,
    tagalogName: "",
    type,
    description: post.body ?? "",
    story: post.story ?? "",
    image: resolveImage(post, "/images/places/Food.jpg"),
    where: post.location ? [post.location] : [],
    bestTime: post.hours ?? undefined,
    isFeatured: post.isFeatured ?? false,
  }
}

export function cmsToFestival(post: CMSPost): Festival {
  const cat = (post.category ?? "").toLowerCase()
  const type: Festival["type"] = cat.includes("religious") ? "religious"
    : cat.includes("civic") ? "civic"
    : cat.includes("seasonal") ? "seasonal"
    : "cultural"
  return {
    id: post.id,
    name: post.title,
    date: post.established ?? "",
    type,
    description: post.body ?? "",
    story: post.story ?? "",
    highlights: post.highlights ?? [],
    image: resolveImage(post, "/images/places/river-festival.jpg"),
  }
}

export function cmsToCulturalPractice(post: CMSPost): CulturalPractice {
  const cat = (post.category ?? "").toLowerCase()
  const category: CulturalPractice["category"] = cat.includes("religion") ? "religion"
    : cat.includes("lifecycle") || cat.includes("life") ? "lifecycle"
    : cat.includes("craft") ? "crafts"
    : cat.includes("perform") || cat.includes("art") ? "performing-arts"
    : "community"
  return {
    id: post.id,
    name: post.title,
    category,
    description: post.body ?? "",
    significance: post.story ?? "",
    status: "active",
    image: resolveImage(post, "/images/places/Arts.jpg"),
  }
}

export function cmsToArtisan(post: CMSPost): Artisan {
  return {
    id: post.id,
    name: post.title,
    craft: post.category ?? "",
    experience: post.established ?? "",
    description: post.body ?? "",
    products: post.highlights ?? [],
    awards: [],
    location: post.location ?? "",
    image: resolveImage(post, "/images/places/Arts.jpg"),
  }
}

export function cmsToPeopleWonder(post: CMSPost): PeopleWonder {
  const cat = (post.category ?? "").toLowerCase()
  const category: PeopleWonder["category"] = cat.includes("pageant") || cat.includes("beauty") ? "pageant"
    : cat.includes("art") || cat.includes("music") ? "arts"
    : cat.includes("sport") || cat.includes("athlet") ? "sports"
    : cat.includes("academ") || cat.includes("education") ? "academics"
    : cat.includes("entertain") || cat.includes("media") ? "entertainment"
    : "civic"
  return {
    id: post.id,
    name: post.title,
    category,
    title: post.category ?? "",
    achievement: post.story ?? "",
    description: post.body ?? "",
    year: post.established ?? undefined,
    awards: post.highlights ?? [],
    image: resolveImage(post, "/images/places/Arts.jpg"),
    isAlive: true,
  }
}

export function cmsToLocalBusiness(post: CMSPost): LocalBusiness {
  const cat = (post.category ?? "").toLowerCase()
  const type: LocalBusiness["type"] = cat.includes("food") || cat.includes("dining") ? "food"
    : cat.includes("craft") || cat.includes("artisan") ? "crafts"
    : cat.includes("agri") || cat.includes("farm") ? "agri"
    : cat.includes("service") ? "services"
    : "retail"
  return {
    id: post.id,
    name: post.title,
    type,
    description: post.body ?? "",
    products: post.highlights ?? [],
    location: post.location ?? "",
    contact: post.contact ?? undefined,
    yearEstablished: post.established ?? undefined,
    image: resolveImage(post, "/images/places/Food.jpg"),
  }
}

// ─── History mappers ──────────────────────────────────────────────

export function cmsToTimelineEvent(post: CMSPost): TimelineEvent {
  return {
    year: post.established ?? "",
    era: post.category ?? "Contemporary",
    title: post.title,
    description: post.body ?? "",
    details: post.story ?? "",
    image: resolveImage(post, "/images/places/oldtownbocaue.jpg"),
    significance: "notable",
  }
}

export function cmsToNotablePerson(post: CMSPost): NotablePerson {
  const cat = (post.category ?? "").toLowerCase()
  const category: NotablePerson["category"] = cat.includes("hero") ? "national-hero"
    : cat.includes("art") || cat.includes("literat") ? "arts"
    : cat.includes("religion") || cat.includes("church") ? "religion"
    : cat.includes("government") || cat.includes("politic") ? "government"
    : cat.includes("education") || cat.includes("academ") ? "education"
    : cat.includes("sport") ? "sports"
    : "arts"
  return {
    id: post.id,
    name: post.title,
    title: post.category ?? "",
    years: post.established ?? "",
    category,
    description: post.body ?? "",
    legacy: post.story ?? "",
    image: resolveImage(post, "/images/places/Arts.jpg"),
  }
}

// ─── Filter helpers for destinations page ─────────────────────────

const HERITAGE_TYPES = ["Heritage Site", "Landmark"]
const MUSEUM_TYPES = ["Museum"]
const RELIGIOUS_TYPES = ["Religious Site"]

export function filterHeritage(posts: CMSPost[]): CMSPost[] {
  return posts.filter(p => HERITAGE_TYPES.includes(p.category ?? ""))
}

export function filterMuseums(posts: CMSPost[]): CMSPost[] {
  return posts.filter(p => MUSEUM_TYPES.includes(p.category ?? ""))
}

export function filterReligious(posts: CMSPost[]): CMSPost[] {
  return posts.filter(p => RELIGIOUS_TYPES.includes(p.category ?? ""))
}

// ─── Community mappers ────────────────────────────────────────────

/** Parse a comma-separated or newline-separated string into an array */
function parseList(text: string | undefined | null): string[] {
  if (!text) return []
  return text
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

export function cmsToSchoolEntry(post: CMSPost): SchoolEntry {
  const ownershipRaw = (post.category ?? "public").toLowerCase()
  const ownership: SchoolEntry["ownership"] = ownershipRaw.includes("private") ? "private" : "public"
  const levelRaw = (post.postType ?? "elementary").toLowerCase()
  const level: SchoolEntry["level"] = (
    levelRaw.includes("college") ? "college"
    : levelRaw.includes("senior") ? "senior-high"
    : levelRaw.includes("junior") ? "junior-high"
    : levelRaw.includes("integrated") ? "integrated"
    : levelRaw.includes("tech") || levelRaw.includes("tvet") ? "technical-vocational"
    : "elementary"
  ) as SchoolEntry["level"]

  return {
    id: post.id,
    name: post.title,
    ownership,
    level,
    barangay: post.location ?? "",
    description: post.body ?? "",
    programs: parseList(post.story),
    enrollment: post.established ?? undefined,
    yearEstablished: post.contact ?? undefined,
    logo: post.image?.[0] || undefined,
  }
}

export function cmsToPublicSchool(post: CMSPost): PublicSchool {
  const levelRaw = (post.postType ?? "elementary").toLowerCase()
  const level: PublicSchool["level"] = (
    levelRaw.includes("senior") ? "senior-high"
    : levelRaw.includes("junior") ? "junior-high"
    : levelRaw.includes("integrated") ? "integrated"
    : "elementary"
  ) as PublicSchool["level"]

  return {
    id: post.id,
    name: post.title,
    level,
    barangay: post.location ?? "",
    description: post.body ?? "",
    programs: parseList(post.story),
    enrollmentRange: post.established ?? undefined,
  }
}

export function cmsToCollege(post: CMSPost): College {
  const typeRaw = (post.category ?? "private").toLowerCase()
  const type: College["type"] = (
    typeRaw.includes("state") || typeRaw.includes("public") ? "state"
    : typeRaw.includes("tech") || typeRaw.includes("tvet") ? "technical"
    : "private"
  ) as College["type"]

  return {
    id: post.id,
    name: post.title,
    type,
    programs: parseList(post.story),
    description: post.body ?? "",
    location: post.location ?? "",
    contact: post.contact ?? undefined,
    yearEstablished: post.established ?? undefined,
    enrollment: post.hours ?? undefined,
  }
}

export function cmsToHospital(post: CMSPost): Hospital {
  const typeRaw = (post.category ?? "private").toLowerCase()
  const type: Hospital["type"] = (
    typeRaw.includes("government") || typeRaw.includes("gov") ? "government"
    : typeRaw.includes("lying") || typeRaw.includes("birthing") ? "lying-in"
    : typeRaw.includes("rhu") || typeRaw.includes("rural") ? "rhu"
    : "private"
  ) as Hospital["type"]

  return {
    id: post.id,
    name: post.title,
    type,
    services: parseList(post.story),
    description: post.body ?? "",
    location: post.location ?? "",
    contact: post.contact ?? "",
    beds: post.established ? parseInt(post.established, 10) || undefined : undefined,
    hours: post.hours ?? "",
    emergency: post.isFeatured ?? false,
  }
}

/** Filter schools by ownership from a shared CMS posts array */
export function filterPublicSchools(posts: CMSPost[]): CMSPost[] {
  return posts.filter(p => !(p.category ?? "").toLowerCase().includes("private"))
}

export function filterPrivateSchools(posts: CMSPost[]): CMSPost[] {
  return posts.filter(p => (p.category ?? "").toLowerCase().includes("private"))
}
