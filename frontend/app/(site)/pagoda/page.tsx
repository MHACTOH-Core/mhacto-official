"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, type Variants } from "framer-motion"
import { apiFetchByLabel } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { asset, resolveMediaUrl } from "@/lib/utils"

/* ── Design tokens — Pagoda sa Bocaue blue gradient palette ──────── */
const BG        = "hsl(222, 30%, 8%)"          // deep midnight blue
const BG_CARD   = "hsl(222, 28%, 12%)"         // slightly lighter card
const BG_MUTED  = "hsl(222, 22%, 17%)"         // muted panel
const GOLD      = "hsl(215, 75%, 60%)"         // vibrant blue accent
const GOLD_DIM  = "hsla(215, 75%, 60%, 0.12)"
const RED       = "hsl(235, 55%, 50%)"         // deep indigo accent
const RED_DIM   = "hsla(235, 55%, 50%, 0.10)"
const TEAL      = "hsl(195, 85%, 62%)"         // sky blue / cyan accent
const TEAL_DIM  = "hsla(195, 85%, 62%, 0.15)"
const WARM      = "hsl(210, 25%, 96%)"         // cool white for headings
const TEXT_BODY  = "hsl(210, 15%, 82%)"        // light blue-gray body
const TEXT_DIM   = "hsl(215, 12%, 55%)"        // muted blue-gray
const SERIF     = "'Poppins', sans-serif"

/* ── Animation presets ────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const
const fadeUp   = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6, ease: EASE } }
const scaleIn  = { initial: { opacity: 0, scale: 0.94 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.6, ease: EASE } }
const blurUp   = { initial: { opacity: 0, y: 20, filter: 'blur(8px)' }, whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.7, ease: EASE } }

/* Stagger container + child variants for cascading reveals */
const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: EASE } },
}

/* Image reveal — smooth fade + scale entrance */
const imageReveal = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: EASE },
}

