import CultureDetailClient from "@/components/sections/culture-detail-client"
import { API_BASE } from "@/lib/api"

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts?label=people-wonders&status=published`)
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
      label="people-wonders"
      backHref="/culture/people-wonders"
      backLabel="People Wonders"
      categoryLabel="People Wonder"
      highlightsLabel="Awards & Recognition"
      storyLabel="Achievement"
    />
  )
}
