import Link from "next/link"
import { Landmark, Building2, Church, Compass } from "lucide-react"

const categories = [
  {
    title: "Heritage Sites",
    description:
      "Explore Bocaue's ancestral houses, historic landmarks, and Spanish-era structures that tell the story of the town's storied past.",
    href: "/destinations/heritage-sites",
    icon: Landmark,
    color: "from-amber-500 to-yellow-400",
    bg: "bg-amber-50",
  },
  {
    title: "Museums",
    description:
      "Step inside Bocaue's museums and galleries showcasing artifacts, photographs, and exhibits that document the town's history and culture.",
    href: "/destinations/museums",
    icon: Building2,
    color: "from-sky-500 to-blue-400",
    bg: "bg-sky-50",
  },
  {
    title: "Religious Sites",
    description:
      "Visit the centuries-old churches and chapels of Bocaue, including the Parish of St. Martin of Tours — home of the famous Pagoda Festival.",
    href: "/destinations/religious-sites",
    icon: Church,
    color: "from-violet-500 to-purple-400",
    bg: "bg-violet-50",
  },
  {
    title: "Travel &amp; Tours",
    description:
      "Plan your visit with curated tour packages that take you through Bocaue's storied streets, waterways, and cultural landmarks.",
    href: "/travel-tours",
    icon: Compass,
    color: "from-teal-500 to-emerald-400",
    bg: "bg-teal-50",
  },
]

export default function DestinationsPage() {
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
            Tourist Destinations
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
            From heritage churches to riverside views — experience the best of
            Bocaue's destinations and tours.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {categories.map(({ title, description, href, icon: Icon, color, bg }) => (
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
                <h2
                  className="mb-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
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
