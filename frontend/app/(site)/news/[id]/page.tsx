import NewsDetailClient from "./news-detail-client"
import { API_BASE } from "@/lib/api"

/**
 * Fetch all published news IDs so `output: 'export'` can pre-render them.
 * Falls back to an empty array when the backend is unreachable (e.g. CI).
 */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts?type=news`)
    const json = await res.json()
    const data: { id: string }[] = json.data ?? json
    return data.map((a) => ({ id: String(a.id) }))
  } catch {
    return []
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NewsDetailClient id={id} />
}
