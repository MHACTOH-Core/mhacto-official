"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, User, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { newsArticles, categoryLabels, type NewsArticle } from "@/lib/data/news-data"

interface NewsDetailClientProps {
  article?: NewsArticle
}

export default function NewsDetailClient({ article }: NewsDetailClientProps) {
  if (!article) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Article not found</h1>
          <p className="mt-2 text-muted-foreground">
            The news article you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild className="mt-6">
            <Link href="/news">Back to News</Link>
          </Button>
        </div>
      </main>
    )
  }

  // Get other articles for "More News" section
  const otherArticles = newsArticles.filter((a) => a.id !== article.id)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero image */}
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[55vh] w-full mt-14 sm:mt-16 md:mt-20 lg:mt-28">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-4xl px-4 pb-8 sm:pb-12 lg:px-8">
            <div className="animate-fade-in-up">
              <Badge className="mb-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                {categoryLabels[article.category]}
              </Badge>
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {article.author}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article content */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-8 gap-1 text-muted-foreground">
            <Link href="/news">
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>
          </Button>

          <article className="prose prose-neutral dark:prose-invert max-w-none animate-fade-in-up delay-200">
            <p className="text-lg leading-relaxed text-muted-foreground mb-6 font-medium">
              {article.summary}
            </p>
            <div className="space-y-4 text-base leading-relaxed text-foreground/90">
              {article.content.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </article>

          {/* Tags */}
          <div className="mt-8 flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{categoryLabels[article.category]}</Badge>
            <Badge variant="outline">Bocaue</Badge>
            <Badge variant="outline">Bulacan</Badge>
          </div>
        </div>
      </section>

      {/* More News */}
      {otherArticles.length > 0 && (
        <section className="border-t border-border bg-muted/40 py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl mb-6">
              More News
            </h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {otherArticles.map((other) => (
                <Link
                  key={other.id}
                  href={`/news/${other.id}`}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={other.image}
                      alt={other.title}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(other.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {other.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
