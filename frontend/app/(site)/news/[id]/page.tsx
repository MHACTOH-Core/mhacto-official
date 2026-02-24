import type { Metadata } from "next"
import { newsArticles, categoryLabels } from "@/lib/data/news-data"
import NewsDetailClient from "./news-detail-client"

export function generateStaticParams() {
  return newsArticles.map((article) => ({
    id: article.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const article = newsArticles.find((a) => a.id === id)
  if (!article) {
    return { title: "Article Not Found" }
  }
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: `${article.title} | MHACTO Bocaue`,
      description: article.summary,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: article.image ? [{ url: article.image }] : undefined,
    },
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = newsArticles.find((a) => a.id === id)
  return <NewsDetailClient article={article} />
}
