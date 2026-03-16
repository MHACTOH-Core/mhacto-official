"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { resolveMediaUrl } from "@/lib/utils"
import { apiFetchPublishedNews, type NewsArticleAPI } from "@/lib/api"

// Local display-ready type for news cards (mapped from API shape)
type NewsCardData = {
  id: string
  title: string
  summary: string
  image: string
  date: string
  category: string
}

/** Human-readable labels for news category badges */
const newsCategoryDisplayLabels: Record<string, string> = {
  competition: "Competition",
  project: "Development",
  community: "Community",
  festival: "Festival",
  news: "News",
}

/** Maximum featured news cards shown on the homepage */
const MAX_FEATURED_NEWS_DISPLAY = 4

export function NewsSection() {
  const [featuredArticles, setFeaturedArticles] = useState<NewsCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ──────────────────────────────────────────────────────────────────────
  // DATA FETCHING — How this works (applies to ALL fetch calls in the app):
  //
  //   Frontend (React)           →  HTTP request  →  PHP Backend  →  MySQL DB
  //   apiFetchPublishedNews()       GET /api/posts/read.php?type=news
  //
  // WHY NOT a direct SQL SELECT?
  //   The frontend runs in the user's BROWSER. Browsers cannot connect to a
  //   MySQL database directly — that would expose the DB credentials and allow
  //   anyone to run arbitrary SQL. Instead, we use a "REST API" pattern:
  //
  //   1. The frontend calls `fetch()` to send an HTTP GET request to the PHP
  //      backend server (e.g. http://localhost:8000/api/posts/read.php?type=news).
  //   2. The PHP backend receives the request, runs a prepared SQL SELECT
  //      query (e.g. `SELECT * FROM content WHERE post_type = 'news'`),
  //      and returns the rows as a JSON array in the HTTP response.
  //   3. The frontend parses the JSON and puts it into React state.
  //
  //   This is the standard, secure way all modern web apps access databases.
  //   The "SELECT" query still happens — just on the server side, inside PHP.
  // ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Sends GET /api/posts/read.php?type=news → PHP runs SQL SELECT → returns JSON array
    apiFetchPublishedNews()
      .then((apiArticles) => {
        if (apiArticles && apiArticles.length > 0) {
          // Only show featured posts on the home page, sorted newest-first
          const mappedArticles = apiArticles
            .filter((article) => article.isFeatured)
            .sort((articleA, articleB) => {
              const dateA = articleA.newsDate || articleA.createdAt
              const dateB = articleB.newsDate || articleB.createdAt
              return new Date(dateB).getTime() - new Date(dateA).getTime()
            })
            .slice(0, MAX_FEATURED_NEWS_DISPLAY)
            .map((article) => ({
              id: article.id,
              title: article.title,
              summary: article.body?.substring(0, 200) + "..." || "",
              image: resolveMediaUrl(article.image?.[0]),
              date: article.newsDate || article.createdAt,
              category: article.label || "news",
            }))
          setFeaturedArticles(mappedArticles)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Don't render if no articles loaded
  if (!isLoading && featuredArticles.length === 0) return null

  return (
    <section id="news" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 sm:mb-14 text-center reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Calendar className="h-4 w-4" />
            Latest Updates
          </span>
          <h2 className="mt-3 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl font-heading">
            Featured News &amp; Stories
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            Stay up to date with the latest happenings, achievements, and
            developments in the Municipality of Bocaue.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
          {featuredArticles.map((article, cardIndex) => {
            return (
              <article
                key={article.id}
                className={`group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg reveal-on-scroll delay-${(cardIndex + 1) * 100}`}
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
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-black/60 text-white border-0 text-[10px] uppercase tracking-wider backdrop-blur-sm"
                      >
                        {newsCategoryDisplayLabels[article.category] || article.category}
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
            )
          })}
        </div>

        {/* View All button - always show if there are articles */}
        {featuredArticles.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              See All News
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
