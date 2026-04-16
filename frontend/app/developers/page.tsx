"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import { Linkedin, Crown, Terminal, Layers, TestTube, Palette, Quote } from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils"

const team = [
  {
    name: "Christian Carr Tac-an",
    role: "Project Manager",
    description: "Leads project planning, coordination, and delivery — ensuring the team stays aligned and milestones are met on schedule.",
    icon: Crown,
    gradient: "from-amber-400 to-orange-500",
    avatarBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    roleBg: "bg-amber-500/10",
    roleText: "text-amber-400",
    borderAccent: "group-hover:border-amber-500/30",
    glowColor: "group-hover:shadow-amber-500/10",
    linkedin: "https://www.linkedin.com/in/christian-carr-tac-an-638195249/",
  },
  {
    name: "Jayson Visnar",
    role: "Tech Lead",
    description: "Architects the full-stack system, makes key technical decisions, and drives code quality across the entire application.",
    icon: Terminal,
    gradient: "from-blue-500 to-cyan-500",
    avatarBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    roleBg: "bg-blue-500/10",
    roleText: "text-blue-400",
    borderAccent: "group-hover:border-blue-500/30",
    glowColor: "group-hover:shadow-blue-500/10",
    linkedin: "https://www.linkedin.com/in/jayson-visnar-1164a4365/",
  },
  {
    name: "Juan Carlos Flores",
    role: "Full Stack Developer",
    description: "Builds and integrates frontend interfaces with backend services — from REST APIs to responsive UI components.",
    icon: Layers,
    gradient: "from-emerald-400 to-teal-500",
    avatarBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    roleBg: "bg-emerald-500/10",
    roleText: "text-emerald-400",
    borderAccent: "group-hover:border-emerald-500/30",
    glowColor: "group-hover:shadow-emerald-500/10",
    linkedin: "https://www.linkedin.com/in/juancarlosfloresph/",
  },
  {
    name: "John Leonard Chingcuangco",
    role: "QA Tester",
    description: "Ensures application reliability through rigorous testing, bug tracking, and quality assurance across all features.",
    icon: TestTube,
    gradient: "from-violet-500 to-purple-600",
    avatarBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    roleBg: "bg-violet-500/10",
    roleText: "text-violet-400",
    borderAccent: "group-hover:border-violet-500/30",
    glowColor: "group-hover:shadow-violet-500/10",
    linkedin: "https://www.linkedin.com/in/john-leonard-chingcuangco-9ba2623b0/",
  },
  {
    name: "Juan Miguel Borja",
    role: "UI/UX Designer",
    description: "Crafts intuitive user experiences and polished visual designs — turning wireframes into pixel-perfect interfaces.",
    icon: Palette,
    gradient: "from-pink-500 to-rose-500",
    avatarBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    roleBg: "bg-pink-500/10",
    roleText: "text-pink-400",
    borderAccent: "group-hover:border-pink-500/30",
    glowColor: "group-hover:shadow-pink-500/10",
    linkedin: "https://www.linkedin.com/in/miguel-borja-0659193b1/",
  },
]



