"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { apiFetchByLabel } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { asset, resolveMediaUrl } from "@/lib/utils"

/* ── Design tokens (admin dark mode palette) ──────────────────────── */
const BG = "hsl(222, 25%, 10%)"        // deep navy
const BG_CARD = "hsl(222, 25%, 13%)"    // slightly lighter card
const BG_MUTED = "hsl(222, 18%, 20%)"   // muted panel
const CYAN = "hsl(175, 70%, 48%)"       // teal-green — pops against blue bg
const CYAN_GLOW = "hsla(175, 70%, 48%, 0.15)"
const WARM_WHITE = "hsl(42, 30%, 95%)"  // creamy white for headings
const TEXT = "hsl(42, 18%, 86%)"        // warm cream body text (NOT blue)
const TEXT_DIM = "hsl(38, 12%, 60%)"    // sandy muted (NOT blue)
const SERIF = "'Georgia', 'Times New Roman', serif"

/* ── Animation presets ────────────────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
}

const slideLeft = {
  initial: { opacity: 0, x: -60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
}

const slideRight = {
  initial: { opacity: 0, x: 60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
}

/* ── Fallback data ────────────────────────────────────────────────── */

interface SubBlock {
  image: string
  title: string
  text: string
}

const FALLBACK_HERO_IMAGE = asset("/images/places/river-festival.jpg")

const FALLBACK_OVERVIEW =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et."

const FALLBACK_SUBS: SubBlock[] = [
  {
    image: asset("/images/places/river-festival.jpg"),
    title: "Lorem Ipsum Dolor",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras vehicula diam vitae est consequat, a feugiat eros bibendum. Nulla facilisi. Morbi tincidunt augue interdum velit euismod, in pellentesque nisi fermentum. Donec at ligula eu arcu molestie tempus sed vitae justo.",
  },
  {
    image: asset("/images/places/oldtownbocaue.jpg"),
    title: "Sed Ut Perspiciatis",
    text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  },
  {
    image: asset("/images/places/Church.jpg"),
    title: "At Vero Eos Et",
    text: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
  },
]

const FALLBACK_GALLERY = [
  asset("/images/places/river-festival.jpg"),
  asset("/images/places/oldtownbocaue.jpg"),
  asset("/images/places/Church.jpg"),
  asset("/images/places/river-festival.jpg"),
  asset("/images/places/oldtownbocaue.jpg"),
  asset("/images/places/Church.jpg"),
]

