import type { ContentCategory, ContentLabel, ContentStatus, PostType } from "@/lib/data/admin-data"

export type FormData = {
  title: string
  body: string
  contentCategory: ContentCategory
  label: ContentLabel
  postType: PostType
  status: ContentStatus
  images: string[]
  location: string
  hours: string
  contact: string
  established: string
  category: string
  story: string
  highlights: string
  newsDate: string
  isFeatured: boolean
  author: string
}

export const EMPTY_FORM: FormData = {
  title: "",
  body: "",
  contentCategory: "history",
  label: "timeline-of-events",
  postType: "place",
  status: "draft",
  images: [],
  location: "",
  hours: "",
  contact: "",
  established: "",
  category: "",
  story: "",
  highlights: "",
  newsDate: new Date().toISOString().slice(0, 10),
  isFeatured: false,
  author: "",
}

export const UNKNOWN_LABEL = { label: "Other", color: "bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-300" }

export const PLACE_CATEGORIES = [
  "Heritage Site",
  "Religious Site",
  "Museum",
  "Festival Grounds",
  "Food & Dining",
  "Arts & Culture",
  "Arena & Events Venue",
]

export const LABEL_PLACE_TYPES: Record<string, string[]> = {
  "timeline-of-events": ["Heritage Site", "Religious Site", "Museum", "Landmark"],
  "notable-figures": [],
  "local-cuisine": ["Main Dish", "Snack", "Dessert & Sweets", "Drink"],
  "festivals": ["Festival Grounds", "Arena & Events Venue"],
  "cultural-practices": ["Arts & Culture", "Heritage Site"],
  "crafts-artisan": ["Arts & Culture"],
  "people-wonders": [],
  "restaurants": ["Restaurant", "Eatery", "Café", "Carinderia", "Bakery"],
  "destinations": ["Heritage Site", "Museum", "Religious Site"],
  "travel-tours": ["Heritage Tour", "Food Trail", "Festival Package", "Nature Tour", "Custom"],
  "schools": ["Public", "Private"],
  "hospitals": ["Government", "Private", "Clinic", "Lying-In / Birthing", "Rural Health Unit"],
  "barangay": [],
  "local-business": ["Retail", "Food & Dining", "Services", "Crafts & Artisan", "Agriculture"],
  "pagoda": ["Festival Grounds", "Arena & Events Venue"],
}

export type DetailField = "location" | "hours" | "contact" | "established" | "category" | "story" | "highlights"

export const LABEL_VISIBLE_FIELDS: Record<string, DetailField[]> = {
  "timeline-of-events": ["established", "story"],
  "notable-figures":    ["story"],
  "local-cuisine":      ["category", "story", "highlights"],
  "festivals":          ["location", "established", "story", "highlights"],
  "cultural-practices": ["story", "highlights"],
  "crafts-artisan":     ["story", "highlights"],
  "people-wonders":     ["story"],
  "restaurants":        ["location", "hours", "contact", "category"],
  "destinations":       ["location", "hours", "contact", "established", "category", "story", "highlights"],
  "travel-tours":       ["contact", "category", "story", "highlights"],
  "events":             ["location", "story", "highlights"],
  "schools":             ["location", "hours", "established", "contact", "category", "story"],
  "hospitals":           ["location", "hours", "contact", "established", "category", "story"],
  "barangay":            ["location", "established", "story"],
  "local-business":      ["location", "hours", "contact", "established", "category", "story", "highlights"],
  "pagoda":              ["location", "established", "story", "highlights"],
}

export const LABEL_FIELD_LABELS: Record<string, Partial<Record<DetailField, { label: string; placeholder: string }>>> = {
  "timeline-of-events": {
    established: { label: "Era / Period", placeholder: "e.g. Pre-Colonial Period, Spanish Era, 1787" },
    story: { label: "Historical Context", placeholder: "Write the historical context or background..." },
  },
  "notable-figures": {
    story: { label: "Biography / Background", placeholder: "Write the person's biography or background story..." },
  },
  "local-cuisine": {
    story: { label: "Origin / Background", placeholder: "Where does this dish come from?" },
    highlights: { label: "Key Ingredients / Features", placeholder: "Main ingredient\nTraditional preparation\nBest paired with..." },
  },
  "festivals": {
    established: { label: "Year Started", placeholder: "e.g. 1787" },
    story: { label: "Festival Story", placeholder: "Write the story behind this festival..." },
    highlights: { label: "Festival Highlights", placeholder: "Grand fluvial parade\nStreet dancing\nFireworks display" },
  },
  "travel-tours": {
    contact: { label: "Booking Contact", placeholder: "e.g. (044) 123-4567" },
    story: { label: "Itinerary", placeholder: "Describe the tour itinerary..." },
    highlights: { label: "Includes", placeholder: "Licensed MHACTO guide\nEntrance fees\nWelcome snack" },
  },
  "schools": {
    location: { label: "Barangay / Location", placeholder: "e.g. Brgy. Lolomboy, Bocaue" },
    hours: { label: "School Level", placeholder: "e.g. Elementary, Junior High, Senior High, College, Technical-Vocational" },
    established: { label: "Enrollment / Student Count", placeholder: "e.g. 1,200 students" },
    contact: { label: "Year Founded", placeholder: "e.g. 1952" },
    story: { label: "Programs Offered", placeholder: "Science & Technology\nHumss\nGeneral Academic Strand" },
  },
  "hospitals": {
    story: { label: "Services Offered", placeholder: "Emergency care\nOutpatient services\nLaboratory\nPharmacy" },
    established: { label: "Bed Capacity", placeholder: "e.g. 50" },
  },
  "barangay": {
    location: { label: "Address", placeholder: "e.g. Brgy. Wawa, Bocaue, Bulacan" },
    established: { label: "Population", placeholder: "e.g. 15,000 residents" },
    story: { label: "Barangay Captain", placeholder: "e.g. Hon. Juan Dela Cruz" },
  },
  "local-business": {
    established: { label: "Year Established", placeholder: "e.g. 2010" },
    story: { label: "About / Description", placeholder: "Describe the business, what it offers..." },
    highlights: { label: "Products / Services Offered", placeholder: "Product A\nService B\nSpecialty C" },
  },
  "pagoda": {
    established: { label: "Year Started", placeholder: "e.g. 1787" },
    story: { label: "Festival Story", placeholder: "Write the story behind the Pagoda Festival..." },
    highlights: { label: "Festival Highlights", placeholder: "Grand fluvial parade\nFireworks display\nCross-river procession" },
  },
}
