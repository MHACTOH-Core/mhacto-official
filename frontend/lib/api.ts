/**
 * api.ts — Centralised API client for the PHP backend.
 *
 * Every backend call goes through `apiFetch` so you only configure
 * the base URL once and get consistent error handling everywhere.
 *
 * The base URL defaults to empty in development (requests are proxied by
 * Next.js rewrites to avoid CORS) and can be overridden via
 * the NEXT_PUBLIC_API_URL environment variable for production.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? ""

// ─── Lightweight in-memory cache for public GET requests ─────────
// Prevents re-fetching the same data on SPA navigation (stale-while-revalidate).
// Only caches unauthenticated GET requests. Mutations bypass the cache.

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
}

const _apiCache = new Map<string, CacheEntry>()
/** Default TTL: 60 seconds — stale data is served while revalidating */
const CACHE_TTL_MS = 60_000

// ─── In-flight request deduplication ────────────────────────────
// When multiple components simultaneously request the same public URL
// (e.g. the slider AND a section both asking for featured cultural-practices)
// they share a single in-flight Promise instead of making separate requests.
// The promise is removed from the map once it settles.
const _inflight = new Map<string, Promise<unknown>>()

/** Return cached data if fresh, otherwise undefined */
function getCached<T>(key: string, ttl: number = CACHE_TTL_MS): T | undefined {
  const entry = _apiCache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.timestamp > ttl) return undefined
  return entry.data as T
}

/** Store data in the cache */
function setCache<T>(key: string, data: T): void {
  _apiCache.set(key, { data, timestamp: Date.now() })
  // Cap cache size to prevent memory leaks on long sessions
  if (_apiCache.size > 200) {
    const firstKey = _apiCache.keys().next().value
    if (firstKey) _apiCache.delete(firstKey)
  }
}

/** Invalidate all cached entries (call after mutations if needed) */
export function clearApiCache(): void {
  _apiCache.clear()
}

// ─── Pagination types ─────────────────────────────────────────────

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  lastPage: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// ─── Auth token management ────────────────────────────────────────

let _authToken: string | null = null
let _onAuthError: (() => void) | null = null
// Holds a single in-flight refresh Promise so concurrent 401s share one refresh request
let _isRefreshing: Promise<boolean> | null = null

/**
 * Thrown when a 401 cannot be recovered (refresh failed or token too old).
 * `_onAuthError` has already been called so the UI is transitioning to login.
 * Callers should silently discard this error rather than showing an error state.
 */
export class AuthExpiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthExpiredError'
  }
}

/** Register a callback invoked when a 401 (token expired/invalid) is received. */
export function onAuthError(cb: (() => void) | null) {
  _onAuthError = cb
}

/** Store the JWT token (called after login) */
export function setAuthToken(token: string | null) {
  _authToken = token
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("admin_token", token)
    } else {
      localStorage.removeItem("admin_token")
    }
  }
}

/** Restore token from localStorage (call on mount). */
export function restoreAuthToken(): string | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("admin_token")
  if (stored) _authToken = stored
  return _authToken
}

/** Retrieve the current JWT token */
export function getAuthToken(): string | null {
  if (_authToken) return _authToken
  if (typeof window !== "undefined") {
    _authToken = localStorage.getItem("admin_token")
  }
  return _authToken
}

/** Attempt to silently refresh the JWT. Returns true if refreshed. */
async function tryRefreshToken(): Promise<boolean> {
  const token = getAuthToken()
  if (!token) return false
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!res.ok) return false
    const body = await res.json()
    if (body.success && body.data?.token) {
      setAuthToken(body.data.token)
      return true
    }
    return false
  } catch {
    return false
  }
}

// ─── Generic fetch wrapper ────────────────────────────────────────

export interface ApiFetchOptions extends RequestInit {
  /** When true, skip attaching the JWT Authorization header (for public endpoints). */
  skipAuth?: boolean
  /** Custom cache TTL in milliseconds for public GET requests. Defaults to 60 s. */
  cacheTtl?: number
}

// ── Private helpers (keep apiFetch as a thin orchestrator) ────────

/** Build the versioned absolute URL for a given endpoint. */
function _buildUrl(endpoint: string): string {
  const versioned = endpoint.startsWith("/api/") && !endpoint.startsWith("/api/v1/")
    ? `/api/v1/${endpoint.slice(5)}`
    : endpoint
  return `${API_BASE}${versioned}`
}