export default function PagodaPage() {
  const [heroImage, setHeroImage] = useState(FALLBACK_HERO_IMAGE)
  const [overview, setOverview] = useState(FALLBACK_OVERVIEW)
  const [subs, setSubs] = useState<SubBlock[]>(FALLBACK_SUBS)
  const [gallery, setGallery] = useState<string[]>(FALLBACK_GALLERY)

  const { scrollYProgress } = useScroll()
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -80])

  useEffect(() => {
    apiFetchByLabel("pagoda")
      .then((posts: CMSPost[]) => {
        if (posts?.length) {
          const post = posts[0]
          const allImages = (post.image ?? [])
            .map((img) => resolveMediaUrl(img))
            .filter(Boolean)
          if (allImages.length > 0) {
            setHeroImage(allImages[0])
            setGallery(allImages.length >= 6 ? allImages.slice(0, 6) : allImages.length >= 3 ? [...allImages.slice(0, 3), ...allImages.slice(0, 3)] : FALLBACK_GALLERY)
            setSubs((prev) =>
              prev.map((b, i) => ({
                ...b,
                image: allImages[(i + 1) % allImages.length] || allImages[0],
              })),
            )
          }
        }
      })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: BG, color: TEXT }}>

      {/* ═══════════════════════════════════════════════════════════
          HERO BANNER — Full-width image header
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[50vh] sm:h-[55vh] lg:h-[60vh] min-h-[340px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroParallax }}>
          <Image
            src={heroImage}
            alt="Pagoda Festival"
            fill
            priority
            sizes="100vw"
            className="object-cover scale-110"
          />
        </motion.div>
        {/* Bottom fade into body */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to top, ${BG} 0%, ${BG}99 15%, transparent 55%)`
        }} />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TITLE + INTRO — Below the banner image
      ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 pt-10 sm:pt-14 lg:pt-16 relative z-10 pb-6 sm:pb-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-5"
        >
          <span
            className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] px-4 py-1.5 rounded-full border"
            style={{ color: CYAN, borderColor: CYAN, backgroundColor: CYAN_GLOW }}
          >
            Lorem Ipsum Festival
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-5"
          style={{ fontFamily: SERIF }}
        >
          <span className="block" style={{
            background: `linear-gradient(135deg, ${WARM_WHITE} 0%, ${CYAN} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Lorem Ipsum
          </span>
          <span className="block italic font-light" style={{
            background: `linear-gradient(135deg, ${CYAN} 0%, hsl(175, 55%, 72%) 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Dolor Sit
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg md:text-xl max-w-xl leading-relaxed"
          style={{ color: TEXT }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
          sed do eiusmod tempor.
        </motion.p>

        {/* Festival date reminder */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-8 sm:mt-10 inline-flex items-center gap-4 sm:gap-5 rounded-2xl px-6 py-4 sm:px-8 sm:py-5 border"
          style={{ backgroundColor: `${BG_CARD}cc`, borderColor: `${CYAN}25` }}
        >
          {/* Calendar icon block */}
          <div
            className="flex flex-col items-center justify-center rounded-xl w-16 h-16 sm:w-20 sm:h-20 shrink-0"
            style={{ backgroundColor: CYAN }}
          >
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider leading-none" style={{ color: BG }}>
              Jul
            </span>
            <span className="text-lg sm:text-xl font-black leading-none mt-0.5" style={{ color: BG }}>
              Sun
            </span>
          </div>

          {/* Text */}
          <div>
            <p className="text-sm sm:text-base font-bold" style={{ color: WARM_WHITE }}>
              Cross River Festival
            </p>
            <p className="text-[11px] sm:text-xs mt-1" style={{ color: TEXT_DIM }}>
              Every 1st Sunday of July &mdash; Mark your calendar
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: CYAN }} />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: CYAN }}>
                Annual Celebration
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INTRO — Overview with accent border
      ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-32">
        <motion.div {...fadeUp}>
          <div className="pl-6 sm:pl-8 border-l-[3px]" style={{ borderColor: CYAN }}>
            <span
              className="block text-5xl sm:text-6xl leading-[0.5] font-serif select-none mb-4 sm:mb-5 -ml-1"
              style={{ color: `${CYAN}40` }}
            >
              &ldquo;
            </span>
            <p
              className="text-lg sm:text-xl lg:text-2xl leading-[1.8] sm:leading-[1.9]"
              style={{ color: TEXT, fontFamily: SERIF }}
            >
              {overview}
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — Architecture of Faith (image left, text right)
          Overlapping layout with big number accent
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-24 lg:py-28" style={{ backgroundColor: BG_CARD }}>

        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <div className="grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-8 lg:gap-0 items-center">
            {/* Image — slightly overlapping */}
            <motion.div
              {...slideLeft}
              className="relative lg:-mr-12 z-10"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg group">
                <Image
                  src={subs[0]?.image || FALLBACK_SUBS[0].image}
                  alt={subs[0]?.title || "Lorem Ipsum Dolor"}
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                {/* Cyan accent line at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: CYAN }} />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div {...slideRight} className="lg:pl-20">
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                style={{ color: WARM_WHITE, fontFamily: SERIF }}
              >
                {subs[0]?.title || "Lorem Ipsum Dolor"}
              </h2>
              <div className="w-16 h-[2px] mb-6" style={{ backgroundColor: CYAN }} />
              <p className="text-[15px] sm:text-base lg:text-[17px] leading-[1.95]" style={{ color: TEXT }}>
                {subs[0]?.text || FALLBACK_SUBS[0].text}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PULL QUOTE — Dramatic centered quote
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-24">
        <motion.div
          {...scaleIn}
          className="mx-auto max-w-4xl px-6 sm:px-10 lg:px-16 text-center"
        >
          <div className="mb-4">
            <span className="text-4xl sm:text-5xl" style={{ color: CYAN }}>&mdash;</span>
          </div>
          <p
            className="text-2xl sm:text-3xl lg:text-4xl leading-snug font-light italic"
            style={{ color: WARM_WHITE, fontFamily: SERIF }}
          >
            &ldquo;Lorem ipsum dolor sit amet, consectetur adipiscing elit.&rdquo;
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.3em]" style={{ color: TEXT_DIM }}>
            — Lorem Ipsum
          </p>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — Rhythm of the Lupakan (text left, image right)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-24 lg:py-28" style={{ backgroundColor: BG_MUTED }}>

        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <div className="grid md:grid-cols-[1fr_1.15fr] gap-10 md:gap-8 lg:gap-0 items-center">
            {/* Text */}
            <motion.div {...slideLeft} className="lg:pr-20 md:order-1">
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                style={{ color: WARM_WHITE, fontFamily: SERIF }}
              >
                {subs[1]?.title || "Sed Ut Perspiciatis"}
              </h2>
              <div className="w-16 h-[2px] mb-6" style={{ backgroundColor: CYAN }} />
              <p className="text-[15px] sm:text-base lg:text-[17px] leading-[1.95]" style={{ color: TEXT }}>
                {subs[1]?.text || FALLBACK_SUBS[1].text}
              </p>
            </motion.div>

            {/* Image — slightly overlapping */}
            <motion.div
              {...slideRight}
              className="relative lg:-ml-12 z-10 md:order-2"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg group">
                <Image
                  src={subs[1]?.image || FALLBACK_SUBS[1].image}
                  alt={subs[1]?.title || "Sed Ut Perspiciatis"}
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: CYAN }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GALLERY — Horizontal filmstrip (full-bleed scroll)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 lg:py-28 overflow-hidden">
        {/* Section header */}
        <motion.div {...fadeUp} className="text-center mb-10 sm:mb-14 px-6">
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.35em] mb-4"
            style={{ color: CYAN }}
          >
            Lorem Ipsum
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            style={{ color: WARM_WHITE, fontFamily: SERIF }}
          >
            Dolor Sit Amet
          </h2>
        </motion.div>

        {/* Horizontal scroll strip — breaks out of container */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to right, ${BG}, transparent)` }} />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to left, ${BG}, transparent)` }} />

          <div className="flex gap-4 sm:gap-5 overflow-x-auto px-8 sm:px-16 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {gallery.map((src, i) => {
              const widths = ["w-[280px]", "w-[200px]", "w-[320px]", "w-[240px]", "w-[360px]", "w-[220px]"]
              const heights = ["h-[360px]", "h-[300px]", "h-[340px]", "h-[380px]", "h-[300px]", "h-[350px]"]
              const offsets = ["mt-0", "mt-10", "mt-2", "mt-8", "mt-4", "mt-12"]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                  className={`relative ${widths[i]} ${heights[i]} ${offsets[i]} shrink-0 overflow-hidden rounded-2xl group cursor-pointer`}
                >
                  <Image
                    src={src}
                    alt={`Gallery ${i + 1}`}
                    fill
                    sizes="360px"
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(to top, ${BG}cc, transparent 50%)` }}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — A Legacy of Resilience (full-width image + overlay text)
      ═══════════════════════════════════════════════════════════ */}
      {subs[2] && (
        <section className="relative py-16 sm:py-24 lg:py-28" style={{ backgroundColor: BG_CARD }}>

          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <div className="grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-8 lg:gap-0 items-center">
              {/* Image */}
              <motion.div
                {...slideLeft}
                className="relative lg:-mr-12 z-10"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg group">
                  <Image
                    src={subs[2].image}
                    alt={subs[2].title}
                    fill
                    sizes="(max-width: 768px) 100vw, 550px"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: CYAN }} />
                </div>
              </motion.div>

              {/* Text */}
              <motion.div {...slideRight} className="lg:pl-20">
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                  style={{ color: WARM_WHITE, fontFamily: SERIF }}
                >
                  {subs[2].title}
                </h2>
                <div className="w-16 h-[2px] mb-6" style={{ backgroundColor: CYAN }} />
                <p className="text-[15px] sm:text-base lg:text-[17px] leading-[1.95]" style={{ color: TEXT }}>
                  {subs[2].text}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CTA / CLOSING — Exciting call to experience
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none"
          style={{ backgroundColor: CYAN_GLOW }}
        />

        <motion.div {...scaleIn} className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
            style={{ color: WARM_WHITE, fontFamily: SERIF }}
          >
            Lorem Ipsum Dolor
          </h2>
          <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: TEXT }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
            ut enim ad minim veniam.
          </p>
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-10" style={{ backgroundColor: CYAN }} />
            <span
              className="text-xs font-bold tracking-[0.35em] uppercase"
              style={{ color: CYAN }}
            >
              Bocaue, Bulacan
            </span>
            <div className="h-px w-10" style={{ backgroundColor: CYAN }} />
          </div>
        </motion.div>
      </section>
    </main>
  )
}
