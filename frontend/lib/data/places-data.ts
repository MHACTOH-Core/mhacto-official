export type PlaceCategory =
  | "heritage" | "religious" | "museum" | "nature"
  | "festival" | "arts" | "cuisine" | "landmark" | "venue"

export interface Place {
  id: string
  title: string
  description: string
  image: string
  fullDescription?: string
  story?: string
  location?: string
  hours?: string
  contact?: string
  category: PlaceCategory
  established?: string
  highlights?: string[]
}

export const categoryLabels: Record<PlaceCategory, string> = {
  heritage: "Heritage",
  religious: "Religious",
  museum: "Museum",
  nature: "Nature",
  festival: "Festival",
  arts: "Arts",
  cuisine: "Cuisine",
  landmark: "Landmark",
  venue: "Venue",
}

export interface EventItem {
  id: string
  title: string
  description: string
  date: string
  location: string
  image?: string
  isSpotlight?: boolean
}