/** Build request headers — Content-Type for body requests, JWT when present. */
function _buildHeaders(
  options: ApiFetchOptions,
  token: string | null,
): Record<string, string> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  // Only set Content-Type when a body is present (avoids unnecessary CORS preflight on GETs)
  if (options.body) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

/** Parse the raw response text into the standard envelope shape. */
function _parseJsonResponse<T>(
  rawText: string,
  endpoint: string,
): { success?: boolean; data?: T; error?: string; message?: string } {
  try {
    return rawText ? JSON.parse(rawText) : {}
  } catch {
    throw new Error(`Invalid JSON response from ${endpoint}`)
  }
}

/** Unwrap the { success, data } envelope; fall back to the raw object for non-enveloped responses. */
function _unwrapEnvelope<T>(
  envelope: { success?: boolean; data?: T; error?: string; message?: string },
): T {
  if (envelope.success !== undefined && "data" in envelope) {
    return envelope.data as T
  }
  return envelope as unknown as T
}

/**
 * Handle a 401 response: attempt a silent token refresh and retry.
 * Returns true if the caller should retry; throws AuthExpiredError if not.
 */
async function _handle401(skipAuth: boolean, errMsg: string): Promise<boolean> {
  if (skipAuth) return false
  const currentToken = getAuthToken()
  if (currentToken) {
    // Deduplicate: concurrent 401s share a single refresh request
    if (!_isRefreshing) _isRefreshing = tryRefreshToken()
    const refreshed = await _isRefreshing
    _isRefreshing = null
    if (refreshed) return true // caller should retry with new token
    setAuthToken(null)
  }
  _onAuthError?.()
  throw new AuthExpiredError(errMsg)
}

// ─────────────────────────────────────────────────────────────────

/** Retry a fetch up to `retries` times on transient network errors.
 *  HTTP error responses (4xx/5xx) are NOT retried — only thrown `TypeError`
 *  from `fetch()` itself (connection reset, DNS failure, proxy drop, etc.). */
async function _fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, init)
    } catch (err) {
      lastError = err
      console.warn(
        `[apiFetch] attempt ${attempt + 1}/${retries + 1} failed for ${url}:`,
        err,
      )
      if (attempt >= retries) {
        const detail = err instanceof Error ? err.message : String(err)
        throw new Error(
          `Network error — backend may be unavailable (${detail})`,
        )
      }
      // Exponential back-off: 500 ms, 1 000 ms
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
}

