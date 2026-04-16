"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { useAuth } from "@/components/providers/auth-provider"

/**
 * AdminShell — persistent layout wrapper for all /admin/* pages.
 *
 * Renders the sidebar only for authenticated inner pages (not the login page).
 * By living in the layout, the sidebar is NOT unmounted on SPA navigation —
 * only the <main> children slot is swapped, eliminating the navbar reload.
 *
 * Also acts as a centralized auth guard: any unauthenticated visit to a
 * protected admin route is redirected back to the login page.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, isHydrated } = useAuth()

  // The login page (/admin or /admin/) should render without the sidebar shell
  const isLoginPage = pathname === "/admin" || pathname === "/admin/"

  useEffect(() => {
    if (!isLoginPage && isHydrated && !isLoggedIn) {
      router.replace("/admin")
    }
  }, [isLoginPage, isHydrated, isLoggedIn, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  // While hydrating or if not logged in, render nothing so protected content
  // isn't briefly flashed before the redirect fires.
  if (!isHydrated || !isLoggedIn) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
