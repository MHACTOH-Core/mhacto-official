"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search, X, FileText, Utensils, Sparkles, Flame, Hammer,
  Users, ShoppingBag, Clock, UserCheck, Landmark, Building2,
  MapPin, GraduationCap, Cross, Newspaper, ArrowRight, Loader2,
} from "lucide-react"
import { searchContent, type SearchResult } from "@/lib/search-index"

// ── Icon map ──────────────────────────────────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  Page:              <FileText className="h-3.5 w-3.5" />,
  Cuisine:           <Utensils className="h-3.5 w-3.5" />,
  Festival:          <Sparkles className="h-3.5 w-3.5" />,
  "Cultural Practice": <Flame className="h-3.5 w-3.5" />,
  Artisan:           <Hammer className="h-3.5 w-3.5" />,
  "People Wonder":   <Users className="h-3.5 w-3.5" />,
  "Local Business":  <ShoppingBag className="h-3.5 w-3.5" />,
  History:           <Clock className="h-3.5 w-3.5" />,
  "Notable Person":  <UserCheck className="h-3.5 w-3.5" />,
  "Heritage Site":   <Landmark className="h-3.5 w-3.5" />,
  Museum:            <Building2 className="h-3.5 w-3.5" />,
  "Religious Site":  <Cross className="h-3.5 w-3.5" />,
  "Tour Package":    <MapPin className="h-3.5 w-3.5" />,
  School:            <GraduationCap className="h-3.5 w-3.5" />,
  Hospital:          <Cross className="h-3.5 w-3.5" />,
  News:              <Newspaper className="h-3.5 w-3.5" />,
}

const categoryColor: Record<string, string> = {
  Page:              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Cuisine:           "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Festival:          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Cultural Practice": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Artisan:           "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  "People Wonder":   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Local Business":  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  History:           "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Notable Person":  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Heritage Site":   "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  Museum:            "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Religious Site":  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "Tour Package":    "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  School:            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Hospital:          "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  News:              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

// ── Quick-access links shown before typing ────────────────────────────
const quickLinks: { label: string; href: string; category: string }[] = [
  { label: "Pagoda Festival",    href: "/culture/festivals-celebrations", category: "Festival" },
  { label: "Tourist Destinations", href: "/destinations",                category: "Heritage Site" },
  { label: "Travel & Tours",     href: "/travel-tours",                  category: "Tour Package" },
  { label: "Local Cuisine",      href: "/culture/local-cuisine",         category: "Cuisine" },
  { label: "People Wonders",     href: "/culture/people-wonders",        category: "People Wonder" },
  { label: "News",               href: "/news",                          category: "News" },
]

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

// Highlight matching text
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5 font-semibold not-italic">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60)
      setQuery("")
      setResults([])
      setActiveIndex(0)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setLoading(false); return }

    setLoading(true)
    debounceRef.current = setTimeout(() => {
      setResults(searchContent(query))
      setActiveIndex(0)
      setLoading(false)
    }, 180)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const list = query.trim() ? results : quickLinks
      const len = list.length
      if (!len) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % len)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + len) % len)
      } else if (e.key === "Enter") {
        e.preventDefault()
        const target = query.trim() ? results[activeIndex]?.href : quickLinks[activeIndex]?.href
        if (target) { router.push(target); onClose() }
      }
    },
    [query, results, activeIndex, router, onClose]
  )

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  // Keyboard shortcut Ctrl/Cmd+K to open (handled by parent, but prevent default here too)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const navigate = (href: string) => { router.push(href); onClose() }

  if (!open) return null

  const hasResults = results.length > 0
  const showQuick = !query.trim()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 top-[10vh] z-[1000] mx-auto w-full max-w-2xl px-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">

          {/* Search input row */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
            {loading
              ? <Loader2 className="h-5 w-5 shrink-0 text-muted-foreground animate-spin" />
              : <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            }
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search Bocaue — places, culture, history, news…"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:flex h-6 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results / Quick links */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
            {showQuick && (
              <div className="p-3">
                <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Quick Access
                </p>
                <div className="space-y-0.5">
                  {quickLinks.map((link, i) => (
                    <button
                      key={link.href}
                      onClick={() => navigate(link.href)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        activeIndex === i ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${categoryColor[link.category] ?? "bg-muted text-muted-foreground"}`}>
                        {iconMap[link.category]}
                      </span>
                      <span className="flex-1 text-sm font-medium text-foreground">{link.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showQuick && !loading && !hasResults && (
              <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                <Search className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-semibold">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-xs mt-1">Try different keywords or browse the menu above.</p>
              </div>
            )}

            {!showQuick && hasResults && (
              <div className="p-3">
                <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-0.5">
                  {results.map((result, i) => (
                    <button
                      key={result.id}
                      onClick={() => navigate(result.href)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        activeIndex === i ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${categoryColor[result.category] ?? "bg-muted text-muted-foreground"}`}>
                        {iconMap[result.category] ?? <FileText className="h-3.5 w-3.5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-snug truncate ${activeIndex === i ? "text-primary" : "text-foreground group-hover:text-primary"} transition-colors`}>
                          <Highlight text={result.title} query={query} />
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          <Highlight text={result.subtitle} query={query} />
                        </p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor[result.category] ?? "bg-muted text-muted-foreground"}`}>
                        {result.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">↵</kbd> Open</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </>
  )
}
