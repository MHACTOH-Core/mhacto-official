"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView, useMotionValueEvent, type Variants } from "framer-motion"
import { apiFetchByLabel } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { asset, resolveMediaUrl } from "@/lib/utils"

/* ── Design tokens — Pagoda sa Bocaue river festival palette ─────── */
const BG        = "hsl(222, 25%, 10%)"         // deep navy
const BG_CARD   = "hsl(222, 25%, 13%)"         // slightly lighter card
const BG_MUTED  = "hsl(222, 18%, 20%)"         // muted panel
const GOLD      = "hsl(175, 70%, 48%)"         // teal accent (matching site theme)
const GOLD_DIM  = "hsla(175, 70%, 48%, 0.12)"
const RED       = "#c0392b"                    // festival red banners
const RED_DIM   = "rgba(192,57,43,0.10)"
const TEAL      = "hsl(175, 70%, 48%)"         // teal-green accent
const TEAL_DIM  = "hsla(175, 70%, 48%, 0.15)"
const WARM      = "hsl(42, 30%, 95%)"          // creamy white for headings
const TEXT_BODY  = "hsl(42, 18%, 86%)"         // warm cream body text
const TEXT_DIM   = "hsl(38, 12%, 60%)"         // sandy muted
const SERIF     = "'Georgia', 'Times New Roman', serif"

/* ── Animation presets ────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const
const fadeUp   = { initial: { opacity: 0, y: 50 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.9, ease: EASE } }
const scaleIn  = { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 1, ease: EASE } }
const slideL   = { initial: { opacity: 0, x: -70 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.9, ease: EASE } }
const slideR   = { initial: { opacity: 0, x: 70 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.9, ease: EASE } }
const blurUp   = { initial: { opacity: 0, y: 30, filter: 'blur(10px)' }, whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' }, viewport: { once: true, margin: "-60px" }, transition: { duration: 1, ease: EASE } }
const rotateIn = { initial: { opacity: 0, rotate: -3, y: 40 }, whileInView: { opacity: 1, rotate: 0, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 1.1, ease: EASE } }

/* Stagger container + child variants for cascading reveals */
const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
}

/* Image reveal with clip-path sweep */
const imageReveal = {
  initial: { clipPath: 'inset(0 100% 0 0)' },
  whileInView: { clipPath: 'inset(0 0% 0 0)' },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 1.2, ease: EASE },
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
      transition={{ delay: 2.8, duration: 1.2 }}
      className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
    >
      {/* Animated chevrons — three staggered arrows */}
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

const FALLBACK_HERO = asset("/images/places/bocaue-pagoda.jpg")
const FALLBACK_OVERVIEW = "The Pagoda sa Bocaue is one of Bulacan's most cherished river festivals, a centuries-old tradition honoring the Holy Cross of Wawa. Every first Sunday of July, the Bocaue River transforms into a vibrant waterway filled with lavishly decorated boats, floating pagodas, and devotees crossing the river in a spectacular procession of faith and culture."

const FALLBACK_SUBS: SubBlock[] = [
  {
    image: asset("/images/places/river-festival.jpg"),
    title: "The Sacred Cross-River Procession",
    text: "At the heart of the Pagoda festival lies the dramatic fluvial procession — a grand parade of ornately decorated boats carrying the Holy Cross across the Bocaue River. Devotees and spectators line both riverbanks as colorful floats adorned with flowers, banners, and religious icons glide across the shimmering waters.",
  },
  {
    image: asset("/images/places/fireworks.jpg"),
    title: "A Night of Fire & Light",
    text: "As dusk falls over the Bocaue River, the sky erupts in a breathtaking display of fireworks that illuminates the floating pagodas below. The reflection of golden sparks dancing across the dark water creates an unforgettable spectacle — a perfect union of fire above and river below, celebrating centuries of devotion.",
  },
  {
    image: asset("/images/places/Church.jpg"),
    title: "Faith Rooted in Heritage",
    text: "The origins of the Pagoda festival trace back to the miraculous discovery of the Holy Cross of Wawa in the Bocaue River. The tradition of carrying it across the water has endured for generations, surviving typhoons, tragedies, and the passage of time — a testament to the unshakeable faith of the Bocaueños.",
  },
]

