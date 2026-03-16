export interface NewsArticle {
  id: string
  title: string
  summary: string
  description: string
  content: string
  image: string
  date: string
  category: "competition" | "project" | "community" | "festival"
  author: string
  places: string[]
}

export const categoryLabels: Record<NewsArticle["category"], string> = {
  competition: "Competition",
  project: "Development",
  community: "Community",
  festival: "Festival",
}
