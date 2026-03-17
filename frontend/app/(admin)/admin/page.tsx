"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react"
import { useAdmin } from "@/components/providers/admin-provider"
import { asset } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const { login, isLoggedIn } = useAdmin()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isLoggedIn) router.push("/admin/dashboard")
  }, [isLoggedIn, router])

  if (isLoggedIn) return null

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
    <div className="flex min-h-screen">

      <style>{`
        @keyframes adm-fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .adm-fade { opacity: 0; animation: adm-fadeIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .adm-fade { animation: none; opacity: 1; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════
          LEFT — Login form
      ════════════════════════════════════════════════════ */}
      <div className="relative flex w-full flex-col justify-between bg-[hsl(200,25%,8%)] lg:w-[480px] xl:w-[520px] shrink-0">

        {/* Subtle grid dot pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden
          style={{ backgroundImage: "radial-gradient(circle, hsl(193,70%,50%) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Top — Logo bar */}
        <div className={`relative z-10 flex items-center gap-3 px-8 pt-8 sm:px-10 ${mounted ? "adm-fade" : "opacity-0"}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
            <Image src={asset("/images/logos/MHACTO_LOGO.png")} alt="MHACTO" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <span className="block text-sm font-bold tracking-wide text-white/90">MHACTO</span>
            <span className="block text-[10px] font-medium text-white/35">Bocaue, Bulacan</span>
          </div>
        </div>

        {/* Center — Form */}
        <div className={`relative z-10 px-8 sm:px-10 ${mounted ? "adm-fade" : "opacity-0"}`}
          style={{ animationDelay: "0.1s" }}>

          <div className="mx-auto w-full max-w-sm">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[26px] font-extrabold tracking-tight text-white sm:text-3xl">
                Admin Portal
              </h1>
              <p className="mt-1 text-sm text-white/40">
                Sign in to manage content, inquiries &amp; analytics.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-white/45">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 transition-colors duration-200 group-focus-within:text-primary" />
                  <Input
                    id="email" type="email" placeholder="admin@mhacto.gov.ph"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                    className="h-11 rounded-lg border-white/[0.08] bg-white/[0.04] pl-11 text-sm text-white placeholder:text-white/20 transition-colors duration-200 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-white/45">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 transition-colors duration-200 group-focus-within:text-primary" />
                  <Input
                    id="password" type={showPassword ? "text" : "password"}
                    placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                    value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                    className="h-11 rounded-lg border-white/[0.08] bg-white/[0.04] pl-11 pr-11 text-sm text-white placeholder:text-white/20 transition-colors duration-200 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-primary/30"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-white/25 transition-colors duration-200 hover:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2.5">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button type="submit" size="lg" disabled={loading}
                className="w-full h-11 rounded-lg font-semibold text-sm bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground transition-colors duration-200 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(200,25%,8%)]">
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Demo hint */}
            <div className="mt-5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
              <p className="text-center text-[11px] text-white/30">
                Demo: <span className="font-medium text-white/45">admin@mhacto.gov.ph</span> / <span className="font-medium text-white/45">admin123</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom — Footer */}
        <div className={`relative z-10 px-8 pb-6 sm:px-10 ${mounted ? "adm-fade" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}>
          <p className="text-[11px] text-white/15">
            &copy; {new Date().getFullYear()} Municipal History, Arts, Culture &amp; Tourism Office
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          RIGHT — Full-bleed hero image
      ════════════════════════════════════════════════════ */}
      <div className="relative hidden flex-1 lg:block">
        <Image
          src={asset("/images/heroes/hero-bocaue.jpg")}
          alt="Bocaue, Bulacan"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient blend into left panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(200,25%,8%)] via-[hsl(200,25%,8%)]/40 to-transparent w-[30%]" />
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        {/* Overlay card — bottom right */}
        <div className={`absolute bottom-10 right-10 left-10 z-10 max-w-lg ml-auto ${mounted ? "adm-fade" : "opacity-0"}`}
          style={{ animationDelay: "0.3s" }}>
          <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-6 rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">Bocaue, Bulacan</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-snug sm:text-2xl">
              Heritage, Arts, Culture<br />
              <span className="text-primary">&amp; Tourism</span>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-white/50 max-w-sm">
              Manage destinations, cultural content, tourism inquiries, and analytics — all in one place.
            </p>
            <div className="mt-4 flex items-center gap-4 text-[11px] font-medium text-white/30">
              <span>Content</span>
              <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
              <span>Inquiries</span>
              <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
              <span>Analytics</span>
              <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
              <span>Media</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