const FALLBACK_GALLERY = [
  asset("/images/places/river-festival.jpg"),
  asset("/images/places/fireworks.jpg"),
  asset("/images/places/Church.jpg"),
  asset("/images/places/oldtownbocaue.jpg"),
  asset("/images/places/river-festival.jpg"),
  asset("/images/places/fireworks.jpg"),
]

/* ── Floating Lanterns (gentle rising lights) ─────────────────────── */
const LANTERNS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${((i * 31 + 11) % 92) + 4}%`,
  size: 10 + (i % 5) * 6,
  delay: (i * 0.5) % 6,
  duration: 8 + (i % 6) * 3,
  color: i % 3 === 0 ? TEAL : i % 3 === 1 ? 'hsl(200, 80%, 60%)' : 'hsl(190, 70%, 55%)',
}))

function FloatingLanterns() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[8] overflow-hidden" aria-hidden>
      {LANTERNS.map((l) => (
        <div key={l.id} className="absolute" style={{
          left: l.left, bottom: '-5%', width: l.size, height: l.size,
          animation: `lanternRise ${l.duration}s ${l.delay}s ease-in-out infinite`,
        }}>
          <div className="w-full h-full rounded-full" style={{
            background: `radial-gradient(circle, ${l.color} 0%, ${l.color}bb 25%, transparent 60%)`,
            boxShadow: `0 0 ${l.size * 2}px ${l.color}, 0 0 ${l.size * 4}px ${l.color}88`,
          }} />
        </div>
      ))}
    </div>
  )
}

/* ── River Shimmer — subtle water reflection ─────────────────────── */
function RiverShimmer() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden style={{
      background: `linear-gradient(180deg, transparent 0%, transparent 60%, ${TEAL}05 75%, ${TEAL}08 85%, transparent 100%)`,
    }}>
      <div className="absolute bottom-0 left-0 right-0 h-[40%]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, ${TEAL}05 4%, transparent 8%)`,
        backgroundSize: '250% 100%',
        animation: 'riverShimmer 8s ease-in-out infinite alternate',
      }} />
    </div>
  )
}

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

