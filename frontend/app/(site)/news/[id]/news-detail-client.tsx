"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Calendar, User, Clock, Loader2, Megaphone, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiFetchPostById, apiFetchPublishedNews, type NewsArticleAPI } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { resolveMediaUrl } from "@/lib/utils"

interface Props {
  id: string
}

const categoryLabels: Record<string, string> = {
  competition: "Competition",
  project: "Development",
  community: "Community",
  festival: "Festival",
  news: "News",
}

export default function NewsDetailClient({ id }: Props) {
  const [article, setArticle] = useState<CMSPost | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<NewsArticleAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch this article + related articles in parallel:
  //   1. GET /api/posts/read.php?id={id}        → PHP runs SELECT WHERE id={id} → returns single post JSON
  //   2. GET /api/posts/read.php?type=news&limit=6 → PHP runs SELECT WHERE post_type='news' LIMIT 6 → returns JSON array
  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      apiFetchPostById(id),
      apiFetchPublishedNews(6),
    ])
      .then(([post, allNews]) => {
        setArticle(post)
        setRelatedArticles(allNews.filter((a) => String(a.id) !== String(id)).slice(0, 4))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const readingTime = (text: string) => {
    const words = text.split(/\s+/).length
    return Math.ceil(words / 200)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading article...</span>
      </main>
    )
  }

  if (error || !article) {
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

  return (
    <main className="min-h-screen bg-background">
      {/* Hero image */}
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[55vh] w-full mt-14 sm:mt-16 md:mt-20 lg:mt-28">
        {article.image.length > 0 ? (
          <Image
            src={resolveMediaUrl(article.image[0])}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground/40">
            <Megaphone className="h-16 w-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-4xl px-4 pb-8 sm:pb-12 lg:px-8">
            <div className="animate-fade-in-up">
              <Badge className="mb-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                {categoryLabels[article.label] || article.label || "News"}
              </Badge>
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                {article.newsDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={article.newsDate}>
                      {new Date(article.newsDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  MHACTO Bocaue
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTime(article.body)} min read
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
            <div className="space-y-4 text-base leading-relaxed text-foreground/90">
              {article.body.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </article>

          {/* Additional images gallery */}
          {article.image.length > 1 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold text-foreground mb-4">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {article.image.slice(1).map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={resolveMediaUrl(img)}
                      alt={`${article.title} - photo ${i + 2}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="mt-8 flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{categoryLabels[article.label] || article.label}</Badge>
            <Badge variant="outline">Bocaue</Badge>
            <Badge variant="outline">Bulacan</Badge>
          </div>
        </div>
      </section>

      {/* More News */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-border bg-muted/40 py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl mb-6">
              More News
            </h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {relatedArticles.map((other) => (
                <Link
                  key={other.id}
                  href={`/news/${other.id}`}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                    {other.image.length > 0 ? (
                      <Image
                        src={resolveMediaUrl(other.image[0])}
                        alt={other.title}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground/40">
                        <Megaphone className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    {other.newsDate && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(other.newsDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
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
