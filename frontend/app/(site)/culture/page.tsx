import Link from "next/link"
import { Utensils, Sparkles, Flame } from "lucide-react"

const sections = [
  {
    title: "Local Cuisine",
    description:
      "Taste the flavors of Bocaue — from its famous puto and kakanin to traditional town fiesta dishes that have been passed down for generations.",
    href: "/culture/local-cuisine",
    icon: Utensils,
    color: "from-orange-500 to-amber-400",
    bg: "bg-orange-50",
  },
  {
    title: "Festivals",
    description:
      "Experience the vibrant celebrations of Bocaue, including the world-famous Bocaue Pagoda Festival and the rich fiesta traditions honoring St. Martin of Tours.",
    href: "/culture/festivals-celebrations",
    icon: Sparkles,
    color: "from-rose-500 to-pink-400",
    bg: "bg-rose-50",
  },
  {
    title: "Cultural Practices",
    description:
      "Learn about the living traditions, rituals, and customs that define Bocaue's identity — from religious processions to everyday community practices.",
    href: "/culture/practices-traditions",
    icon: Flame,
    color: "from-violet-500 to-purple-400",
    bg: "bg-violet-50",
  },
]

export default function CulturePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[280px] flex items-end overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(/images/places/oldtownbocaue.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="px-6 pb-10 pt-20 lg:px-16">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
            Bocaue Wonders
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Arts &amp; Culture
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
            Immerse yourself in the rich heritage, living traditions, and vibrant
            festivals that make Bocaue a cultural treasure of Bulacan.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(({ title, description, href, icon: Icon, color, bg }) => (
            <Link
              key={title}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${color}`} />
              <div className="p-6">
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}
                >
                  <Icon className="h-5 w-5 text-foreground/70" />
                </div>
                <h2 className="mb-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <span className="mt-4 inline-block text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
