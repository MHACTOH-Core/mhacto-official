import { asset } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────

// Categories — based on navbar structure
export type ContentCategory =
  | "history"
  | "arts-culture"
  | "tourist-wonders"
  | "news"
  | "events"
  | "community"

// Labels — sub-items under each navbar category
export type ContentLabel =
  | "timeline-of-events"
  | "notable-figures"
  | "local-cuisine"
  | "festivals"
  | "cultural-practices"
  | "crafts-artisan"
  | "people-wonders"
  | "restaurants"
  | "destinations"
  | "travel-tours"
  | "news"
  | "events"
  | "schools"
  | "hospitals"
  | "barangay"
  | "local-business"
  | "pagoda"

export type ContentStatus = "draft" | "published" | "archived"

export type PostType = "place" | "news" | "event"

export interface CMSPost {
  id: string
  title: string
  body: string
  contentCategory: ContentCategory
  label: ContentLabel
  postType: PostType
  status: ContentStatus
  image: string[]
  // Place detail fields (optional — only for place/event post types)
  location?: string
  hours?: string
  contact?: string
  established?: string
  category?: string
  story?: string
  highlights?: string[]
  // Tour-specific fields (optional — from content_fields)
  includes?: string[]
  itinerary?: { time: string; activity: string }[]
  tourType?: string
  tourDifficulty?: string
  // News detail fields
  newsDate?: string
  // Featured flag — per-label featured assignment
  isFeatured?: boolean
  // Restaurant-specific
  priceRange?: string
  // Author display name
  author?: string
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type InquiryStatus = "unread" | "read" | "in_progress" | "assigned" | "archived" | "spam" | "trash"

export type InquiryType = "general_contact" | "tour_booking" | "partnership"

export interface Inquiry {
  id: string
  name: string
  email: string
  contactNumber?: string
  dateOfVisit?: string
  numberOfPax?: number
  message: string
  status: InquiryStatus
  inquiryType: InquiryType
  additionalDetails?: Record<string, unknown>
  assignedTo?: string | null
  replyText?: string | null
  repliedAt?: string | null
  repliedBy?: string | null
  createdAt: string
}

export type ActivityAction =
  | "login"
  | "logout"
  | "create_post"
  | "update_post"
  | "delete_post"
  | "publish_post"
  | "archive_post"
  | "reply_inquiry"
  | "archive_inquiry"
  | "delete_inquiry"
  | "update_settings"

export type UserRole = "super_admin" | "admin" | "content_manager"
export type UserStatus = "active" | "archived"

export interface AdminUser {
  user_id: number
  username: string
  full_name: string | null
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  content_manager: "Content Manager",
}

export interface ActivityLogEntry {
  id: string
  action: ActivityAction
  description: string
  timestamp: string
  user: string
}

export interface PageView {
  page: string
  title: string
  views: number
  category: string
}

export interface DailyVisit {
  date: string
  views: number
}

/** Row returned by GET /api/analytics/top-destinations.php */
export interface TopDestination {
  content_id: number
  destination_name: string
  category: string
  total_clicks: number
}

export interface AdminSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  facebookUrl: string
  instagramUrl: string
  enableInquiryNotifications: boolean
  enableAnalytics: boolean
  maintenanceMode: boolean
  loginBackgroundImage: string
  navbarLogoUrl: string
  navbarSecondaryLogoUrl: string
  navbarTitle: string
}

// ─── Label helpers ─────────────────────────────────────────────────

// ─── Category helpers ──────────────────────────────────────────────

