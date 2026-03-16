"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { apiFetchByLabel } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { asset, resolveMediaUrl } from "@/lib/utils"

/* ── Colors ───────────────────────────────────────────────────────── */
const TEAL = "rgb(0, 102, 102)" // deep teal
const GOLD = "rgb(194, 165, 108)" // tan-gold
const BEIGE = "rgb(245, 240, 230)" // light beige

/* ── Fallback data ────────────────────────────────────────────────── */

interface SubBlock {
  image: string
  title: string
  text: string
}

const FALLBACK_HERO_IMAGE = asset("/images/places/river-festival.jpg")

const FALLBACK_OVERVIEW =
  "A centerpiece of cultural heritage, the annual Bocaue River Pagoda festival is a profound expression of faith, resilience, and unity. This vibrant event transforms the river into a sacred stage, honoring the Holy Cross. Anchored in centuries-old tradition, the pagoda itself is a magnificent, multi-tiered floating structure built atop joined bancas. It is meticulously adorned with intricate decorations, lights, and religious icons. This sacred voyage is more than a spectacle; it is a profound testament to the deep-seated spiritual beliefs and communal strength of the people of Bocaue, connecting current generations with their ancestors in a powerful act of collective worship."

const FALLBACK_SUBS: SubBlock[] = [
  {
    image: asset("/images/places/river-festival.jpg"),
    title: "Craftsmanship and Communal Effort",
    text: "Building the floating pagoda is a monumental task. Local artisans and skilled builders dedicate weeks to meticulously engineering the massive, multi-story structure. Multiple large bancas (traditional boats) are fused to create a stable base, which is then built upon with bamboo and wood. The final decoration, a tapestry of colorful fabrics, flowers, and religious symbols, is a collective communal effort, reflecting the shared devotion of everyone involved.",
  },
  {
    image: asset("/images/places/oldtownbocaue.jpg"),
    title: "The Holy Voyage and the Bystander\u2019s Blessing",
    text: "The journey along the Bocaue River is the heart of the festival. Hundreds of smaller boats form a flotilla, known as the \u2018kubol,\u2019 surrounding the large Pagoda. Along the banks, thousands gather in anticipation. The moment the Pagoda arrives, carrying the Holy Cross, is marked by shared prayers, synchronized movements, and the visible outpouring of faith. It is believed that the mere presence of the Holy Cross bestows powerful blessings upon all who witness the procession.",
  },
  {
    image: asset("/images/places/Church.jpg"),
    title: "Modernizing Tradition for Safety",
    text: "While deeply rooted in faith, the Pagoda celebration has evolved. Significant modern emphasis is placed on safety and formal river management. Modern materials are used to reinforce the structure, and detailed safety protocols are enforced by the local government. This approach ensures that the powerful religious event remains a joyful and safe experience for participants and spectators alike, preserving the tradition\u2019s core while embracing responsible stewardship and progress.",
  },
]

/* ── Gold-framed image component ──────────────────────────────────── */
function GoldFrame({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`}>
      <div
        className="absolute inset-0 rounded-sm"
        style={{ border: `2px solid ${GOLD}` }}
      />
      <div className="absolute inset-[3px] overflow-hidden rounded-sm">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
      </div>
    </div>
  )
}

/* ── Horizontal gold divider ──────────────────────────────────────── */
function GoldDivider() {
  return <hr className="border-0 h-px my-0" style={{ backgroundColor: GOLD }} />
}

export default function PagodaPage() {
  const [heroImage, setHeroImage] = useState(FALLBACK_HERO_IMAGE)
  const [overview, setOverview] = useState(FALLBACK_OVERVIEW)
  const [subs, setSubs] = useState<SubBlock[]>(FALLBACK_SUBS)

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
    <main className="min-h-screen" style={{ backgroundColor: BEIGE }}>
      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-14 sm:py-20 lg:py-28">

        {/* ═══════════════════════════════════════════════════════
            PART 1 — Grand Overview (image_0.png synthesis)
        ═══════════════════════════════════════════════════════ */}

        {/* Main Title */}
        <h1
          className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight mb-10 sm:mb-14"
          style={{ color: TEAL, fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 700 }}
        >
          The Magnificent Bocaue River Pagoda:<br className="hidden sm:block" /> A Legacy of Devotion
        </h1>

        {/* Body text with left vertical rule + large image right */}
        <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-start mb-16 sm:mb-20 lg:mb-28">
          {/* Text with vertical line */}
          <div className="flex gap-5 sm:gap-6">
            {/* Vertical rule */}
            <div
              className="hidden sm:block w-[2px] shrink-0 self-stretch rounded-full"
              style={{ backgroundColor: "rgb(80, 80, 80)" }}
            />
            <p
              className="text-[15px] sm:text-base lg:text-[17px] leading-[1.85] tracking-[0.01em]"
              style={{ color: "rgb(40, 40, 40)" }}
            >
              {overview}
            </p>
          </div>

          {/* Large gold-framed image */}
          <GoldFrame
            src={heroImage}
            alt="Bocaue Pagoda Festival"
            className="w-full md:w-[280px] lg:w-[320px]"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════
            PART 2 — Alternating Sub-Blocks (image_1.png synthesis)
        ═══════════════════════════════════════════════════════ */}

        {subs.map((block, i) => {
          // Pattern: 0=image RIGHT, 1=image LEFT, 2=image RIGHT
          const imageOnRight = i % 2 === 0

          return (
            <div key={i}>
              <GoldDivider />

              <div className="py-10 sm:py-14 lg:py-16">
                <div
                  className={`grid md:grid-cols-[1fr_auto] gap-8 md:gap-10 items-center ${
                    !imageOnRight ? "md:grid-cols-[auto_1fr]" : ""
                  }`}
                >
                  {/* Text side */}
                  <div className={imageOnRight ? "md:order-1" : "md:order-2"}>
                    <h2
                      className="text-xl sm:text-2xl lg:text-[1.7rem] leading-snug mb-4 sm:mb-5"
                      style={{ color: TEAL, fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 700 }}
                    >
                      {block.title}
                    </h2>
                    <p
                      className="text-[15px] sm:text-base lg:text-[17px] leading-[1.85] tracking-[0.01em]"
                      style={{ color: "rgb(40, 40, 40)" }}
                    >
                      {block.text}
                    </p>
                  </div>

                  {/* Gold-framed image */}
                  <GoldFrame
                    src={block.image}
                    alt={block.title}
                    className={`w-full md:w-[220px] lg:w-[260px] ${imageOnRight ? "md:order-2" : "md:order-1"}`}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Final divider */}
        <GoldDivider />

      </div>
    </main>
  )
}