export default function DevelopersPage() {
  const [scrollY, setScrollY] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const aboutRef = useRef<HTMLElement>(null)
  const teamRef = useRef<HTMLElement>(null)
  const [aboutOffset, setAboutOffset] = useState(0)
  const [teamOffset, setTeamOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrollY(y)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? y / max : 0)

      // Section-relative offsets (0 = section top at viewport bottom, 1 = section top at viewport top)
      const vh = window.innerHeight
      if (aboutRef.current) {
        const rect = aboutRef.current.getBoundingClientRect()
        setAboutOffset(Math.max(0, Math.min(1, 1 - rect.top / vh)))
      }
      if (teamRef.current) {
        const rect = teamRef.current.getBoundingClientRect()
        setTeamOffset(Math.max(0, Math.min(1, 1 - rect.top / vh)))
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) scale3d(1.02,1.02,1.02)`
  }, [])

  const resetTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = ""
  }, [])

  const handleMagnetic = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`
  }, [])

  const resetMagnetic = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = ""
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0a0e1a]">

      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 h-[2px] z-50 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Film grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-30 opacity-[0.015] mix-blend-overlay"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Aurora gradient background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,165,233,0.15),transparent)] animate-aurora-1" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(139,92,246,0.08),transparent)] animate-aurora-2" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_20%_80%,rgba(20,184,166,0.06),transparent)] animate-aurora-3" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M60 0H0v60' stroke='%23fff' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        {/* Floating particles with parallax */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.15}px)`, transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }}
          aria-hidden
        >
          <div className="absolute top-[12%] left-[8%] w-2 h-2 rounded-full bg-cyan-400/30 animate-dev-float-1" />
          <div className="absolute top-[22%] right-[12%] w-1.5 h-1.5 rounded-full bg-violet-400/25 animate-dev-float-2" />
          <div className="absolute bottom-[35%] left-[18%] w-1 h-1 rounded-full bg-teal-400/30 animate-dev-float-3" />
          <div className="absolute bottom-[22%] right-[22%] w-2.5 h-2.5 rounded-full bg-pink-400/20 animate-dev-float-1 delay-300" />
          <div className="absolute top-[40%] left-[45%] w-1 h-1 rounded-full bg-amber-400/20 animate-dev-float-2 delay-500" />
          <div className="absolute top-[18%] left-[65%] w-1.5 h-1.5 rounded-full bg-blue-400/20 animate-dev-float-3 delay-200" />
          <div className="absolute bottom-[45%] right-[8%] w-1 h-1 rounded-full bg-emerald-400/25 animate-dev-float-1 delay-400" />
          <div className="absolute top-[55%] left-[5%] w-2 h-2 rounded-full bg-violet-400/15 animate-dev-float-2 delay-100" />
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(10,14,26,0.6))]"
          style={{ opacity: Math.min(1 + scrollY * 0.001, 1.3), transition: "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
          aria-hidden
        />

        <div
          className="relative z-10 mx-auto max-w-5xl px-6 text-center"
          style={{ transform: `translateY(${scrollY * 0.25}px) scale(${Math.max(1 - scrollY * 0.0003, 0.92)})`, opacity: Math.max(1 - scrollY * 0.0015, 0), transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <div className="reveal-on-scroll reveal-scale inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
              In Partnership with STI College Balagtas
            </span>
          </div>

          <h1 className="reveal-on-scroll delay-100 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            <span className="text-white">The Team Behind</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              MHACTO Bocaue Website
            </span>
          </h1>

          <p className="reveal-on-scroll delay-200 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            A dedicated group of developers and designers committed to preserving
            and promoting the Bocaue Wonders of the RiverTown through technology.
          </p>

          <div className="reveal-on-scroll delay-300 flex items-center justify-center gap-6">
            <Image
              src={resolveMediaUrl("/uploads/images/logos/MHACTO_LOGO.png")}
              alt="MHACTO Bocaue"
              width={120}
              height={40}
              className="h-9 w-auto object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <div className="w-px h-10 bg-white/10" />
            <Image
              src={resolveMediaUrl("/uploads/images/logos/sti-logo.jpg")}
              alt="STI College Balagtas"
              width={80}
              height={56}
              className="h-12 w-auto object-contain rounded-lg opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>

        {/* Animated section divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-gradient-flow" />
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section ref={aboutRef} className="relative bg-[#0d1225] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-32 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.04] blur-[120px]"
            style={{ transform: `translateY(${aboutOffset * -60}px)`, transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <div
            className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-blue-500/[0.03] blur-[100px]"
            style={{ transform: `translateY(${aboutOffset * 40}px)`, transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </div>

        {/* Section particles */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translateY(${(1 - aboutOffset) * 40}px)`, transition: "transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          aria-hidden
        >
          <div className="absolute top-[15%] left-[5%] w-1.5 h-1.5 rounded-full bg-cyan-400/20 animate-dev-particle-1" />
          <div className="absolute top-[30%] right-[8%] w-1 h-1 rounded-full bg-blue-400/25 animate-dev-particle-2" />
          <div className="absolute bottom-[20%] left-[12%] w-2 h-2 rounded-full bg-teal-400/15 animate-dev-particle-3" />
          <div className="absolute top-[50%] right-[15%] w-1 h-1 rounded-full bg-violet-400/20 animate-dev-particle-1" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-[35%] left-[45%] w-1.5 h-1.5 rounded-full bg-cyan-300/15 animate-dev-particle-2" style={{ animationDelay: "0.8s" }} />
          <div className="absolute top-[70%] right-[35%] w-1 h-1 rounded-full bg-blue-300/20 animate-dev-particle-3" style={{ animationDelay: "2s" }} />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-gradient-flow" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div className="reveal-on-scroll reveal-left flex flex-col md:flex-row gap-8 md:gap-14 items-start">
            <div
              className="flex-shrink-0"
              style={{ transform: `translateY(${(1 - aboutOffset) * 40}px) rotate(${(1 - aboutOffset) * -8}deg)`, opacity: Math.min(aboutOffset * 2, 1), transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/5 animate-glow-soft">
                <Quote className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <div style={{ transform: `translateY(${(1 - aboutOffset) * 24}px)`, opacity: Math.min(aboutOffset * 1.8, 1), transition: "transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5">About This Project</h2>
              <p className="text-[15px] text-slate-400 leading-[1.9] max-w-2xl">
                This website was developed in partnership with{" "}
                <span className="font-semibold text-white">STI College Balagtas</span> as a
                website project together with MHACTO staff for the Municipal History, Arts, Culture and Tourism Office (MHACTO)
                of Bocaue, Bulacan. It serves as a digital platform to showcase the
                municipality&apos;s rich history, vibrant culture, tourist destinations, and community life
                — making Bocaue&apos;s heritage accessible to everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Glowing section divider */}
        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-gradient-flow" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent blur-sm" />
        </div>
      </section>

      {/* ══════════ TEAM ══════════ */}
      <section ref={teamRef} className="relative bg-[#0a0e1a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/[0.04] blur-[100px]"
            style={{ transform: `translate(-50%, ${teamOffset * -50}px) scale(${0.8 + teamOffset * 0.3})`, transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/[0.03] blur-[80px]"
            style={{ transform: `translateY(${teamOffset * 40}px) scale(${0.85 + teamOffset * 0.2})`, transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <div
            className="absolute top-1/3 right-[10%] w-[250px] h-[250px] rounded-full bg-cyan-500/[0.02] blur-[80px]"
            style={{ transform: `translate(${(1 - teamOffset) * 30}px, ${teamOffset * -20}px)`, transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </div>

        {/* Team section particles */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translateY(${(1 - teamOffset) * 50}px)`, transition: "transform 1.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          aria-hidden
        >
          <div className="absolute top-[8%] left-[6%] w-1.5 h-1.5 rounded-full bg-amber-400/20 animate-dev-particle-1" />
          <div className="absolute top-[12%] right-[10%] w-1 h-1 rounded-full bg-blue-400/25 animate-dev-particle-3" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-[25%] left-[85%] w-2 h-2 rounded-full bg-cyan-400/15 animate-dev-particle-2" style={{ animationDelay: "1s" }} />
          <div className="absolute top-[40%] left-[3%] w-1 h-1 rounded-full bg-emerald-400/20 animate-dev-particle-3" style={{ animationDelay: "1.8s" }} />
          <div className="absolute top-[55%] right-[5%] w-1.5 h-1.5 rounded-full bg-violet-400/20 animate-dev-particle-1" style={{ animationDelay: "0.3s" }} />
          <div className="absolute top-[65%] left-[50%] w-1 h-1 rounded-full bg-pink-400/15 animate-dev-particle-2" style={{ animationDelay: "2.2s" }} />
          <div className="absolute top-[75%] right-[30%] w-1.5 h-1.5 rounded-full bg-teal-400/20 animate-dev-particle-3" style={{ animationDelay: "0.7s" }} />
          <div className="absolute top-[85%] left-[20%] w-1 h-1 rounded-full bg-blue-300/20 animate-dev-particle-1" style={{ animationDelay: "1.3s" }} />
          <div className="absolute top-[35%] left-[40%] w-0.5 h-0.5 rounded-full bg-cyan-300/25 animate-dev-particle-2" style={{ animationDelay: "2.5s" }} />
          <div className="absolute top-[90%] right-[45%] w-1 h-1 rounded-full bg-amber-300/15 animate-dev-particle-1" style={{ animationDelay: "1.6s" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div
            className="reveal-on-scroll reveal-scale text-center mb-16"
            style={{ transform: `translateY(${(1 - teamOffset) * 30}px)`, opacity: Math.min(teamOffset * 2, 1), transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400 mb-3 dev-shimmer-text">Our People</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">The Developers</h2>
            <div className="mt-5 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-gradient-flow" />
          </div>

          {/* Lead card — 3D tilt */}
          <div
            className="reveal-on-scroll reveal-blur mb-10"
            style={{ transform: `translateY(${Math.max((1 - teamOffset) * 20 - 10, 0)}px)`, transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {(() => {
              const lead = team[0]
              const LeadIcon = lead.icon
              const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)
              return (
                <div
                  className="dev-tilt-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden mx-auto max-w-3xl dev-card-glow hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-amber-500/[0.08]"
                  onMouseMove={handleTilt}
                  onMouseLeave={resetTilt}
                >
                  <div className={`h-px bg-gradient-to-r ${lead.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-700`} />
                  <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${lead.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-all duration-1000`} />
                      <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ${lead.avatarBg} text-white text-xl font-bold flex-shrink-0 shadow-lg ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-700 group-hover:scale-110 group-hover:shadow-xl`}>
                        {initials}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-white">{lead.name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${lead.roleBg} ${lead.roleText} border border-current/10 transition-all duration-500 group-hover:scale-105`}>
                          <LeadIcon className="h-3.5 w-3.5" />
                          {lead.role}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed transition-colors duration-500 group-hover:text-slate-300">{lead.description}</p>
                    </div>
                    {lead.linkedin && (
                      <a
                        href={lead.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dev-magnetic inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-[#0A66C2] hover:border-[#0A66C2]/50 hover:shadow-lg hover:shadow-blue-500/25 flex-shrink-0 transition-all duration-500"
                        onMouseMove={handleMagnetic}
                        onMouseLeave={resetMagnetic}
                      >
                        <Linkedin className="h-4 w-4" />
                        Connect
                      </a>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Grid cards — alternating reveal + 3D tilt */}
          <div className="grid gap-5 sm:grid-cols-2">
            {team.slice(1).map((member, idx) => {
              const Icon = member.icon
              const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2)
              const delay = `delay-${(idx + 1) * 150}`
              const direction = idx % 2 === 0 ? "reveal-left" : "reveal-right"
              const cardFloat = Math.max((1 - teamOffset) * (30 + idx * 8) - 15, 0)

              return (
                <div
                  key={member.name}
                  className={`reveal-on-scroll ${direction} ${delay}`}
                  style={{ transform: `translateY(${cardFloat}px)`, transition: `transform ${1.2 + idx * 0.15}s cubic-bezier(0.16, 1, 0.3, 1)` }}
                >
                  <div
                    className={`dev-tilt-card group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden dev-card-glow hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-2xl ${member.glowColor}`}
                    onMouseMove={handleTilt}
                    onMouseLeave={resetTilt}
                  >
                    <div className={`h-px bg-gradient-to-r ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    <div className="p-6 sm:p-7">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative flex-shrink-0">
                          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-30 blur-lg transition-all duration-1000`} />
                          <div className={`relative flex h-14 w-14 items-center justify-center rounded-full ${member.avatarBg} text-white text-sm font-bold shadow-lg ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-700 group-hover:scale-110 group-hover:shadow-xl`}>
                            {initials}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-white leading-snug group-hover:text-white/90 transition-colors duration-400">{member.name}</h3>
                          <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${member.roleBg} ${member.roleText} transition-all duration-500 group-hover:scale-105`}>
                            <Icon className="h-3 w-3" />
                            {member.role}
                          </span>
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-400 leading-relaxed mb-5 transition-colors duration-500 group-hover:text-slate-300">
                        {member.description}
                      </p>
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dev-magnetic inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:bg-[#0A66C2] hover:border-[#0A66C2]/50 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-500"
                          onMouseMove={handleMagnetic}
                          onMouseLeave={resetMagnetic}
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

    </main>
  )
}
