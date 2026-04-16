"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiFetchSettings } from "@/lib/api"

interface SiteSettings {
  navbarLogoUrl: string
  navbarSecondaryLogoUrl: string
  navbarTitle: string
  facebookUrl: string
  instagramUrl: string
}

const defaults: SiteSettings = {
  navbarLogoUrl: "",
  navbarSecondaryLogoUrl: "",
  navbarTitle: "",
  facebookUrl: "",
  instagramUrl: "",
}

const SiteSettingsContext = createContext<SiteSettings>(defaults)

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults)

  useEffect(() => {
    let cancelled = false
    apiFetchSettings()
      .then((s) => {
        if (cancelled || !s) return
        setSettings({
          navbarLogoUrl: s.navbarLogoUrl ?? "",
          navbarSecondaryLogoUrl: s.navbarSecondaryLogoUrl ?? "",
          navbarTitle: s.navbarTitle ?? "",
          facebookUrl: s.facebookUrl ?? "",
          instagramUrl: s.instagramUrl ?? "",
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}
