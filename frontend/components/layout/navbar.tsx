"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Menu, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { asset } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

interface NavItem {
  label: string
  href?: string
  isHash?: boolean
  children?: NavItem[]
}

const navLinks: NavItem[] = [
  { label: "Home", href: "/", isHash: false },
  { label: "Mission & Vision", href: "/mission-vision", isHash: false },
  { label: "Tourism Office / Organization", href: "/tourism-office", isHash: false },
  {
    label: "History",
    children: [
      { label: "Timeline of Events", href: "/history/timeline", isHash: false },
      { label: "Notable Persons", href: "/history/notable-persons", isHash: false },
    ],
  },
  {
    label: "Art & Culture",
    children: [
      {
        label: "Culture",
        children: [
          { label: "Local Cuisine", href: "/culture/local-cuisine", isHash: false },
          { label: "Festivals & Celebrations", href: "/culture/festivals-celebrations", isHash: false },
          { label: "Cultural Practices & Traditions", href: "/culture/practices-traditions", isHash: false },
        ],
      },
      {
        label: "Arts & Livelihood",
        children: [
          { label: "Local Business", href: "/arts-livelihood/local-business", isHash: false },
          { label: "Crafts & Artisans", href: "/arts-livelihood/crafts-artisans", isHash: false },
        ],
      },
    ],
  },
  {
    label: "Tourism",
    children: [
      {
        label: "Destinations",
        children: [
          { label: "Heritage Sites", href: "/destinations/heritage-sites", isHash: false },
          { label: "Museums", href: "/destinations/museums", isHash: false },
          { label: "Religious Sites", href: "/destinations/religious-sites", isHash: false },
        ],
      },
      { label: "Travel and Tours", href: "/travel-tours", isHash: false },
    ],
  },
  {
    label: "Community",
    children: [
      {
        label: "Educational Institutions",
        children: [
          { label: "Colleges", href: "/community/colleges", isHash: false },
          { label: "Public Schools", href: "/community/public-schools", isHash: false },
        ],
      },
      { label: "Hospitals", href: "/community/hospitals", isHash: false },
    ],
  },
  { label: "Events", href: "/events", isHash: false },
  { label: "News", href: "/news", isHash: false },
  { label: "Inquiry", href: "/inquiry", isHash: false },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const isHomePage = pathname === "/"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
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

  // Toggle expanded items in mobile menu
  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    )
  }

  // Render desktop dropdown
  const renderDesktopDropdown = (item: NavItem) => {
    if (!item.children || item.children.length === 0) return null

    return (
      <div
        key={item.label}
        className="relative group"
        onMouseEnter={() => setHoveredDropdown(item.label)}
        onMouseLeave={() => setHoveredDropdown(null)}
      >
        {/* Trigger button */}
        <button
          className={`flex items-center gap-0.5 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-150 hover:bg-accent hover:text-primary ${
            hasActiveChild(item) || hoveredDropdown === item.label
              ? "text-primary bg-accent/60"
              : "text-foreground"
          }`}
        >
          {item.label}
          <ChevronDown
            className={`mt-px h-3.5 w-3.5 transition-transform duration-200 ${
              hoveredDropdown === item.label ? "rotate-180" : ""
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
              hoveredDropdown === item.label
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
                    <button
                      className="flex w-full items-center justify-between gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent/60 hover:text-primary"
                    >
                      {child.label}
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover/sub:translate-x-0.5" />
                    </button>

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
                            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-accent/60 hover:text-primary ${
                              isActive(subchild)
                                ? "text-primary font-semibold bg-accent/40"
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
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-accent/60 hover:text-primary ${
                      isActive(child)
                        ? "text-primary font-semibold bg-accent/40"
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
    return (
      <Link
        key={item.label}
        href={getHref(item)}
        onClick={(e) => handleHashClick(e, item)}
        className={`rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-150 hover:bg-accent hover:text-primary ${
          isActive(item)
            ? "text-primary bg-accent/60"
            : "text-foreground"
        }`}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-2 lg:px-8">
        {/* Left – MHACTO logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={asset("/images/logos/MHACTO_LOGO.png")}
            alt="MHACTO Bocaue Logo"
            width={180}
            height={48}
            className="h-9 sm:h-10 w-auto object-contain"
            style={{ imageRendering: 'crisp-edges' }}
            priority
          />
        </Link>

        {/* Center – Desktop nav links */}
        <div className="hidden items-center gap-0.5 md:flex lg:gap-1">
          {navLinks.map((item) =>
            item.children
              ? renderDesktopDropdown(item)
              : renderDesktopLink(item)
          )}
        </div>

        {/* Right – Municipality of Bocaue logo + mobile menu */}
        <div className="flex items-center gap-2">
          <Link href="/" className="hidden md:flex shrink-0 items-center gap-2">
            <Image
              src={asset("/images/logos/Municipality_of_bocaue.png")}
              alt="Municipality of Bocaue Logo"
              width={56}
              height={56}
              className="h-11 w-11 sm:h-12 sm:w-12 object-contain"
              priority
            />
            <span className="hidden xl:block text-xs font-semibold leading-tight text-foreground">
              Municipality<br />of Bocaue
            </span>
          </Link>

          {/* Mobile nav */}
          <Sheet open={open} onOpenChange={setOpen}>
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
              <div className="mt-4 mb-6 flex justify-center">
                <Image
                  src={asset("/images/logos/MHACTO_LOGO.png")}
                  alt="MHACTO Bocaue Logo"
                  width={140}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col gap-4">
                {navLinks.map((item) => (
                  <div key={item.label}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <button
                          onClick={() => toggleExpanded(item.label)}
                          className={`w-full text-left text-lg font-medium transition-colors flex items-center justify-between hover:text-primary ${
                            hasActiveChild(item) || expandedItems.includes(item.label)
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {item.label}
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              expandedItems.includes(item.label) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedItems.includes(item.label) && (
                          <div className="pl-4 mt-2 space-y-3 border-l-2 border-primary/20">
                            {item.children.map((child) => (
                              <div key={child.label}>
                                {child.children && child.children.length > 0 ? (
                                  <>
                                    <button
                                      onClick={() => toggleExpanded(child.label)}
                                      className={`w-full text-left text-base font-medium transition-colors flex items-center justify-between hover:text-primary ${
                                        expandedItems.includes(child.label)
                                          ? "text-primary"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {child.label}
                                      <ChevronDown
                                        className={`h-4 w-4 transition-transform ${
                                          expandedItems.includes(child.label) ? "rotate-180" : ""
                                        }`}
                                      />
                                    </button>
                                    {expandedItems.includes(child.label) && (
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
                                              setOpen(false)
                                              setExpandedItems([])
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
                                      setOpen(false)
                                      setExpandedItems([])
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
                        className={`text-lg font-medium transition-colors hover:text-primary ${
                          isActive(item) ? "text-primary" : "text-foreground"
                        }`}
                        onClick={(e) => {
                          handleHashClick(e, item)
                          setOpen(false)
                        }}
                      >
                        {item.label}
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
  )
}
