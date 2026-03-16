"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Clock, Loader2, Megaphone, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiFetchPostById, apiFetchPublishedNews, type NewsArticleAPI } from "@/lib/api"
import type { CMSPost } from "@/lib/data/admin-data"
import { resolveMediaUrl } from "@/lib/utils"
import ContentDetailLayout, { type QuickFact } from "@/components/sections/content-detail-layout"

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

  const categoryName = categoryLabels[article.label] || article.label || "News"
  const formattedDate = article.newsDate
    ? new Date(article.newsDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : undefined

  const quickFacts: QuickFact[] = []
  if (formattedDate) quickFacts.push({ icon: <Calendar className="h-4 w-4 text-primary" />, label: "Published", value: formattedDate })
  quickFacts.push({ icon: <User className="h-4 w-4 text-primary" />, label: "Author", value: "MHACTO Bocaue" })
  quickFacts.push({ icon: <Clock className="h-4 w-4 text-primary" />, label: "Reading Time", value: `${readingTime(article.body)} min read` })

  return (
    <ContentDetailLayout
      heroImage={article.image[0] ?? ""}
      title={article.title}
      heroBadges={
        <Badge className="bg-primary text-primary-foreground text-xs uppercase tracking-wider">
          {categoryName}
        </Badge>
      }
      heroSubtitle={formattedDate}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "News & Updates", href: "/news" },
        { label: article.title },
      ]}
      backHref="/news"
      backLabel="News & Updates"
      images={article.image}
      quickFacts={quickFacts}
      badges={
        <>
          <Badge variant="outline" className="text-xs">{categoryName}</Badge>
          <Badge variant="outline" className="text-xs">Bocaue</Badge>
          <Badge variant="outline" className="text-xs">Bulacan</Badge>
        </>
      }
      bodyText={article.body || undefined}
      bodyLabel="Article"
      highlights={article.highlights?.length ? article.highlights : undefined}
      cta={
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-bold text-foreground mb-1">Stay Updated</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Read more news and updates from Bocaue, Bulacan.
          </p>
          <Button asChild size="sm" className="gap-2">
            <Link href="/news">Browse All News</Link>
          </Button>
        </div>
      }
    >
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
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {other.image.length > 0 ? (
                      <Image
                        src={resolveMediaUrl(other.image[0])}
                        alt={other.title}
                        fill
                        sizes="96px"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        style={{ minWidth: "100%", minHeight: "100%" }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
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
    </ContentDetailLayout>
  )
}
