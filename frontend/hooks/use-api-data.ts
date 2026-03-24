"use client"

import { useEffect, useRef, useState, useCallback } from "react"

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
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(enabled)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refetch = useCallback(() => {
    const controller = new AbortController()

    setIsLoading(true)
    setError(undefined)

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        // Network errors that look like "Failed to fetch" are often
        // caused by the backend not running — treat as non-fatal.
        if (err instanceof TypeError && err.message.toLowerCase().includes("failed to fetch")) {
          setIsLoading(false)
          return
        }
        setError(err instanceof Error ? err.message : String(err))
        setIsLoading(false)
      })

    return controller
  }, [])

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
