import CultureDetailClient from "@/components/sections/culture-detail-client"
import { barangays } from "@/lib/data/community-data"
import { API_BASE } from "@/lib/api"

export async function generateStaticParams() {
  const staticIds = barangays.map((b) => ({ id: b.id }))
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts?label=barangay&status=published`)
    const json = await res.json()
    const data: { id: string | number }[] = json.data ?? json
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
      label="barangay"
      backHref="/community/barangay"
      backLabel="Barangays"
      categoryLabel="Barangay"
      storyLabel="About the Barangay"
      highlightsLabel="Key Features"
    />
  )
}
