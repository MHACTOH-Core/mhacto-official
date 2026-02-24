import Image from "next/image"
import Link from "next/link"
import { ArrowRight, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { asset } from "@/lib/utils"

const delicacies = [
  {
    id: "chicharon",
    title: "Bocaue Chicharon",
    description:
      "Crispy, golden pork rinds perfected over generations — Bocaue's most celebrated street food and the pride of MacArthur Highway.",
    image: asset("/images/places/local-delicacies.jpg"),
    tag: "Street Food Icon",
  },
  {
    id: "kakanin",
    title: "Traditional Kakanin",
    description:
      "Suman, bibingka, puto, and other rice cakes rooted in pre-colonial harvest traditions. A sweet taste of Bulacan's indigenous heritage.",
    image: asset("/images/places/Food.jpg"),
    tag: "Heritage Sweets",
  },
  {
    id: "river-seafood",
    title: "River Seafood & Ulam",
    description:
      "Fresh catches from the Bocaue River transformed into classic Filipino ulam — sinangag, bangus dishes, and slow-cooked stews served by local eateries.",
    image: asset("/images/heroes/hero-bocaue.jpg"),
    tag: "Local Favourites",
  },
]

export function CulinarySection() {
  return (
    <section
      id="cuisine"
      className="relative z-20 bg-muted/40 py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <UtensilsCrossed className="h-4 w-4" />
            Taste of Bocaue
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            Featured Culinary Delicacies
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            From legendary crispy chicharon to generations-old kakanin, Bocaue's flavours
            tell a story of culture, craft, and community.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {delicacies.map((item, i) => (
            <div
              key={item.id}
              className={`group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(i + 1) * 100}`}
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className="bg-primary/90 text-primary-foreground border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm"
                  >
                    {item.tag}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
                <Link
                  href="/culture/local-cuisine"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary"
                >
                  Explore Cuisine
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center reveal-on-scroll delay-300">
          <Button asChild variant="outline" size="lg" className="rounded-full gap-2">
            <Link href="/culture/local-cuisine">
              Discover All Delicacies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
