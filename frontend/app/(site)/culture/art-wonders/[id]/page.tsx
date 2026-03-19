import CultureDetailClient from "@/components/sections/culture-detail-client"
import { API_BASE } from "@/lib/api"

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts?label=crafts-artisan&status=published`)
    const json = await res.json()
    const data: { id: string | number }[] = json.data ?? json
    return data.map((p) => ({ id: String(p.id) }))
  } catch {
    return []
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <CultureDetailClient
      id={id}
      label="crafts-artisan"
      backHref="/culture/art-wonders"
      backLabel="Art Wonders"
      categoryLabel="Master Artisan"
      highlightsLabel="Products & Works"
      storyLabel="About the Artisan"
    />
  )
}
