/**
 * api.ts — Centralised API client for the PHP backend.
 *
 * Every backend call goes through `apiFetch` so you only configure
 * the base URL once and get consistent error handling everywhere.
 *
 * The base URL defaults to http://localhost:8000 and can be overridden
 * via the NEXT_PUBLIC_API_URL environment variable.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ─── Generic fetch wrapper ────────────────────────────────────────

/**
 * Centralised fetch wrapper. All backend calls go through here
 * for consistent URL resolution, JSON parsing, and error handling.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  // Only set Content-Type for requests that carry a body (POST/PUT/PATCH).
  // Omitting it on GET avoids unnecessary CORS preflight requests.
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  if (options.body) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
  }

  const response = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers,
  })

  // Try to parse JSON even for error responses
  const rawText = await response.text()
  let parsedData: T

  try {
    parsedData = rawText ? JSON.parse(rawText) : ({} as T)
  } catch {
    throw new Error(`Invalid JSON response from ${endpoint}`)
  }

  if (!response.ok) {
    const errorMessage =
      (parsedData as Record<string, string>).message ??
      (parsedData as Record<string, string>).error ??
      `Request failed (${response.status})`
    throw new Error(errorMessage)
  }

  return parsedData
}

// ─── Media Library ────────────────────────────────────────────────

export interface MediaFile {
  name: string
  url: string
  size: number
  modified: string
  extension: string
  type: "image" | "video"
}

export interface MediaListResponse {
  images?: MediaFile[]
  videos?: MediaFile[]
}

export interface MediaUploadResult {
  uploaded: { name: string; url: string; size: number; type: string }[]
  errors: string[]
  count: number
}

/** List existing uploaded media files */
export function apiListMedia(type: "images" | "videos" | "all" = "all") {
  return apiFetch<MediaListResponse>(`/api/media/list.php?type=${type}`)
}

/** Upload one or more files. Uses FormData (multipart). */
export async function apiUploadMedia(
  files: File[],
  type: "image" | "video" = "image",
  options?: { category?: string; label?: string },
): Promise<MediaUploadResult> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files[]", file))

  const params = new URLSearchParams({ type })
  if (options?.category) params.set("category", options.category)
  if (options?.label) params.set("label", options.label)

  const uploadUrl = `${API_BASE}/api/media/upload.php?${params.toString()}`
  const response = await fetch(uploadUrl, { method: "POST", body: formData })
  const rawText = await response.text()
  const parsedResult: MediaUploadResult = rawText
    ? JSON.parse(rawText)
    : { uploaded: [], errors: [], count: 0 }

  if (!response.ok) {
    throw new Error((parsedResult as unknown as Record<string, string>).message ?? "Upload failed")
  }
  return parsedResult
}

/** Delete an uploaded media file */
export function apiDeleteMedia(path: string) {
  return apiFetch<{ message: string }>(`/api/media/delete.php?path=${encodeURIComponent(path)}`, {
    method: "DELETE",
  })
}

// ─── Auth ─────────────────────────────────────────────────────────

export interface LoginResponse {
  message: string
  user: {
    id: number
    username: string
    fullName: string
    profilePicture?: string | null
    email: string
    role: string
  }
}

