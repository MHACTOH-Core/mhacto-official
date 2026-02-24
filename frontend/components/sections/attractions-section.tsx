import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { attractions, categoryLabels } from "@/lib/data/places-data"

export function AttractionsSection() {
  return (
    <section id="attractions" className="relative z-20 bg-card pt-16 pb-14 sm:pt-24 sm:pb-16 lg:pt-36 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center reveal-on-scroll">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Top Destinations
          </span>
          <h2 className="mt-2 text-balance text-2xl font-bold text-card-foreground sm:text-3xl md:text-4xl">
            Discover Bocaue
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground">
            From awe-inspiring landmarks to mouth-watering cuisine, Bocaue
            offers an unforgettable experience for every visitor.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {attractions.slice(0, 4).map((item, i) => (
            <div
              key={item.id}
              className={`group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(i + 1) * 100}`}
            >
              <Link href={`/places/${item.id}`} className="block">
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/60 text-white border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                      {categoryLabels[item.category]}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {item.established && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Est. {item.established}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.location.split(",")[0]}</span>
                      </span>
                    )}
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Read more
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* View All button */}
        <div className="mt-10 text-center reveal-on-scroll delay-300">
          <Button asChild variant="outline" size="lg" className="rounded-full gap-2">
            <Link href="/places">
              View All Places
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
