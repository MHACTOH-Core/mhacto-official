import NewsDetailClient from "./news-detail-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/**
 * Fetch all published news IDs so `output: 'export'` can pre-render them.
 * Falls back to an empty array when the backend is unreachable (e.g. CI).
 */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/read.php?type=news`)
    const data: { id: string }[] = await res.json()
    return data.map((a) => ({ id: String(a.id) }))
  } catch {
    return []
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NewsDetailClient id={id} />
}
