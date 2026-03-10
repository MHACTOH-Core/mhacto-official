import CultureDetailClient from "@/components/sections/culture-detail-client"
import { artisans } from "@/lib/data/culture-data"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function generateStaticParams() {
  const staticIds = artisans.map((a) => ({ id: a.id }))
  try {
    const res = await fetch(`${API_BASE}/api/posts/read.php?label=crafts-artisan&status=published`)
    const data: { id: string | number }[] = await res.json()
    const apiIds = data.map((p) => ({ id: String(p.id) }))
    const seen = new Set(staticIds.map((s) => s.id))
    apiIds.forEach((a) => { if (!seen.has(a.id)) staticIds.push(a) })
  } catch { /* backend unavailable */ }
  return staticIds
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <CultureDetailClient
      id={id}
      label="crafts-artisan"
      backHref="/culture/crafts-artisan"
      backLabel="Crafts & Artisan"
      categoryLabel="Master Artisan"
      highlightsLabel="Products & Works"
      storyLabel="About the Artisan"
    />
  )
}
