"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { CalendarDays, MapPin, Sparkles, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiFetchSpotlight, type Spotlight, type FeaturedContent } from "@/lib/api"
import { asset } from "@/lib/utils"

/* ── Floating Sparkle Particles ── */
function SparkleCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Create sparkle particles
    type Particle = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; decay: number; color: string }
    const particles: Particle[] = []
    const colors = [
      "rgba(56,189,248,", // sky-400
      "rgba(14,165,233,", // sky-500
      "rgba(250,204,21,", // yellow-400
      "rgba(251,191,36,", // amber-400
      "rgba(255,255,255,", // white
    ]

    const spawn = () => {
      const rect = canvas.getBoundingClientRect()
      if (particles.length > 50) return
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.6 + 0.4,
        decay: Math.random() * 0.003 + 0.001,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Seed initial particles
    for (let i = 0; i < 30; i++) spawn()

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      if (prefersReduced) return

      if (Math.random() < 0.15) spawn()

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay

        if (p.alpha <= 0) { particles.splice(i, 1); continue }

        // Glow
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        gradient.addColorStop(0, p.color + (p.alpha * 0.6) + ")")
        gradient.addColorStop(1, p.color + "0)")
        ctx.fillStyle = gradient
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.fillStyle = p.color + p.alpha + ")"
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} />
}

export function FeaturedSpotlight() {
  const [spotlightData, setSpotlightData] = useState<Spotlight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    apiFetchSpotlight()
      .then((responseData) => {
        if (responseData) {
          setSpotlightData(responseData as unknown as Spotlight)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (!spotlightData) return null

  const spotlightImageUrl = spotlightData.image
    ? spotlightData.image.startsWith("/images") ? asset(spotlightData.image) : spotlightData.image
    : asset("/images/defaults/no-image.svg")

  return (
    <section className="py-8 lg:py-12">
    <div className="mx-auto max-w-7xl px-4 lg:px-8">
    <div
      className="group relative w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 reveal-on-scroll reveal-scale"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Background Image with Ken Burns ── */}
      <div className="absolute inset-0">
        <Image
          src={spotlightImageUrl}
          alt={spotlightData.title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-8000 ease-out will-change-transform group-hover:scale-110"
          priority
        />

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-amber-500/10" />
      </div>

      {/* ── Sparkle Particle Overlay ── */}
      <SparkleCanvas className="absolute inset-0 z-[1] pointer-events-none" />

      {/* ── Animated Glow Orbs ── */}
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-amber-500/15 blur-[80px] animate-pulse pointer-events-none" style={{ animationDelay: "1.5s" }} />

      {/* ── Content Layout ── */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[400px] sm:min-h-[480px] lg:min-h-[540px]">
        {/* Left: Text Content */}
        <div className="flex flex-1 flex-col justify-center p-6 sm:p-10 md:p-14 lg:p-16 lg:max-w-[60%]">
          {/* Badge */}
          <div className="mb-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Badge
              variant="secondary"
              className="border-0 bg-gradient-to-r from-primary/90 to-sky-500/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/30 backdrop-blur-md"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5 animate-pulse" />
              Featured Spotlight
            </Badge>
          </div>

          {/* Title */}
          <h3
            className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight animate-fade-in-up font-heading drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            style={{ animationDelay: "300ms" }}
          >
            {spotlightData.title}
          </h3>

          {/* Meta Info Pills */}
          <div className="mt-5 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            {spotlightData.date && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md">
                <CalendarDays className="h-4 w-4 text-sky-400" />
                {format(new Date(spotlightData.date), "MMMM d, yyyy")}
              </span>
            )}
            {spotlightData.location && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md">
                <MapPin className="h-4 w-4 text-amber-400" />
                {spotlightData.location}
              </span>
            )}
          </div>

          {/* Description */}
          <p
            className="mt-5 max-w-xl text-base text-white/70 leading-relaxed sm:text-lg animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            {spotlightData.description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <Button
              asChild
              size="lg"
              className="group/btn relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-sky-500 px-8 py-3 text-white font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.03] cursor-pointer"
            >
              <Link href="/inquire">
                <span className="relative z-10 flex items-center">
                  Plan Your Visit
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-sky-500 to-primary opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/20 bg-white/5 px-8 py-3 text-white font-semibold backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:border-white/40 hover:text-white hover:scale-[1.03] cursor-pointer"
            >
              <Link href="/pagoda">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Right: Glass Info Card (visible on lg+) */}
        <div className="hidden lg:flex items-end justify-end p-16 flex-1">
          <div
            className="w-72 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl animate-fade-in-up"
            style={{ animationDelay: "700ms" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-500 shadow-lg shadow-primary/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Spotlight Event</p>
                <p className="text-sm text-white/60">Don&apos;t miss out</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-primary/40 via-white/10 to-transparent" />
            <div className="mt-4 space-y-3">
              {spotlightData.date && (
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CalendarDays className="h-4 w-4 shrink-0 text-sky-400" />
                  <span>{format(new Date(spotlightData.date), "EEEE, MMMM d")}</span>
                </div>
              )}
              {spotlightData.location && (
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{spotlightData.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Shimmer Effect ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-px">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    </div>
    </div>
    </section>
  )
}
