"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Menu, ChevronDown, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { asset, resolveMediaUrl } from "@/lib/utils"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { SearchOverlay } from "@/components/layout/search-overlay"

interface NavItem {
  label: string
  href?: string
  isHash?: boolean
  children?: NavItem[]
}

/** Tri-color "Pagoda" text matching the MHACTO logo branding */
function PagodaText({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  const base = size === "lg" ? "text-lg" : "text-[13px]"
  return (
    <span className={`${base} font-bold tracking-wide ${className ?? ""}`}>
      <span className="text-red-500">P</span>
      <span className="text-red-500">A</span>
      <span className="text-emerald-500">G</span>
      <span className="text-emerald-500">O</span>
      <span className="text-blue-500">D</span>
      <span className="text-blue-500">A</span>
    </span>
  )
}

const navLinks: NavItem[] = [
  { label: "Home", href: "/", isHash: false },
  {
    label: "Bocaue the RiverTown Wonders",
    href: "/bocaue-wonders",
    isHash: false,
    children: [
      {
        label: "History Wonders",
        href: "/history",
        children: [
          { label: "Timeline of Events", href: "/history/timeline", isHash: false },
          { label: "Remarkable Persons", href: "/history/remarkable-persons", isHash: false },
        ],
      },
      {
        label: "Arts & Culture Wonders",
        href: "/culture",
        children: [
          { label: "Culinary Wonders", href: "/culture/culinary-wonders", isHash: false },
          { label: "Bocaue Festival", href: "/culture/festivals-celebrations", isHash: false },
          { label: "Cultural Practices", href: "/culture/practices-traditions", isHash: false },
          { label: "Art Wonders", href: "/culture/art-wonders", isHash: false },
          { label: "People Wonders", href: "/culture/people-wonders", isHash: false },
        ],
      },
      {
        label: "Tourist Wonders",
        href: "/destinations",
        children: [
          { label: "Destinations", href: "/destinations", isHash: false },
          { label: "Travel & Tours", href: "/travel-tours", isHash: false },
        ],
      },
    ],
  },
  {
    label: "Community",
    href: "/community",
    isHash: false,
    children: [
      { label: "Schools", href: "/community/schools", isHash: false },
      { label: "Hospitals", href: "/community/hospitals", isHash: false },
      { label: "Barangays", href: "/community/barangays", isHash: false },
      { label: "Local Businesses", href: "/community/local-business", isHash: false },
    ],
  },
  { label: "News", href: "/news", isHash: false },
  { label: "Events", href: "/events", isHash: false },
  {
    label: "MHACTO Office",
    href: "/tourism-office",
    isHash: false,
    children: [
      { label: "About MHACTO", href: "/tourism-office", isHash: false },
      { label: "Mission & Vision", href: "/mission-vision", isHash: false },
    ],
  },
  { label: "Inquiry", href: "/inquire", isHash: false },
  { label: "Pagoda", href: "/pagoda", isHash: false },
]

// Pixels scrolled before the navbar switches to the scrolled style
const SCROLL_THRESHOLD_PX = 20
// Delay (ms) between closing the mobile menu and opening search, allowing the menu close animation to finish
const MOBILE_SEARCH_OPEN_DELAY_MS = 150

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedMobileLabels, setExpandedMobileLabels] = useState<string[]>([])
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null)
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)
  const [navbarLogoUrl, setNavbarLogoUrl] = useState("")
  const [navbarSecondaryLogoUrl, setNavbarSecondaryLogoUrl] = useState("")
  const [navbarTitle, setNavbarTitle] = useState("")
  const dropdownCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRafIdRef = useRef<number | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const isHomePage = pathname === "/"

  // Use shared settings provider (single API call for navbar + footer)
  const siteSettings = useSiteSettings()
  useEffect(() => {
    if (siteSettings.navbarLogoUrl) setNavbarLogoUrl(siteSettings.navbarLogoUrl)
    if (siteSettings.navbarSecondaryLogoUrl) setNavbarSecondaryLogoUrl(siteSettings.navbarSecondaryLogoUrl)
    if (siteSettings.navbarTitle) setNavbarTitle(siteSettings.navbarTitle)
  }, [siteSettings])

  useEffect(() => {
    const handleScroll = () => {
      // Skip: an animation frame read is already queued
      if (scrollRafIdRef.current != null) return
      scrollRafIdRef.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX)
        scrollRafIdRef.current = null
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollRafIdRef.current != null) cancelAnimationFrame(scrollRafIdRef.current)
    }
  }, [])

  // Cleanup dropdown close timer on unmount
  useEffect(() => {
    return () => {
      if (dropdownCloseTimerRef.current) clearTimeout(dropdownCloseTimerRef.current)
    }
  }, [])

  // Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOverlayOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Determine if a link is active
  const isActive = useCallback(
    (item: NavItem) => {
      if (!item.href) return false
      if (item.isHash && isHomePage) {
        if (typeof window !== "undefined") {
          const currentHash = window.location.hash
          if (item.href === "/#home" && (!currentHash || currentHash === "#home")) return true
          if (item.href === "/#attractions" && currentHash === "#attractions") return true
          return false
        }
        return item.href === "/#home"
      }
      return pathname === item.href || pathname.startsWith(item.href + "/")
    },
    [pathname, isHomePage]
  )

  // Check if any child items are active
  const hasActiveChild = useCallback(
    (item: NavItem): boolean => {
      if (item.children) {
        return item.children.some(
          (child) =>
            isActive(child) ||
            (child.children && child.children.some((subchild) => isActive(subchild)))
        )
      }
      return false
    },
    [isActive]
  )

  // For hash links on the home page, use simple anchors
  const getHref = (item: NavItem) => {
    if (!item.href) return "#"
    if (item.isHash && isHomePage) {
      return item.href.replace("/", "")
    }
    return item.href
  }

  // Handle hash navigation
  const handleHashClick = useCallback(
    (e: React.MouseEvent, item: NavItem) => {
      if (!item.isHash) return
      if (isHomePage) return

      e.preventDefault()
      const hash = item.href?.split("#")[1]
      if (hash) router.push(`/#${hash}`)
    },
    [isHomePage, router]
  )

  /** Toggle a mobile menu item's expanded/collapsed state */
  const toggleMobileExpanded = (label: string) => {
    setExpandedMobileLabels((previousLabels) =>
      previousLabels.includes(label)
        ? previousLabels.filter((l) => l !== label)
        : [...previousLabels, label]
    )
  }

  /** Close mobile menu then open search overlay (with a brief delay for the close animation) */
  const handleMobileSearchOpen = () => {
    setIsMobileMenuOpen(false)
    setTimeout(() => setIsSearchOverlayOpen(true), MOBILE_SEARCH_OPEN_DELAY_MS)
  }

  // Render desktop dropdown
  const renderDesktopDropdown = (item: NavItem) => {
    if (!item.children || item.children.length === 0) return null

    return (
      <div
        key={item.label}
        className="relative group"
        onMouseEnter={() => {
          if (dropdownCloseTimerRef.current) clearTimeout(dropdownCloseTimerRef.current)
          setActiveDesktopDropdown(item.label)
        }}
        onMouseLeave={() => {
          dropdownCloseTimerRef.current = setTimeout(() => setActiveDesktopDropdown(null), 350)
        }}
      >
        {/* Trigger button */}
        <button
          className={`flex items-center gap-0.5 whitespace-nowrap rounded-md px-1.5 py-1.5 text-[12px] lg:text-[13px] font-medium transition-all duration-150 hover:text-primary ${
            hasActiveChild(item) || activeDesktopDropdown === item.label
              ? "text-primary"
              : "text-foreground"
          }`}
        >
          {item.label}
          <ChevronDown
            className={`mt-px h-3 w-3 lg:h-3.5 lg:w-3.5 transition-transform duration-200 ${
              activeDesktopDropdown === item.label ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown panel */}
        <div
          className={`
            absolute left-0 top-[calc(100%+6px)] z-50 min-w-[200px] origin-top-left
            rounded-xl border border-border/50 bg-white/95 shadow-xl backdrop-blur-md
            transition-all duration-200
            ${
              activeDesktopDropdown === item.label
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-1 pointer-events-none"
            }
          `}
        >
          {/* Top accent line */}
          <div className="h-0.5 w-full rounded-t-xl bg-gradient-to-r from-primary via-primary/60 to-transparent" />

          <div className="py-2">
            {item.children.map((child, ci) => (
              <div key={child.label}>
                {/* Divider between top-level children */}
                {ci > 0 && <div className="mx-3 my-1 border-t border-border/40" />}

                {child.children ? (
                  // Category group with flyout
                  <div className="group/sub relative">
                    {child.href ? (
                      <Link
                        href={child.href}
                        className="flex w-full items-center justify-between gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                      >
                        {child.label}
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover/sub:translate-x-0.5" />
                      </Link>
                    ) : (
                      <button
                        className="flex w-full items-center justify-between gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                      >
                        {child.label}
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover/sub:translate-x-0.5" />
                      </button>
                    )}

                    {/* Flyout submenu */}
                    <div
                      className="
                        absolute left-full top-0 z-50 min-w-[210px] origin-top-left
                        rounded-xl border border-border/50 bg-white/95 shadow-xl backdrop-blur-md
                        opacity-0 -translate-x-1 pointer-events-none
                        transition-all duration-200
                        group-hover/sub:opacity-100 group-hover/sub:translate-x-0 group-hover/sub:pointer-events-auto
                      "
                    >
                      <div className="h-0.5 w-full rounded-t-xl bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                      <div className="py-2">
                        {child.children.map((subchild) => (
                          <Link
                            key={subchild.label}
                            href={subchild.href || "#"}
                            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted/70 hover:text-primary ${
                              isActive(subchild)
                                ? "text-primary font-semibold bg-primary/10"
                                : "text-foreground"
                            }`}
                          >
                            <span className="h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                            {subchild.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Direct link
                  <Link
                    href={child.href || "#"}
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted/70 hover:text-primary ${
                      isActive(child)
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-foreground"
                    }`}
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                    {child.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render desktop simple link
  const renderDesktopLink = (item: NavItem) => {
    const isPagoda = item.label === "Pagoda"
    return (
      <Link
        key={item.label}
        href={getHref(item)}
        onClick={(e) => handleHashClick(e, item)}
        className={`whitespace-nowrap rounded-md px-1.5 py-1.5 text-[12px] lg:text-[13px] font-medium transition-all duration-150 hover:opacity-80 ${
          isPagoda
            ? ""
            : isActive(item)
              ? "text-primary hover:text-primary"
              : "text-foreground hover:text-primary"
        }`}
      >
        {isPagoda ? <PagodaText /> : item.label}
      </Link>
    )
  }

  // Render desktop Pagoda link with special styling
  const renderPagodaLink = (item: NavItem) => {
    return (
      <Link
        key={item.label}
        href={getHref(item)}
        className="whitespace-nowrap rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[12px] lg:text-[13px] font-medium transition-all duration-150 hover:bg-muted/60 hover:border-primary/30 hover:shadow-sm"
      >
        <PagodaText />
      </Link>
    )
  }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-blue-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      {/* ═══════════════════ Azure Horizon Water System ═══════════════
          Layer order (bottom → top):
            0. bg-white/80 backdrop-blur-md  (header base)
            1. Sky-light bloom               (static radial from top-center)
            2. Depth gradient                (static, top→bottom deepens)
            3. Diagonal refraction wash      (static, angular color shift)
            4. Edge ambient glows            (static, left + right radials)
            5. Breathing shimmer             (1 animation, 26s alternate)
            6. Wave body                     (2 wave fills, fills bottom ~48%)
      ════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes navFloat {
          0%   { transform: translateX(-5%) }
          100% { transform: translateX(5%)  }
        }
        @keyframes navWave {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
      `}</style>

      {/* ── 1. Sky-light bloom: large soft radial from above ───────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 240% at 50% -15%, rgba(186,230,253,0.30) 0%, rgba(219,234,254,0.10) 55%, transparent 80%)',
        }}
      />

      {/* ── 2. Depth gradient: water deepens toward bottom ──────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(186,230,253,0.07) 38%, rgba(96,165,250,0.17) 100%)',
        }}
      />

      {/* ── 3. Diagonal refraction wash: angular split of cool light ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden
        style={{
          background:
            'linear-gradient(114deg, rgba(219,234,254,0.24) 0%, transparent 44%, rgba(186,230,253,0.18) 100%)',
        }}
      />

      {/* ── 4. Edge ambient glows: soft blue columns at each side ───── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden
        style={{
          background: [
            'radial-gradient(ellipse 26% 130% at 0% 50%, rgba(147,197,253,0.15) 0%, transparent 100%)',
            'radial-gradient(ellipse 26% 130% at 100% 50%, rgba(147,197,253,0.13) 0%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/* ── 5. Breathing shimmer: one slow diagonal light drift ──────── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <div
          style={{
            position: 'absolute',
            inset: '-6px',
            background:
              'linear-gradient(108deg, transparent 20%, rgba(147,197,253,0.10) 50%, transparent 80%)',
            animation: 'navFloat 26s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* ── 6. Wave body: fills bottom ~48% of the navbar ────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[28px] pointer-events-none z-[1] overflow-hidden" aria-hidden>
        {/* Soft glow bloom behind the wave fills */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.07) 100%)',
          }}
        />

        {/* Wave A — back layer, deep blue fill, very slow */}
        <svg
          style={{ position: 'absolute', bottom: 0, width: '200%', height: '28px', animation: 'navWave 28s linear infinite' }}
          viewBox="0 0 2880 28"
          preserveAspectRatio="none"
        >
          <path
            d="M0,14 C360,3 720,3 1080,14 C1440,25 1800,25 2160,14 C2520,3 2880,3 2880,14 L2880,28 L0,28 Z"
            fill="rgba(37,99,235,0.11)"
          />
        </svg>

        {/* Wave B — front layer, lighter fill, inverted swell, offset start */}
        <svg
          style={{ position: 'absolute', bottom: 0, width: '200%', height: '22px', animation: 'navWave 19s linear infinite', animationDelay: '-7s' }}
          viewBox="0 0 2880 22"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="navWaveFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(59,130,246,0.12)" />
              <stop offset="100%" stopColor="rgba(37,99,235,0.22)" />
            </linearGradient>
          </defs>
          <path
            d="M0,11 C360,20 720,20 1080,11 C1440,2 1800,2 2160,11 C2520,20 2880,20 2880,11 L2880,22 L0,22 Z"
            fill="url(#navWaveFill)"
          />
        </svg>
      </div>

      <nav className="relative z-[2] mx-auto flex max-w-screen-2xl items-center gap-3 px-4 py-2.5 lg:py-5 lg:px-8">
        {/* Left – MHACTO logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={resolveMediaUrl(navbarLogoUrl || "/uploads/images/logos/MHACTO_LOGO.png")}
            alt="MHACTO Bocaue Logo"
            width={160}
            height={42}
            className="h-8 lg:h-9 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
            priority
          />
        </Link>

        {/* Center – Desktop nav links + search */}
        <div className="hidden items-center gap-0.5 md:flex lg:gap-1 min-w-0 flex-1 justify-center">
          {navLinks.map((item) =>
            item.label === "Pagoda"
              ? renderPagodaLink(item)
              : item.children
                ? renderDesktopDropdown(item)
                : renderDesktopLink(item)
          )}

          {/* Search button */}
          <button
            onClick={() => setIsSearchOverlayOpen(true)}
            className="hidden md:flex items-center justify-center ml-1 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Right – Bocaue logo + mobile menu */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link href="/" className="hidden md:flex shrink-0 items-center gap-1.5">
            <Image
              src={resolveMediaUrl(navbarSecondaryLogoUrl || "/uploads/images/logos/Municipality_of_bocaue.png")}
              alt="Municipality of Bocaue Logo"
              width={52}
              height={52}
              className="h-10 w-10 lg:h-11 lg:w-11 object-contain"
            />
            <span className="hidden xl:block text-xs font-semibold leading-tight text-foreground">
              {navbarTitle ? navbarTitle : <>Municipality<br />of Bocaue</>}
            </span>
          </Link>

          {/* Mobile nav */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card overflow-y-auto">
              <SheetTitle className="text-foreground">Menu</SheetTitle>
              {/* MHACTO logo in mobile menu */}
              <div className="mt-4 mb-4 flex justify-center">
                <Image
                  src={resolveMediaUrl(navbarLogoUrl || "/uploads/images/logos/MHACTO_LOGO.png")}
                  alt="MHACTO Bocaue Logo"
                  width={140}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
              </div>
              {/* Mobile search button */}
              <button
                onClick={handleMobileSearchOpen}
                className="mb-5 flex w-full items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span>Search…</span>
              </button>
              <div className="flex flex-col gap-4">
                {navLinks.map((item) => (
                  <div key={item.label}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <button
                          onClick={() => toggleMobileExpanded(item.label)}
                          className={`w-full text-left text-lg font-medium transition-colors flex items-center justify-between hover:text-primary ${
                            hasActiveChild(item) || expandedMobileLabels.includes(item.label)
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {item.label}
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              expandedMobileLabels.includes(item.label) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedMobileLabels.includes(item.label) && (
                          <div className="pl-4 mt-2 space-y-3 border-l-2 border-primary/20">
                            {item.children.map((child) => (
                              <div key={child.label}>
                                {child.children && child.children.length > 0 ? (
                                  <>
                                    <div className="flex items-center justify-between">
                                      {child.href ? (
                                        <Link
                                          href={child.href}
                                          className={`flex-1 text-base font-medium transition-colors hover:text-primary ${
                                            expandedMobileLabels.includes(child.label)
                                              ? "text-primary"
                                              : "text-foreground"
                                          }`}
                                          onClick={() => {
                                            setIsMobileMenuOpen(false)
                                            setExpandedMobileLabels([])
                                          }}
                                        >
                                          {child.label}
                                        </Link>
                                      ) : (
                                        <span className={`flex-1 text-base font-medium ${
                                          expandedMobileLabels.includes(child.label) ? "text-primary" : "text-foreground"
                                        }`}>
                                          {child.label}
                                        </span>
                                      )}
                                      <button
                                        onClick={() => toggleMobileExpanded(child.label)}
                                        className="p-1 hover:text-primary"
                                      >
                                        <ChevronDown
                                          className={`h-4 w-4 transition-transform ${
                                            expandedMobileLabels.includes(child.label) ? "rotate-180" : ""
                                          }`}
                                        />
                                      </button>
                                    </div>
                                    {expandedMobileLabels.includes(child.label) && (
                                      <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/10">
                                        {child.children.map((subchild) => (
                                          <Link
                                            key={subchild.label}
                                            href={subchild.href || "#"}
                                            className={`block text-base font-medium transition-colors hover:text-primary ${
                                              isActive(subchild)
                                                ? "text-primary"
                                                : "text-foreground"
                                            }`}
                                            onClick={() => {
                                              setIsMobileMenuOpen(false)
                                              setExpandedMobileLabels([])
                                            }}
                                          >
                                            {subchild.label}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <Link
                                    href={child.href || "#"}
                                    className={`block text-base font-medium transition-colors hover:text-primary ${
                                      isActive(child)
                                        ? "text-primary"
                                        : "text-foreground"
                                    }`}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false)
                                      setExpandedMobileLabels([])
                                    }}
                                  >
                                    {child.label}
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={getHref(item)}
                        className={`text-lg font-medium transition-colors ${
                          item.label === "Pagoda"
                            ? "hover:opacity-80"
                            : isActive(item)
                              ? "text-primary hover:text-primary"
                              : "text-foreground hover:text-primary"
                        }`}
                        onClick={(e) => {
                          handleHashClick(e, item)
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        {item.label === "Pagoda" ? <PagodaText size="lg" /> : item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
        </Sheet>
        </div>
      </nav>
    </header>

    <SearchOverlay open={isSearchOverlayOpen} onClose={() => setIsSearchOverlayOpen(false)} />
    </>
  )
}