/* ── Scroll Progress Bar ─────────────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left"
      style={{
        scaleX: scrollYProgress,
        background: `linear-gradient(90deg, ${TEAL}, hsl(175, 55%, 72%), ${TEAL})`,
        boxShadow: `0 0 12px ${TEAL}60`,
      }}
    />
  )
}

/* ── Scroll-down Hero Indicator — elegant chevron ────────────────── */
function ScrollIndicator() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY < 100)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
    >
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: TEXT_DIM }}>
        Scroll down
      </span>
      <motion.div className="flex flex-col items-center gap-[2px]">
        {[0, 1, 2].map((i) => (
          <motion.svg
            key={i}
            width="20" height="8" viewBox="0 0 20 8" fill="none"
            animate={{ y: [0, 4, 0], opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
          >
            <path d="M1 1L10 6.5L19 1" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ── Parallax Image Section ──────────────────────────────────────── */
function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ''}`}>
      <motion.div className="relative w-full h-full" style={{ y }}>
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 550px" className="object-cover scale-[1.16]" />
      </motion.div>
    </div>
  )
}

/* ── Fallback data ────────────────────────────────────────────────── */
interface SubBlock { image: string; title: string; text: string }

const FALLBACK_HERO = asset("/images/defaults/no-image.svg")
const FALLBACK_OVERVIEW = "The Pagoda sa Bocaue is one of Bulacan's most cherished river festivals, a centuries-old tradition honoring the Holy Cross of Wawa. Every first Sunday of July, the Bocaue River transforms into a vibrant waterway filled with lavishly decorated boats, floating pagodas, and devotees crossing the river in a spectacular procession of faith and culture."

const FALLBACK_SUBS: SubBlock[] = [
  {
    image: asset("/images/defaults/no-image.svg"),
    title: "The Sacred Cross-River Procession",
    text: "At the heart of the Pagoda festival lies the dramatic fluvial procession — a grand parade of ornately decorated boats carrying the Holy Cross across the Bocaue River. Devotees and spectators line both riverbanks as colorful floats adorned with flowers, banners, and religious icons glide across the shimmering waters.",
  },
  {
    image: asset("/images/defaults/no-image.svg"),
    title: "A Night of Fire & Light",
    text: "As dusk falls over the Bocaue River, the sky erupts in a breathtaking display of fireworks that illuminates the floating pagodas below. The reflection of golden sparks dancing across the dark water creates an unforgettable spectacle — a perfect union of fire above and river below, celebrating centuries of devotion.",
  },
  {
    image: asset("/images/defaults/no-image.svg"),
    title: "Faith Rooted in Heritage",
    text: "The origins of the Pagoda festival trace back to the miraculous discovery of the Holy Cross of Wawa in the Bocaue River. The tradition of carrying it across the water has endured for generations, surviving typhoons, tragedies, and the passage of time — a testament to the unshakeable faith of the Bocaueños.",
  },
]

const FALLBACK_GALLERY = [
  asset("/images/defaults/no-image.svg"),
  asset("/images/defaults/no-image.svg"),
  asset("/images/defaults/no-image.svg"),
  asset("/images/defaults/no-image.svg"),
  asset("/images/defaults/no-image.svg"),
  asset("/images/defaults/no-image.svg"),
]

/* Gallery detail data — descriptions for each gallery image */
interface GalleryItem { title: string; description: string; category: string }
const GALLERY_DETAILS: GalleryItem[] = [
  {
    title: "Fluvial Procession on the Bocaue River",
    description: "Colorful boats adorned with flowers, religious icons, and vibrant banners sail across the Bocaue River during the annual Pagoda festival. Devotees from all over Bulacan gather along the riverbanks to witness this spectacular fluvial parade honoring the Holy Cross of Wawa.",
    category: "Procession",
  },
  {
    title: "Fireworks Over the River",
    description: "A breathtaking display of fireworks illuminates the night sky above the Bocaue River, casting golden and crimson reflections on the water below. This pyrotechnic spectacle marks the climax of the Pagoda festival, symbolizing the fire of faith that has burned for over 400 years.",
    category: "Celebration",
  },
  {
    title: "Bocaue Church — Home of the Holy Cross",
    description: "The historic church of Bocaue, where the Holy Cross of Wawa is enshrined year-round. Built during the Spanish colonial era, this church serves as the spiritual heart of the Pagoda festival and the starting point of the sacred cross-river procession.",
    category: "Heritage",
  },
  {
    title: "Old Town Bocaue — Streets of Tradition",
    description: "The charming streets and ancestral houses of old Bocaue come alive during the Pagoda festival. Locals decorate their homes with banderitas and religious imagery, while street vendors fill the air with the aroma of traditional Filipino delicacies.",
    category: "Culture",
  },
  {
    title: "Decorated Floats Along the Waterway",
    description: "Intricately decorated barges and floats glide along the river, each one a masterpiece of devotion. Families and barangays compete to create the most beautiful float, showcasing months of preparation and craftsmanship passed down through generations.",
    category: "Procession",
  },
  {
    title: "Evening Celebration by the River",
    description: "As twilight settles over the Bocaue River, the floating pagodas glow with hundreds of lanterns and candles. The evening celebration brings together music, prayer, and community — a sacred moment where the river becomes a mirror reflecting centuries of unwavering faith.",
    category: "Celebration",
  },
]



/* ── Wave Section Divider ─────────────────────────────────────────── */
function WaveDivider({ colorTop, colorBottom }: { colorTop: string; colorBottom: string }) {
  return (
    <div className="relative w-full overflow-hidden select-none" style={{ height: 70, backgroundColor: colorTop }} aria-hidden>
      <svg className="absolute bottom-0 w-[200%]" style={{ animation: 'waveFlow1 16s linear infinite', height: '100%' }} viewBox="0 0 2880 120" preserveAspectRatio="none">
        <path d="M0,40 C240,90 480,15 720,55 C960,95 1200,25 1440,40 C1680,90 1920,15 2160,55 C2400,95 2640,25 2880,40 L2880,120 L0,120Z" fill={colorBottom} opacity="0.3" />
      </svg>
      <svg className="absolute bottom-0 w-[200%]" style={{ animation: 'waveFlow2 10s linear infinite', height: '70%' }} viewBox="0 0 2880 120" preserveAspectRatio="none">
        <path d="M0,60 C360,15 720,95 1080,50 C1260,30 1380,85 1440,60 C1800,15 2160,95 2520,50 C2700,30 2820,85 2880,60 L2880,120 L0,120Z" fill={colorBottom} opacity="0.6" />
      </svg>
      <svg className="absolute bottom-0 w-[200%]" style={{ animation: 'waveFlow3 7s linear infinite', height: '45%' }} viewBox="0 0 2880 120" preserveAspectRatio="none">
        <path d="M0,75 C180,35 540,95 720,60 C900,25 1260,85 1440,75 C1620,35 1980,95 2160,60 C2340,25 2700,85 2880,75 L2880,120 L0,120Z" fill={colorBottom} opacity="0.9" />
      </svg>
    </div>
  )
}

export default function PagodaPage() {
  const [heroImage, setHeroImage] = useState(FALLBACK_HERO)
  const [overview, setOverview] = useState(FALLBACK_OVERVIEW)
  const [subs, setSubs] = useState<SubBlock[]>(FALLBACK_SUBS)
  const [gallery, setGallery] = useState<string[]>(FALLBACK_GALLERY)
  const [galleryDetail, setGalleryDetail] = useState<number | null>(null)
  const galleryScrollRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()

  // Auto-slideshow: continuous infinite loop scrolling left
  useEffect(() => {
    const container = galleryScrollRef.current
    if (!container) return
    let animFrame: number
    const speed = 0.5 // px per frame
    let paused = false

    const step = () => {
      if (!paused && container) {
        container.scrollLeft += speed
        // Seamless loop: the strip renders 2 copies of the gallery.
        // When we've scrolled past the first copy, jump back by exactly
        // half the total scroll width so the user sees no visual break.
        const halfScroll = container.scrollWidth / 2
        if (container.scrollLeft >= halfScroll) {
          container.scrollLeft -= halfScroll
        }
      }
      animFrame = requestAnimationFrame(step)
    }
    animFrame = requestAnimationFrame(step)

    const pause = () => { paused = true }
    const resume = () => { paused = false }
    container.addEventListener('mouseenter', pause)
    container.addEventListener('mouseleave', resume)
    container.addEventListener('touchstart', pause, { passive: true })
    container.addEventListener('touchend', resume)

    return () => {
      cancelAnimationFrame(animFrame)
      container.removeEventListener('mouseenter', pause)
      container.removeEventListener('mouseleave', resume)
      container.removeEventListener('touchstart', pause)
      container.removeEventListener('touchend', resume)
    }
  }, [gallery])

  // Lightbox keyboard navigation
  useEffect(() => {
    if (galleryDetail === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGalleryDetail(null)
      if (e.key === 'ArrowRight') setGalleryDetail((prev) => (prev !== null ? (prev + 1) % gallery.length : null))
      if (e.key === 'ArrowLeft') setGalleryDetail((prev) => (prev !== null ? (prev - 1 + gallery.length) % gallery.length : null))
    }
    // Prevent scroll when lightbox is open
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [galleryDetail, gallery.length])

  useEffect(() => {
    apiFetchByLabel("pagoda")
      .then((posts: CMSPost[]) => {
        if (posts?.length) {
          const post = posts[0]
          const allImages = (post.image ?? []).map((img) => resolveMediaUrl(img)).filter(Boolean)
          if (allImages.length > 0) {
            setHeroImage(allImages[0])
            setGallery(allImages.length >= 6 ? allImages.slice(0, 6) : allImages.length >= 3 ? [...allImages.slice(0, 3), ...allImages.slice(0, 3)] : FALLBACK_GALLERY)
            setSubs((prev) => prev.map((b, i) => ({ ...b, image: allImages[(i + 1) % allImages.length] || allImages[0] })))
          }
        }
      })
      .catch((err) => { console.error("Failed to load pagoda data:", err.message) })
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden" data-no-reveal style={{ backgroundColor: BG, color: TEXT_BODY }}>

      {/* ─── All CSS Keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes waveFlow1 { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes waveFlow2 { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes waveFlow3 { 0% { transform: translateX(-50%) } 100% { transform: translateX(0) } }
        @keyframes gentlePulse {
          0%, 100% { opacity: 0.4; transform: scale(1) }
          50%      { opacity: 0.8; transform: scale(1.05) }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1) }
          25%      { transform: translate(60px, -80px) scale(1.15) }
          50%      { transform: translate(-40px, -120px) scale(0.9) }
          75%      { transform: translate(80px, -50px) scale(1.1) }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1) }
          33%      { transform: translate(-70px, -90px) scale(1.12) }
          66%      { transform: translate(50px, -40px) scale(0.88) }
        }
        @keyframes auraPulse {
          0%, 100% { transform: scale(1); opacity: 0.6 }
          50%      { transform: scale(1.2); opacity: 1 }
        }
        @keyframes particleRise {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0 }
          10%  { opacity: 1 }
          50%  { transform: translateY(-60px) translateX(8px) scale(1.1); opacity: 0.8 }
          80%  { transform: translateY(-110px) translateX(-5px) scale(0.6); opacity: 0.3 }
          100% { transform: translateY(-140px) translateX(3px) scale(0.2); opacity: 0 }
        }
        @keyframes particleSway {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0 }
          10%  { opacity: 0.9 }
          40%  { transform: translateY(-50px) translateX(-10px) scale(1.15); opacity: 0.7 }
          70%  { transform: translateY(-95px) translateX(6px) scale(0.5); opacity: 0.25 }
          100% { transform: translateY(-130px) translateX(-3px) scale(0.15); opacity: 0 }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Ambient floating orbs — subtle blue atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden" aria-hidden>
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px]" style={{ top: '15%', left: '5%', backgroundColor: GOLD, opacity: 0.08, animation: 'orbFloat1 25s ease-in-out infinite' }} />
        <div className="absolute w-[450px] h-[450px] rounded-full blur-[130px]" style={{ top: '55%', right: '3%', backgroundColor: TEAL, opacity: 0.06, animation: 'orbFloat2 30s ease-in-out infinite' }} />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO — Immersive full-screen river festival banner
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-screen overflow-hidden">

        {/* ── Background hero image — full-bleed, masked to fade left-to-right ── */}
        <div className="absolute inset-0 z-[1]">
          {/* The image itself is masked — invisible on the left, fades in toward the right */}
          <div className="absolute inset-0" style={{
            WebkitMaskImage: `linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.7) 50%, black 65%)`,
            maskImage: `linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.7) 50%, black 65%)`,
          }}>
            <Image src={heroImage} alt="Pagoda sa Bocaue Festival" fill priority sizes="100vw" className="object-cover object-[65%_25%]" />
          </div>
          {/* Subtle dim over the visible image for depth */}
          <div className="absolute inset-0" style={{ background: `${BG}33` }} />
          {/* Bottom fade — image dissolves into background */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 0%, ${BG}ee 10%, ${BG}88 30%, transparent 55%)` }} />
          {/* Top vignette */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}88 0%, transparent 20%)` }} />
          {/* Soft right edge fade */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to left, ${BG}55 0%, transparent 12%)` }} />
        </div>

        {/* Hero text content — left side */}
        <div className="relative z-10 mx-auto max-w-7xl h-full px-5 sm:px-10 lg:px-16 flex items-end sm:items-center pt-24 sm:pt-32 lg:pt-0 pb-24 sm:pb-20 lg:pb-0 min-h-[85vh] sm:min-h-[90vh] lg:min-h-screen">

          <div className="max-w-[320px] sm:max-w-md">
            {/* Festival badge */}
            <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}>
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] px-4 py-2 rounded-full border"
                style={{ color: GOLD, borderColor: `${GOLD}50`, backgroundColor: `${GOLD}12` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: GOLD }} />
                Bocaue River Festival
              </span>
            </motion.div>

            {/* Main title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.01, delay: 0.1 }}
              className="mt-4 sm:mt-5 text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.9] tracking-tight"
              style={{ fontFamily: SERIF }}
            >
              <motion.span
                className="block bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ backgroundImage: `linear-gradient(135deg, ${WARM} 0%, ${GOLD} 100%)` }}
              >Pagoda</motion.span>
              <motion.span
                className="block font-bold text-[0.55em] mt-1 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ backgroundImage: `linear-gradient(135deg, ${TEAL} 0%, hsl(175, 55%, 72%) 100%)` }}
              >sa Bocaue</motion.span>
            </motion.h1>

            {/* Decorative line */}
            <motion.div
              className="mt-4 h-[2px] rounded-full"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 80, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: `linear-gradient(90deg, ${TEAL}, ${GOLD})` }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-sm sm:text-base leading-relaxed"
              style={{ color: `${WARM}bb` }}
            >
              A centuries-old fluvial procession honoring the Holy Cross of Wawa — where faith, river, and celebration unite.
            </motion.p>

            {/* Date callout */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] as const }}
              className="mt-6 sm:mt-8 inline-flex items-center gap-3 sm:gap-4 rounded-2xl px-4 py-3 sm:px-7 sm:py-4 border backdrop-blur-sm"
              style={{ backgroundColor: `${BG_CARD}bb`, borderColor: `${GOLD}20` }}
            >
              <div className="flex flex-col items-center justify-center rounded-xl w-12 h-12 sm:w-16 sm:h-16 shrink-0"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${RED})` }}>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-none" style={{ color: BG }}>Jul</span>
                <span className="text-base sm:text-lg font-black leading-none mt-0.5" style={{ color: BG }}>1st</span>
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold" style={{ color: WARM }}>Cross River Procession</p>
                <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: TEXT_DIM }}>Every 1st Sunday of July</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RED, animation: 'gentlePulse 2s ease-in-out infinite' }} />
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Annual Celebration</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Blue fire-like rising particles */}
        <div className="absolute inset-0 pointer-events-none z-[25] overflow-hidden" aria-hidden>
          {[
            { bottom: '8%',  left: '5%',   s: 5, delay: 0,    dur: 3.2, anim: 'particleRise' },
            { bottom: '12%', left: '12%',  s: 3, delay: 0.6,  dur: 2.8, anim: 'particleSway' },
            { bottom: '5%',  left: '20%',  s: 4, delay: 1.2,  dur: 3.5, anim: 'particleRise' },
            { bottom: '10%', left: '30%',  s: 3, delay: 0.3,  dur: 2.6, anim: 'particleSway' },
            { bottom: '15%', left: '42%',  s: 5, delay: 1.8,  dur: 3.0, anim: 'particleRise' },
            { bottom: '8%',  left: '50%',  s: 4, delay: 0.9,  dur: 3.4, anim: 'particleSway' },
            { bottom: '6%',  left: '58%',  s: 3, delay: 2.1,  dur: 2.9, anim: 'particleRise' },
            { bottom: '12%', left: '68%',  s: 5, delay: 0.4,  dur: 3.1, anim: 'particleSway' },
            { bottom: '9%',  left: '76%',  s: 4, delay: 1.5,  dur: 3.6, anim: 'particleRise' },
            { bottom: '14%', left: '85%',  s: 3, delay: 0.7,  dur: 2.7, anim: 'particleSway' },
            { bottom: '7%',  left: '92%',  s: 4, delay: 2.4,  dur: 3.3, anim: 'particleRise' },
            { bottom: '18%', left: '8%',   s: 3, delay: 1.0,  dur: 3.8, anim: 'particleSway' },
            { bottom: '4%',  left: '36%',  s: 5, delay: 2.0,  dur: 2.5, anim: 'particleRise' },
            { bottom: '11%', left: '62%',  s: 3, delay: 1.4,  dur: 3.0, anim: 'particleSway' },
            { bottom: '16%', left: '48%',  s: 4, delay: 0.2,  dur: 3.2, anim: 'particleRise' },
          ].map((p, i) => (
            <div key={i} className="absolute rounded-full" style={{
              bottom: p.bottom,
              left: p.left,
              width: p.s,
              height: p.s,
              background: `radial-gradient(circle, hsla(195,85%,68%,0.9), hsla(215,75%,55%,0.4))`,
              boxShadow: `0 0 ${p.s + 4}px hsla(195,85%,62%,0.5), 0 0 ${p.s + 8}px hsla(215,75%,55%,0.2)`,
              animation: `${p.anim} ${p.dur}s ease-out ${p.delay}s infinite`,
              opacity: 0,
            }} />
          ))}
        </div>

        {/* Scroll indicator */}
        <ScrollIndicator />

        {/* Animated water waves at bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none z-[5] overflow-hidden" aria-hidden>
          <svg className="absolute bottom-0 w-[200%]" style={{ animation: 'waveFlow1 12s linear infinite', height: '100%' }} viewBox="0 0 2880 80" preserveAspectRatio="none">
            <path d="M0,30 C240,60 480,10 720,40 C960,70 1200,15 1440,30 C1680,60 1920,10 2160,40 C2400,70 2640,15 2880,30 L2880,80 L0,80Z" fill={BG} opacity="0.65" />
          </svg>
          <svg className="absolute bottom-0 w-[200%]" style={{ animation: 'waveFlow3 8s linear infinite', height: '70%' }} viewBox="0 0 2880 80" preserveAspectRatio="none">
            <path d="M0,50 C360,15 720,60 1080,35 C1440,60 1800,15 2160,50 C2520,60 2700,25 2880,50 L2880,80 L0,80Z" fill={BG} />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OVERVIEW — The story of Pagoda with golden accent
      ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <motion.div {...blurUp}>
          <div className="relative pl-8 sm:pl-10 border-l-[3px]" style={{ borderColor: GOLD }}>
            {/* Decorative lantern icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              className="absolute -left-[14px] top-0 w-[26px] h-[26px] rounded-full flex items-center justify-center"
              style={{ backgroundColor: BG, border: `2px solid ${GOLD}` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />
            </motion.div>
            <span className="block text-6xl sm:text-7xl leading-[0.5] select-none mb-5 -ml-1" style={{ color: `${GOLD}30`, fontFamily: SERIF }}>&ldquo;</span>
            <p className="text-lg sm:text-xl lg:text-2xl leading-[1.85] sm:leading-[1.95]" style={{ color: TEXT_BODY, fontFamily: SERIF }}>{overview}</p>
            <motion.div
              initial={{ width: 0, opacity: 0 }} whileInView={{ width: 'auto', opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
              className="mt-6 flex items-center gap-3 overflow-hidden"
            >
              <div className="h-px w-10" style={{ backgroundColor: `${GOLD}50` }} />
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold whitespace-nowrap" style={{ color: GOLD }}>Bocaue Heritage</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <WaveDivider colorTop={BG} colorBottom={BG_CARD} />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — The Sacred Cross-River Procession
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 lg:py-32" style={{ backgroundColor: BG_CARD }}>
        {/* Subtle gold glow accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none" style={{
          background: `radial-gradient(circle, ${GOLD}08 0%, transparent 70%)`,
        }} />

        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          {/* Section number + label */}
          <motion.div {...fadeUp} className="mb-10 sm:mb-14">
            <div className="flex items-center gap-4">
              <span className="text-7xl sm:text-8xl font-black leading-none" style={{ color: `${GOLD}25`, fontFamily: SERIF }}>01</span>
              <div>
                <div className="w-10 h-[2px] mb-2" style={{ backgroundColor: GOLD }} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: GOLD }}>The Procession</span>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-[1.15fr_1fr] gap-10 lg:gap-0 items-center">
            {/* Image with parallax + reveal */}
            <motion.div {...imageReveal} className="relative lg:-mr-10 z-10">
              <div className="relative aspect-[4/5] rounded-2xl group">
                <ParallaxImage src={subs[0]?.image || FALLBACK_SUBS[0].image} alt={subs[0]?.title || ''} className="absolute inset-0 rounded-2xl" />
              </div>
            </motion.div>

            {/* Text content with stagger */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="lg:pl-16">
              <motion.h2 variants={staggerChild} className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5" style={{ color: WARM, fontFamily: SERIF }}>
                {subs[0]?.title || FALLBACK_SUBS[0].title}
              </motion.h2>
              <motion.div variants={staggerChild} className="flex items-center gap-2 mb-6">
                <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3, ease: EASE }} className="h-[2px]" style={{ backgroundColor: GOLD }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RED }} />
              </motion.div>
              <motion.p variants={staggerChild} className="text-[15px] sm:text-base lg:text-[17px] leading-[2]" style={{ color: TEXT_BODY }}>
                {subs[0]?.text || FALLBACK_SUBS[0].text}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      <WaveDivider colorTop={BG_CARD} colorBottom={BG} />

      {/* ═══════════════════════════════════════════════════════════
          PULL QUOTE — Dramatic centered devotion quote
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Soft ambient glow background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 30% 50%, ${TEAL}06 0%, transparent 50%), radial-gradient(ellipse at 70% 40%, ${GOLD}05 0%, transparent 50%)`,
        }} />

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 lg:px-16 text-center"
        >
          {/* Ornament with spin */}
          <motion.div variants={staggerChild} className="mb-6 flex items-center justify-center gap-3">
            <motion.div initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}
              className="h-px" style={{ backgroundColor: `${GOLD}40` }} />
            <motion.span
              initial={{ rotate: 0, scale: 0 }} whileInView={{ rotate: 360, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}
              className="text-3xl inline-block" style={{ color: GOLD }}
            >✦</motion.span>
            <motion.div initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}
              className="h-px" style={{ backgroundColor: `${GOLD}40` }} />
          </motion.div>
          <motion.p variants={staggerChild} className="text-2xl sm:text-3xl lg:text-4xl leading-snug font-light italic" style={{ color: WARM, fontFamily: SERIF }}>
            &ldquo;Where the river meets faith, the Pagoda sails — carrying the hopes and prayers of every Bocaueño across the sacred waters.&rdquo;
          </motion.p>
          <motion.p variants={staggerChild} className="mt-5 text-xs uppercase tracking-[0.3em]" style={{ color: GOLD }}>— Pagoda sa Bocaue Tradition</motion.p>
        </motion.div>
      </section>

      <WaveDivider colorTop={BG} colorBottom={BG_MUTED} />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — Fire & Light (reversed layout)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 lg:py-32" style={{ backgroundColor: BG_MUTED }}>
        {/* Deep blue glow accent */}
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] pointer-events-none" style={{
          background: `radial-gradient(circle, ${RED}22 0%, transparent 70%)`,
        }} />

        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <motion.div {...fadeUp} className="mb-10 sm:mb-14 text-right">
            <div className="flex items-center justify-end gap-4">
              <div>
                <div className="w-10 h-[2px] mb-2 ml-auto" style={{ backgroundColor: RED }} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: RED }}>Fire & Light</span>
              </div>
              <span className="text-7xl sm:text-8xl font-black leading-none" style={{ color: `${RED}30`, fontFamily: SERIF }}>02</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-[1fr_1.15fr] gap-10 lg:gap-0 items-center">
            {/* Text with stagger */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="lg:pr-16 md:order-1">
              <motion.h2 variants={staggerChild} className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5" style={{ color: WARM, fontFamily: SERIF }}>
                {subs[1]?.title || FALLBACK_SUBS[1].title}
              </motion.h2>
              <motion.div variants={staggerChild} className="flex items-center gap-2 mb-6">
                <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3, ease: EASE }} className="h-[2px]" style={{ backgroundColor: RED }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />
              </motion.div>
              <motion.p variants={staggerChild} className="text-[15px] sm:text-base lg:text-[17px] leading-[2]" style={{ color: TEXT_BODY }}>
                {subs[1]?.text || FALLBACK_SUBS[1].text}
              </motion.p>
            </motion.div>

            {/* Image with reveal + parallax */}
            <motion.div {...imageReveal} className="relative lg:-ml-10 z-10 md:order-2">
              <div className="relative aspect-[4/5] rounded-2xl group">
                <ParallaxImage src={subs[1]?.image || FALLBACK_SUBS[1].image} alt={subs[1]?.title || ''} className="absolute inset-0 rounded-2xl" />
                
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <WaveDivider colorTop={BG_MUTED} colorBottom={BG} />

      {/* ═══════════════════════════════════════════════════════════
          GALLERY — Immersive image mosaic
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 overflow-hidden">
        <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16 px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: `${GOLD}40` }} />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: GOLD }}>Gallery</span>
            <div className="h-px w-10" style={{ backgroundColor: `${GOLD}40` }} />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: WARM, fontFamily: SERIF }}>
            Moments on the River
          </h2>
        </motion.div>

        {/* Auto-scrolling filmstrip */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${BG}, transparent)` }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${BG}, transparent)` }} />

          <div ref={galleryScrollRef} className="flex gap-4 sm:gap-5 overflow-x-auto px-8 sm:px-16 pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {/* Render two copies of gallery for seamless infinite loop */}
            {[...gallery, ...gallery].map((src, idx) => {
              const i = idx % gallery.length
              const widths  = ["w-[300px]", "w-[220px]", "w-[340px]", "w-[260px]", "w-[380px]", "w-[240px]"]
              const heights = ["h-[380px]", "h-[320px]", "h-[360px]", "h-[400px]", "h-[320px]", "h-[370px]"]
              const offsets = ["mt-0", "mt-12", "mt-3", "mt-10", "mt-5", "mt-14"]
              const rotations = [-2, 1.5, -1, 2, -1.5, 1]
              const detail = GALLERY_DETAILS[i % GALLERY_DETAILS.length]
              return (
                <motion.div key={`gallery-${idx}`}
                  initial={{ opacity: 0, y: 80, rotate: rotations[i] * 2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: rotations[i] }}
                  whileHover={{ rotate: 0, scale: 1.04, y: -8, zIndex: 20 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.8, delay: (idx < gallery.length ? i * 0.12 : 0), ease: EASE }}
                  className={`relative ${widths[i]} ${heights[i]} ${offsets[i]} shrink-0 overflow-hidden rounded-2xl group cursor-pointer`}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setGalleryDetail(i)}
                  role="button"
                  tabIndex={idx < gallery.length ? 0 : -1}
                  aria-label={`View details: ${detail.title}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGalleryDetail(i) } }}
                >
                  <Image src={src} alt={detail.title} fill sizes="380px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                  {/* Hover label with detail title */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 rounded-b-2xl backdrop-blur-md"
                    style={{ background: `${BG}99` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: GOLD }}>{detail.category}</p>
                    <p className="text-sm font-bold leading-snug" style={{ color: WARM }}>{detail.title}</p>
                  </div>
                  {/* Glow border on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ boxShadow: `inset 0 0 25px ${GOLD}15, 0 0 15px ${GOLD}10` }} />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GALLERY DETAIL MODAL — Image details on click
      ═══════════════════════════════════════════════════════════ */}
      {galleryDetail !== null && (() => {
        const detail = GALLERY_DETAILS[galleryDetail % GALLERY_DETAILS.length]
        return (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10"
            role="dialog"
            aria-modal="true"
            aria-label={detail.title}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setGalleryDetail(null)}
            />

            {/* Close button */}
            <button
              onClick={() => setGalleryDetail(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
              style={{ backgroundColor: `${BG_CARD}cc`, color: WARM }}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            {/* Prev / Next arrows */}
            <button
              onClick={() => setGalleryDetail((galleryDetail - 1 + gallery.length) % gallery.length)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
              style={{ backgroundColor: `${BG_CARD}cc`, color: WARM }}
              aria-label="Previous image"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              onClick={() => setGalleryDetail((galleryDetail + 1) % gallery.length)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
              style={{ backgroundColor: `${BG_CARD}cc`, color: WARM }}
              aria-label="Next image"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>

            {/* Modal content */}
            <motion.div
              key={galleryDetail}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-5xl rounded-2xl lg:rounded-3xl overflow-hidden flex flex-col lg:flex-row"
              style={{ backgroundColor: BG_CARD, boxShadow: `0 30px 80px rgba(0,0,0,0.5)` }}
            >
              {/* Image side */}
              <div className="relative w-full lg:w-[55%] aspect-[4/3] lg:aspect-auto lg:min-h-[450px] shrink-0">
                <Image
                  src={gallery[galleryDetail]}
                  alt={detail.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                  style={{ backgroundColor: `${BG}88`, color: GOLD }}>
                  {detail.category}
                </div>
              </div>

              {/* Info side */}
              <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                {/* Counter */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1" style={{ backgroundColor: `${GOLD}20` }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_DIM }}>
                    {galleryDetail + 1} / {gallery.length}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: `${GOLD}20` }} />
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-4" style={{ color: WARM, fontFamily: SERIF }}>
                  {detail.title}
                </h3>

                <div className="w-12 h-[2px] rounded-full mb-5" style={{ background: `linear-gradient(90deg, ${GOLD}, ${TEAL})` }} />

                <p className="text-sm sm:text-[15px] leading-[1.9]" style={{ color: TEXT_BODY }}>
                  {detail.description}
                </p>

                {/* Bottom tag */}
                <div className="mt-6 pt-5 border-t flex items-center gap-3" style={{ borderColor: `${GOLD}15` }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>Pagoda sa Bocaue Festival</span>
                </div>
              </div>
            </motion.div>
          </div>
        )
      })()}

      <WaveDivider colorTop={BG} colorBottom={BG_CARD} />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — Faith Rooted in Heritage
      ═══════════════════════════════════════════════════════════ */}
      {subs[2] && (
        <section className="relative py-20 sm:py-28 lg:py-32" style={{ backgroundColor: BG_CARD }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none" style={{
            background: `radial-gradient(ellipse, ${TEAL}06 0%, transparent 70%)`,
          }} />

          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <motion.div {...fadeUp} className="mb-10 sm:mb-14">
              <div className="flex items-center gap-4">
                <span className="text-7xl sm:text-8xl font-black leading-none" style={{ color: `${TEAL}25`, fontFamily: SERIF }}>03</span>
                <div>
                  <div className="w-10 h-[2px] mb-2" style={{ backgroundColor: TEAL }} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: TEAL }}>Heritage</span>
                </div>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-[1.15fr_1fr] gap-10 lg:gap-0 items-center">
              <motion.div {...imageReveal} className="relative lg:-mr-10 z-10">
                <div className="relative aspect-[4/5] rounded-2xl group">
                  <ParallaxImage src={subs[2].image} alt={subs[2].title} className="absolute inset-0 rounded-2xl" />
                </div>
              </motion.div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="lg:pl-16">
                <motion.h2 variants={staggerChild} className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5" style={{ color: WARM, fontFamily: SERIF }}>
                  {subs[2].title}
                </motion.h2>
                <motion.div variants={staggerChild} className="flex items-center gap-2 mb-6">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3, ease: EASE }} className="h-[2px]" style={{ backgroundColor: TEAL }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />
                </motion.div>
                <motion.p variants={staggerChild} className="text-[15px] sm:text-base lg:text-[17px] leading-[2]" style={{ color: TEXT_BODY }}>
                  {subs[2].text}
                </motion.p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CTA — Final call to experience the festival
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
        {/* Multi-color glow blooms */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none" style={{ backgroundColor: `${GOLD}25` }} />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none" style={{ backgroundColor: `${TEAL}20` }} />

        {/* Radial aura behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{
          background: `radial-gradient(circle, ${TEAL}22 0%, transparent 55%)`,
          animation: 'auraPulse 6s ease-in-out infinite',
        }} />

        {/* Soft ambient warmth */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 50% 60%, ${TEAL}06 0%, transparent 55%), radial-gradient(ellipse at 20% 30%, ${GOLD}04 0%, transparent 45%)`,
        }} />

        <motion.div {...scaleIn} className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          {/* Ornamental top */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="h-px w-8" style={{ backgroundColor: `${GOLD}30` }} />
            <span className="text-sm" style={{ color: `${GOLD}60` }}>✦</span>
            <div className="h-px w-8" style={{ backgroundColor: `${GOLD}30` }} />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{ color: WARM, fontFamily: SERIF }}>
            Experience the Pagoda
          </h2>
          <p className="text-base sm:text-lg leading-relaxed mb-10" style={{ color: TEXT_BODY }}>
            Join thousands of devotees as the Holy Cross sails across the Bocaue River — a sacred tradition that has endured for over four centuries. Witness the decorated boats, feel the rhythm of the drums, and be part of Bulacan&apos;s greatest fluvial celebration.
          </p>

          {/* Action buttons */}
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div variants={staggerChild}>
              <Link href="/inquire"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222,30%,8%)] cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${RED})`, color: BG, boxShadow: `0 4px 20px ${GOLD}30` }}>
                Plan Your Visit
                <span className="text-xs">→</span>
              </Link>
            </motion.div>
            <motion.div variants={staggerChild}>
              <Link href="/events"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider border transition-all duration-200 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222,30%,8%)] cursor-pointer"
                style={{ color: GOLD, borderColor: `${GOLD}40`, backgroundColor: `${GOLD}08` }}>
                View Events
              </Link>
            </motion.div>
          </motion.div>

          {/* Bottom ornament */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="h-px w-10" style={{ backgroundColor: `${GOLD}30` }} />
            <span className="text-xs font-bold tracking-[0.35em] uppercase" style={{ color: GOLD }}>Bocaue, Bulacan</span>
            <div className="h-px w-10" style={{ backgroundColor: `${GOLD}30` }} />
          </div>
        </motion.div>
      </section>
    </main>
  )
}