/** Authenticate an admin user against the backend */
export function apiLogin(email: string, password: string) {
  return apiFetch<LoginResponse>("/api/auth/login.php", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

// ─── Admin data-fetching helpers ──────────────────────────────────

import type {
  Inquiry,
  ActivityLogEntry,
  AdminSettings,
  PageView,
  DailyVisit,
  TopDestination,
} from "@/lib/data/admin-data"

export type { CMSPost } from "@/lib/data/admin-data"
import type { CMSPost } from "@/lib/data/admin-data"

/** Fetch CMS posts, optionally filtered by publication status */
export function apiFetchPosts(status?: string) {
  const queryString = status ? `?status=${status}` : ""
  return apiFetch<CMSPost[]>(`/api/posts/read.php${queryString}`)
}

/** Fetch inquiries, optionally filtered by status (unread/in-progress/etc.) */
export function apiFetchInquiries(status?: string) {
  const queryString = status ? `?status=${status}` : ""
  return apiFetch<Inquiry[]>(`/api/inquiries/read.php${queryString}`)
}

/** Fetch recent activity log entries (admin actions, logins, page views) */
export function apiFetchActivityLog(limit = 100) {
  return apiFetch<ActivityLogEntry[]>(
    `/api/activity/read.php?limit=${limit}`,
  )
}

/** Fetch site-wide settings (general + hero configuration) */
export function apiFetchSettings() {
  return apiFetch<AdminSettings>("/api/settings/read.php")
}

/** Fetch page-level view counts for the analytics dashboard */
export function apiFetchPageViews() {
  return apiFetch<PageView[]>("/api/analytics/pageviews.php")
}

/** Fetch daily visit totals over the last N days (default 30) */
export function apiFetchDailyVisits(days = 30) {
  return apiFetch<DailyVisit[]>(`/api/analytics/visits.php?days=${days}`)
}

/**
 * Log a destination click.
 * Called on the public site when a visitor navigates to a destination page.
 * Sends a lightweight POST with the destination's content_id.
 */
export function apiLogDestinationView(
  contentId: number,
  sessionId?: string,
) {
  return apiFetch<{ message: string }>("/api/analytics/log-view.php", {
    method: "POST",
    body: JSON.stringify({ contentId, sessionId }),
  })
}

/**
 * Fetch the top N most-clicked destinations (default 10, max 50).
 * Used by the admin analytics dashboard.
 */
export function apiFetchTopDestinations(limit = 10) {
  return apiFetch<TopDestination[]>(
    `/api/analytics/top-destinations.php?limit=${limit}`,
  )
}

// ─── Page Heroes (per-page hero image/text CMS) ──────────────────

export interface PageHeroData {
  slug: string
  displayName: string
  imageUrl: string
  iconName: string
  accentColor: string
  label: string
  title: string
  description: string
}

/** Fetch all page hero configurations */
export function apiFetchAllPageHeroes() {
  return apiFetch<PageHeroData[]>("/api/heroes/read.php")
}

/** Fetch a single page hero by slug (with cache-busting timestamp) */
export function apiFetchPageHero(slug: string) {
  return apiFetch<PageHeroData>(
    `/api/heroes/read.php?slug=${encodeURIComponent(slug)}&_t=${Date.now()}`,
  )
}

/** Update a page hero (admin) */
export function apiUpdatePageHero(slug: string, data: Partial<PageHeroData>) {
  return apiFetch<{ message: string; hero: PageHeroData }>(
    `/api/heroes/update.php?slug=${encodeURIComponent(slug)}`,
    { method: "POST", body: JSON.stringify(data) },
  )
}

// ─── Posts CRUD ───────────────────────────────────────────────────

/** Create a new CMS post (place, news, or event) */
export function apiCreatePost(postData: Partial<CMSPost>) {
  return apiFetch<{ message: string; post: CMSPost }>("/api/posts/create.php", {
    method: "POST",
    body: JSON.stringify(postData),
  })
}

/** Update an existing CMS post by ID */
export function apiUpdatePost(id: string, postData: Partial<CMSPost>) {
  return apiFetch<{ message: string; post: CMSPost }>(`/api/posts/update.php?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(postData),
  })
}

/** Permanently delete a CMS post */
export function apiDeletePost(id: string) {
  return apiFetch<{ message: string }>(`/api/posts/delete.php?id=${id}`, {
    method: "DELETE",
  })
}

// ─── Inquiries CRUD ───────────────────────────────────────────────

/** Update an inquiry's status or details (admin) */
export function apiUpdateInquiry(id: string, inquiryData: Partial<Inquiry>) {
  // Convert camelCase frontend fields to the snake_case the PHP backend expects
  const payload: Record<string, unknown> = {}
  if (inquiryData.status !== undefined) payload.status = inquiryData.status
  if (inquiryData.assignedTo !== undefined) payload.assigned_to = inquiryData.assignedTo
  if (inquiryData.replyText !== undefined) payload.reply_text = inquiryData.replyText
  if (inquiryData.repliedAt !== undefined) payload.replied_at = inquiryData.repliedAt
  if (inquiryData.repliedBy !== undefined) payload.replied_by = inquiryData.repliedBy

  // If the only fields are reply-related (already saved via apiReplyInquiry), skip the API call
  const hasNonReplyField = payload.status !== undefined || payload.assigned_to !== undefined
  if (!hasNonReplyField) return Promise.resolve({ message: "Local update only", inquiry: {} as Inquiry })

  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries/update.php?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

/** Permanently delete an inquiry */
export function apiDeleteInquiry(id: string) {
  return apiFetch<{ message: string }>(`/api/inquiries/delete.php?id=${id}`, {
    method: "DELETE",
  })
}

export function apiReplyInquiry(id: string, replyText: string, repliedBy?: string) {
  // Sends GET /api/inquiries/reply.php?id=... → PHP saves reply_text, replied_at, replied_by
  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries/reply.php?id=${id}`, {
    method: "POST",
    body: JSON.stringify({ reply_text: replyText, replied_by: repliedBy ?? "Admin" }),
  })
}

/** Assign an inquiry to a tourist guide — sets status to 'assigned' and saves guide name */
export function apiAssignInquiry(id: string, assignedTo: string) {
  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries/update.php?id=${id}`, {
    method: "POST",
    body: JSON.stringify({ status: "assigned", assigned_to: assignedTo }),
  })
}

// ─── Public Inquiry (tourist site form) ───────────────────────────

export interface CreateInquiryPayload {
  name: string
  email: string
  contactNumber?: string
  inquiryType?: string
  /** Alias for inquiryType, accepted by the backend */
  purpose?: string
  dateOfVisit?: string
  numberOfPax?: number
  message: string
  additionalDetails?: Record<string, unknown>
}

/** Submit a new public inquiry from the tourist-facing form */
export function apiCreateInquiry(inquiryData: CreateInquiryPayload) {
  return apiFetch<{ message: string }>("/api/inquiries/create.php", {
    method: "POST",
    body: JSON.stringify(inquiryData),
  })
}

// ─── Settings CRUD ────────────────────────────────────────────────

/** Persist changes to site-wide settings */
export function apiUpdateSettings(settingsData: Partial<AdminSettings>) {
  return apiFetch<{ message: string; settings: AdminSettings }>("/api/settings/update.php", {
    method: "PUT",
    body: JSON.stringify(settingsData),
  })
}

// ─── Activity Log ─────────────────────────────────────────────────

/** Record an admin activity (e.g. login, post update) to the audit log */
export function apiLogActivity(action: string, description: string) {
  return apiFetch<ActivityLogEntry>("/api/activity/log.php", {
    method: "POST",
    body: JSON.stringify({ action, description }),
  })
}

// ─── Users / Account Management ───────────────────────────────────

import type { AdminUser } from "@/lib/data/admin-data"

/** Fetch all user accounts (active + optionally archived) */
export function apiFetchUsers(includeArchived = false) {
  const qs = includeArchived ? "?all=1" : ""
  return apiFetch<AdminUser[]>(`/api/users${qs}`)
}

/** Create a new user account */
export function apiCreateUser(data: { fullName: string; email: string; password: string; role: string }) {
  return apiFetch<{ message: string; user: AdminUser }>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/** Update an existing user account */
export function apiUpdateUser(id: number, data: Record<string, unknown>) {
  return apiFetch<{ message: string; user: AdminUser }>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/** Archive (soft-delete) a user account */
export function apiArchiveUser(id: number) {
  return apiFetch<{ message: string }>(`/api/users/${id}`, {
    method: "DELETE",
  })
}

/** Restore an archived user account */
export function apiRestoreUser(id: number) {
  return apiFetch<{ message: string }>(`/api/users/${id}/restore`, {
    method: "PUT",
  })
}

/** Change password (requires current password verification) */
export function apiChangePassword(id: number, oldPassword: string, newPassword: string) {
  return apiFetch<{ message: string }>(`/api/users/${id}/change-password`, {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  })
}

/** Update own profile (name, profile picture) */
export function apiUpdateProfile(id: number, data: { full_name?: string; profile_picture?: string | null }) {
  return apiFetch<{ message: string; user: AdminUser }>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ─── Public content endpoints (for tourist site) ──────────────────

export interface FeaturedContent {
  featuredId: number
  contentId: string | null
  section: "spotlight" | "landmark"
  title: string
  description: string
  image: string | null
  postType: string | null
  location: string | null
  category: string | null
  date: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  milestoneId: number
  year: string
  title: string
  description: string
  detail: string
  side: "left" | "right"
  sortOrder: number
  isActive?: boolean
}

export interface HeroSettings {
  settingId: number
  subtitle: string
  title: string
  highlight: string
  description: string
  videoUrl: string
  fallbackImage: string
  ctaText: string
  ctaLink: string
  updatedAt?: string
}

export interface NewsArticleAPI {
  id: string
  title: string
  body: string
  label: string
  postType: string
  status: string
  image: string[]
  newsDate: string | null
  createdAt: string
  updatedAt: string
  isFeatured: boolean
}

// ─── Spotlight (featured_content where section='spotlight') ───────

export function apiFetchSpotlight() {
  return apiFetch<FeaturedContent | null>("/api/home/spotlight.php")
}

export function apiFetchAllSpotlights() {
  return apiFetch<(FeaturedContent & Spotlight)[]>("/api/home/spotlight.php?all=1")
}

export function apiCreateSpotlight(data: { contentId?: string; isActive?: boolean }) {
  return apiFetch<{ message: string; featuredId: number }>("/api/home/spotlight.php", {
    method: "POST", body: JSON.stringify(data),
  })
}

export function apiUpdateSpotlight(id: number, data: { contentId?: string; isActive?: boolean }) {
  return apiFetch<{ message: string }>(`/api/home/spotlight.php?id=${id}`, {
    method: "PUT", body: JSON.stringify(data),
  })
}

export function apiDeleteSpotlight(id: number) {
  return apiFetch<{ message: string }>(`/api/home/spotlight.php?id=${id}`, { method: "DELETE" })
}

// ─── Milestones ───────────────────────────────────────────────────

export function apiFetchMilestones() {
  return apiFetch<Milestone[]>("/api/home/milestones.php")
}

export function apiFetchAllMilestones() {
  return apiFetch<Milestone[]>("/api/home/milestones.php?all=1")
}

export function apiCreateMilestone(data: Partial<Milestone>) {
  return apiFetch<{ message: string; milestoneId: number }>("/api/home/milestones.php", {
    method: "POST", body: JSON.stringify(data),
  })
}

export function apiUpdateMilestone(id: number, data: Partial<Milestone>) {
  return apiFetch<{ message: string }>(`/api/home/milestones.php?id=${id}`, {
    method: "PUT", body: JSON.stringify(data),
  })
}

export function apiDeleteMilestone(id: number) {
  return apiFetch<{ message: string }>(`/api/home/milestones.php?id=${id}`, { method: "DELETE" })
}

export function apiReorderMilestones(order: number[]) {
  return apiFetch<{ message: string }>("/api/home/milestones.php", {
    method: "PATCH", body: JSON.stringify({ order }),
  })
}

// ─── Public content fetches ───────────────────────────────────────

/** Fetch the published news articles, optionally limited */
export function apiFetchPublishedNews(limit?: number) {
  const queryString = limit ? `?type=news&limit=${limit}` : "?type=news"
  return apiFetch<NewsArticleAPI[]>(`/api/posts/read.php${queryString}`)
}

/** Fetch the published events, optionally limited */
export function apiFetchPublishedEvents(limit?: number) {
  const queryString = limit ? `?type=events&limit=${limit}` : "?type=events"
  return apiFetch<NewsArticleAPI[]>(`/api/posts/read.php${queryString}`)
}

/** Fetch published place posts for the public site */
export function apiFetchPublishedPlaces(limit?: number) {
  const queryString = limit ? `?type=places&limit=${limit}` : "?type=places"
  return apiFetch<CMSPost[]>(`/api/posts/read.php${queryString}`)
}

export function apiFetchPostById(id: string) {
  return apiFetch<CMSPost>(`/api/posts/read.php?id=${id}`)
}

/** Fetch published posts by label key (e.g. 'local-cuisine', 'destinations', 'festivals') */
export function apiFetchByLabel(label: string, limit?: number) {
  const params = new URLSearchParams({ label, status: "published" })
  if (limit) params.set("limit", String(limit))
  return apiFetch<CMSPost[]>(`/api/posts/read.php?${params}`)
}

/** Fetch published posts by category key (e.g. 'history', 'arts-culture', 'tourist-destinations') */
export function apiFetchByCategory(category: string, limit?: number) {
  const params = new URLSearchParams({ category, status: "published" })
  if (limit) params.set("limit", String(limit))
  return apiFetch<CMSPost[]>(`/api/posts/read.php?${params}`)
}

// ─── Featured posts by label / category (for navbar dropdowns) ────

/** Fetch featured posts, optionally filtered by label key (e.g. 'local-cuisine', 'destinations') */
export function apiFetchFeaturedByLabel(label?: string, limit?: number) {
  const params = new URLSearchParams({ featured: "1" })
  if (label) params.set("label", label)
  if (limit) params.set("limit", String(limit))
  return apiFetch<CMSPost[]>(`/api/posts/read.php?${params}`)
}

/** Fetch featured posts, filtered by category key (e.g. 'arts-culture', 'tourist-destinations') */
export function apiFetchFeaturedByCategory(category: string, limit?: number) {
  const params = new URLSearchParams({ featured: "1", category })
  if (limit) params.set("limit", String(limit))
  return apiFetch<CMSPost[]>(`/api/posts/read.php?${params}`)
}

// ─── Hero Settings (now stored in site_settings) ──────────────────

export function apiFetchHeroSettings() {
  return apiFetch<HeroSettings | null>("/api/home/hero-settings.php")
}

export function apiUpdateHeroSettings(data: Partial<HeroSettings>) {
  return apiFetch<{ message: string }>("/api/home/hero-settings.php", {
    method: "PUT", body: JSON.stringify(data),
  })
}

// ─── Legacy type aliases (backward compat for tourist site) ───────
// These map to the new unified types so existing tourist-site
// components continue to work without any changes.

/** @deprecated Use HeroSettings — hero is now a single video, not slides */
export interface HeroSlide {
  slideId: number
  src: string
  alt: string
  subtitle: string
  title: string
  highlight: string
  description: string
  href: string
  sortOrder: number
  isActive?: boolean
}

/** @deprecated Culinary items are auto-pulled from CMS label 'local-cuisine' */
export interface CulinaryItem {
  itemId: number
  title: string
  description: string
  image: string
  tag: string
  sortOrder: number
  isActive?: boolean
}

/** @deprecated Use FeaturedContent — spotlights now live in featured_content */
export type Spotlight = {
  spotlightId: number
  contentId?: string
  title: string
  description: string
  image: string | null
  date: string | null
  location: string | null
  isActive?: boolean
}

/** @deprecated Use FeaturedContent — landmarks now live in featured_content */
export type FeaturedLandmark = {
  landmarkId: number
  contentId?: string
  placeId?: string
  title: string
  description: string
  image: string
  category: string
  sortOrder: number
  isActive?: boolean
}

/** @deprecated Hero is now a single video — returns synthesized single-item array from site_settings */
export function apiFetchHeroSlides() {
  return apiFetch<HeroSlide[]>("/api/home/hero.php")
}

/** @deprecated Culinary items auto-fetched from CMS label 'local-cuisine' */
export async function apiFetchCulinaryItems(): Promise<CulinaryItem[]> {
  const posts = await apiFetchByLabel("local-cuisine");
  return posts.map((post) => ({
    itemId: Number(post.id),
    title: post.title,
    description: post.body,
    image: Array.isArray(post.image) ? post.image[0] ?? "" : "",
    tag: post.label,
    sortOrder: 0,
    isActive: post.status === "published",
  }));
}

// Legacy admin CRUD stubs — kept for backward compat with admin page.
// Hero CRUD calls the hero.php endpoint which now reads from site_settings.
// Culinary CRUD calls culinary.php which now reads from CMS.

/** @deprecated */
export function apiFetchAllHeroSlides() {
  return apiFetch<HeroSlide[]>("/api/home/hero.php?all=1")
}
/** @deprecated */
export async function apiFetchAllCulinaryItems(): Promise<CulinaryItem[]> {
  const posts = await apiFetchByLabel("local-cuisine");
  return posts.map((post) => ({
    itemId: Number(post.id),
    title: post.title,
    description: post.body,
    image: Array.isArray(post.image) ? post.image[0] ?? "" : "",
    tag: post.label,
    sortOrder: 0,
    isActive: post.status === "published",
  }));
}
/** @deprecated Hero is now a single video section in site_settings */
export function apiCreateHeroSlide(data: Partial<HeroSlide>) {
  return apiFetch<{ message: string; slideId: number }>("/api/home/hero.php", {
    method: "POST", body: JSON.stringify(data),
  })
}
/** @deprecated */
export function apiUpdateHeroSlide(id: number, data: Partial<HeroSlide>) {
  return apiFetch<{ message: string }>(`/api/home/hero.php?id=${id}`, {
    method: "PUT", body: JSON.stringify(data),
  })
}
/** @deprecated */
export function apiDeleteHeroSlide(id: number) {
  return apiFetch<{ message: string }>(`/api/home/hero.php?id=${id}`, { method: "DELETE" })
}
/** @deprecated Culinary items managed via CMS posts */
export function apiCreateCulinaryItem(_data: Partial<CulinaryItem>) {
  throw new Error("Culinary items are now managed via CMS posts")
}
/** @deprecated */
export function apiUpdateCulinaryItem(_id: number, _data: Partial<CulinaryItem>) {
  throw new Error("Culinary items are now managed via CMS posts")
}
/** @deprecated */
export function apiDeleteCulinaryItem(_id: number) {
  throw new Error("Culinary items are now managed via CMS posts")
}