/**
 * Centralised fetch wrapper. All backend calls go through here
 * for consistent URL resolution, JSON parsing, and error handling.
 * Automatically attaches the JWT Authorization header when a token is set.
 * Endpoints starting with /api/ are automatically versioned to /api/v1/.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const url = _buildUrl(endpoint)
  const method = (options.method ?? "GET").toUpperCase()
  const { skipAuth, ...fetchOptions } = options
  const token = skipAuth ? null : getAuthToken()
  const isCacheableGet = method === "GET" && !token && !options.body

  // ── Cache & in-flight deduplication (public GETs only) ──────────
  if (isCacheableGet) {
    const cached = getCached<T>(url, options.cacheTtl)
    if (cached !== undefined) return cached

    const existing = _inflight.get(url)
    if (existing) return existing as Promise<T>
  }

  const headers = _buildHeaders(options, token)

  // ── Cacheable GET path: wrap in deduplication map ───────────────
  if (isCacheableGet) {
    const inflightPromise = (async (): Promise<T> => {
      try {
        const res = await _fetchWithRetry(url, { ...fetchOptions, cache: "no-store", headers })

        const envelope = _parseJsonResponse<T>(await res.text(), endpoint)

        if (!res.ok) {
          const errMsg = envelope.error ?? envelope.message ?? `Request failed (${res.status})`
          if (res.status === 401) {
            _inflight.delete(url)
            const shouldRetry = await _handle401(skipAuth ?? false, errMsg)
            if (shouldRetry) return apiFetch<T>(endpoint, options)
          }
          throw new Error(errMsg)
        }

        const result = _unwrapEnvelope<T>(envelope)
        setCache(url, result)
        return result
      } finally {
        _inflight.delete(url)
      }
    })()
    _inflight.set(url, inflightPromise as Promise<unknown>)
    return inflightPromise
  }

  // ── Standard (authenticated / mutation) path ────────────────────
  const response = await _fetchWithRetry(url, { ...fetchOptions, cache: "no-store", headers })

  const envelope = _parseJsonResponse<T>(await response.text(), endpoint)

  if (!response.ok) {
    const errorMessage = envelope.error ?? envelope.message ?? `Request failed (${response.status})`
    if (response.status === 401) {
      const shouldRetry = await _handle401(skipAuth ?? false, errorMessage)
      if (shouldRetry) return apiFetch<T>(endpoint, options)
    }
    throw new Error(errorMessage)
  }

  return _unwrapEnvelope<T>(envelope)
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
  return apiFetch<MediaListResponse>(`/api/media?type=${type}`)
}

/** Upload one or more files. Uses FormData (multipart). */
export async function apiUploadMedia(
  files: File[],
  type: "image" | "video" = "image",
  options?: { category?: string; label?: string; subfolder?: string },
): Promise<MediaUploadResult> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files[]", file))

  const params = new URLSearchParams({ type })
  if (options?.category) params.set("category", options.category)
  if (options?.label) params.set("label", options.label)
  if (options?.subfolder) params.set("subfolder", options.subfolder)

  const uploadUrl = `${API_BASE}/api/media?${params.toString()}`
  // Reuse _buildHeaders without Content-Type (FormData sets its own multipart boundary)
  const uploadHeaders = _buildHeaders({ body: undefined }, getAuthToken())

  const response = await fetch(uploadUrl, { method: "POST", body: formData, headers: uploadHeaders })
  const rawText = await response.text()
  const envelope: { success?: boolean; data?: MediaUploadResult; error?: string } = rawText
    ? JSON.parse(rawText)
    : {}

  if (!response.ok) {
    if (response.status === 401) {
      const shouldRetry = await _handle401(false, envelope.error ?? "Upload failed")
      if (shouldRetry) return apiUploadMedia(files, type, options)
    }
    throw new Error(envelope.error ?? "Upload failed")
  }
  return (envelope.data ?? envelope) as MediaUploadResult
}

/** Delete an uploaded media file */
export function apiDeleteMedia(path: string) {
  return apiFetch<{ message: string }>(`/api/media?path=${encodeURIComponent(path)}`, {
    method: "DELETE",
  })
}

/** A single usage record — either a CMS content item or a site config entry */
export interface MediaUsageItem {
  type: "content" | "config"
  // content
  content_id?: number
  title?: string
  post_type?: string
  status?: string
  // config
  config_key?: string
  config_group?: string
  label?: string
}

/**
 * Fetch which content items / settings reference a given media file.
 * - Pass `path` (e.g. `/uploads/images/foo.jpg`) for a single file.
 * - Omit `path` to get a bulk map of all referenced URLs → their usages.
 */
export async function apiGetMediaUsages(path?: string): Promise<Record<string, MediaUsageItem[]>> {
  if (path) {
    const data = await apiFetch<{ path: string; usages: MediaUsageItem[]; count: number }>(
      `/api/media/usages?path=${encodeURIComponent(path)}`
    )
    return { [path]: data.usages ?? [] }
  }
  const data = await apiFetch<{ usageMap: Record<string, MediaUsageItem[]> }>("/api/media/usages")
  return data.usageMap ?? {}
}

// ─── Auth ─────────────────────────────────────────────────────────

