import { asset } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────
export type ContentLabel =
  | "historical"
  | "festival"
  | "arts"
  | "culture"
  | "tourism"
  | "news"

export type ContentStatus = "draft" | "published" | "archived"

export type PostType = "place" | "news"

export interface CMSPost {
  id: string
  title: string
  body: string
  label: ContentLabel
  postType: PostType
  status: ContentStatus
  image: string[]
  // Place detail fields
  location?: string
  hours?: string
  contact?: string
  established?: string
  category?: string
  story?: string
  highlights?: string[]
  // News detail fields
  newsDate?: string
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type InquiryStatus = "unread" | "read" | "replied" | "archived" | "starred" | "spam" | "trash"

export interface Inquiry {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: InquiryStatus
  replyMessage?: string
  repliedAt?: string
  trashedAt?: string
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
  | "update_settings"

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

export interface AdminSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  enableInquiryNotifications: boolean
  enableAnalytics: boolean
  maintenanceMode: boolean
}

// ─── Label helpers ─────────────────────────────────────────────────

export const contentLabels: Record<ContentLabel, { label: string; color: string }> = {
  historical: { label: "Historical", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  festival: { label: "Festival", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300" },
  arts: { label: "Arts", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  culture: { label: "Culture", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  tourism: { label: "Tourism", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  news: { label: "News", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
}

export const inquiryStatusLabels: Record<InquiryStatus, { label: string; color: string }> = {
  unread: { label: "Unread", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  read: { label: "Read", color: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300" },
  replied: { label: "Replied", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  archived: { label: "Archived", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  starred: { label: "Starred", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  spam: { label: "Spam", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  trash: { label: "Trash", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
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
  archive_inquiry: "Archived an inquiry",
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
    label: "festival",
    postType: "place",
    status: "published",
    image: [asset("/images/places/river-festival.jpg")],
    location: "Bocaue River, Bulacan",
    hours: "Annual event — First week of July",
    contact: "Municipal Tourism Office",
    established: "1787",
    category: "Festival",
    story: "The Bocaue River Festival traces its origins to 1787 when a fisherman discovered a small wooden cross floating in the river.",
    highlights: ["Over 235 years of tradition", "Iconic pagoda fluvial procession", "Week-long festivities with street dancing"],
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-01-20T10:30:00Z",
  },
  {
    id: "post-2",
    title: "St. Martin of Tours Church — Restoration Update",
    body: "The ongoing restoration of St. Martin of Tours Parish Church is progressing well. The centuries-old structure, a cornerstone of Bocaue's heritage, is being carefully restored to preserve its Spanish colonial architecture while ensuring structural integrity for generations to come.\n\nPhase 2 of the restoration, focusing on the bell tower and facade, is expected to be completed by March 2026. Visitors are welcome to view the progress from the designated viewing area.",
    label: "historical",
    postType: "place",
    status: "published",
    image: [asset("/images/places/church-bocaue.jpg")],
    location: "Bocaue Town Center, Bulacan",
    hours: "Daily: 6:00 AM – 8:00 PM",
    contact: "(044) 123-4567",
    established: "circa 1609",
    category: "Temple & Heritage",
    story: "The parish was established by Augustinian friars in the early 1600s.",
    highlights: ["One of the oldest parishes in Bulacan", "Baroque-style stone church", "Patron saint: St. Martin of Tours"],
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-12T14:00:00Z",
  },
  {
    id: "post-3",
    title: "New Art Exhibit at Bocaue Artisan Village",
    body: "A new exhibit featuring local artisans will open at the Bocaue Artisan Crafts Village this February. The exhibit showcases traditional craftsmanship including pottery, weaving, and woodcarving that have been part of Bocaue's cultural identity for centuries.",
    label: "arts",
    postType: "place",
    status: "draft",
    image: [],
    location: "Bocaue Artisan Crafts Village",
    hours: "Mon–Sat: 9:00 AM – 5:00 PM",
    category: "Arts & Culture",
    createdAt: "2026-02-01T11:00:00Z",
    updatedAt: "2026-02-01T11:00:00Z",
  },
  {
    id: "post-4",
    title: "Important Notice: MHACTO Office Hours Update",
    body: "Starting February 2026, the MHACTO office will observe new office hours: Monday to Friday, 8:00 AM to 5:00 PM. Saturday walk-in consultations will be available from 9:00 AM to 12:00 PM by appointment only.",
    label: "news",
    postType: "news",
    status: "published",
    image: [],
    newsDate: "2026-02-05",
    location: "MHACTO Office, Municipal Hall, Bocaue",
    hours: "Mon–Fri: 8:00 AM – 5:00 PM",
    contact: "mhacto@bocaue.gov.ph",
    createdAt: "2026-02-05T08:00:00Z",
    updatedAt: "2026-02-05T08:00:00Z",
  },
  {
    id: "post-5",
    title: "Exploring Bocaue's Local Delicacies — A Culinary Journey",
    body: "Bocaue is not only known for its fireworks and festivals but also for its rich culinary heritage. From the famous chicharon to traditional kakanin, our town offers a diverse palette of flavors waiting to be discovered.\n\nJoin our monthly food tour every first Saturday to explore the best of Bocaue's local cuisine.",
    label: "culture",
    postType: "place",
    status: "published",
    image: [asset("/images/places/local-delicacies.jpg")],
    location: "Various locations, Bocaue",
    hours: "Monthly — Every first Saturday",
    category: "Cuisine",
    highlights: ["Famous chicharon", "Traditional kakanin", "Guided food tours"],
    createdAt: "2026-01-25T07:00:00Z",
    updatedAt: "2026-01-28T09:00:00Z",
  },
]

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    subject: "River Festival 2026 Participation",
    message: "Good day! I am writing to inquire about how our organization can participate in the upcoming River Festival 2026. We are a cultural dance group from Manila and we would love to perform during the festivities. Could you provide information on the application process and requirements? Thank you!",
    status: "unread",
    createdAt: "2026-02-12T14:30:00Z",
  },
  {
    id: "inq-2",
    name: "John Reyes",
    email: "john.reyes@company.com",
    subject: "Venue Inquiry for Corporate Event",
    message: "Hello, I would like to inquire about available venues in Bocaue for a corporate team-building event. We are looking for a venue that can accommodate 50-80 persons sometime in March 2026. Please advise on options and rates.",
    status: "replied",
    replyMessage: "Good day, Mr. Reyes! Thank you for your interest. We recommend the Ciudad de Victoria or the Philippine Arena for corporate events. I have attached a venue guide with rates and contact details for each venue. Feel free to reach out if you have further questions.",
    repliedAt: "2026-02-11T10:00:00Z",
    createdAt: "2026-02-10T09:15:00Z",
  },
  {
    id: "inq-3",
    name: "Dr. Elena Cruz",
    email: "elena.cruz@university.edu",
    subject: "Research Request — Historical Records",
    message: "Dear MHACTO, I am a history professor at a state university conducting research on the Spanish colonial-era churches of Bulacan. I would like to request access to any historical records, documents, or archives related to St. Martin of Tours Church. Would it be possible to schedule a visit to your archives?",
    status: "starred",
    createdAt: "2026-02-08T16:20:00Z",
  },
  {
    id: "inq-4",
    name: "Carlos Mendoza",
    email: "carlos.m@gmail.com",
    subject: "Tour Guide Services",
    message: "Hi! My family is planning to visit Bocaue next weekend. Do you offer guided tour services? If so, how can we book one and what are the rates? We're particularly interested in the historical sites and the river walk. Thanks!",
    status: "read",
    createdAt: "2026-02-07T11:45:00Z",
  },
  {
    id: "inq-5",
    name: "Ana Villanueva",
    email: "ana.v@hotmail.com",
    subject: "Feedback on Visit",
    message: "Good afternoon! I just wanted to say that our family had an amazing time visiting Bocaue last weekend. The Old Town Plaza and St. Martin Church were beautiful. The locals were so warm and welcoming. We will definitely be back for the River Festival! Keep up the great work promoting Bocaue's heritage.",
    status: "archived",
    createdAt: "2026-01-28T15:00:00Z",
  },
  {
    id: "inq-6",
    name: "Patrick Lim",
    email: "patrick.lim@travel.ph",
    subject: "Photography Permit Request",
    message: "Hello MHACTO, I am a professional photographer working on a documentary about Philippine heritage towns. I would like to request a photography permit for the heritage sites in Bocaue. I plan to shoot for 3 days starting February 20. Please let me know the requirements and fees involved.",
    status: "unread",
    createdAt: "2026-02-13T08:00:00Z",
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
  enableInquiryNotifications: true,
  enableAnalytics: true,
  maintenanceMode: false,
}
