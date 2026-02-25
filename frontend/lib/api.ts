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

// ─── Typed endpoint helpers ───────────────────────────────────────

/** POST /api/auth/login.php */
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

// ── Data-fetching helpers (read-only for now) ─────────────────────

import type {
  CMSPost,
  Inquiry,
  ActivityLogEntry,
  AdminSettings,
  PageView,
  DailyVisit,
} from "@/lib/data/admin-data"

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
