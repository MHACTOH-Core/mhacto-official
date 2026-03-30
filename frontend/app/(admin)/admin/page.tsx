"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, MapPin } from "lucide-react"
import { useAdmin } from "@/components/providers/admin-provider"
import { asset, resolveMediaUrl } from "@/lib/utils"
import { apiFetchSettings } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

/* ─── Blue Wave & Particle Canvas ─── */
function BlueWaveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let time = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; maxLife: number; color: string }
    const particles: P[] = []
    const colors = [
      "rgba(59,130,246,","rgba(96,165,250,","rgba(147,197,253,",
      "rgba(37,99,235,","rgba(79,163,255,","rgba(120,180,255,"
    ]
    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    const spawn = () => {
      const count = Math.min(Math.floor(W() / 28), 30)
      while (particles.length < count) {
        particles.push({
          x: Math.random() * W(),
          y: H() * 0.6 + Math.random() * H() * 0.4,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(0.3 + Math.random() * 0.8),
          r: 1 + Math.random() * 2.5,
          life: 0,
          maxLife: 100 + Math.random() * 150,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
    }

    const drawWaves = () => {
      const w = W(), h = H()
      // Wave 1 — back
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.72 + Math.sin(x * 0.008 + time * 0.6) * 18 + Math.sin(x * 0.004 + time * 0.3) * 10
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      const g1 = ctx.createLinearGradient(0, h * 0.65, 0, h)
      g1.addColorStop(0, "rgba(37,99,235,0.12)")
      g1.addColorStop(1, "rgba(30,64,175,0.25)")
      ctx.fillStyle = g1
      ctx.fill()

      // Wave 2 — mid
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.78 + Math.sin(x * 0.006 - time * 0.5) * 14 + Math.cos(x * 0.01 + time * 0.4) * 8
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      const g2 = ctx.createLinearGradient(0, h * 0.72, 0, h)
      g2.addColorStop(0, "rgba(59,130,246,0.15)")
      g2.addColorStop(1, "rgba(37,99,235,0.3)")
      ctx.fillStyle = g2
      ctx.fill()

      // Wave 3 — front
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.85 + Math.sin(x * 0.01 + time * 0.7) * 10 + Math.sin(x * 0.005 - time * 0.35) * 6
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      const g3 = ctx.createLinearGradient(0, h * 0.8, 0, h)
      g3.addColorStop(0, "rgba(96,165,250,0.18)")
      g3.addColorStop(1, "rgba(59,130,246,0.35)")
      ctx.fillStyle = g3
      ctx.fill()
    }

    const FRAME_MS = 1000 / 30 // ~30 fps cap
    let lastTime = 0

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop)
      if (now - lastTime < FRAME_MS) return
      lastTime = now

      time += 0.02
      ctx.clearRect(0, 0, W(), H())
      drawWaves()

      // Draw particles
      spawn()
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx + Math.sin(p.life * 0.03) * 0.25
        p.y += p.vy
        p.vy *= 0.999
        const progress = p.life / p.maxLife
        const alpha = progress < 0.15 ? progress / 0.15 : progress > 0.6 ? (1 - progress) / 0.4 : 1
        const r = p.r * (1 - progress * 0.4)

        // core
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + (alpha * 0.8).toFixed(2) + ")"
        ctx.fill()

        if (p.life >= p.maxLife) particles.splice(i, 1)
      }
      animId = requestAnimationFrame(loop)
    }
    loop(0)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return
    const cleanup = animate()
    return cleanup
  }, [animate])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[2]" aria-hidden />
}