/* ── Animated Counter ─────────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!isInView) return
    let start = 0
    const step = Math.max(1, Math.floor(value / 40))
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 30)
    return () => clearInterval(timer)
  }, [isInView, value])
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>
}

export default function PagodaPage() {
  const [heroImage, setHeroImage] = useState(FALLBACK_HERO)
  const [overview, setOverview] = useState(FALLBACK_OVERVIEW)
  const [subs, setSubs] = useState<SubBlock[]>(FALLBACK_SUBS)
  const [gallery, setGallery] = useState<string[]>(FALLBACK_GALLERY)

  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1.1, 1.25])

  // Hide scrollbar on pagoda page, restore on leave
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'pagoda-scrollbar-hide'
    style.textContent = 'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}'
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])

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
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden" data-no-reveal style={{ backgroundColor: BG, color: TEXT_BODY }}>

      {/* ─── All CSS Keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes lanternRise {
          0%   { transform: translateY(0) scale(0.6); opacity: 0 }
          5%   { opacity: 0.9 }
          40%  { opacity: 0.7 }
          80%  { opacity: 0.3 }
          100% { transform: translateY(-110vh) scale(1.1); opacity: 0 }
        }
        @keyframes riverShimmer {
          0%   { background-position: 0% 0% }
          100% { background-position: 100% 0% }
        }
        @keyframes waveFlow1 { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes waveFlow2 { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes waveFlow3 { 0% { transform: translateX(-50%) } 100% { transform: translateX(0) } }
        @keyframes gentlePulse {
          0%, 100% { opacity: 0.4; transform: scale(1) }
          50%      { opacity: 0.8; transform: scale(1.05) }
        }
        @keyframes shimmerGold {
          0%   { background-position: -200% 0 }
          100% { background-position: 200% 0 }
        }
        @keyframes candleFlicker {
          0%, 100% { opacity: 0.6; transform: scaleY(1) }
          25%      { opacity: 1; transform: scaleY(1.1) }
          50%      { opacity: 0.7; transform: scaleY(0.95) }
          75%      { opacity: 0.9; transform: scaleY(1.05) }
        }
        @keyframes floatBoat {
          0%, 100% { transform: translateY(0) rotate(-0.5deg) }
          50%      { transform: translateY(-8px) rotate(0.5deg) }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px ${TEAL}20, 0 0 60px ${TEAL}05 }
          50%      { box-shadow: 0 0 40px ${TEAL}40, 0 0 100px ${TEAL}15 }
        }
        @keyframes textShine {
          0%   { background-position: -200% center }
          100% { background-position: 200% center }
        }
        @keyframes borderDraw {
          0%   { stroke-dashoffset: 1000 }
          100% { stroke-dashoffset: 0 }
        }
        @keyframes fadeInScale {
          0%   { opacity: 0; transform: scale(0.8) }
          100% { opacity: 1; transform: scale(1) }
        }
        @keyframes spinSlow {
          0%   { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
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
        @keyframes gentleBreathe {
          0%, 100% { opacity: 0.04 }
          50%      { opacity: 0.09 }
        }
        @keyframes auraPulse {
          0%, 100% { transform: scale(1); opacity: 0.6 }
          50%      { transform: scale(1.2); opacity: 1 }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Global atmospheric layers */}
      <FloatingLanterns />
      <RiverShimmer />

      {/* Ambient floating orbs — large glowing teal/blue/gold spheres */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden" aria-hidden>
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px]" style={{ top: '15%', left: '5%', backgroundColor: TEAL, opacity: 0.18, animation: 'orbFloat1 25s ease-in-out infinite' }} />
        <div className="absolute w-[450px] h-[450px] rounded-full blur-[130px]" style={{ top: '55%', right: '3%', backgroundColor: 'hsl(200, 80%, 55%)', opacity: 0.14, animation: 'orbFloat2 30s ease-in-out infinite' }} />
        <div className="absolute w-[350px] h-[350px] rounded-full blur-[110px]" style={{ top: '35%', left: '45%', backgroundColor: GOLD, opacity: 0.1, animation: 'orbFloat1 35s ease-in-out infinite reverse' }} />
      </div>

      {/* Film grain texture for cinematic depth */}
      <div className="fixed inset-0 pointer-events-none z-[9]" aria-hidden style={{
        opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        animation: 'gentleBreathe 6s ease-in-out infinite',
      }} />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Immersive full-screen river festival banner
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[85vh] sm:h-[90vh] lg:h-screen min-h-[500px] overflow-hidden">

        {/* ── Cinematic curtain reveal overlay ── */}
        <motion.div
          className="absolute inset-0 z-[15] pointer-events-none"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
          style={{ backgroundColor: BG, transformOrigin: 'top' }}
        />

        {/* ── Light sweep across image on reveal ── */}
        <motion.div
          className="absolute inset-0 z-[6] pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `linear-gradient(105deg, transparent 30%, ${GOLD}18 45%, ${WARM}12 50%, ${GOLD}18 55%, transparent 70%)`,
          }}
        />

        {/* Parallax background image with entrance transition */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.3, filter: 'brightness(0.3) saturate(0)' }}
          animate={{ scale: 1.1, filter: 'brightness(1) saturate(1)' }}
          transition={{ duration: 2.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: heroY, scale: heroScale }}
        >
          <Image src={heroImage} alt="Pagoda sa Bocaue Festival" fill priority sizes="100vw" className="object-cover" />
        </motion.div>

        {/* Vignette border that pulses once on load */}
        <motion.div
          className="absolute inset-0 z-[4] pointer-events-none"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          style={{
            boxShadow: `inset 0 0 150px 60px ${BG}`,
          }}
        />

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}40 0%, transparent 30%, transparent 50%, ${BG}cc 80%, ${BG} 100%)` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG}80 0%, transparent 40%, transparent 60%, ${BG}80 100%)` }} />

        {/* Gold light bloom from center top */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[400px] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
          style={{
            background: `radial-gradient(ellipse at center top, ${GOLD}15 0%, transparent 70%)`,
          }}
        />

        {/* Hero content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 sm:px-10 lg:px-16 pb-14 sm:pb-18 lg:pb-22">
          <div className="mx-auto max-w-6xl">
            {/* Festival badge */}
            <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.9, delay: 1.4, ease: [0.22, 1, 0.36, 1] as const }}>
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] px-4 py-2 rounded-full border backdrop-blur-sm"
                style={{ color: GOLD, borderColor: `${GOLD}50`, backgroundColor: `${GOLD}12` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: GOLD }} />
                Bocaue River Festival
              </span>
            </motion.div>

            {/* Main title — staggered letter-group reveal */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.01, delay: 1.5 }}
              className="mt-5 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tight"
              style={{ fontFamily: SERIF }}
            >
              <motion.span
                className="block bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 60, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                transition={{ duration: 1.2, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ backgroundImage: `linear-gradient(135deg, ${WARM} 0%, ${TEAL} 100%)` }}
              >Pagoda</motion.span>
              <motion.span
                className="block italic font-light text-[0.55em] mt-1 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                transition={{ duration: 1.1, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ backgroundImage: `linear-gradient(135deg, ${TEAL} 0%, hsl(175, 55%, 72%) 100%)` }}
              >sa Bocaue</motion.span>
            </motion.h1>

            {/* Decorative line that draws in under the title */}
            <motion.div
              className="mt-4 h-[2px] rounded-full"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 80, opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: `linear-gradient(90deg, ${TEAL}, ${GOLD})` }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed"
              style={{ color: `${WARM}bb` }}
            >
              A centuries-old fluvial procession honoring the Holy Cross of Wawa — where faith, river, and celebration unite.
            </motion.p>

            {/* Date callout */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 2.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="mt-8 inline-flex items-center gap-4 rounded-2xl px-5 py-3 sm:px-7 sm:py-4 border backdrop-blur-sm"
              style={{ backgroundColor: `${BG_CARD}bb`, borderColor: `${GOLD}20` }}
            >
              <div className="flex flex-col items-center justify-center rounded-xl w-14 h-14 sm:w-16 sm:h-16 shrink-0"
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

        {/* Scroll indicator */}
        <ScrollIndicator />

        {/* Animated water waves at bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[60px] pointer-events-none z-[5] overflow-hidden" aria-hidden>
          <svg className="absolute bottom-0 w-[200%]" style={{ animation: 'waveFlow1 12s linear infinite', height: '100%' }} viewBox="0 0 2880 80" preserveAspectRatio="none">
            <path d="M0,30 C240,60 480,10 720,40 C960,70 1200,15 1440,30 C1680,60 1920,10 2160,40 C2400,70 2640,15 2880,30 L2880,80 L0,80Z" fill={BG} opacity="0.5" />
          </svg>
          <svg className="absolute bottom-0 w-[200%]" style={{ animation: 'waveFlow3 8s linear infinite', height: '70%' }} viewBox="0 0 2880 80" preserveAspectRatio="none">
            <path d="M0,50 C360,15 720,60 1080,35 C1440,60 1800,15 2160,50 C2520,60 2700,25 2880,50 L2880,80 L0,80Z" fill={BG} />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR — Key festival facts with animated counters
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-1 pb-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mx-auto max-w-5xl px-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 rounded-2xl border px-6 py-6 sm:px-10 sm:py-8 backdrop-blur-sm"
            style={{ backgroundColor: `${BG_CARD}ee`, borderColor: `${GOLD}15`, animation: 'glowPulse 4s ease-in-out infinite' }}>
            {[
              { value: 400, suffix: "+", label: "Years of Tradition" },
              { value: 50, suffix: "+", label: "Decorated Boats" },
              { value: 100, suffix: "K+", label: "Devotees Yearly" },
              { value: 1, suffix: "", label: "Holy Cross of Wawa" },
            ].map((stat, i) => (
              <motion.div key={i} variants={staggerChild} className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: GOLD, fontFamily: SERIF }}>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] sm:text-xs mt-1 uppercase tracking-[0.15em]" style={{ color: TEXT_DIM }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD, animation: 'candleFlicker 3s ease-in-out infinite' }} />
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
              <div className="relative aspect-[4/5] rounded-2xl group" style={{ animation: 'glowPulse 5s ease-in-out infinite' }}>
                <ParallaxImage src={subs[0]?.image || FALLBACK_SUBS[0].image} alt={subs[0]?.title || ''} className="absolute inset-0 rounded-2xl" />
                <div className="absolute inset-0 rounded-2xl border" style={{ borderColor: `${GOLD}20` }} />
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ background: `linear-gradient(90deg, ${GOLD}, ${RED}, ${GOLD})` }} />
                <div className="absolute bottom-3 right-4 text-2xl" style={{ animation: 'floatBoat 4s ease-in-out infinite' }}>⛵</div>
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
        {/* Red glow accent */}
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] pointer-events-none" style={{
          background: `radial-gradient(circle, ${RED}22 0%, transparent 70%)`,
        }} />
        {/* Teal counter-glow */}
        <div className="absolute top-10 right-0 w-[400px] h-[400px] pointer-events-none" style={{
          background: `radial-gradient(circle, ${TEAL}18 0%, transparent 70%)`,
          animation: 'orbFloat2 20s ease-in-out infinite',
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
              <div className="relative aspect-[4/5] rounded-2xl group" style={{ animation: 'glowPulse 5s ease-in-out infinite' }}>
                <ParallaxImage src={subs[1]?.image || FALLBACK_SUBS[1].image} alt={subs[1]?.title || ''} className="absolute inset-0 rounded-2xl" />
                <div className="absolute inset-0 rounded-2xl border" style={{ borderColor: `${RED}20` }} />
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ background: `linear-gradient(90deg, ${RED}, ${GOLD}, ${RED})` }} />
                <div className="absolute top-4 right-5 text-xl" style={{ animation: 'candleFlicker 2s ease-in-out infinite' }}>🎆</div>
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

        {/* Horizontal scroll filmstrip */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${BG}, transparent)` }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${BG}, transparent)` }} />

          <div className="flex gap-4 sm:gap-5 overflow-x-auto px-8 sm:px-16 pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {gallery.map((src, i) => {
              const widths  = ["w-[300px]", "w-[220px]", "w-[340px]", "w-[260px]", "w-[380px]", "w-[240px]"]
              const heights = ["h-[380px]", "h-[320px]", "h-[360px]", "h-[400px]", "h-[320px]", "h-[370px]"]
              const offsets = ["mt-0", "mt-12", "mt-3", "mt-10", "mt-5", "mt-14"]
              const rotations = [-2, 1.5, -1, 2, -1.5, 1]
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 80, rotate: rotations[i] * 2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: rotations[i] }}
                  whileHover={{ rotate: 0, scale: 1.05, y: -10, zIndex: 20 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
                  className={`relative ${widths[i]} ${heights[i]} ${offsets[i]} shrink-0 overflow-hidden rounded-2xl group cursor-pointer`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Image src={src} alt={`Festival moment ${i + 1}`} fill sizes="380px"
                    className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-2xl border transition-all duration-500"
                    style={{ borderColor: `${GOLD}00` }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                    style={{ background: `linear-gradient(to top, ${BG}ee, transparent 60%)` }} />
                  {/* Hover label with slide-up */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-sm font-bold" style={{ color: WARM }}>Festival Moment</p>
                    <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: GOLD }}>View {i + 1}</p>
                  </div>
                  {/* Glow border on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ boxShadow: `inset 0 0 30px ${TEAL}20, 0 0 20px ${TEAL}15` }} />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

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
                <div className="relative aspect-[4/5] rounded-2xl group" style={{ animation: 'glowPulse 5s ease-in-out infinite' }}>
                  <ParallaxImage src={subs[2].image} alt={subs[2].title} className="absolute inset-0 rounded-2xl" />
                  <div className="absolute inset-0 rounded-2xl border" style={{ borderColor: `${TEAL}20` }} />
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ background: `linear-gradient(90deg, ${TEAL}, ${GOLD}, ${TEAL})` }} />
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
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:scale-110 hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${RED})`, color: BG, boxShadow: `0 4px 20px ${GOLD}30` }}>
                Plan Your Visit
                <span className="text-xs">→</span>
              </Link>
            </motion.div>
            <motion.div variants={staggerChild}>
              <Link href="/events"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider border transition-all duration-300 hover:scale-110 hover:shadow-xl"
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
