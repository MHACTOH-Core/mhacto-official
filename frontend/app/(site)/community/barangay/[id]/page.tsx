import CultureDetailClient from "@/components/sections/culture-detail-client"
import { barangays } from "@/lib/data/community-data"
import { API_BASE } from "@/lib/api"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const staticIds: { id: string }[] = barangays.map((b) => ({ id: b.id }))
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts?label=barangay&status=published`)
    const json = await res.json()
    const data: { id: string | number }[] = json.data ?? json
    const seen = new Set(staticIds.map((s) => s.id))
    data.forEach((p) => { const sid = String(p.id); if (!seen.has(sid)) { seen.add(sid); staticIds.push({ id: sid }) } })
  } catch { /* backend unavailable */ }
  // Next.js 16 requires at least one entry for dynamic routes in output:export.
  // Return a placeholder when no data exists; the page component calls notFound() for it.
  return staticIds.length > 0 ? staticIds : [{ id: '__empty__' }]
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === '__empty__') notFound()
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
