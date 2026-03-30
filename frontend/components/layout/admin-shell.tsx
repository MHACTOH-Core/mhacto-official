"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

/**
 * AdminShell — persistent layout wrapper for all /admin/* pages.
 *
 * Renders the sidebar only for authenticated inner pages (not the login page).
 * By living in the layout, the sidebar is NOT unmounted on SPA navigation —
 * only the <main> children slot is swapped, eliminating the navbar reload.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // The login page (/admin or /admin/) should render without the sidebar shell
  const isLoginPage = pathname === "/admin" || pathname === "/admin/"

  if (isLoginPage) {
    return <>{children}</>
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
