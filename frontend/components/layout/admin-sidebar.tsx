"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { asset, resolveMediaUrl } from "@/lib/utils"
import {
  LayoutDashboard,
  FileEdit,
  MessageSquare,
  Settings,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Home,
  Menu,
  ImageIcon,
  Users,
  Flame,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAdmin } from "@/components/providers/admin-provider"
import type { UserRole } from "@/lib/data/admin-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; roles?: UserRole[] }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/home-content", label: "Home Page", icon: Home, roles: ["super_admin", "admin", "content_manager"] },
  { href: "/admin/heroes", label: "Page Banners", icon: ImageIcon, roles: ["super_admin", "admin", "content_manager"] },
  { href: "/admin/cms", label: "Manage Content", icon: FileEdit, roles: ["super_admin", "admin", "content_manager"] },
  { href: "/admin/pagoda", label: "Pagoda Festival", icon: Flame, roles: ["super_admin", "admin", "content_manager"] },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, roles: ["super_admin", "admin", "content_manager"] },
  { href: "/admin/accounts", label: "Accounts", icon: Users, roles: ["super_admin", "admin"] },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/activity-log", label: "Activity Log", icon: ClipboardList },
]

function SidebarContent({ collapsed, setCollapsed, isMobile, onLinkClick }: {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  isMobile: boolean
  onLinkClick?: () => void
}) {
  const pathname = usePathname()
  const { logout, inquiries, currentUser } = useAdmin()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const unreadCount = inquiries.filter((i) => i.status === "unread").length
  const userRole = currentUser?.role ?? "content_manager"

  const showLabels = isMobile || !collapsed

  // Filter nav items by role
  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    content_manager: "Content Manager",
  }

  return (
    <>
      {/* User Profile */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        {currentUser?.profilePicture ? (
          <Image src={resolveMediaUrl(currentUser.profilePicture)} alt={currentUser.fullName ?? "User"} width={36} height={36} className="shrink-0 rounded-full object-cover h-9 w-9" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
            {(currentUser?.fullName ?? "U").charAt(0).toUpperCase()}
          </div>
        )}
        {showLabels && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-card-foreground">{currentUser?.fullName ?? "User"}</p>
            <p className="truncate text-[10px] text-muted-foreground">{roleLabels[userRole] ?? userRole}</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                !showLabels && "justify-center px-2",
              )}
              title={!showLabels ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {showLabels && (
                <span className="flex-1">{item.label}</span>
              )}
              {showLabels && item.label === "Inquiries" && unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
              {!showLabels && item.label === "Inquiries" && unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-2 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "w-full",
            !showLabels ? "justify-center" : "justify-start gap-3",
          )}
          title={!showLabels ? "Toggle dark mode" : undefined}
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          {showLabels && mounted && <span className="text-xs">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}        </Button>
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "w-full text-destructive hover:bg-destructive/10 hover:text-destructive",
            !showLabels ? "justify-center" : "justify-start gap-3",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {showLabels && <span>Logout</span>}
        </Button>
      </div>
    </>
  )
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button — fixed top-left */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-3 top-3 z-50 h-10 w-10 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SidebarContent
            collapsed={false}
            setCollapsed={() => {}}
            isMobile
            onLinkClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={false}
        />
      </aside>
    </>
  )
}
