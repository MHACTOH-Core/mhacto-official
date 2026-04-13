"use client"

import Image from "next/image"
import { Linkedin, Code2, GraduationCap, Layers, TestTube, Palette, Terminal, Crown } from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils"

const team = [
  {
    name: "Christian Carr Tac-an",
    role: "Project Manager",
    description: "Leads project planning, coordination, and delivery — ensuring the team stays aligned and milestones are met on schedule.",
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    colorLight: "bg-amber-500/10 text-amber-600",
    linkedin: null,
  },
  {
    name: "Jayson Visnar",
    role: "Tech Lead",
    description: "Architects the full-stack system, makes key technical decisions, and drives code quality across the entire application.",
    icon: Terminal,
    color: "from-blue-500 to-cyan-500",
    colorLight: "bg-blue-500/10 text-blue-600",
    linkedin: "https://www.linkedin.com/in/jayson-visnar-1164a4365/",
  },
  {
    name: "Juan Carlos Flores",
    role: "Full Stack Developer",
    description: "Builds and integrates frontend interfaces with backend services — from REST APIs to responsive UI components.",
    icon: Layers,
    color: "from-emerald-500 to-teal-500",
    colorLight: "bg-emerald-500/10 text-emerald-600",
    linkedin: "https://www.linkedin.com/in/juancarlosfloresph/?fbclid=IwY2xjawRJkjdleHRuA2FlbQIxMABicmlkETFJS1dScUR5R1EzWU9xajh6c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHh4nz3rZtS7xmxwVz4bwP802eUWld2fYrciMBu6Q1hGl7NKK8WSByTEp17Eo_aem_QPH0GVb1c-ekjzEkL6c-Ww",
  },
  {
    name: "John Leonard Chingcuangco",
    role: "QA Tester",
    description: "Ensures application reliability through rigorous testing, bug tracking, and quality assurance across all features.",
    icon: TestTube,
    color: "from-violet-500 to-purple-600",
    colorLight: "bg-violet-500/10 text-violet-600",
    linkedin: "https://www.linkedin.com/in/john-leonard-chingcuangco-9ba2623b0/?fbclid=IwY2xjawRJkktleHRuA2FlbQIxMABicmlkETFJS1dScUR5R1EzWU9xajh6c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHjr_gEvVHll3QgGAK5sjH-XZ-T-sKu0O-cDyBb_P3YH3UnU_I_wc0i0nW2nG_aem_ViQAO9Gc8GBPjms1KWzsTg",
  },
  {
    name: "Juan Miguel Borja",
    role: "UI/UX Designer",
    description: "Crafts intuitive user experiences and polished visual designs — turning wireframes into pixel-perfect interfaces.",
    icon: Palette,
    color: "from-pink-500 to-rose-500",
    colorLight: "bg-pink-500/10 text-pink-600",
    linkedin: "https://www.linkedin.com/in/miguel-borja-0659193b1/?fbclid=IwY2xjawRJkglleHRuA2FlbQIxMABicmlkETFJS1dScUR5R1EzWU9xajh6c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHjr_gEvVHll3QgGAK5sjH-XZ-T-sKu0O-cDyBb_P3YH3UnU_I_wc0i0nW2nG_aem_ViQAO9Gc8GBPjms1KWzsTg",
  },
]

const techStack = [
  { name: "Next.js", icon: "▲", color: "bg-black/5 text-black border-black/10 dark:bg-white/10 dark:text-white dark:border-white/10" },
  { name: "React", icon: "⚛", color: "bg-sky-50 text-sky-600 border-sky-200" },
  { name: "TypeScript", icon: "TS", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "Tailwind CSS", icon: "🌊", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { name: "PHP", icon: "🐘", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { name: "MySQL", icon: "🗄", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Framer Motion", icon: "✦", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { name: "shadcn/ui", icon: "◆", color: "bg-zinc-50 text-zinc-700 border-zinc-200" },
]

export default function DevelopersPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-14 pb-14 sm:pt-20 sm:pb-16">
        {/* Background grid pattern */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }} />
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/4 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="flex justify-center mb-5">
            <Image
              src={resolveMediaUrl("/uploads/images/logos/sti-logo.jpg")}
              alt="STI College Balagtas Logo"
              width={80}
              height={60}
              className="h-14 w-auto object-contain rounded-lg shadow-sm"
            />
          </div>

          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-primary/60 mb-2">
            In Partnership with STI College Balagtas
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
            Developer Team
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            The team behind the MHACTO Bocaue digital platform — built with modern technologies to serve the Municipality of Bocaue, Bulacan.
          </p>

          {/* Tech stack pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {techStack.map((tech) => (
              <span
                key={tech.name}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default ${tech.color}`}
              >
                <span className="text-xs leading-none">{tech.icon}</span>
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── About the Project ── */}
      <section className="mx-auto max-w-4xl px-6 pb-10">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">About This Project</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            This website was developed in partnership with{" "}
            <span className="font-semibold text-foreground">STI College Balagtas</span> as a website project
            for the Municipal History, Arts, Culture and Tourism Office (MHACTO) of Bocaue, Bulacan.
            It serves as a digital platform to showcase Bocaue&apos;s rich history, vibrant culture,
            tourist destinations, and community life.
          </p>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">The Developers</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => {
            const Icon = member.icon
            return (
              <div
                key={member.name}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${member.color}`} />

                <div className="p-6">
                  {/* Role icon + initials */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${member.colorLight} text-xl font-black`}>
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${member.colorLight}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">{member.name}</h3>
                  <p className={`text-sm font-semibold mt-0.5 bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}>
                    {member.role}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed">
                    {member.description}
                  </p>

                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#0A66C2] hover:underline transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      Connect on LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
