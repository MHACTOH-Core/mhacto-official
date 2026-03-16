export interface SchoolEntry {
  id: string
  name: string
  ownership: "public" | "private"
  level: "elementary" | "junior-high" | "senior-high" | "integrated" | "college" | "technical-vocational"
  barangay: string
  description: string
  logo?: string
  programs: string[]
  enrollment?: string
  yearEstablished?: string
  contact?: string
  website?: string
}

export interface College {
  id: string
  name: string
  ownership: "public" | "private"
  description: string
  programs: string[]
  enrollment?: string
  yearEstablished?: string
  contact?: string
  website?: string
  logo?: string
  barangay: string
}

export interface PublicSchool {
  id: string
  name: string
  level: "elementary" | "junior-high" | "senior-high" | "integrated"
  barangay: string
  description: string
  enrollment?: string
  yearEstablished?: string
  contact?: string
  logo?: string
}

export interface Hospital {
  id: string
  name: string
  type: "public" | "private" | "clinic" | "specialty"
  services: string[]
  description: string
  location: string
  contact: string
  beds?: number
  hours?: string
  emergency?: boolean
}

export interface MunicipalEvent {
  id: string
  title: string
  date: string
  description: string
  location: string
  category: string
}

export interface Barangay {
  id: string
  name: string
  captain: string
  address: string
  contact?: string
  population?: string
  description: string
  image?: string
}
