"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Megaphone, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { newsArticles, categoryLabels } from "@/lib/data/news-data"
import NewsImage from "@/public/images/places/News.jpg"

export default function NewsPage() {
  const featuredArticle = newsArticles[0]
  const regularArticles = newsArticles.slice(1)

  const readingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <section 
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden"
        style={{
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url(${NewsImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
         
        }}
      >
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 h-full flex flex-col justify-center py-12 sm:py-16 md:py-24 lg:py-32">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all transform hover:scale-105 duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to home</span>
          </button>

          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-blue-300" />
              <span className="text-sm font-bold uppercase tracking-widest text-blue-300">News &amp; Blog</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl leading-tight">
              Stay Informed &amp; Updated
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
              Latest announcements, updates, and stories from the Municipality of Bocaue, Bulacan
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6">
                <Megaphone className="h-6 w-6 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">Featured Story</h2>
              </div>

              <Link href={`/news/${featuredArticle.id}`} className="group block">
                <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                      <Image
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
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
                            {categoryLabels[featuredArticle.category]}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <time dateTime={featuredArticle.date}>
                              {new Date(featuredArticle.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                          {featuredArticle.title}
                        </h3>

                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                          {featuredArticle.summary}
                        </p>

                        <p className="text-sm text-muted-foreground italic mb-4 p-3 bg-muted/50 rounded">
                          {featuredArticle.description}
                        </p>

                        {featuredArticle.places && featuredArticle.places.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Places Featured</p>
                            <div className="flex flex-wrap gap-2">
                              {featuredArticle.places.map((place) => (
                                <Badge key={place} variant="outline" className="text-xs">
                                  📍 {place}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>{featuredArticle.author}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{readingTime(featuredArticle.summary)} min read</span>
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
            </div>
          )}

          {/* All Articles Section */}
          <div>
            <div className="flex items-center gap-3 mb-8 sm:mb-12">
              <Megaphone className="h-6 w-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Latest Articles</h2>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {regularArticles.map((article, i) => (
                <Link key={article.id} href={`/news/${article.id}`} className="group block">
                  <Card className="overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                      {/* Image - 1 column on mobile, 1 on tablet/desktop */}
                      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-muted md:col-span-1">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs uppercase tracking-wider backdrop-blur-sm">
                            {categoryLabels[article.category]}
                          </Badge>
                        </div>
                      </div>

                      {/* Content - 2 columns on desktop */}
                      <CardContent className="p-5 sm:p-6 flex flex-col justify-between bg-card md:col-span-2 group">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <time dateTime={article.date}>
                                {new Date(article.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </time>
                            </div>
                          </div>

                          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                            {article.title}
                          </h3>

                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {article.summary}
                          </p>

                          {article.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground italic p-2 sm:p-3 bg-muted/50 rounded">
                              {article.description}
                            </p>
                          )}

                          {article.places && article.places.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Places Featured</p>
                              <div className="flex flex-wrap gap-2">
                                {article.places.map((place) => (
                                  <Badge key={place} variant="outline" className="text-xs">
                                    📍 {place}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <User className="h-4 w-4" />
                              <span>{article.author}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span>{readingTime(article.summary)} min read</span>
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
        </div>
      </section>
    </main>
  )
}
