import CultureDetailClient from "@/components/sections/culture-detail-client"
import { festivals } from "@/lib/data/culture-data"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function generateStaticParams() {
  const staticIds = festivals.map((f) => ({ id: f.id }))
  try {
    const res = await fetch(`${API_BASE}/api/posts/read.php?label=festivals&status=published`)
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
      label="festivals"
      backHref="/culture/festivals-celebrations"
      backLabel="Festivals & Celebrations"
      categoryLabel="Festival"
      highlightsLabel="Festival Highlights"
      storyLabel="History & Background"
    />
  )
}
