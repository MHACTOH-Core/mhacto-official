"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Megaphone, Clock, User, Loader2 } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { apiFetchPublishedNews, type NewsArticleAPI } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/utils"
import NewsImage from "@/public/images/places/News.jpg"

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticleAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sends GET /api/posts/read.php?type=news → PHP runs SQL SELECT on content WHERE post_type='news' → returns JSON
  useEffect(() => {
    apiFetchPublishedNews()
      .then((data) => setArticles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const featuredArticles = articles.filter((a) => a.isFeatured)
  const regularArticles = articles.filter((a) => !a.isFeatured)
  const heroFeatured = featuredArticles[0] ?? null
  const additionalFeatured = featuredArticles.slice(1)

  const readingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <PageHero
        pageSlug="news"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackIcon="Megaphone"
        fallbackAccentColor="blue-300"
        fallbackLabel="News & Blog"
        fallbackTitle="Stay Informed & Updated"
        fallbackDescription="Latest announcements, updates, and stories from the Municipality of Bocaue, Bulacan"
        showBackButton
      />

      {/* Main Content */}
      <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading news...</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Unable to load news articles.</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-20">
              <Megaphone className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">No news articles published yet.</p>
            </div>
          )}

          {/* Featured Article(s) */}
          {!loading && heroFeatured && (
            <div className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6">
                <Megaphone className="h-6 w-6 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">Featured Story</h2>
              </div>

              {/* Hero featured */}
              <Link href={`/news/${heroFeatured.id}`} className="group block">
                <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden bg-muted">
                      {heroFeatured.image.length > 0 ? (
                        <Image
                          src={resolveMediaUrl(heroFeatured.image[0])}
                          alt={heroFeatured.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          priority
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground/40">
                          <Megaphone className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500/90 hover:bg-red-600 text-white border-0 text-xs uppercase tracking-wider backdrop-blur-sm">
                          Featured
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 sm:p-8 flex flex-col justify-between bg-card group">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                            News
                          </Badge>
                          {heroFeatured.newsDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <time dateTime={heroFeatured.newsDate}>
                                {new Date(heroFeatured.newsDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </time>
                            </div>
                          )}
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                          {heroFeatured.title}
                        </h3>

                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 line-clamp-4">
                          {heroFeatured.body}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>MHACTO Bocaue</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{readingTime(heroFeatured.body)} min read</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-border">
                        <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                          Read full story
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>

              {/* Additional featured articles (2-column grid) */}
              {additionalFeatured.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
                  {additionalFeatured.map((article) => (
                    <Link key={article.id} href={`/news/${article.id}`} className="group block">
                      <Card className="overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-xl h-full">
                        <div className="relative h-48 sm:h-56 overflow-hidden bg-muted">
                          {article.image.length > 0 ? (
                            <Image
                              src={resolveMediaUrl(article.image[0])}
                              alt={article.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                              <Megaphone className="h-10 w-10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-red-500/90 hover:bg-red-600 text-white border-0 text-xs uppercase tracking-wider backdrop-blur-sm">Featured</Badge>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.body}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Articles Section */}
          {!loading && regularArticles.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8 sm:mb-12">
              <Megaphone className="h-6 w-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Latest Articles</h2>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {regularArticles.map((article) => (
                <Link key={article.id} href={`/news/${article.id}`} className="group block">
                  <Card className="overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                      {/* Image */}
                      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-muted md:col-span-1">
                        {article.image.length > 0 ? (
                          <Image
                            src={resolveMediaUrl(article.image[0])}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                            loading="lazy"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                            <Megaphone className="h-10 w-10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs uppercase tracking-wider backdrop-blur-sm">
                            News
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-5 sm:p-6 flex flex-col justify-between bg-card md:col-span-2 group">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {article.newsDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <time dateTime={article.newsDate}>
                                  {new Date(article.newsDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </time>
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                            {article.title}
                          </h3>

                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">
                            {article.body}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <User className="h-4 w-4" />
                              <span>MHACTO Bocaue</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span>{readingTime(article.body)} min read</span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all text-sm">
                            Read full story
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          )}
        </div>
      </section>
    </main>
  )
}
