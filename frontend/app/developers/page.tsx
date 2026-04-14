"use client"

import Image from "next/image"
import Link from "next/link"
import { Linkedin, ArrowLeft, Crown, Terminal, Layers, TestTube, Palette, Quote } from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils"

const team = [
  {
    name: "Christian Carr Tac-an",
    role: "Project Manager",
    description: "Leads project planning, coordination, and delivery — ensuring the team stays aligned and milestones are met on schedule.",
    icon: Crown,
    gradient: "from-amber-400 to-orange-500",
    avatarBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    roleBg: "bg-amber-50",
    roleText: "text-amber-700",
    linkedin: "https://www.linkedin.com/in/christian-carr-tac-an-638195249/",
  },
  {
    name: "Jayson Visnar",
    role: "Tech Lead",
    description: "Architects the full-stack system, makes key technical decisions, and drives code quality across the entire application.",
    icon: Terminal,
    gradient: "from-blue-500 to-cyan-500",
    avatarBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    roleBg: "bg-blue-50",
    roleText: "text-blue-700",
    linkedin: "https://www.linkedin.com/in/jayson-visnar-1164a4365/",
  },
  {
    name: "Juan Carlos Flores",
    role: "Full Stack Developer",
    description: "Builds and integrates frontend interfaces with backend services — from REST APIs to responsive UI components.",
    icon: Layers,
    gradient: "from-emerald-400 to-teal-500",
    avatarBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    roleBg: "bg-emerald-50",
    roleText: "text-emerald-700",
    linkedin: "https://www.linkedin.com/in/juancarlosfloresph/",
  },
  {
    name: "John Leonard Chingcuangco",
    role: "QA Tester",
    description: "Ensures application reliability through rigorous testing, bug tracking, and quality assurance across all features.",
    icon: TestTube,
    gradient: "from-violet-500 to-purple-600",
    avatarBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    roleBg: "bg-violet-50",
    roleText: "text-violet-700",
    linkedin: "https://www.linkedin.com/in/john-leonard-chingcuangco-9ba2623b0/",
  },
  {
    name: "Juan Miguel Borja",
    role: "UI/UX Designer",
    description: "Crafts intuitive user experiences and polished visual designs — turning wireframes into pixel-perfect interfaces.",
    icon: Palette,
    gradient: "from-pink-500 to-rose-500",
    avatarBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    roleBg: "bg-pink-50",
    roleText: "text-pink-700",
    linkedin: "https://www.linkedin.com/in/miguel-borja-0659193b1/",
  },
]

export default function DevelopersPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">

      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-foreground overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-blue-100/30 blur-[100px]" />
          <div className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full bg-primary/3 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                In Partnership with STI College Balagtas
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
                The Team Behind<br />
                <span className="text-primary">MHACTO Bocaue</span>
              </h1>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md">
                A dedicated group of developers and designers committed to preserving
                and promoting the heritage of the RiverTown through technology.
              </p>
            </div>

            {/* Partner logos card */}
            <div className="flex-shrink-0 rounded-2xl p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-4 text-center">A Project By</p>
              <div className="flex items-center justify-center gap-5">
                <Image
                  src={resolveMediaUrl("/uploads/images/logos/MHACTO_LOGO.png")}
                  alt="MHACTO Bocaue"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
                <div className="w-px h-12 bg-slate-200" />
                <Image
                  src={resolveMediaUrl("/uploads/images/logos/sti-logo.jpg")}
                  alt="STI College Balagtas"
                  width={80}
                  height={56}
                  className="h-14 w-auto object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-start">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Quote className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">About This Project</h2>
              <p className="text-[15px] text-muted-foreground leading-[1.8]">
                This website was developed in partnership with{" "}
                <span className="font-semibold text-foreground">STI College Balagtas</span> as a
                capstone project for the Municipal History, Arts, Culture and Tourism Office (MHACTO)
                of Bocaue, Bulacan. It serves as a digital platform to showcase the
                municipality&apos;s rich history, vibrant culture, tourist destinations, and community life
                — making Bocaue&apos;s heritage accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Our People</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">The Developers</h2>
          </div>

          {/* Lead — Project Manager (featured) */}
          <div className="mb-8">
            {(() => {
              const lead = team[0]
              const LeadIcon = lead.icon
              const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)
              return (
                <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm mx-auto max-w-2xl hover:shadow-lg transition-shadow duration-300">
                  <div className={`h-1.5 bg-gradient-to-r ${lead.gradient}`} />
                  <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${lead.avatarBg} text-white text-lg font-bold flex-shrink-0 shadow-md`}>
                      {initials}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{lead.name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1.5 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${lead.roleBg} ${lead.roleText}`}>
                          <LeadIcon className="h-3.5 w-3.5" />
                          {lead.role}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{lead.description}</p>
                    </div>
                    {lead.linkedin && (
                      <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#004182] transition-colors shadow-sm">
                        <Linkedin className="h-4 w-4" />
                        Connect
                      </a>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Rest of the team */}
          <div className="grid gap-5 sm:grid-cols-2">
            {team.slice(1).map((member) => {
              const Icon = member.icon
              const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2)

              return (
                <div
                  key={member.name}
                  className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`h-1 bg-gradient-to-r ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${member.avatarBg} text-white text-sm font-bold flex-shrink-0 shadow-sm`}>
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-foreground leading-snug">{member.name}</h3>
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${member.roleBg} ${member.roleText}`}>
                            <Icon className="h-3 w-3" />
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                      {member.description}
                    </p>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0A66C2] text-white text-xs font-medium hover:bg-[#004182] transition-colors shadow-sm"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                        LinkedIn
                      </a>
                    )}
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
