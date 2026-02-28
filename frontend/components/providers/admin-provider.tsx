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
  MOCK_PAGE_VIEWS,
  MOCK_DAILY_VISITS,
  DEFAULT_SETTINGS,
  generateId,
} from "@/lib/data/admin-data"
import {
  apiLogin,
  apiFetchPosts,
  apiCreatePost,
  apiUpdatePost,
  apiDeletePost,
  apiFetchInquiries,
  apiUpdateInquiry,
  apiDeleteInquiry,
  apiReplyInquiry,
  apiFetchSettings,
  apiUpdateSettings,
  apiFetchActivityLog,
  apiLogActivity,
} from "@/lib/api"

// ─── Context shape ─────────────────────────────────────────────────

interface AdminContextValue {
  // Auth
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
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

  // Loading / refresh
  loading: boolean
  refreshPosts: () => Promise<void>
  refreshInquiries: () => Promise<void>
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
  const [loading, setLoading] = useState(false)

  // ── Load all data from backend ──
  const loadFromBackend = useCallback(async () => {
    setLoading(true)
    try {
      const [postsRes, inqRes, settingsRes, actRes] = await Promise.allSettled([
        apiFetchPosts(),
        apiFetchInquiries(),
        apiFetchSettings(),
        apiFetchActivityLog(),
      ])
      if (postsRes.status === "fulfilled") {
        setPosts(postsRes.value)
        saveJson("admin_posts", postsRes.value)
      }
      if (inqRes.status === "fulfilled") {
        setInquiries(inqRes.value)
        saveJson("admin_inquiries", inqRes.value)
      }
      if (settingsRes.status === "fulfilled" && settingsRes.value) {
        setSettings(settingsRes.value)
        saveJson("admin_settings", settingsRes.value)
      }
      if (actRes.status === "fulfilled") {
        setActivityLog(actRes.value)
        saveJson("admin_activity", actRes.value)
      }
    } catch (err) {
      console.error("Failed to load from backend:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshPosts = useCallback(async () => {
    try {
      const data = await apiFetchPosts()
      setPosts(data)
      saveJson("admin_posts", data)
    } catch (err) {
      console.error("refreshPosts failed:", err)
    }
  }, [])

  const refreshInquiries = useCallback(async () => {
    try {
      const data = await apiFetchInquiries()
      setInquiries(data)
      saveJson("admin_inquiries", data)
    } catch (err) {
      console.error("refreshInquiries failed:", err)
    }
  }, [])

  // Hydrate from localStorage first (fast), then fetch from backend
  useEffect(() => {
    setPosts(loadJson("admin_posts", []))
    setInquiries(loadJson("admin_inquiries", []))
    setActivityLog(loadJson("admin_activity", []))
    setSettings(loadJson("admin_settings", DEFAULT_SETTINGS))
    setIsLoggedIn(loadJson("admin_logged_in", false))
    setAdminEmail(loadJson("admin_email", ""))
    setMounted(true)
  }, [])

  // Once mounted & logged in, pull fresh data from API
  useEffect(() => {
    if (!mounted || !isLoggedIn) return
    loadFromBackend()
  }, [mounted, isLoggedIn, loadFromBackend])

  // ── Auth ──
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiLogin(email, password)
      setIsLoggedIn(true)
      setAdminEmail(data.user.email)
      saveJson("admin_logged_in", true)
      saveJson("admin_email", data.user.email)
      return true
    } catch (error) {
      console.error("Login failed:", error instanceof Error ? error.message : error)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setAdminEmail("")
    saveJson("admin_logged_in", false)
    saveJson("admin_email", "")
  }, [])

  // ── Activity log helper ──
  const logActivityFn = useCallback(
    (action: ActivityAction, description: string) => {
      const entry: ActivityLogEntry = {
        id: generateId(),
        action,
        description,
        timestamp: new Date().toISOString(),
        user: adminEmail || "admin@mhacto.gov.ph",
      }
      setActivityLog((prev) => {
        const next = [entry, ...prev]
        saveJson("admin_activity", next)
        return next
      })
      // Fire-and-forget to backend
      apiLogActivity(action, description).catch(() => {})
    },
    [adminEmail],
  )

