"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { AuthExpiredError } from "@/lib/api"

// ─── Simple client-side cache shared across hook instances ────────
// Returns cached data immediately so the UI doesn't flash loading states
// when navigating back to a page that was already fetched.
const _hookCache = new Map<string, unknown>()

/**
 * Lightweight SWR-style hook for public site data fetching.
 *
 * Features:
 * - Returns cached data immediately while revalidating in background
 * - AbortController cleanup on unmount (prevents memory leaks)
 * - Deduplication (via apiFetch's built-in dedup layer)
 * - Optional `enabled` flag to conditionally skip fetching
 *
 * @param key   A stable cache key (typically the API endpoint path)
 * @param fetcher  An async function that accepts an AbortSignal and returns data
 * @param options  { enabled?: boolean }
 */
export function useAPIData<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true
  const cachedData = _hookCache.get(key) as T | undefined
  const [data, setData] = useState<T | undefined>(cachedData)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(enabled && cachedData === undefined)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refetch = useCallback(() => {
    const controller = new AbortController()
    const hasCachedData = _hookCache.has(key)

    // Only show loading state if there's no cached data to display
    if (!hasCachedData) setIsLoading(true)
    setError(undefined)

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          _hookCache.set(key, result)
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        // Auth failures are handled by the _onAuthError callback (which triggers
        // logout + redirect to login). Don't set error state — the UI is already
        // transitioning away and showing an error message would be confusing.
        if (err instanceof AuthExpiredError) {
          setIsLoading(false)
          return
        }
        // Network errors (TypeError from fetch, or the wrapped Error from apiFetch)
        if (
          (err instanceof TypeError || err instanceof Error) &&
          /failed to fetch|networkerror|network error/i.test(err.message)
        ) {
          setError("Network error — backend may be offline")
          setIsLoading(false)
          return
        }
        setError(err instanceof Error ? err.message : String(err))
        setIsLoading(false)
      })

    return controller
  }, [key])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    const controller = refetch()
    return () => controller.abort()
    // key is included so we re-fetch when the endpoint changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return { data, error, isLoading, refetch }
}
