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

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  // Try to parse JSON even for error responses
  const text = await res.text()
  let data: T

  try {
    data = text ? JSON.parse(text) : ({} as T)
  } catch {
    throw new Error(`Invalid JSON response from ${endpoint}`)
  }

  if (!res.ok) {
    const msg =
      (data as Record<string, string>).message ??
      (data as Record<string, string>).error ??
      `Request failed (${res.status})`
    throw new Error(msg)
  }

  return data
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
): Promise<MediaUploadResult> {
  const formData = new FormData()
  files.forEach((f) => formData.append("files[]", f))

  const url = `${API_BASE}/api/media/upload.php?type=${type}`
  const res = await fetch(url, { method: "POST", body: formData })
  const text = await res.text()
  const data: MediaUploadResult = text ? JSON.parse(text) : { uploaded: [], errors: [], count: 0 }

  if (!res.ok) {
    throw new Error((data as unknown as Record<string, string>).message ?? "Upload failed")
  }
  return data
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
    email: string
    role: string
  }
}

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
} from "@/lib/data/admin-data"

export type { CMSPost } from "@/lib/data/admin-data"
import type { CMSPost } from "@/lib/data/admin-data"

export function apiFetchPosts(status?: string) {
  const qs = status ? `?status=${status}` : ""
  return apiFetch<CMSPost[]>(`/api/posts/read.php${qs}`)
}

export function apiFetchInquiries(status?: string) {
  const qs = status ? `?status=${status}` : ""
  return apiFetch<Inquiry[]>(`/api/inquiries/read.php${qs}`)
}

export function apiFetchActivityLog(limit = 100) {
  return apiFetch<ActivityLogEntry[]>(
    `/api/activity/read.php?limit=${limit}`,
  )
}

export function apiFetchSettings() {
  return apiFetch<AdminSettings>("/api/settings/read.php")
}

export function apiFetchPageViews() {
  return apiFetch<PageView[]>("/api/analytics/pageviews.php")
}

export function apiFetchDailyVisits(days = 30) {
  return apiFetch<DailyVisit[]>(`/api/analytics/visits.php?days=${days}`)
}

// ─── Posts CRUD ───────────────────────────────────────────────────

export function apiCreatePost(data: Partial<CMSPost>) {
  return apiFetch<{ message: string; post: CMSPost }>("/api/posts/create.php", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function apiUpdatePost(id: string, data: Partial<CMSPost>) {
  return apiFetch<{ message: string; post: CMSPost }>(`/api/posts/update.php?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function apiDeletePost(id: string) {
  return apiFetch<{ message: string }>(`/api/posts/delete.php?id=${id}`, {
    method: "DELETE",
  })
}

// ─── Inquiries CRUD ───────────────────────────────────────────────

export function apiUpdateInquiry(id: string, data: Partial<Inquiry>) {
  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries/update.php?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function apiDeleteInquiry(id: string) {
  return apiFetch<{ message: string }>(`/api/inquiries/delete.php?id=${id}`, {
    method: "DELETE",
  })
}

export function apiReplyInquiry(id: string, message: string) {
  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries/reply.php?id=${id}`, {
    method: "POST",
    body: JSON.stringify({ message }),
  })
}

// ─── Public Inquiry (tourist site form) ───────────────────────────

export interface CreateInquiryPayload {
  name: string
  email: string
  contactNumber?: string
  purpose?: string
  dateOfVisit?: string
  numberOfPax?: number
  message: string
}

export function apiCreateInquiry(data: CreateInquiryPayload) {
  return apiFetch<{ message: string }>("/api/inquiries/create.php", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// ─── Settings CRUD ────────────────────────────────────────────────

export function apiUpdateSettings(data: Partial<AdminSettings>) {
  return apiFetch<{ message: string; settings: AdminSettings }>("/api/settings/update.php", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ─── Activity Log ─────────────────────────────────────────────────

export function apiLogActivity(action: string, description: string) {
  return apiFetch<ActivityLogEntry>("/api/activity/log.php", {
    method: "POST",
    body: JSON.stringify({ action, description }),
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

// ─── Featured Landmarks (featured_content where section='landmark') ─

export function apiFetchFeaturedLandmarks() {
  return apiFetch<FeaturedContent[]>("/api/home/landmarks.php")
}

export function apiFetchAllFeaturedLandmarks() {
  return apiFetch<(FeaturedContent & FeaturedLandmark)[]>("/api/home/landmarks.php?all=1")
}

export function apiCreateFeaturedLandmark(data: { contentId?: string; sortOrder?: number; isActive?: boolean }) {
  return apiFetch<{ message: string; featuredId: number }>("/api/home/landmarks.php", {
    method: "POST", body: JSON.stringify(data),
  })
}

export function apiUpdateFeaturedLandmark(id: number, data: { contentId?: string; sortOrder?: number; isActive?: boolean }) {
  return apiFetch<{ message: string }>(`/api/home/landmarks.php?id=${id}`, {
    method: "PUT", body: JSON.stringify(data),
  })
}

export function apiDeleteFeaturedLandmark(id: number) {
  return apiFetch<{ message: string }>(`/api/home/landmarks.php?id=${id}`, { method: "DELETE" })
}

export function apiReorderFeaturedLandmarks(order: number[]) {
  return apiFetch<{ message: string }>("/api/home/landmarks.php", {
    method: "PATCH", body: JSON.stringify({ order }),
  })
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

export function apiFetchPublishedNews(limit?: number) {
  const qs = limit ? `?type=news&limit=${limit}` : "?type=news"
  return apiFetch<NewsArticleAPI[]>(`/api/posts/read.php${qs}`)
}

export function apiFetchPublishedEvents(limit?: number) {
  const qs = limit ? `?type=events&limit=${limit}` : "?type=events"
  return apiFetch<NewsArticleAPI[]>(`/api/posts/read.php${qs}`)
}

export function apiFetchPublishedPlaces(limit?: number) {
  const qs = limit ? `?type=places&limit=${limit}` : "?type=places"
  return apiFetch<CMSPost[]>(`/api/posts/read.php${qs}`)
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
export function apiFetchCulinaryItems() {
  return apiFetch<CulinaryItem[]>("/api/home/culinary.php")
}

// Legacy admin CRUD stubs — kept for backward compat with admin page.
// Hero CRUD calls the hero.php endpoint which now reads from site_settings.
// Culinary CRUD calls culinary.php which now reads from CMS.

/** @deprecated */
export function apiFetchAllHeroSlides() {
  return apiFetch<HeroSlide[]>("/api/home/hero.php?all=1")
}
/** @deprecated */
export function apiFetchAllCulinaryItems() {
  return apiFetch<CulinaryItem[]>("/api/home/culinary.php?all=1")
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
/** @deprecated Culinary items auto-pulled from CMS */
export function apiCreateCulinaryItem(data: Partial<CulinaryItem>) {
  return apiFetch<{ message: string; itemId: number }>("/api/home/culinary.php", {
    method: "POST", body: JSON.stringify(data),
  })
}
/** @deprecated */
export function apiUpdateCulinaryItem(id: number, data: Partial<CulinaryItem>) {
  return apiFetch<{ message: string }>(`/api/home/culinary.php?id=${id}`, {
    method: "PUT", body: JSON.stringify(data),
  })
}
/** @deprecated */
export function apiDeleteCulinaryItem(id: number) {
  return apiFetch<{ message: string }>(`/api/home/culinary.php?id=${id}`, { method: "DELETE" })
}
