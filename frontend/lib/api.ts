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
function getCached<T>(key: string): T | undefined {
  const entry = _apiCache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return undefined
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
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
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
  // Auto-version: /api/posts → /api/v1/posts
  const versioned = endpoint.startsWith("/api/") && !endpoint.startsWith("/api/v1/")
    ? `/api/v1/${endpoint.slice(5)}`
    : endpoint
  const url = `${API_BASE}${versioned}`

  // Determine if this is a cacheable public GET (no body, no auth token)
  const method = (options.method ?? "GET").toUpperCase()
  const { skipAuth, ...fetchOptions } = options
  const token = skipAuth ? null : getAuthToken()
  const isCacheableGet = method === "GET" && !token && !options.body

  // Return cached data for public GETs when available
  if (isCacheableGet) {
    const cached = getCached<T>(url)
    if (cached !== undefined) return cached

    // If an identical request is already in-flight, share its promise
    // rather than opening a second connection to the PHP server.
    const existing = _inflight.get(url)
    if (existing) return existing as Promise<T>
  }

  // Only set Content-Type for requests that carry a body (POST/PUT/PATCH).
  // Omitting it on GET avoids unnecessary CORS preflight requests.
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  if (options.body) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
  }

  // Attach JWT token if available (unless skipAuth is set)
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // Register this request as in-flight so simultaneous duplicate calls share it
  let inflightPromise: Promise<T> | null = null
  if (isCacheableGet) {
    inflightPromise = (async () => {
      try {
        const res = await fetch(url, { ...fetchOptions, cache: 'no-store', headers })
        const text = await res.text()
        let env: { success?: boolean; data?: T; error?: string; message?: string }
        try { env = text ? JSON.parse(text) : {} } catch { throw new Error(`Invalid JSON response from ${endpoint}`) }
        if (!res.ok) {
          if (res.status === 401 && !skipAuth) {
            const tok = getAuthToken()
            if (tok) {
              if (!_isRefreshing) _isRefreshing = tryRefreshToken()
              const refreshed = await _isRefreshing
              _isRefreshing = null
              if (refreshed) { _inflight.delete(url); return apiFetch<T>(endpoint, options) }
              setAuthToken(null)
            }
            _onAuthError?.()
          }
          throw new Error(env.error ?? env.message ?? `Request failed (${res.status})`)
        }
        const result = (env.success !== undefined && 'data' in env ? env.data : env) as T
        setCache(url, result)
        return result
      } finally {
        _inflight.delete(url)
      }
    })()
    _inflight.set(url, inflightPromise as Promise<unknown>)
    return inflightPromise
  }

  const response = await fetch(url, {
    ...fetchOptions,
    cache: 'no-store',
    headers,
  })

  // Try to parse JSON even for error responses
  const rawText = await response.text()
  let envelope: { success?: boolean; data?: T; error?: string; message?: string }

  try {
    envelope = rawText ? JSON.parse(rawText) : {}
  } catch {
    throw new Error(`Invalid JSON response from ${endpoint}`)
  }

  if (!response.ok) {
    // On 401, attempt a silent token refresh then retry once (only when auth is in use)
    if (response.status === 401 && !skipAuth) {
      const currentToken = getAuthToken()
      if (currentToken) {
        // Deduplicate: if a refresh is already running, await that same promise rather than issuing a second one
        if (!_isRefreshing) _isRefreshing = tryRefreshToken()
        const refreshed = await _isRefreshing
        _isRefreshing = null
        if (refreshed) {
          // Retry the original request with the new token
          return apiFetch<T>(endpoint, options)
        }
        // Refresh failed — clear token and notify
        setAuthToken(null)
      }
      // No token (or refresh failed) — always notify so the UI can redirect to login
      _onAuthError?.()
    }
    const errorMessage =
      envelope.error ??
      envelope.message ??
      `Request failed (${response.status})`
    throw new Error(errorMessage)
  }

  // Unwrap standard { success, data } envelope; fall back to raw response
  // for any non-enveloped responses (e.g. third-party or upload endpoints).
  if (envelope.success !== undefined && 'data' in envelope) {
    const result = envelope.data as T
    if (isCacheableGet) setCache(url, result)
    return result
  }

  const result = envelope as unknown as T
  if (isCacheableGet) setCache(url, result)
  return result
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
  options?: { category?: string; label?: string },
): Promise<MediaUploadResult> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files[]", file))

  const params = new URLSearchParams({ type })
  if (options?.category) params.set("category", options.category)
  if (options?.label) params.set("label", options.label)

  const uploadUrl = `${API_BASE}/api/v1/media?${params.toString()}`
  const uploadHeaders: Record<string, string> = {}
  const token = getAuthToken()
  if (token) uploadHeaders["Authorization"] = `Bearer ${token}`

  const response = await fetch(uploadUrl, { method: "POST", body: formData, headers: uploadHeaders })
  const rawText = await response.text()
  const envelope: { success?: boolean; data?: MediaUploadResult; error?: string } = rawText
    ? JSON.parse(rawText)
    : {}

  if (!response.ok) {
    // On 401, attempt a silent token refresh then retry once (mirrors apiFetch logic)
    if (response.status === 401) {
      const currentToken = getAuthToken()
      if (currentToken) {
        // Deduplicate: if a refresh is already running, await that same promise rather than issuing a second one
        if (!_isRefreshing) _isRefreshing = tryRefreshToken()
        const refreshed = await _isRefreshing
        _isRefreshing = null
        if (refreshed) {
          return apiUploadMedia(files, type, options)
        }
        setAuthToken(null)
      }
      _onAuthError?.()
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
} from "@/lib/data/admin-data"

export type { CMSPost } from "@/lib/data/admin-data"
import type { CMSPost } from "@/lib/data/admin-data"

/** Fetch CMS posts, optionally filtered by publication status */
export function apiFetchPosts(status?: string) {
  const queryString = status ? `?status=${status}` : ""
  return apiFetch<CMSPost[]>(`/api/posts${queryString}`)
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
  return apiFetch<PageView[]>("/api/analytics/pageviews")
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

/**
 * Log a destination click.
 * Called on the public site when a visitor navigates to a destination page.
 * Sends a lightweight POST with the destination's content_id.
 */
export function apiLogDestinationView(
  contentId: number,
  sessionId?: string,
) {
  return apiFetch<{ message: string }>("/api/analytics/log-view", {
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
    { method: "POST", body: JSON.stringify(data) },
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

/** Assign an inquiry to a tourist guide — sets status to 'assigned' and saves guide name */
export function apiAssignInquiry(id: string, assignedTo: string) {
  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries?id=${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "assigned", assigned_to: assignedTo }),
  })
}

/** Confirm a tour — sets confirmed_date, optional guide assignment, status → 'confirmed' */
export function apiConfirmTour(
  id: string,
  confirmedDate: string,
  opts?: { assignedTo?: string; touristName?: string }
) {
  return apiFetch<{ message: string; inquiry: Inquiry }>(`/api/inquiries/${id}/confirm`, {
    method: "POST",
    body: JSON.stringify({
      confirmed_date: confirmedDate,
      assigned_to: opts?.assignedTo ?? undefined,
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
  data: Partial<Pick<TourGuide, "fullName" | "phoneNumber" | "availability" | "isActive">>
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
  return apiFetch<FeaturedContent | null>("/api/home/spotlight")
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
  return apiFetch<CMSPost[]>(`/api/posts?${params}`)
}

// ─── Featured posts by label / category (for navbar dropdowns) ────

/** Fetch featured posts, optionally filtered by label key (e.g. 'local-cuisine', 'destinations') */
export function apiFetchFeaturedByLabel(label?: string, limit?: number) {
  const params = new URLSearchParams({ featured: "1" })
  if (label) params.set("label", label)
  if (limit) params.set("limit", String(limit))
  return apiFetch<CMSPost[]>(`/api/posts?${params}`)
}

// ─── Hero Settings (now stored in site_settings) ──────────────────

export function apiFetchHeroSettings() {
  return apiFetch<HeroSettings | null>("/api/home/hero-settings")
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
  return apiFetch<HeroSlide[]>("/api/home/hero")
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
