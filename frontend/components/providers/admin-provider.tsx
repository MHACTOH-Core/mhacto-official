"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import {
  type CMSPost,
  type Inquiry,
  type ActivityLogEntry,
  type AdminSettings,
  type PageView,
  type DailyVisit,
  type ActivityAction,
  MOCK_POSTS,
  MOCK_INQUIRIES,
  MOCK_ACTIVITY_LOG,
  MOCK_PAGE_VIEWS,
  MOCK_DAILY_VISITS,
  DEFAULT_SETTINGS,
  generateId,
} from "@/lib/data/admin-data"

// ─── Context shape ─────────────────────────────────────────────────

interface AdminContextValue {
  // Auth
  isLoggedIn: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  adminEmail: string

  // Analytics
  pageViews: PageView[]
  dailyVisits: DailyVisit[]
  totalViews: number

  // CMS
  posts: CMSPost[]
  createPost: (post: Omit<CMSPost, "id" | "createdAt" | "updatedAt">) => void
  updatePost: (id: string, data: Partial<CMSPost>) => void
  deletePost: (id: string) => void

  // Inquiries
  inquiries: Inquiry[]
  updateInquiry: (id: string, data: Partial<Inquiry>) => void
  deleteInquiry: (id: string) => void
  permanentDeleteInquiry: (id: string) => void
  replyToInquiry: (id: string, message: string) => void

  // Settings
  settings: AdminSettings
  updateSettings: (data: Partial<AdminSettings>) => void

  // Activity log
  activityLog: ActivityLogEntry[]
  logActivity: (action: ActivityAction, description: string) => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

// ─── Hook ──────────────────────────────────────────────────────────

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider")
  return ctx
}

// ─── Helpers ───────────────────────────────────────────────────────

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// ─── Provider ──────────────────────────────────────────────────────

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [posts, setPosts] = useState<CMSPost[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS)
  const [pageViews] = useState<PageView[]>(MOCK_PAGE_VIEWS)
  const [dailyVisits] = useState<DailyVisit[]>(MOCK_DAILY_VISITS)
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    setPosts(loadJson("admin_posts", MOCK_POSTS))
    setInquiries(loadJson("admin_inquiries", MOCK_INQUIRIES))
    setActivityLog(loadJson("admin_activity", MOCK_ACTIVITY_LOG))
    setSettings(loadJson("admin_settings", DEFAULT_SETTINGS))
    setIsLoggedIn(loadJson("admin_logged_in", false))
    setAdminEmail(loadJson("admin_email", ""))
    setMounted(true)
  }, [])

  // Persist whenever state changes (after mount)
  useEffect(() => {
    if (!mounted) return
    saveJson("admin_posts", posts)
  }, [posts, mounted])

  useEffect(() => {
    if (!mounted) return
    saveJson("admin_inquiries", inquiries)
  }, [inquiries, mounted])

  useEffect(() => {
    if (!mounted) return
    saveJson("admin_activity", activityLog)
  }, [activityLog, mounted])

  useEffect(() => {
    if (!mounted) return
    saveJson("admin_settings", settings)
  }, [settings, mounted])

  // ── Auth ──
  const login = useCallback((email: string, password: string) => {
    // Simple demo auth
    if (email === "admin@mhacto.gov.ph" && password === "admin123") {
      setIsLoggedIn(true)
      setAdminEmail(email)
      saveJson("admin_logged_in", true)
      saveJson("admin_email", email)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setAdminEmail("")
    saveJson("admin_logged_in", false)
    saveJson("admin_email", "")
  }, [])

  // ── Activity log helper ──
  const logActivity = useCallback(
    (action: ActivityAction, description: string) => {
      const entry: ActivityLogEntry = {
        id: generateId(),
        action,
        description,
        timestamp: new Date().toISOString(),
        user: adminEmail || "admin@mhacto.gov.ph",
      }
      setActivityLog((prev) => [entry, ...prev])
    },
    [adminEmail],
  )

  // ── CMS ──
  const createPost = useCallback(
    (data: Omit<CMSPost, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const post: CMSPost = { ...data, id: generateId(), createdAt: now, updatedAt: now }
      setPosts((prev) => [post, ...prev])
      logActivity("create_post", `Created "${data.title}"`)
    },
    [logActivity],
  )

  const updatePost = useCallback(
    (id: string, data: Partial<CMSPost>) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p,
        ),
      )
      if (data.status === "published") {
        logActivity("publish_post", `Published "${data.title || "post"}"`)
      } else if (data.status === "archived") {
        logActivity("archive_post", `Archived "${data.title || "post"}"`)
      } else {
        logActivity("update_post", `Updated "${data.title || "post"}"`)
      }
    },
    [logActivity],
  )

  const deletePost = useCallback(
    (id: string) => {
      const post = posts.find((p) => p.id === id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
      logActivity("delete_post", `Deleted "${post?.title || "post"}"`)
    },
    [posts, logActivity],
  )

  // ── Inquiries ──
  const updateInquiry = useCallback((id: string, data: Partial<Inquiry>) => {
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, ...data } : inq)))
  }, [])

  const deleteInquiry = useCallback(
    (id: string) => {
      const inq = inquiries.find((i) => i.id === id)
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "trash" as const, trashedAt: new Date().toISOString() } : i,
        ),
      )
      logActivity("archive_inquiry", `Moved inquiry from ${inq?.name || "unknown"} to trash`)
    },
    [inquiries, logActivity],
  )

  const permanentDeleteInquiry = useCallback(
    (id: string) => {
      const inq = inquiries.find((i) => i.id === id)
      setInquiries((prev) => prev.filter((i) => i.id !== id))
      logActivity("archive_inquiry", `Permanently deleted inquiry from ${inq?.name || "unknown"}`)
    },
    [inquiries, logActivity],
  )

  const replyToInquiry = useCallback(
    (id: string, message: string) => {
      const now = new Date().toISOString()
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id
            ? { ...inq, status: "replied" as const, replyMessage: message, repliedAt: now }
            : inq,
        ),
      )
      const inq = inquiries.find((i) => i.id === id)
      logActivity("reply_inquiry", `Replied to ${inq?.name || "inquiry"} — ${inq?.subject || ""}`)
    },
    [inquiries, logActivity],
  )

  // ── Settings ──
  const updateSettings = useCallback(
    (data: Partial<AdminSettings>) => {
      setSettings((prev) => ({ ...prev, ...data }))
      logActivity("update_settings", "Updated site settings")
    },
    [logActivity],
  )

  const totalViews = pageViews.reduce((sum, p) => sum + p.views, 0)

  return (
    <AdminContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        adminEmail,
        pageViews,
        dailyVisits,
        totalViews,
        posts,
        createPost,
        updatePost,
        deletePost,
        inquiries,
        updateInquiry,
        deleteInquiry,
        permanentDeleteInquiry,
        replyToInquiry,
        settings,
        updateSettings,
        activityLog,
        logActivity,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}
