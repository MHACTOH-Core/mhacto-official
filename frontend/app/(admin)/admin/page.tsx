"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
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

  // If already logged in, redirect
  useEffect(() => {
    if (isLoggedIn) router.push("/admin/dashboard")
  }, [isLoggedIn, router])

  if (isLoggedIn) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      const success = login(email, password)
      if (success) {
        router.push("/admin/dashboard")
      } else {
        setError("Invalid email or password.")
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side — Login form */}
      <div className="flex w-full flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-5 lg:w-1/2">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md animate-fade-in-up">
          {/* Logo & heading */}
          <div className="mb-10 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-lg">
              <Image
                src={asset("/images/logos/MHACTO_LOGO.png")}
                alt="MHACTO Logo"
                width={52}
                height={52}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Sign in to the MHACTO Admin Panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mhacto.gov.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-red-400 animate-fade-in-up">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full rounded-lg font-semibold"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in\u2026" : "Sign In"}
            </Button>
          </form>

          {/* Hint */}
          <div className="mt-6 rounded-lg bg-white/5 p-3">
            <p className="text-center text-xs text-slate-500">
              Demo credentials:{" "}
              <span className="text-slate-400">admin@mhacto.gov.ph</span> /{" "}
              <span className="text-slate-400">admin123</span>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-600 lg:text-left">
            &copy; {new Date().getFullYear()} MHACTO &mdash; Bocaue, Bulacan
          </p>
        </div>
      </div>

      {/* Right side — Image */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src={asset("/images/heroes/hero-bocaue.jpg")}
          alt="Bocaue, Bulacan"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/60" />

        {/* Overlay text */}
        <div className="absolute bottom-12 left-10 right-10 z-10 animate-fade-in-right delay-300">
          <div className="rounded-2xl bg-black/30 p-8 backdrop-blur-md">
            <h2 className="text-3xl font-bold text-white">
              MHACTO <span className="text-primary">Admin Portal</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Manage your tourism website content, view analytics, respond to
              inquiries, and keep Bocaue&apos;s digital presence thriving &mdash; all from
              one dashboard.
            </p>
            <div className="mt-4 flex gap-6 text-xs text-white/60">
              <span>Dashboard</span>
              <span>&middot;</span>
              <span>CMS</span>
              <span>&middot;</span>
              <span>Inquiries</span>
              <span>&middot;</span>
              <span>Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
