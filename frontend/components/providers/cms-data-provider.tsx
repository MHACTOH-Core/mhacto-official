"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type {
  CMSPost,
  Inquiry,
  TourGuide,
  ActivityLogEntry,
  AdminSettings,
  ActivityAction,
  AdminUser,
} from "@/lib/data/admin-data"
import { DEFAULT_SETTINGS, contentLabels, generateId } from "@/lib/data/admin-data"
import {
  apiFetchPosts,
  apiCreatePost,
  apiUpdatePost,
  apiDeletePost,
  apiFetchInquiries,
  apiUpdateInquiry,
  apiDeleteInquiry,
  apiConfirmTour,
  apiLogWalkIn,
  apiFetchTourGuides,
  apiCreateTourGuide,
  apiUpdateTourGuide,
  apiDeleteTourGuide,
  apiFetchSettings,
  apiUpdateSettings,
  apiFetchActivityLog,
  apiLogActivity,
  apiFetchUsers,
  apiCreateUser,
  apiUpdateUser,
  apiArchiveUser,
  apiRestoreUser,
  apiFetchArchiveRequests,
  apiApproveArchiveRequest,
  apiDenyArchiveRequest,
  AuthExpiredError,
} from "@/lib/api"
import type { ArchiveRequest } from "@/lib/api"
import { useAuth } from "./auth-provider"

// ─── Types ─────────────────────────────────────────────────────────

export interface CMSDataContextValue {
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
  confirmTour: (id: string, confirmedDate: string, opts?: { assignedTo?: string; touristName?: string }) => Promise<void>
  logWalkIn: (data: Parameters<typeof apiLogWalkIn>[0]) => Promise<void>
  refreshInquiries: () => Promise<void>

  // Tour Guides
  tourGuides: TourGuide[]
  createTourGuide: (data: { fullName: string; phoneNumber?: string; availability?: TourGuide["availability"] }) => Promise<void>
  updateTourGuide: (id: string, data: Partial<Pick<TourGuide, "fullName" | "phoneNumber" | "availability" | "isActive">>) => Promise<void>
  deleteTourGuide: (id: string) => Promise<void>
  refreshTourGuides: () => Promise<void>

  // Settings
  settings: AdminSettings
  updateSettings: (data: Partial<AdminSettings>) => void

  // Activity log
  activityLog: ActivityLogEntry[]
  logActivity: (action: ActivityAction, description: string) => void

