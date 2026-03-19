"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { UserRole } from "@/lib/data/admin-data"
import { apiLogin, apiUpdateProfile, apiChangePassword, setAuthToken, apiFetchUserPreferences, apiUpdateUserPreferences } from "@/lib/api"

// ─── Types ─────────────────────────────────────────────────────────

export interface AuthUser {
  id: number
  username: string
  fullName: string
  email: string
  role: UserRole
  profilePicture?: string | null
}

export interface AuthContextValue {
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<true | string>
  logout: () => void
  adminEmail: string
  currentUser: AuthUser | null
  updateProfile: (data: { full_name?: string; profile_picture?: string | null }) => Promise<boolean>
  changePassword: (oldPassword: string, newPassword: string) => Promise<string | true>
  notificationPrefs: { enableEmailNotifications: boolean; enableInquiryAlerts: boolean }
  updateNotificationPrefs: (prefs: { enableEmailNotifications?: boolean; enableInquiryAlerts?: boolean }) => Promise<boolean>
  /** True once localStorage has been read on mount */
  isHydrated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
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

// ─── Provider ──────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [notificationPrefs, setNotificationPrefs] = useState<{ enableEmailNotifications: boolean; enableInquiryAlerts: boolean }>({ enableEmailNotifications: true, enableInquiryAlerts: true })

  // Hydrate from localStorage
  useEffect(() => {
    setIsLoggedIn(loadJson("admin_logged_in", false))
    setAdminEmail(loadJson("admin_email", ""))
    setCurrentUser(loadJson("admin_current_user", null))
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null
    if (storedToken) setAuthToken(storedToken)
    setIsHydrated(true)
  }, [])

  // Fetch notification preferences when user is known
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || !currentUser) return
    apiFetchUserPreferences(currentUser.id)
      .then((prefs) => setNotificationPrefs(prefs))
      .catch(() => {})
  }, [isHydrated, isLoggedIn, currentUser])

  const login = useCallback(async (email: string, password: string): Promise<true | string> => {
    try {
      const resp = await apiLogin(email, password)
      setAuthToken(resp.token)
      const userObj: AuthUser = {
        id: resp.user.id,
        username: resp.user.username,
        fullName: resp.user.fullName || resp.user.username,
        email: resp.user.email,
        role: (resp.user.role || "admin") as UserRole,
        profilePicture: resp.user.profilePicture ?? null,
      }
      setIsLoggedIn(true)
      setAdminEmail(resp.user.email)
      setCurrentUser(userObj)
      saveJson("admin_logged_in", true)
      saveJson("admin_email", resp.user.email)
      saveJson("admin_current_user", userObj)
      return true
    } catch (error) {
      console.error("Login failed:", error instanceof Error ? error.message : error)
      return error instanceof Error ? error.message : "Login failed. Please try again."
    }
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    setIsLoggedIn(false)
    setAdminEmail("")
    setCurrentUser(null)
    saveJson("admin_logged_in", false)
    saveJson("admin_email", "")
    saveJson("admin_current_user", null)
  }, [])

  const updateProfile = useCallback(
    async (data: { full_name?: string; profile_picture?: string | null }): Promise<boolean> => {
      if (!currentUser) return false
      try {
        await apiUpdateProfile(currentUser.id, data)
        const updated: AuthUser = {
          ...currentUser,
          fullName: data.full_name ?? currentUser.fullName,
          profilePicture: data.profile_picture !== undefined ? data.profile_picture : currentUser.profilePicture,
        }
        setCurrentUser(updated)
        saveJson("admin_current_user", updated)
        return true
      } catch (err) {
        console.error("updateProfile error:", err)
        return false
      }
    },
    [currentUser],
  )

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string): Promise<string | true> => {
      if (!currentUser) return "Not logged in."
      try {
        await apiChangePassword(currentUser.id, oldPassword, newPassword)
        return true
      } catch (err) {
        return err instanceof Error ? err.message : "Failed to change password."
      }
    },
    [currentUser],
  )

  const updateNotificationPrefs = useCallback(
    async (prefs: { enableEmailNotifications?: boolean; enableInquiryAlerts?: boolean }): Promise<boolean> => {
      if (!currentUser) return false
      try {
        const res = await apiUpdateUserPreferences(currentUser.id, prefs)
        if (res.preferences) {
          setNotificationPrefs(res.preferences)
        }
        return true
      } catch (err) {
        console.error("updateNotificationPrefs error:", err)
        return false
      }
    },
    [currentUser],
  )

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, adminEmail, currentUser, updateProfile, changePassword, notificationPrefs, updateNotificationPrefs, isHydrated }}
    >
      {children}
    </AuthContext.Provider>
  )
}
