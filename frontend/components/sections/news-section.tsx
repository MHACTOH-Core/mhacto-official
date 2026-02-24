import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { newsArticles, categoryLabels } from "@/lib/data/news-data"

export function NewsSection() {
  return (
    <section id="news" className="relative z-20 bg-background pt-16 pb-14 sm:pt-24 sm:pb-16 lg:pt-36 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center reveal-on-scroll">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Latest Updates
          </span>
          <h2 className="mt-2 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            News &amp; Stories from Bocaue
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground">
            Stay up to date with the latest happenings, achievements, and
            developments in the Municipality of Bocaue.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
          {newsArticles.map((article, i) => (
            <article
              key={article.id}
              className={`group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(i + 1) * 100}`}
            >
              <Link href={`/news/${article.id}`} className="block">
                <div className="relative h-52 sm:h-60 w-full overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className="bg-black/60 text-white border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm"
                    >
                      {categoryLabels[article.category]}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={article.date}>
                      {new Date(article.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground line-clamp-3">
                    {article.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read full story
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center reveal-on-scroll delay-300">
          <Button asChild variant="outline" size="lg" className="rounded-full gap-2">
            <Link href="/news">
              View All News
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