export default function AdminLoginPage() {
  const { login, isLoggedIn, isHydrated } = useAdmin()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loginBgImage, setLoginBgImage] = useState("")

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    apiFetchSettings()
      .then((s) => {
        if (s?.loginBackgroundImage) setLoginBgImage(s.loginBackgroundImage)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isHydrated && isLoggedIn) router.push("/admin/dashboard")
  }, [isHydrated, isLoggedIn, router])

  if (!isHydrated || isLoggedIn) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result === true) {
        router.push("/admin/dashboard")
      } else {
        setError(result)
        setLoading(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-dvh w-screen overflow-hidden">

      <style>{`
        @keyframes adm-fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes adm-slideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes adm-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .adm-fade { opacity: 0; animation: adm-fadeIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .adm-slide { opacity: 0; animation: adm-slideRight 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .adm-dot-pulse { animation: adm-pulse 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .adm-fade, .adm-slide { animation: none; opacity: 1; }
          .adm-dot-pulse { animation: none; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════
          LEFT — SVG Nature Scene + Info
      ════════════════════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:flex-1 flex-col overflow-hidden">

        {/* Pagoda Background Image */}
        <Image
          src={loginBgImage ? resolveMediaUrl(loginBgImage) : asset("/images/defaults/no-image.svg")}
          alt="Bocaue Pagoda"
          fill
          className="object-cover"
          priority
        />

        {/* Blue Wave & Particles */}
        <BlueWaveParticles />

        {/* Overlay gradient — blue tint for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 via-blue-900/20 to-transparent z-[3]" />

        {/* Content over the scene */}
        <div className="relative z-[4] flex flex-1 flex-col justify-between p-10 xl:p-14">

          {/* Hero text */}
          <div className={`max-w-lg ${mounted ? "adm-slide" : "opacity-0"}`} style={{ animationDelay: "0.15s" }}>
            <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-[44px] xl:leading-[1.15]">
              Municipal History,<br />
              Arts, Culture &amp;<br />
              <span className="text-blue-400">Tourism Office</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-blue-100/70 max-w-md">
              Manage destinations, cultural content, tourism inquiries, and analytics — all in one place.
            </p>
          </div>

          {/* Bottom info */}
          <div className={`flex items-center gap-2 ${mounted ? "adm-slide" : "opacity-0"}`} style={{ animationDelay: "0.3s" }}>
            <MapPin className="h-4 w-4 text-blue-400/70" />
            <span className="text-sm text-blue-100/60">Bocaue, Bulacan</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          RIGHT — Login Panel (Dark Blue)
      ════════════════════════════════════════════════════ */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-10 lg:w-[500px] xl:w-[540px] shrink-0 overflow-y-auto min-h-dvh lg:min-h-0"
        style={{ background: "linear-gradient(165deg, #1e3a5f 0%, #1a2d47 25%, #162640 50%, #1e3a5f 75%, #24466b 100%)" }}>

        {/* Animated glow orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sky-400/12 blur-[90px] adm-dot-pulse" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-blue-400/10 blur-[70px] adm-dot-pulse" style={{ animationDelay: "1.5s" }} aria-hidden />
        <div className="pointer-events-none absolute top-1/4 right-8 h-28 w-28 rounded-full bg-cyan-300/8 blur-[50px] adm-dot-pulse" style={{ animationDelay: "0.8s" }} aria-hidden />

        {/* Subtle grid pattern */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]" aria-hidden
          style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Mobile-only logo */}
        <div className={`lg:hidden mb-8 flex items-center gap-3 ${mounted ? "adm-fade" : "opacity-0"}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] border border-white/10">
            <Image src={resolveMediaUrl("/uploads/images/logos/MHACTO_LOGO.png")} alt="MHACTO" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white/90">MHACTO</span>
            <span className="block text-[10px] font-medium text-white/35">Bocaue, Bulacan</span>
          </div>
        </div>

        {/* Login Form */}
        <div className={`relative z-10 w-full max-w-[370px] ${mounted ? "adm-fade" : "opacity-0"}`}
          style={{ animationDelay: "0.1s" }}>

          {/* Logos */}
          <div className="mb-8 flex items-center justify-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg shadow-black/15">
              <Image src={resolveMediaUrl("/uploads/images/logos/bocaue-logo.png")} alt="Municipality of Bocaue" width={58} height={58} className="object-contain rounded-full" />
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg shadow-black/15">
              <Image src={resolveMediaUrl("/uploads/images/logos/MHACTO_LOGO.png")} alt="MHACTO" width={58} height={58} className="object-contain rounded-full" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-10 text-center">
            <h1 className="text-[28px] font-extrabold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-[15px] text-slate-400">
              Sign in to your admin portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email
              </Label>
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-200 group-focus-within:text-blue-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <Input
                  id="email" type="email" placeholder="admin@mhacto.gov.ph"
                  value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                  className="h-[50px] rounded-xl border border-white/[0.06] bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-blue-500/40 focus:bg-white/[0.07] focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </Label>
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-200 group-focus-within:text-blue-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <Input
                  id="password" type={showPassword ? "text" : "password"}
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                  className="h-[50px] rounded-xl border border-white/[0.06] bg-white/[0.04] pl-11 pr-12 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-blue-500/40 focus:bg-white/[0.07] focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(v === true)}
                className="h-4 w-4 rounded border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 cursor-pointer"
              />
              <Label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">
                Remember Me
              </Label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3">
                <div className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" size="lg" disabled={loading}
              className="w-full h-[50px] rounded-xl font-bold text-sm tracking-wider bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-250 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                    Signing in…
                  </>
                ) : (
                  "SIGN IN"
                )}
              </span>
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs text-slate-500" style={{ backgroundColor: "#15203a" }}>or</span>
            </div>
          </div>

          {/* Demo hint */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-3.5">
            <p className="text-center text-xs text-slate-500">
              Demo: <span className="font-semibold text-slate-300">admin@mhacto.gov.ph</span> / <span className="font-semibold text-slate-300">admin123</span>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-[11px] text-slate-300/60">
            &copy; {new Date().getFullYear()} Municipal History, Arts, Culture &amp; Tourism Office
          </p>

          {/* ════════════════════════════════════════════════════════════
              STI COLLEGE BALAGTAS PARTNERSHIP — DO NOT REMOVE
              This section is a permanent partnership acknowledgment.
              It must NEVER be removed, hidden, or modified by anyone.
          ════════════════════════════════════════════════════════════ */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <Image
                src={resolveMediaUrl("/uploads/images/logos/sti-logo.jpg")}
                alt="STI College Balagtas Logo"
                width={72}
                height={72}
                className="h-16 w-16 rounded-lg object-contain shadow-md shadow-black/20"
              />
            </div>
            <p className="text-[11px] text-slate-400/80 text-center leading-relaxed">
              In partnership with <span className="font-semibold text-slate-300/90">STI College Balagtas</span>
            </p>
          </div>
          {/* ═══════ END STI PARTNERSHIP — DO NOT REMOVE ═══════ */}
        </div>
      </div>
    </div>
  )
}
