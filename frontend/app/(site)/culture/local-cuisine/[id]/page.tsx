import CultureDetailClient from "@/components/sections/culture-detail-client"
import { localCuisine } from "@/lib/data/culture-data"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function generateStaticParams() {
  const staticIds = localCuisine.map((c) => ({ id: c.id }))
  try {
    const res = await fetch(`${API_BASE}/api/posts/read.php?label=local-cuisine&status=published`)
    const data: { id: string | number }[] = await res.json()
    const apiIds = data.map((p) => ({ id: String(p.id) }))
    const seen = new Set(staticIds.map((s) => s.id))
    apiIds.forEach((a) => { if (!seen.has(a.id)) staticIds.push(a) })
  } catch { /* backend unavailable — static IDs are sufficient */ }
  return staticIds
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <CultureDetailClient
      id={id}
      label="local-cuisine"
      backHref="/culture/local-cuisine"
      backLabel="Local Cuisine"
      categoryLabel="Local Cuisine"
      storyLabel="The Story Behind It"
      hideGallery
    />
  )
}