  // Account management
  users: AdminUser[]
  createUser: (data: { fullName: string; email: string; password: string; role: string }) => Promise<{ success: boolean; error?: string }>
  updateUser: (id: number, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  archiveUser: (id: number) => Promise<{ success: boolean; requiresApproval?: boolean }>
  restoreUser: (id: number) => Promise<boolean>
  refreshUsers: () => Promise<void>

  // Archive requests (approval workflow)
  archiveRequests: ArchiveRequest[]
  refreshArchiveRequests: () => Promise<void>
  approveArchiveRequest: (requestId: number) => Promise<boolean>
  denyArchiveRequest: (requestId: number) => Promise<boolean>

  loading: boolean
  refreshPosts: () => Promise<void>
}

const CMSDataContext = createContext<CMSDataContextValue | null>(null)

export function useCMSData() {
  const ctx = useContext(CMSDataContext)
  if (!ctx) throw new Error("useCMSData must be used within CMSDataProvider")
  return ctx
}

// ─── Helpers ───────────────────────────────────────────────────────

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

function normalizeCMSPost(post: CMSPost): CMSPost {
  const derivedCategory = contentLabels[post.label]?.category
  if (!derivedCategory || post.contentCategory === derivedCategory) {
    return post
  }
  return { ...post, contentCategory: derivedCategory }
}

// ─── Provider ──────────────────────────────────────────────────────

export function CMSDataProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, isHydrated, adminEmail, currentUser } = useAuth()

  const [posts, setPosts] = useState<CMSPost[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoadingBackendData, setIsLoadingBackendData] = useState(false)

  // ── Backend data fetching ──

  const fetchAllBackendData = useCallback(async () => {
    setIsLoadingBackendData(true)
    try {
      const [postsResult, inquiriesResult, settingsResult, activityResult, usersResult, tourGuidesResult] = await Promise.allSettled([
        apiFetchPosts(),
        apiFetchInquiries(),
        apiFetchSettings(),
        apiFetchActivityLog(),
        apiFetchUsers(true),
        apiFetchTourGuides(),
      ])
      if (postsResult.status === "fulfilled") {
        const normalizedPosts = postsResult.value.map(normalizeCMSPost)
        setPosts(normalizedPosts)
        saveJson("admin_posts", normalizedPosts)
      }
      if (inquiriesResult.status === "fulfilled") {
        setInquiries(inquiriesResult.value)
        saveJson("admin_inquiries", inquiriesResult.value)
      }
      if (settingsResult.status === "fulfilled" && settingsResult.value) {
        setSettings(settingsResult.value)
        saveJson("admin_settings", settingsResult.value)
      }
      if (activityResult.status === "fulfilled") {
        setActivityLog(activityResult.value)
        saveJson("admin_activity", activityResult.value)
      }
      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value)
      }
      if (tourGuidesResult.status === "fulfilled") {
        setTourGuides(tourGuidesResult.value)
      }
    } catch (err) {
      if (err instanceof AuthExpiredError || (err instanceof Error && /network error/i.test(err.message))) {
        console.warn("Failed to load from backend (unavailable):", err.message)
        return
      }
      console.error("Failed to load from backend:", err)
    } finally {
      setIsLoadingBackendData(false)
    }
  }, [])

  const refreshPosts = useCallback(async () => {
    try {
      const freshPosts = await apiFetchPosts()
      const normalizedPosts = freshPosts.map(normalizeCMSPost)
      setPosts(normalizedPosts)
      saveJson("admin_posts", normalizedPosts)
    } catch (err) {
      if (err instanceof AuthExpiredError || (err instanceof Error && /network error/i.test(err.message))) return
      console.error("refreshPosts failed:", err)
    }
  }, [])

  const refreshInquiries = useCallback(async () => {
    try {
      const freshInquiries = await apiFetchInquiries()
      setInquiries(freshInquiries)
      saveJson("admin_inquiries", freshInquiries)
    } catch (err) {
      if (err instanceof AuthExpiredError || (err instanceof Error && /network error/i.test(err.message))) return
      console.error("refreshInquiries failed:", err)
    }
  }, [])

  const refreshTourGuides = useCallback(async () => {
    try {
      const fresh = await apiFetchTourGuides()
      setTourGuides(fresh)
    } catch (err) {
      if (err instanceof AuthExpiredError || (err instanceof Error && /network error/i.test(err.message))) return
      console.error("refreshTourGuides failed:", err)
    }
  }, [])

  // Hydrate from localStorage first
  useEffect(() => {
    setPosts(loadJson<CMSPost[]>("admin_posts", []).map(normalizeCMSPost))
    setInquiries(loadJson("admin_inquiries", []))
    setActivityLog(loadJson("admin_activity", []))
    setSettings(loadJson("admin_settings", DEFAULT_SETTINGS))
  }, [])

  // Once hydrated & logged in, pull fresh data from API
  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return
    fetchAllBackendData()
  }, [isHydrated, isLoggedIn, fetchAllBackendData])

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
        saveJson("admin_activity", updatedLog)
        return updatedLog
      })
      apiLogActivity(action, description).catch(() => {})
    },
    [adminEmail],
  )

  // ── CMS ──
  const createPost = useCallback(
    async (data: Omit<CMSPost, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const tempPost = normalizeCMSPost({ ...data, id: generateId(), createdAt: now, updatedAt: now })
      setPosts((prev) => [tempPost, ...prev])
      logActivityFn("create_post", `Created "${data.title}"`)
      try {
        const createResult = await apiCreatePost(data as Record<string, unknown>)
        if (createResult?.post) {
          const normalizedPost = normalizeCMSPost(createResult.post)
          setPosts((prev) => prev.map((p) => (p.id === tempPost.id ? normalizedPost : p)))
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

  const confirmTourFn = useCallback(
    async (id: string, confirmedDate: string, opts?: { assignedTo?: string; touristName?: string }) => {
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id
            ? { ...inq, status: "confirmed" as const, confirmedDate, assignedTo: opts?.assignedTo ?? inq.assignedTo, touristName: opts?.touristName ?? inq.touristName }
            : inq
        )
      )
      try {
        await apiConfirmTour(id, confirmedDate, opts)
        await refreshInquiries()
      } catch (err) {
        console.error("confirmTour API error:", err)
      }
    },
    [refreshInquiries],
  )

  const logWalkInFn = useCallback(
    async (data: Parameters<typeof apiLogWalkIn>[0]) => {
      try {
        await apiLogWalkIn(data)
        await refreshInquiries()
      } catch (err) {
        console.error("logWalkIn API error:", err)
      }
    },
    [refreshInquiries],
  )

  // ── Tour Guides ──
  const createTourGuideFn = useCallback(
    async (data: { fullName: string; phoneNumber?: string; availability?: TourGuide["availability"] }) => {
      try {
        await apiCreateTourGuide(data)
        await refreshTourGuides()
      } catch (err) {
        console.error("createTourGuide API error:", err)
        throw err
      }
    },
    [refreshTourGuides],
  )

  const updateTourGuideFn = useCallback(
    async (id: string, data: Partial<Pick<TourGuide, "fullName" | "phoneNumber" | "availability" | "isActive">>) => {
      setTourGuides((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
      try {
        await apiUpdateTourGuide(id, data)
        await refreshTourGuides()
      } catch (err) {
        console.error("updateTourGuide API error:", err)
        throw err
      }
    },
    [refreshTourGuides],
  )

  const deleteTourGuideFn = useCallback(
    async (id: string) => {
      setTourGuides((prev) => prev.filter((g) => g.id !== id))
      try {
        await apiDeleteTourGuide(id)
      } catch (err) {
        console.error("deleteTourGuide API error:", err)
      }
    },
    [],
  )

  // ── Settings ──
  const updateSettingsFn = useCallback(
    async (settingsUpdate: Partial<AdminSettings>) => {
      setSettings((prev) => {
        const merged = { ...prev, ...settingsUpdate }
        saveJson("admin_settings", merged)
        return merged
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

  // ── Account management ──
  const refreshUsersFn = useCallback(async () => {
    try {
      const freshUsers = await apiFetchUsers(true)
      setUsers(freshUsers)
    } catch (err) {
      if (err instanceof AuthExpiredError || (err instanceof Error && /network error/i.test(err.message))) return
      console.error("refreshUsers failed:", err)
    }
  }, [])

  const createUserFn = useCallback(
    async (data: { fullName: string; email: string; password: string; role: string }): Promise<{ success: boolean; error?: string }> => {
      try {
        await apiCreateUser(data)
        await refreshUsersFn()
        logActivityFn("update_settings", `Created user account for ${data.email}`)
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create user"
        return { success: false, error: message }
      }
    },
    [refreshUsersFn, logActivityFn],
  )

  const updateUserFn = useCallback(
    async (id: number, data: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
      try {
        await apiUpdateUser(id, data)
        await refreshUsersFn()
        logActivityFn("update_settings", `Updated user account #${id}`)
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update user"
        return { success: false, error: message }
      }
    },
    [refreshUsersFn, logActivityFn],
  )

  const archiveUserFn = useCallback(
    async (id: number): Promise<{ success: boolean; requiresApproval?: boolean }> => {
      try {
        const res = await apiArchiveUser(id)
        if (res.requiresApproval) {
          logActivityFn("update_settings", `Submitted archive request for user #${id}`)
          return { success: true, requiresApproval: true }
        }
        await refreshUsersFn()
        logActivityFn("update_settings", `Archived user account #${id}`)
        return { success: true }
      } catch (err) {
        console.error("archiveUser error:", err)
        return { success: false }
      }
    },
    [refreshUsersFn, logActivityFn],
  )

  const restoreUserFn = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await apiRestoreUser(id)
        await refreshUsersFn()
        logActivityFn("update_settings", `Restored user account #${id}`)
        return true
      } catch (err) {
        console.error("restoreUser error:", err)
        return false
      }
    },
    [refreshUsersFn, logActivityFn],
  )

  // ── Archive requests ──
  const [archiveRequests, setArchiveRequests] = useState<ArchiveRequest[]>([])

  const refreshArchiveRequestsFn = useCallback(async () => {
    try {
      const reqs = await apiFetchArchiveRequests("pending")
      setArchiveRequests(reqs)
    } catch (err) {
      if (err instanceof AuthExpiredError || (err instanceof Error && /network error/i.test(err.message))) return
      console.error("refreshArchiveRequests failed:", err)
    }
  }, [])

  const approveArchiveRequestFn = useCallback(
    async (requestId: number): Promise<boolean> => {
      try {
        await apiApproveArchiveRequest(requestId)
        await refreshArchiveRequestsFn()
        await refreshUsersFn()
        logActivityFn("update_settings", `Approved archive request #${requestId}`)
        return true
      } catch (err) {
        console.error("approveArchiveRequest error:", err)
        return false
      }
    },
    [refreshArchiveRequestsFn, refreshUsersFn, logActivityFn],
  )

  const denyArchiveRequestFn = useCallback(
    async (requestId: number): Promise<boolean> => {
      try {
        await apiDenyArchiveRequest(requestId)
        await refreshArchiveRequestsFn()
        logActivityFn("update_settings", `Denied archive request #${requestId}`)
        return true
      } catch (err) {
        console.error("denyArchiveRequest error:", err)
        return false
      }
    },
    [refreshArchiveRequestsFn, logActivityFn],
  )

  // Fetch archive requests on mount (for super admins)
  useEffect(() => {
    if (currentUser?.role === "super_admin") {
      refreshArchiveRequestsFn()
    }
  }, [currentUser?.role, refreshArchiveRequestsFn])

  return (
    <CMSDataContext.Provider
      value={{
        posts,
        createPost,
        updatePost,
        deletePost,
        inquiries,
        updateInquiry: updateInquiryFn,
        deleteInquiry,
        permanentDeleteInquiry,
        confirmTour: confirmTourFn,
        logWalkIn: logWalkInFn,
        refreshInquiries,
        tourGuides,
        createTourGuide: createTourGuideFn,
        updateTourGuide: updateTourGuideFn,
        deleteTourGuide: deleteTourGuideFn,
        refreshTourGuides,
        settings,
        updateSettings: updateSettingsFn,
        activityLog,
        logActivity: logActivityFn,
        users,
        createUser: createUserFn,
        updateUser: updateUserFn,
        archiveUser: archiveUserFn,
        restoreUser: restoreUserFn,
        refreshUsers: refreshUsersFn,
        archiveRequests,
        refreshArchiveRequests: refreshArchiveRequestsFn,
        approveArchiveRequest: approveArchiveRequestFn,
        denyArchiveRequest: denyArchiveRequestFn,
        loading: isLoadingBackendData,
        refreshPosts,
      }}
    >
      {children}
    </CMSDataContext.Provider>
  )
}
