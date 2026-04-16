// ── Local Cuisine ────────────────────────────────────────────────────
export interface CuisineItem {
  id: string
  name: string
  tagalogName?: string
  type: "main" | "snack" | "dessert" | "drink"
  description: string
  story: string
  image: string
  gallery?: string[]
  where: string[]
  bestTime?: string
  isFeatured?: boolean
  ingredients?: string[]
  author?: string
}

// ── Festivals & Celebrations ─────────────────────────────────────────
export interface Festival {
  id: string
  name: string
  date: string
  type: "religious" | "cultural" | "civic" | "seasonal"
  description: string
  highlights: string[]
  story: string
  image: string
  gallery?: string[]
  author?: string
}

// ── Cultural Practices & Traditions ─────────────────────────────────
export interface CulturalPractice {
  id: string
  name: string
  category: "religion" | "community" | "lifecycle" | "crafts" | "performing-arts"
  description: string
  significance: string
  status: "active" | "endangered" | "revived"
  image?: string
  gallery?: string[]
  author?: string
}

// ── Local Business ───────────────────────────────────────────────────
export interface LocalBusiness {
  id: string
  name: string
  type: "food" | "crafts" | "retail" | "services" | "agri"
  description: string
  products: string[]
  location: string
  latitude?: string
  longitude?: string
  contact?: string
  yearEstablished?: string
  image?: string
  images?: string[]
  isFeatured?: boolean
}

// ── People Wonders ──────────────────────────────────────────────────
export interface PeopleWonder {
  id: string
  name: string
  category: "pageant" | "arts" | "sports" | "entertainment" | "academics" | "civic"
  title: string
  achievement: string
  description: string
  year?: string
  awards?: string[]
  image?: string
  social?: string
  isAlive: true
  gallery?: string[]
  author?: string
}

// ── Crafts & Artisans ────────────────────────────────────────────────
export interface Artisan {
  id: string
  name: string
  craft: string
  experience: string
  description: string
  products: string[]
  awards?: string[]
  location: string
  latitude?: string
  longitude?: string
  image?: string
  gallery?: string[]
  author?: string
}

// ── Restaurants & Eateries ───────────────────────────────────────────
export interface Restaurant {
  id: string
  name: string
  type: "restaurant" | "eatery" | "cafe" | "carinderia" | "bakery"
  description: string
  specialties: string[]
  location: string
  latitude?: string
  longitude?: string
  hours?: string
  priceRange?: "₱" | "₱₱" | "₱₱₱"
  image?: string
  isOpen?: boolean
  author?: string
}