  // ── CMS ──
  const createPost = useCallback(
    async (data: Omit<CMSPost, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const tempPost: CMSPost = { ...data, id: generateId(), createdAt: now, updatedAt: now }
      setPosts((prev) => [tempPost, ...prev])
      logActivityFn("create_post", `Created "${data.title}"`)
      try {
        const res = await apiCreatePost(data as Record<string, unknown>)
        if (res?.post) {
          setPosts((prev) => prev.map((p) => (p.id === tempPost.id ? res.post : p)))
        }
        await refreshPosts()
      } catch (err) {
        console.error("createPost API error:", err)
      }
    },
    [logActivityFn, refreshPosts],
  )

  const updatePost = useCallback(
    async (id: string, data: Partial<CMSPost>) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p,
        ),
      )
      if (data.status === "published") {
        logActivityFn("publish_post", `Published "${data.title || "post"}"`)
      } else if (data.status === "archived") {
        logActivityFn("archive_post", `Archived "${data.title || "post"}"`)
      } else {
        logActivityFn("update_post", `Updated "${data.title || "post"}"`)
      }
      try {
        await apiUpdatePost(id, data as Record<string, unknown>)
        await refreshPosts()
      } catch (err) {
        console.error("updatePost API error:", err)
      }
    },
    [logActivityFn, refreshPosts],
  )

  const deletePost = useCallback(
    async (id: string) => {
      const post = posts.find((p) => p.id === id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
      logActivityFn("delete_post", `Deleted "${post?.title || "post"}"`)
      try {
        await apiDeletePost(id)
      } catch (err) {
        console.error("deletePost API error:", err)
      }
    },
    [posts, logActivityFn],
  )

  // ── Inquiries ──
  const updateInquiryFn = useCallback(
    async (id: string, data: Partial<Inquiry>) => {
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, ...data } : inq)))
      try {
        await apiUpdateInquiry(id, data as Record<string, unknown>)
        await refreshInquiries()
      } catch (err) {
        console.error("updateInquiry API error:", err)
      }
    },
    [refreshInquiries],
  )

  const deleteInquiry = useCallback(
    async (id: string) => {
      const inq = inquiries.find((i) => i.id === id)
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "trash" as const, trashedAt: new Date().toISOString() } : i,
        ),
      )
      logActivityFn("archive_inquiry", `Moved inquiry from ${inq?.name || "unknown"} to trash`)
      try {
        await apiUpdateInquiry(id, { status: "trash" })
        await refreshInquiries()
      } catch (err) {
        console.error("deleteInquiry API error:", err)
      }
    },
    [inquiries, logActivityFn, refreshInquiries],
  )

  const permanentDeleteInquiry = useCallback(
    async (id: string) => {
      const inq = inquiries.find((i) => i.id === id)
      setInquiries((prev) => prev.filter((i) => i.id !== id))
      logActivityFn("archive_inquiry", `Permanently deleted inquiry from ${inq?.name || "unknown"}`)
      try {
        await apiDeleteInquiry(id)
      } catch (err) {
        console.error("permanentDeleteInquiry API error:", err)
      }
    },
    [inquiries, logActivityFn],
  )

  const replyToInquiry = useCallback(
    async (id: string, message: string) => {
      const now = new Date().toISOString()
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id
            ? { ...inq, status: "replied" as const, replyMessage: message, repliedAt: now }
            : inq,
        ),
      )
      const inq = inquiries.find((i) => i.id === id)
      logActivityFn("reply_inquiry", `Replied to ${inq?.name || "inquiry"} — ${inq?.subject || ""}`)
      try {
        await apiReplyInquiry(id, message)
        await refreshInquiries()
      } catch (err) {
        console.error("replyToInquiry API error:", err)
      }
    },
    [inquiries, logActivityFn, refreshInquiries],
  )

  // ── Settings ──
  const updateSettingsFn = useCallback(
    async (data: Partial<AdminSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...data }
        saveJson("admin_settings", next)
        return next
      })
      logActivityFn("update_settings", "Updated site settings")
      try {
        await apiUpdateSettings(data as Record<string, unknown>)
      } catch (err) {
        console.error("updateSettings API error:", err)
      }
    },
    [logActivityFn],
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
        updateInquiry: updateInquiryFn,
        deleteInquiry,
        permanentDeleteInquiry,
        replyToInquiry,
        settings,
        updateSettings: updateSettingsFn,
        activityLog,
        logActivity: logActivityFn,
        loading,
        refreshPosts,
        refreshInquiries,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}
