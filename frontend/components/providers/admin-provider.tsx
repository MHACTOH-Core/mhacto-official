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

/** Hook to consume the admin context. Must be used within <AdminProvider>. */
export function useAdmin() {
  const adminContext = useContext(AdminContext)
  if (!adminContext) throw new Error("useAdmin must be used within AdminProvider")
  return adminContext
}

// ─── Helpers ───────────────────────────────────────────────────────

/** Safely load and parse a JSON value from localStorage, returning `fallback` on failure. */
function loadJsonFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const storedValue = localStorage.getItem(key)
    return storedValue ? (JSON.parse(storedValue) as T) : fallback
  } catch {
    return fallback
  }
}

/** Persist a JSON-serialisable value to localStorage. */
function saveJsonToStorage<T>(key: string, value: T) {
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
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoadingBackendData, setIsLoadingBackendData] = useState(false)

  // ── Load all data from backend ──
  /**
   * Fetch all admin data from the backend and sync to both state and localStorage.
   *
   * Fires 4 HTTP requests in parallel (Promise.allSettled so one failure doesn't block the rest):
   *   1. GET /api/posts/read.php           → PHP: SELECT * FROM content                → all CMS posts
   *   2. GET /api/inquiries/read.php       → PHP: SELECT * FROM inquiries               → all inquiry submissions
   *   3. GET /api/settings/read.php        → PHP: SELECT * FROM config                  → site-wide settings
   *   4. GET /api/activity/read.php?limit=100 → PHP: SELECT * FROM activity_logs LIMIT 100 → recent admin activity
   */
  const fetchAllBackendData = useCallback(async () => {
    setIsLoadingBackendData(true)
    try {
      const [postsResult, inquiriesResult, settingsResult, activityResult] = await Promise.allSettled([
        apiFetchPosts(),
        apiFetchInquiries(),
        apiFetchSettings(),
        apiFetchActivityLog(),
      ])
      if (postsResult.status === "fulfilled") {
        setPosts(postsResult.value)
        saveJsonToStorage("admin_posts", postsResult.value)
      }
      if (inquiriesResult.status === "fulfilled") {
        setInquiries(inquiriesResult.value)
        saveJsonToStorage("admin_inquiries", inquiriesResult.value)
      }
      if (settingsResult.status === "fulfilled" && settingsResult.value) {
        setSettings(settingsResult.value)
        saveJsonToStorage("admin_settings", settingsResult.value)
      }
      if (activityResult.status === "fulfilled") {
        setActivityLog(activityResult.value)
        saveJsonToStorage("admin_activity", activityResult.value)
      }
    } catch (err) {
      console.error("Failed to load from backend:", err)
    } finally {
      setIsLoadingBackendData(false)
    }
  }, [])

  const refreshPosts = useCallback(async () => {
    try {
      const freshPosts = await apiFetchPosts()
      setPosts(freshPosts)
      saveJsonToStorage("admin_posts", freshPosts)
    } catch (err) {
      console.error("refreshPosts failed:", err)
    }
  }, [])

  const refreshInquiries = useCallback(async () => {
    try {
      const freshInquiries = await apiFetchInquiries()
      setInquiries(freshInquiries)
      saveJsonToStorage("admin_inquiries", freshInquiries)
    } catch (err) {
      console.error("refreshInquiries failed:", err)
    }
  }, [])

  // Hydrate from localStorage first (fast), then fetch fresh data from backend
  useEffect(() => {
    setPosts(loadJsonFromStorage("admin_posts", []))
    setInquiries(loadJsonFromStorage("admin_inquiries", []))
    setActivityLog(loadJsonFromStorage("admin_activity", []))
    setSettings(loadJsonFromStorage("admin_settings", DEFAULT_SETTINGS))
    setIsLoggedIn(loadJsonFromStorage("admin_logged_in", false))
    setAdminEmail(loadJsonFromStorage("admin_email", ""))
    setIsHydrated(true)
  }, [])

  // Once hydrated & logged in, pull fresh data from API
  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return
    fetchAllBackendData()
  }, [isHydrated, isLoggedIn, fetchAllBackendData])

  // ── Auth ──
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const loginResponse = await apiLogin(email, password)
      setIsLoggedIn(true)
      setAdminEmail(loginResponse.user.email)
      saveJsonToStorage("admin_logged_in", true)
      saveJsonToStorage("admin_email", loginResponse.user.email)
      return true
    } catch (error) {
      console.error("Login failed:", error instanceof Error ? error.message : error)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setAdminEmail("")
    saveJsonToStorage("admin_logged_in", false)
    saveJsonToStorage("admin_email", "")
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
        const updatedLog = [entry, ...prev]
        saveJsonToStorage("admin_activity", updatedLog)
        return updatedLog
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
        const createResult = await apiCreatePost(data as Record<string, unknown>)
        if (createResult?.post) {
          setPosts((prev) => prev.map((p) => (p.id === tempPost.id ? createResult.post : p)))
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
          i.id === id ? { ...i, status: "archived" as const } : i,
        ),
      )
      logActivityFn("archive_inquiry", `Archived inquiry from ${inq?.name || "unknown"}`)
      try {
        await apiUpdateInquiry(id, { status: "archived" })
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

  // ── Settings ──
  const updateSettingsFn = useCallback(
    async (settingsUpdate: Partial<AdminSettings>) => {
      setSettings((prev) => {
        const mergedSettings = { ...prev, ...settingsUpdate }
        saveJsonToStorage("admin_settings", mergedSettings)
        return mergedSettings
      })
      logActivityFn("update_settings", "Updated site settings")
      try {
        await apiUpdateSettings(settingsUpdate as Record<string, unknown>)
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
        settings,
        updateSettings: updateSettingsFn,
        activityLog,
        logActivity: logActivityFn,
        loading: isLoadingBackendData,
        refreshPosts,
        refreshInquiries,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}
