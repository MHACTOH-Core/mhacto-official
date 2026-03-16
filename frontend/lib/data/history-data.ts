// ── Timeline of Events ──────────────────────────────────────────────
export interface TimelineEvent {
  year: string
  era: string
  title: string
  description: string
  details: string
  image?: string
  significance: "major" | "notable" | "cultural"
  author?: string
}

export const timelineEras = [
  { label: "Pre-Colonial", color: "bg-amber-500" },
  { label: "Spanish Colonial", color: "bg-orange-500" },
  { label: "Philippine Revolution", color: "bg-red-500" },
  { label: "American Colonial", color: "bg-blue-500" },
  { label: "World War II", color: "bg-gray-600" },
  { label: "Post-War Republic", color: "bg-green-600" },
  { label: "Contemporary", color: "bg-primary" },
]

// ── Notable Persons ──────────────────────────────────────────────────
export interface NotablePerson {
  id: string
  name: string
  title: string
  years: string
  category: "government" | "arts" | "religion" | "sports" | "education" | "national-hero"
  description: string
  legacy: string
  image?: string
  featured?: boolean
  author?: string
}

export const personCategoryLabels: Record<NotablePerson["category"], string> = {
  "national-hero": "Patriot & Hero",
  arts: "Arts & Literature",
  religion: "Religion & Service",
  government: "Government & Law",
  education: "Education",
  sports: "Sports",
}
