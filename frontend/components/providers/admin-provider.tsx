"use client"

import { useCallback, type ReactNode } from "react"
import { AuthProvider, useAuth } from "./auth-provider"
import { CMSDataProvider, useCMSData } from "./cms-data-provider"
import { AnalyticsProvider, useAnalytics } from "./analytics-provider"

// Re-export focused hooks so pages can import from the same file
export { useAuth } from "./auth-provider"
export { useCMSData } from "./cms-data-provider"
export { useAnalytics } from "./analytics-provider"

// ─── Backward-compatible hook ──────────────────────────────────────

/**
 * Legacy hook that merges all three contexts into a single object.
 * Prefer `useAuth`, `useCMSData`, or `useAnalytics` for new code.
 */
export function useAdmin() {
  const auth = useAuth()
  const cms = useCMSData()
  const analytics = useAnalytics()

  // Wrap profile/password updates with activity logging (was internal before split)
  const updateProfile = useCallback(
    async (data: { full_name?: string; profile_picture?: string | null }): Promise<boolean> => {
      const ok = await auth.updateProfile(data)
      if (ok) cms.logActivity("update_settings", "Updated profile")
      return ok
    },
    [auth, cms],
  )

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string): Promise<string | true> => {
      const result = await auth.changePassword(oldPassword, newPassword)
      if (result === true) cms.logActivity("update_settings", "Changed password")
      return result
    },
    [auth, cms],
  )

  return { ...auth, ...cms, ...analytics, updateProfile, changePassword }
}

// ─── Composed Provider ─────────────────────────────────────────────

export function AdminProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CMSDataProvider>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </CMSDataProvider>
    </AuthProvider>
  )
}
