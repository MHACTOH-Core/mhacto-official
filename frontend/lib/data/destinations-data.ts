// ── Heritage Sites ───────────────────────────────────────────────────
export interface HeritageSite {
  id: string
  name: string
  established: string
  category: "church" | "monument" | "building" | "streetscape" | "bridge"
  description: string
  story: string
  location: string
  hours: string
  highlights: string[]
  image: string
  gallery?: string[]
  isProtected: boolean
  protectionLevel?: string
  author?: string
}

// ── Museums ──────────────────────────────────────────────────────────
export interface Museum {
  id: string
  name: string
  type: "history" | "art" | "natural" | "house"
  description: string
  collections: string[]
  location: string
  hours: string
  admission: string
  contact: string
  image: string
  gallery?: string[]
  author?: string
}

// ── Religious Sites ──────────────────────────────────────────────────
export interface ReligiousSite {
  id: string
  name: string
  denomination: string
  established: string
  description: string
  significance: string
  location: string
  hours: string
  highlights: string[]
  image: string
  gallery?: string[]
  author?: string
}

// ── Tour Packages ────────────────────────────────────────────────────
export interface TourPackage {
  id: string
  name: string
  duration: string
  type: "heritage" | "food" | "festival" | "nature" | "custom"
  difficulty: "easy" | "moderate" | "challenging" | "active"
  description: string
  itinerary: string[]
  includes: string[]
  highlights: string[]
  image: string
  gallery?: string[]
  bookingContact?: string
  author?: string
}