export const contentCategories: Record<ContentCategory, { label: string; color: string }> = {
  "history": { label: "History", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  "arts-culture": { label: "Arts & Culture", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  "tourist-wonders": { label: "Tourist Wonders", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  "news": { label: "News", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
  "events": { label: "Events", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  "community": { label: "Community", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
}

// ─── Label helpers (sub-items grouped by category) ─────────────────

export const contentLabels: Record<ContentLabel, { label: string; color: string; category: ContentCategory }> = {
  // History
  "timeline-of-events": { label: "Timeline of Events", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", category: "history" },
  "notable-figures": { label: "Notable Figures", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", category: "history" },
  // Arts & Culture
  "local-cuisine": { label: "Culinary Wonders", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300", category: "arts-culture" },
  "festivals": { label: "Festivals", color: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300", category: "arts-culture" },
  "cultural-practices": { label: "Cultural Practices", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300", category: "arts-culture" },
  "crafts-artisan": { label: "Art Wonders", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300", category: "arts-culture" },
  "people-wonders": { label: "People Wonders", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300", category: "arts-culture" },
  "restaurants": { label: "Restaurants & Eateries", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", category: "arts-culture" },
  // Tourist Wonders
  "destinations": { label: "Destinations", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", category: "tourist-wonders" },
  "travel-tours": { label: "Travel & Tours", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300", category: "tourist-wonders" },
  // News (standalone)
  "news": { label: "News", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", category: "news" },
  // Events (standalone)
  "events": { label: "Events", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300", category: "events" },
  // Community
  "schools": { label: "Schools", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300", category: "community" },
  "hospitals": { label: "Hospitals", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300", category: "community" },
  "barangay": { label: "Barangay", color: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300", category: "community" },
  "local-business": { label: "Local Business", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", category: "community" },
  // Pagoda Festival
  "pagoda": { label: "Pagoda Festival", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300", category: "arts-culture" },
}

/** Get labels for a specific category */
export function getLabelsByCategory(category: ContentCategory): [ContentLabel, { label: string; color: string; category: ContentCategory }][] {
  return Object.entries(contentLabels).filter(
    ([, v]) => v.category === category
  ) as [ContentLabel, { label: string; color: string; category: ContentCategory }][]
}

/** Get labels for place-type posts (everything except news, events, and pagoda) */
export function getPlaceLabels(): [ContentLabel, { label: string; color: string; category: ContentCategory }][] {
  return Object.entries(contentLabels).filter(
    ([k, v]) => v.category !== "news" && v.category !== "events" && k !== "pagoda"
  ) as [ContentLabel, { label: string; color: string; category: ContentCategory }][]
}

/** Labels available in the CMS filter dropdown (excludes pagoda — it has its own tab) */
export function getCmsFilterLabels(): [ContentLabel, { label: string; color: string; category: ContentCategory }][] {
  return Object.entries(contentLabels).filter(
    ([k]) => k !== "pagoda"
  ) as [ContentLabel, { label: string; color: string; category: ContentCategory }][]
}

/** Labels for a specific category, excluding pagoda */
export function getCmsLabelsByCategory(category: ContentCategory): [ContentLabel, { label: string; color: string; category: ContentCategory }][] {
  return Object.entries(contentLabels).filter(
    ([k, v]) => v.category === category && k !== "pagoda"
  ) as [ContentLabel, { label: string; color: string; category: ContentCategory }][]
}

/** Get the single label for news post type */
export function getNewsLabel(): [ContentLabel, { label: string; color: string; category: ContentCategory }] {
  return ["news", contentLabels["news"]]
}

/** Get the single label for events post type */
export function getEventsLabel(): [ContentLabel, { label: string; color: string; category: ContentCategory }] {
  return ["events", contentLabels["events"]]
}

export const inquiryStatusLabels: Record<InquiryStatus, { label: string; color: string }> = {
  unread:      { label: "Unread",      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  read:        { label: "Read",        color: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  assigned:    { label: "Assigned",    color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  archived:    { label: "Completed",   color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
  spam:        { label: "Spam",        color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  trash:       { label: "Trash",       color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
}

export const inquiryTypeLabels: Record<InquiryType, { label: string; color: string; icon: string }> = {
  general_contact: { label: "General Contact", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300", icon: "mail" },
  tour_booking: { label: "Tour Booking", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", icon: "map-pin" },
  partnership: { label: "Partnership", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300", icon: "handshake" },
}

export const activityLabels: Record<ActivityAction, string> = {
  login: "Logged in",
  logout: "Logged out",
  create_post: "Created a post",
  update_post: "Updated a post",
  delete_post: "Deleted a post",
  publish_post: "Published a post",
  archive_post: "Archived a post",
  reply_inquiry: "Replied to an inquiry",
  archive_inquiry: "Completed an inquiry",
  delete_inquiry: "Deleted an inquiry",
  update_settings: "Updated settings",
}

// ─── Mock data generators ──────────────────────────────────────────

let _idCounter = 100

export function generateId(): string {
  return `${Date.now()}-${++_idCounter}`
}

export const MOCK_PAGE_VIEWS: PageView[] = [
  { page: "/places/philippine-arena", title: "Philippine Arena", views: 2847, category: "Landmark" },
  { page: "/places/bocaue-river-festival", title: "Bocaue River Festival", views: 2301, category: "Festival" },
  { page: "/places/st-martin-church", title: "St. Martin of Tours Church", views: 1956, category: "Heritage" },
  { page: "/", title: "Home Page", views: 1823, category: "Page" },
  { page: "/places/local-delicacies", title: "Local Delicacies", views: 1204, category: "Cuisine" },
  { page: "/places/bocaue-river-walk", title: "Bocaue River Walk", views: 987, category: "Nature" },
  { page: "/places/bocaue-artisan-crafts", title: "Artisan Crafts Village", views: 876, category: "Arts" },
  { page: "/places/old-town-plaza", title: "Old Town Plaza", views: 743, category: "Heritage" },
  { page: "/places/ciudad-de-victoria", title: "Ciudad de Victoria", views: 634, category: "Landmark" },
  { page: "/places", title: "Places & Events", views: 521, category: "Page" },
  { page: "/contact", title: "Contact Page", views: 312, category: "Page" },
  { page: "/inquire", title: "Inquire Page", views: 289, category: "Page" },
]

export const MOCK_DAILY_VISITS: DailyVisit[] = (() => {
  const days: DailyVisit[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().slice(0, 10),
      views: Math.floor(200 + Math.random() * 400),
    })
  }
  return days
})()

export const MOCK_POSTS: CMSPost[] = [
  {
    id: "post-1",
    title: "Bocaue River Festival 2026 — A Celebration of Faith and Culture",
    body: "The annual Bocaue River Festival is set to return this July with more grandeur than ever. The festival, which commemorates the Cross of Bocaue, will feature a fluvial parade, fireworks, and cultural performances. Join us in celebrating Bocaue's most beloved tradition!\n\nThis year's celebration will include new activities such as a food festival showcasing local delicacies, an artisan market, and a historical exhibit at the Old Town Plaza. The festivities will run from July 1-7, 2026.",
    contentCategory: "arts-culture",
    label: "festivals",
    postType: "place",
    status: "published",
    image: [asset("/images/defaults/no-image.svg")],
    location: "Bocaue River, Bulacan",
    hours: "Annual event — First week of July",
    contact: "Municipal Tourism Office",
    established: "1787",
    category: "Festival",
    story: "The Bocaue River Festival traces its origins to 1787 when a fisherman discovered a small wooden cross floating in the river.",
    highlights: ["Over 235 years of tradition", "Iconic pagoda fluvial procession", "Week-long festivities with street dancing"],
    isFeatured: true,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-01-20T10:30:00Z",
  },
  {
    id: "post-2",
    title: "St. Martin of Tours Church — Restoration Update",
    body: "The ongoing restoration of St. Martin of Tours Parish Church is progressing well. The centuries-old structure, a cornerstone of Bocaue's heritage, is being carefully restored to preserve its Spanish colonial architecture while ensuring structural integrity for generations to come.\n\nPhase 2 of the restoration, focusing on the bell tower and facade, is expected to be completed by March 2026. Visitors are welcome to view the progress from the designated viewing area.",
    contentCategory: "history",
    label: "timeline-of-events",
    postType: "place",
    status: "published",
    image: [asset("/images/defaults/no-image.svg")],
    location: "Bocaue Town Center, Bulacan",
    hours: "Daily: 6:00 AM – 8:00 PM",
    contact: "(044) 123-4567",
    established: "circa 1609",
    category: "Temple & Heritage",
    story: "The parish was established by Augustinian friars in the early 1600s.",
    highlights: ["One of the oldest parishes in Bulacan", "Baroque-style stone church", "Patron saint: St. Martin of Tours"],
    isFeatured: false,
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-12T14:00:00Z",
  },
  {
    id: "post-3",
    title: "New Art Exhibit at Bocaue Artisan Village",
    body: "A new exhibit featuring local artisans will open at the Bocaue Artisan Crafts Village this February. The exhibit showcases traditional craftsmanship including pottery, weaving, and woodcarving that have been part of Bocaue's cultural identity for centuries.",
    contentCategory: "arts-culture",
    label: "cultural-practices",
    postType: "place",
    status: "draft",
    image: [],
    location: "Bocaue Artisan Crafts Village",
    hours: "Mon–Sat: 9:00 AM – 5:00 PM",
    category: "Arts & Culture",
    isFeatured: false,
    createdAt: "2026-02-01T11:00:00Z",
    updatedAt: "2026-02-01T11:00:00Z",
  },
  {
    id: "post-4",
    title: "Important Notice: MHACTO Office Hours Update",
    body: "Starting February 2026, the MHACTO office will observe new office hours: Monday to Friday, 8:00 AM to 5:00 PM. Saturday walk-in consultations will be available from 9:00 AM to 12:00 PM by appointment only.",
    contentCategory: "news",
    label: "news",
    postType: "news",
    status: "published",
    image: [],
    newsDate: "2026-02-05",
    location: "MHACTO Office, Municipal Hall, Bocaue",
    hours: "Mon–Fri: 8:00 AM – 5:00 PM",
    contact: "mhacto@bocaue.gov.ph",
    isFeatured: false,
    createdAt: "2026-02-05T08:00:00Z",
    updatedAt: "2026-02-05T08:00:00Z",
  },
  {
    id: "post-5",
    title: "Exploring Bocaue's Local Delicacies — A Culinary Journey",
    body: "Bocaue is not only known for its fireworks and festivals but also for its rich culinary heritage. From the famous chicharon to traditional kakanin, our town offers a diverse palette of flavors waiting to be discovered.\n\nJoin our monthly food tour every first Saturday to explore the best of Bocaue's local cuisine.",
    contentCategory: "arts-culture",
    label: "local-cuisine",
    postType: "place",
    status: "published",
    image: [asset("/images/defaults/no-image.svg")],
    location: "Various locations, Bocaue",
    hours: "Monthly — Every first Saturday",
    category: "Cuisine",
    highlights: ["Famous chicharon", "Traditional kakanin", "Guided food tours"],
    isFeatured: true,
    createdAt: "2026-01-25T07:00:00Z",
    updatedAt: "2026-01-28T09:00:00Z",
  },
]

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    contactNumber: "+63-917-123-4567",
    message: "Good day! I am writing to inquire about how our organization can participate in the upcoming River Festival 2026. We are a cultural dance group from Manila and we would love to perform during the festivities. Could you provide information on the application process and requirements? Thank you!",
    status: "unread",
    inquiryType: "general_contact",
    dateOfVisit: "2026-03-15",
    numberOfPax: 12,
    additionalDetails: { purpose: "Cultural Immersion" },
    createdAt: "2026-02-12T14:30:00Z",
  },
  {
    id: "inq-2",
    name: "John Reyes",
    email: "john.reyes@company.com",
    contactNumber: "+63-918-765-4321",
    message: "Hello, I would like to inquire about available venues in Bocaue for a corporate team-building event. We are looking for a venue that can accommodate 50-80 persons sometime in March 2026. Please advise on options and rates.",
    status: "assigned",
    inquiryType: "tour_booking",
    dateOfVisit: "2026-03-20",
    numberOfPax: 65,
    additionalDetails: { purpose: "Tourism Visit" },
    createdAt: "2026-02-10T09:15:00Z",
  },
  {
    id: "inq-3",
    name: "Dr. Elena Cruz",
    email: "elena.cruz@university.edu",
    contactNumber: "+63-927-888-1234",
    message: "Dear MHACTO, I am a history professor at a state university conducting research on the Spanish colonial-era churches of Bulacan. I would like to request access to any historical records, documents, or archives related to St. Martin of Tours Church. Would it be possible to schedule a visit to your archives?",
    status: "unread",
    inquiryType: "partnership",
    additionalDetails: { purpose: "Research" },
    createdAt: "2026-02-08T16:20:00Z",
  },
  {
    id: "inq-4",
    name: "Carlos Mendoza",
    email: "carlos.m@gmail.com",
    contactNumber: "+63-935-222-3344",
    message: "Hi! My family is planning to visit Bocaue next weekend. Do you offer guided tour services? If so, how can we book one and what are the rates? We're particularly interested in the historical sites and the river walk. Thanks!",
    status: "unread",
    inquiryType: "tour_booking",
    dateOfVisit: "2026-02-15",
    numberOfPax: 6,
    additionalDetails: { purpose: "Tourism Visit" },
    createdAt: "2026-02-07T11:45:00Z",
  },
  {
    id: "inq-5",
    name: "Ana Villanueva",
    email: "ana.v@hotmail.com",
    message: "Good afternoon! I just wanted to say that our family had an amazing time visiting Bocaue last weekend. The Old Town Plaza and St. Martin Church were beautiful. The locals were so warm and welcoming. We will definitely be back for the River Festival! Keep up the great work promoting Bocaue's heritage.",
    status: "archived",
    inquiryType: "general_contact",
    createdAt: "2026-01-28T15:00:00Z",
  },
  {
    id: "inq-6",
    name: "Patrick Lim",
    email: "patrick.lim@travel.ph",
    contactNumber: "+63-912-555-6789",
    message: "Hello MHACTO, I am a professional photographer working on a documentary about Philippine heritage towns. I would like to request a photography permit for the heritage sites in Bocaue. I plan to shoot for 3 days starting February 20. Please let me know the requirements and fees involved.",
    status: "unread",
    inquiryType: "partnership",
    dateOfVisit: "2026-02-20",
    numberOfPax: 3,
    createdAt: "2026-02-13T08:00:00Z",
  },
  {
    id: "inq-7",
    name: "Jasmine Dela Cruz",
    email: "jasmine.dc@bulsu.edu.ph",
    contactNumber: "+63-945-111-2233",
    message: "Good day po! We are 3rd year History students from Bulacan State University. Our professor requires us to visit the MHACTO archives and heritage sites for our thesis on Filipino colonial architecture. We would like to schedule a guided educational tour. We will bring our student IDs and a letter from our department.",
    status: "unread",
    inquiryType: "tour_booking",
    dateOfVisit: "2026-03-05",
    numberOfPax: 35,
    additionalDetails: { purpose: "Educational Tour", schoolName: "Bulacan State University" },
    createdAt: "2026-02-14T07:30:00Z",
  },
]

export const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: "act-1",
    action: "login",
    description: "Admin logged in from 192.168.1.100",
    timestamp: "2026-02-13T08:00:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-2",
    action: "publish_post",
    description: 'Published "Important Notice: MHACTO Office Hours Update"',
    timestamp: "2026-02-05T08:10:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-3",
    action: "create_post",
    description: 'Created draft "New Art Exhibit at Bocaue Artisan Village"',
    timestamp: "2026-02-01T11:00:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-4",
    action: "reply_inquiry",
    description: "Replied to inquiry from John Reyes — Venue Inquiry",
    timestamp: "2026-02-11T10:00:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-5",
    action: "update_settings",
    description: "Updated contact email and phone number",
    timestamp: "2026-01-30T14:00:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-6",
    action: "archive_inquiry",
    description: "Archived inquiry from Ana Villanueva — Feedback on Visit",
    timestamp: "2026-01-29T09:00:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-7",
    action: "publish_post",
    description: 'Published "Exploring Bocaue\'s Local Delicacies"',
    timestamp: "2026-01-28T09:00:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-8",
    action: "update_post",
    description: 'Updated "Bocaue River Festival 2026" content and image',
    timestamp: "2026-01-20T10:30:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-9",
    action: "create_post",
    description: 'Created "Bocaue River Festival 2026 — A Celebration of Faith and Culture"',
    timestamp: "2026-01-15T08:00:00Z",
    user: "admin@mhacto.gov.ph",
  },
  {
    id: "act-10",
    action: "login",
    description: "Admin logged in from 192.168.1.105",
    timestamp: "2026-01-15T07:55:00Z",
    user: "admin@mhacto.gov.ph",
  },
]

export const DEFAULT_SETTINGS: AdminSettings = {
  siteName: "MHACTO Bocaue",
  siteDescription: "Municipal History, Arts, Culture & Tourism Office — Bocaue, Bulacan",
  contactEmail: "mhacto@bocaue.gov.ph",
  contactPhone: "(044) 123-4567",
  address: "Municipal Hall, Bocaue, Bulacan 3018",
  facebookUrl: "",
  instagramUrl: "",
  enableInquiryNotifications: true,
  enableAnalytics: true,
  maintenanceMode: false,
  loginBackgroundImage: "",
  navbarLogoUrl: "",
  navbarSecondaryLogoUrl: "",
  navbarTitle: "",
}