export interface LoginResponse {
  message: string
  token: string
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
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

/** Verify the stored JWT with the backend. Returns user data or null. */
export async function apiVerifyAuth(): Promise<LoginResponse["user"] | null> {
  const token = restoreAuthToken()
  if (!token) return null
  try {
    const res = await apiFetch<{ user: LoginResponse["user"] }>("/api/auth/me")
    return res.user
  } catch {
    // Token invalid/expired — clear it
    setAuthToken(null)
    return null
  }
}

// ─── Admin data-fetching helpers ──────────────────────────────────

import type {
  Inquiry,
  ActivityLogEntry,
  AdminSettings,
  PageView,
  DailyVisit,
  TopDestination,
  TourGuide,
  TourGuideAppointment,
} from "@/lib/data/admin-data"

export type { CMSPost } from "@/lib/data/admin-data"
import type { CMSPost } from "@/lib/data/admin-data"

/** Fetch CMS posts, optionally filtered by publication status */
export function apiFetchPosts(status?: string) {
  const queryString = status ? `?status=${status}` : ""
  return apiFetch<CMSPost[]>(`/api/posts${queryString}`)
}

/** Search published posts by title/description keyword */
export function apiFetchSearch(query: string, limit = 12, signal?: AbortSignal) {
  const params = new URLSearchParams({ search: query, limit: String(limit) })
  return apiFetch<CMSPost[]>(`/api/posts?${params}`, { cacheTtl: 10_000, signal })
}

/** Fetch inquiries, optionally filtered by status (unread/in-progress/etc.) */
export function apiFetchInquiries(status?: string) {
  const queryString = status ? `?status=${status}` : ""
  return apiFetch<Inquiry[]>(`/api/inquiries${queryString}`)
}

/** Fetch recent activity log entries (admin actions, logins, page views) */
export function apiFetchActivityLog(limit = 100) {
  return apiFetch<ActivityLogEntry[]>(
    `/api/activity?limit=${limit}`,
  )
}

/** Fetch site-wide settings (general + hero configuration) */
export function apiFetchSettings() {
  return apiFetch<AdminSettings>("/api/settings", { skipAuth: true })
}

/** Fetch page-level view counts for the analytics dashboard */
export function apiFetchPageViews() {
  return apiFetch<PageView[]>("/api/analytics/content-stats")
}

export interface AllPageViewsFilter {
  sortBy?: "views" | "title" | "category"
  sortOrder?: "ASC" | "DESC"
  startDate?: string
  endDate?: string
}

/** Fetch all page views with optional sorting and date filtering (for analytics detail modal) */
export function apiFetchAllPageViews(filters: AllPageViewsFilter = {}) {
  const params = new URLSearchParams({ all: "1" })
  if (filters.sortBy) params.set("sort_by", filters.sortBy)
  if (filters.sortOrder) params.set("sort_order", filters.sortOrder)
  if (filters.startDate) params.set("start_date", filters.startDate)
  if (filters.endDate) params.set("end_date", filters.endDate)
  return apiFetch<PageView[]>(`/api/analytics/content-stats?${params}`)
}

/** Fetch daily visit totals over the last N days (default 30) */
export function apiFetchDailyVisits(days = 30) {
  return apiFetch<DailyVisit[]>(`/api/analytics/visits?days=${days}`)
}

// ─── Visitor Summary ───────────────────────────────────────────────

export interface VisitorSummaryTotals {
  walkIns: number
  bookingsCompleted: number
  bookingsPending: number
  guideAssigned: number
}

export interface VisitorDailyRow {
  date: string
  walkIns: number
  bookingsCompleted: number
  bookingsPending: number
  guideAssigned: number
}

export interface VisitorSummary {
  totals: VisitorSummaryTotals
  daily: VisitorDailyRow[]
}

/** Fetch visitor engagement summary (walk-ins, bookings, assignments) */
export function apiFetchVisitorSummary(days = 30) {
  return apiFetch<VisitorSummary>(`/api/analytics/visitor-summary?days=${days}`)
}

/** Combined analytics fetch — pageviews + daily visits + visitor summary in one request */
export interface AnalyticsDashboardData {
  pageViews: PageView[]
  dailyVisits: DailyVisit[]
  visitorSummary: VisitorSummary
}

export function apiFetchAnalyticsDashboard(days = 30) {
  return apiFetch<AnalyticsDashboardData>(`/api/analytics/dashboard?days=${days}`)
}

// ─── Visitor Engagement Details ───────────────────────────────────

export interface VisitorDetail {
  id: number
  fullName: string
  touristName: string | null
  email: string
  contactNumber: string | null
  type: string
  status: string
  pax: number | null
  dateOfVisit: string | null
  confirmedDate: string | null
  assignedGuide: string | null
  message: string | null
  createdAt: string
}

export interface VisitorDetailsFilter {
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
  startDate?: string
  endDate?: string
  type?: string
  status?: string
}

/** Fetch detailed per-person visitor engagement list */
export function apiFetchVisitorDetails(filters: VisitorDetailsFilter = {}) {
  const params = new URLSearchParams()
  if (filters.sortBy) params.set("sort_by", filters.sortBy)
  if (filters.sortOrder) params.set("sort_order", filters.sortOrder)
  if (filters.startDate) params.set("start_date", filters.startDate)
  if (filters.endDate) params.set("end_date", filters.endDate)
  if (filters.type) params.set("type", filters.type)
  if (filters.status) params.set("status", filters.status)
  return apiFetch<VisitorDetail[]>(`/api/analytics/visitor-details?${params}`)
}

// ─── MHACTO Office Content ────────────────────────────────────────

export interface OrgStructureItem {
  name: string
  role: string
  note: string
}

export interface ProgramItem {
  title: string
  description: string
  badge: string
  badgeColor: string
}

export interface CoreValueItem {
  title: string
  description: string
}

export interface OfficeContent {
  aboutP1: string
  aboutP2: string
  mission: string
  vision: string
  coreValues: CoreValueItem[]
  objectives: string[]
  orgStructure: OrgStructureItem[]
  programs: ProgramItem[]
}

/** Fetch all MHACTO Office page content (public) */
export function apiFetchOfficeContent() {
  return apiFetch<OfficeContent>("/api/office", { skipAuth: true })
}

/** Update MHACTO Office page content (admin only) */
export function apiUpdateOfficeContent(data: Partial<OfficeContent>) {
  return apiFetch<{ message: string; content: OfficeContent }>("/api/office", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * Log a destination click.
 * Called on the public site when a visitor navigates to a destination page.
 * Sends a lightweight POST with the destination's content_id and current path.
 */
export function apiLogDestinationView(
  contentId: number,
  sessionId?: string,
  pagePath?: string,
) {
  return apiFetch<{ message: string }>("/api/analytics/log-view", {
    method: "POST",
    body: JSON.stringify({ contentId, sessionId, pagePath }),
    skipAuth: true,
  })
}

/**
 * Fetch the top N most-clicked destinations (default 10, max 50).
 * Used by the admin analytics dashboard.
 */
export function apiFetchTopDestinations(limit = 10) {
  return apiFetch<TopDestination[]>(
    `/api/analytics/top-destinations?limit=${limit}`,
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
  return apiFetch<PageHeroData[]>("/api/heroes")
}

/** Fetch a single page hero by slug (with cache-busting timestamp) */
export function apiFetchPageHero(slug: string) {
  return apiFetch<PageHeroData>(
    `/api/heroes?slug=${encodeURIComponent(slug)}&_t=${Date.now()}`,
  )
}

/** Update a page hero (admin) */
export function apiUpdatePageHero(slug: string, data: Partial<PageHeroData>) {
  return apiFetch<{ message: string; hero: PageHeroData }>(
    `/api/heroes?slug=${encodeURIComponent(slug)}`,
    { method: "PUT", body: JSON.stringify(data) },
  )
}

// ─── Posts CRUD ───────────────────────────────────────────────────

/** Create a new CMS post (place, news, or event) */
export function apiCreatePost(postData: Partial<CMSPost>) {
  return apiFetch<{ message: string; post: CMSPost }>("/api/posts", {
    method: "POST",
    body: JSON.stringify(postData),
  })
}

/** Update an existing CMS post by ID */
export function apiUpdatePost(id: string, postData: Partial<CMSPost>) {
  return apiFetch<{ message: string; post: CMSPost }>(`/api/posts?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(postData),
  })
}

/** Permanently delete a CMS post */
export function apiDeletePost(id: string) {
  return apiFetch<{ message: string }>(`/api/posts?id=${id}`, {
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
  if (inquiryData.touristName !== undefined) payload.tourist_name = inquiryData.touristName
  if (inquiryData.replyText !== undefined) payload.reply_text = inquiryData.replyText
  if (inquiryData.repliedAt !== undefined) payload.replied_at = inquiryData.repliedAt
  if (inquiryData.repliedBy !== undefined) payload.replied_by = inquiryData.repliedBy

  // If the only fields are reply-related (already saved via apiReplyInquiry), skip the API PATCH entirely
  const isReplyOnlyUpdate = payload.status === undefined && payload.assigned_to === undefined && payload.tourist_name === undefined
  if (isReplyOnlyUpdate) return Promise.resolve({ message: "Local update only", inquiry: {} as Inquiry })

  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

/** Permanently delete an inquiry */
export function apiDeleteInquiry(id: string) {
  return apiFetch<{ message: string }>(`/api/inquiries?id=${id}`, {
    method: "DELETE",
  })
}

export function apiReplyInquiry(id: string, replyText: string, repliedBy?: string) {
  // Sends POST /api/inquiries/{id}/reply → PHP saves reply_text, replied_at, replied_by
  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ reply_text: replyText, replied_by: repliedBy ?? "Admin" }),
  })
}

/** Confirm a tour — sets confirmed_date, optional guide assignment, status → 'confirmed' */
export function apiConfirmTour(
  id: string,
  confirmedDate: string,
  opts?: { assignedGuideId?: string; touristName?: string }
) {
  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries/${id}/confirm`, {
    method: "POST",
    body: JSON.stringify({
      confirmed_date: confirmedDate,
      assignedGuideId: opts?.assignedGuideId ?? undefined,
      tourist_name: opts?.touristName ?? undefined,
    }),
  })
}

/** Log a walk-in visitor from the admin panel */
export function apiLogWalkIn(walkInData: {
  name: string
  touristName?: string
  email?: string
  contactNumber?: string
  dateOfVisit?: string
  numberOfPax?: number
  message?: string
}) {
  return apiFetch<{ message: string }>("/api/inquiries/walkin", {
    method: "POST",
    body: JSON.stringify(walkInData),
  })
}

// ─── Public Inquiry (tourist site form) ───────────────────────────

export interface CreateInquiryPayload {
  name: string
  touristName?: string
  email: string
  contactNumber?: string
  inquiryType?: string
  /** Alias for inquiryType, accepted by the backend */
  purpose?: string
  dateOfVisit?: string
  numberOfPax?: number
  message: string
  additionalDetails?: Record<string, unknown>
  /** RA 10173 — visitor must consent to data collection */
  consentGiven?: boolean
}

/** Submit a new public inquiry from the tourist-facing form */
export function apiCreateInquiry(inquiryData: CreateInquiryPayload) {
  return apiFetch<{ message: string }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(inquiryData),
  })
}

// ─── Tour Guides CRUD ─────────────────────────────────────────────

/** Fetch all tour guides (?active=1 for available-only) */
export function apiFetchTourGuides(activeOnly = false) {
  const query = activeOnly ? "?active=1" : ""
  return apiFetch<TourGuide[]>(`/api/tour_guides${query}`)
}

/** Create a new tour guide */
export function apiCreateTourGuide(data: {
  fullName: string
  phoneNumber?: string
  organization?: string
  availability?: "available" | "unavailable" | "on_tour"
}) {
  return apiFetch<{ message: string; guide: TourGuide }>("/api/tour_guides", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/** Update an existing tour guide */
export function apiUpdateTourGuide(
  id: string,
  data: Partial<Pick<TourGuide, "fullName" | "phoneNumber" | "organization" | "availability" | "isActive">>
) {
  return apiFetch<{ message: string; guide: TourGuide }>(`/api/tour_guides?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/** Permanently delete a tour guide */
export function apiDeleteTourGuide(id: string) {
  return apiFetch<{ message: string }>(`/api/tour_guides?id=${id}`, {
    method: "DELETE",
  })
}

// ─── Tour Guide Appointments ──────────────────────────────────────

/** Fetch all appointments for a specific guide */
export function apiFetchAppointments(guideId: string) {
  return apiFetch<TourGuideAppointment[]>(`/api/tour_guides/${guideId}/appointments`)
}

/** Create a new appointment for a guide */
export function apiCreateAppointment(
  guideId: string,
  data: { title: string; startDatetime: string; endDatetime: string; notes?: string | null }
) {
  return apiFetch<{ message: string; appointment: TourGuideAppointment }>(
    `/api/tour_guides/${guideId}/appointments`,
    { method: "POST", body: JSON.stringify(data) }
  )
}

/** Update an existing appointment */
export function apiUpdateAppointment(
  guideId: string,
  apptId: string,
  data: Partial<{ title: string; startDatetime: string; endDatetime: string; notes: string | null }>
) {
  return apiFetch<{ message: string; appointment: TourGuideAppointment }>(
    `/api/tour_guides/${guideId}/appointments?apptId=${apptId}`,
    { method: "PUT", body: JSON.stringify(data) }
  )
}

/** Delete an appointment */
export function apiDeleteAppointment(guideId: string, apptId: string) {
  return apiFetch<{ message: string }>(
    `/api/tour_guides/${guideId}/appointments?apptId=${apptId}`,
    { method: "DELETE" }
  )
}

// ─── Settings CRUD ────────────────────────────────────────────────

/** Persist changes to site-wide settings */
export function apiUpdateSettings(settingsData: Partial<AdminSettings>) {
  return apiFetch<{ message: string; settings: AdminSettings }>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(settingsData),
  })
}

// ─── Activity Log ─────────────────────────────────────────────────

/** Record an admin activity (e.g. login, post update) to the audit log */
export function apiLogActivity(action: string, description: string) {
  return apiFetch<ActivityLogEntry>("/api/activity", {
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

/** Archive (soft-delete) a user account. Returns requiresApproval if admin tries to archive a super_admin. */
export function apiArchiveUser(id: number) {
  return apiFetch<{ message: string; requiresApproval?: boolean; requestId?: number }>(`/api/users/${id}`, {
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

/** Fetch per-user notification preferences */
export function apiFetchUserPreferences(id: number) {
  return apiFetch<{ enableEmailNotifications: boolean; enableInquiryAlerts: boolean }>(`/api/users/${id}/preferences`)
}

/** Update per-user notification preferences */
export function apiUpdateUserPreferences(id: number, prefs: { enableEmailNotifications?: boolean; enableInquiryAlerts?: boolean }) {
  return apiFetch<{ message: string; preferences: { enableEmailNotifications: boolean; enableInquiryAlerts: boolean } }>(`/api/users/${id}/preferences`, {
    method: "PUT",
    body: JSON.stringify(prefs),
  })
}

// ─── Archive Requests (approval workflow for archiving super_admins) ──

export interface ArchiveRequest {
  request_id: number
  target_user_id: number
  requested_by: number
  status: "pending" | "approved" | "denied"
  reviewed_by: number | null
  reason: string | null
  created_at: string
  reviewed_at: string | null
  target_name: string
  requester_name: string
  reviewer_name: string | null
}

export function apiFetchArchiveRequests(status: string = "pending") {
  return apiFetch<ArchiveRequest[]>(`/api/users/archive-requests?status=${status}`)
}

export function apiCreateArchiveRequest(targetUserId: number, reason?: string) {
  return apiFetch<{ message: string; requestId: number }>("/api/users/archive-requests", {
    method: "POST",
    body: JSON.stringify({ targetUserId, reason }),
  })
}

export function apiApproveArchiveRequest(requestId: number) {
  return apiFetch<{ message: string }>("/api/users/archive-requests/approve", {
    method: "PUT",
    body: JSON.stringify({ requestId }),
  })
}

export function apiDenyArchiveRequest(requestId: number) {
  return apiFetch<{ message: string }>("/api/users/archive-requests/deny", {
    method: "PUT",
    body: JSON.stringify({ requestId }),
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
  contentId?: string | null
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
  return apiFetch<FeaturedContent | null>("/api/home/spotlight", { cacheTtl: 3_600_000 })
}

export function apiFetchAllSpotlights() {
  return apiFetch<(FeaturedContent & Spotlight)[]>("/api/home/spotlight?all=1")
}

export function apiCreateSpotlight(data: { contentId?: string; isActive?: boolean }) {
  return apiFetch<{ message: string; featuredId: number }>("/api/home/spotlight", {
    method: "POST", body: JSON.stringify(data),
  })
}

export function apiUpdateSpotlight(id: number, data: { contentId?: string; isActive?: boolean }) {
  return apiFetch<{ message: string }>(`/api/home/spotlight?id=${id}`, {
    method: "PUT", body: JSON.stringify(data),
  })
}

export function apiDeleteSpotlight(id: number) {
  return apiFetch<{ message: string }>(`/api/home/spotlight?id=${id}`, { method: "DELETE" })
}

// ─── Milestones ───────────────────────────────────────────────────

export function apiFetchMilestones() {
  return apiFetch<Milestone[]>("/api/home/milestones")
}

export function apiFetchAllMilestones() {
  return apiFetch<Milestone[]>("/api/home/milestones?all=1")
}

export function apiCreateMilestone(data: Partial<Milestone>) {
  return apiFetch<{ message: string; milestoneId: number }>("/api/home/milestones", {
    method: "POST", body: JSON.stringify(data),
  })
}

export function apiUpdateMilestone(id: number, data: Partial<Milestone>) {
  return apiFetch<{ message: string }>(`/api/home/milestones?id=${id}`, {
    method: "PUT", body: JSON.stringify(data),
  })
}

export function apiDeleteMilestone(id: number) {
  return apiFetch<{ message: string }>(`/api/home/milestones?id=${id}`, { method: "DELETE" })
}

export function apiReorderMilestones(order: number[]) {
  return apiFetch<{ message: string }>("/api/home/milestones", {
    method: "PATCH", body: JSON.stringify({ order }),
  })
}

/** Fetch published CMS posts with label 'timeline-of-events' (for admin milestone picker) */
export function apiFetchTimelinePosts() {
  return apiFetch<CMSPost[]>("/api/home/timeline-posts.php")
}

// ─── Public content fetches ───────────────────────────────────────

/** Fetch the published news articles, optionally limited */
export function apiFetchPublishedNews(limit?: number) {
  const queryString = limit ? `?type=news&limit=${limit}` : "?type=news"
  return apiFetch<NewsArticleAPI[]>(`/api/posts${queryString}`)
}

/** Fetch the published events, optionally limited */
export function apiFetchPublishedEvents(limit?: number) {
  const queryString = limit ? `?type=events&limit=${limit}` : "?type=events"
  return apiFetch<NewsArticleAPI[]>(`/api/posts${queryString}`)
}

/** Fetch published place posts for the public site */
export function apiFetchPublishedPlaces(limit?: number) {
  const queryString = limit ? `?type=places&limit=${limit}` : "?type=places"
  return apiFetch<CMSPost[]>(`/api/posts${queryString}`)
}

export function apiFetchPostById(id: string) {
  return apiFetch<CMSPost>(`/api/posts?id=${id}`)
}

/** Fetch published posts by label key (e.g. 'local-cuisine', 'destinations', 'festivals') */
export function apiFetchByLabel(label: string, limit?: number) {
  const params = new URLSearchParams({ label, status: "published" })
  if (limit) params.set("limit", String(limit))
  return apiFetch<CMSPost[]>(`/api/posts?${params}`, { cacheTtl: 600_000 })
}

// ─── Featured posts by label / category (for navbar dropdowns) ────

/** Fetch featured posts, optionally filtered by label key (e.g. 'local-cuisine', 'destinations') */
export function apiFetchFeaturedByLabel(label?: string, limit?: number) {
  const params = new URLSearchParams({ featured: "1" })
  if (label) params.set("label", label)
  if (limit) params.set("limit", String(limit))
  return apiFetch<CMSPost[]>(`/api/posts?${params}`, { cacheTtl: 600_000 })
}

// ─── Hero Settings (now stored in site_settings) ──────────────────

export function apiFetchHeroSettings() {
  return apiFetch<HeroSettings | null>("/api/home/hero-settings", { cacheTtl: 3_600_000 })
}

export function apiUpdateHeroSettings(data: Partial<HeroSettings>) {
  return apiFetch<{ message: string }>("/api/home/hero-settings", {
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
  return apiFetch<HeroSlide[]>("/api/home/hero", { cacheTtl: 3_600_000 })
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
  return apiFetch<HeroSlide[]>("/api/home/hero?all=1")
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
  return apiFetch<{ message: string; slideId: number }>("/api/home/hero", {
    method: "POST", body: JSON.stringify(data),
  })
}
/** @deprecated */
export function apiUpdateHeroSlide(id: number, data: Partial<HeroSlide>) {
  return apiFetch<{ message: string }>(`/api/home/hero?id=${id}`, {
    method: "PUT", body: JSON.stringify(data),
  })
}
/** @deprecated */
export function apiDeleteHeroSlide(id: number) {
  return apiFetch<{ message: string }>(`/api/home/hero?id=${id}`, { method: "DELETE" })
}

