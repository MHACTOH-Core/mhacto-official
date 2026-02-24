import Link from "next/link"
import { Clock, Users } from "lucide-react"

const sections = [
  {
    title: "Timeline of Events",
    description:
      "Explore the significant historical milestones that shaped Bocaue — from its early barangay origins to its role in national history.",
    href: "/history/timeline",
    icon: Clock,
    color: "from-amber-500 to-yellow-400",
    bg: "bg-amber-50",
  },
  {
    title: "Notable Figures",
    description:
      "Discover the remarkable men and women of Bocaue whose contributions in arts, politics, religion, and culture left lasting legacies.",
    href: "/history/notable-persons",
    icon: Users,
    color: "from-emerald-500 to-teal-400",
    bg: "bg-emerald-50",
  },
]

export default function HistoryPage() {
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
            History of Bocaue
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
            A town shaped by faith, revolution, and culture — walk through the
            centuries that defined Bocaue, Bulacan.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-4xl px-6 py-14 lg:px-16">
        <div className="grid gap-8 sm:grid-cols-2">
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
