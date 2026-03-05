import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/MHACTO-PROJECT'

/** Prefix a public asset path with the basePath so it resolves on GitHub Pages */
export function asset(path: string): string {
  if (!path.startsWith('/')) return path
  return `${BASE_PATH}${path}`
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/**
 * Resolve a media URL returned by the CMS backend.
 *
 * - Empty / null  → local fallback via asset()
 * - Absolute http  → pass through
 * - /uploads/…     → prepend API_BASE (PHP server)
 * - /images/…      → local public asset via asset()
 */
export function resolveMediaUrl(
  url: string | undefined | null,
  fallback = '/images/heroes/hero-bocaue.jpg',
): string {
  if (!url) return asset(fallback)
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`
  }
  return asset(url.startsWith('/') ? url : `/${url}`)
}
