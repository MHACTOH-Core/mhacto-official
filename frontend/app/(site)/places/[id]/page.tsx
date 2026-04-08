import PlaceDetailsPage from "./place-details-client"
import { API_BASE } from "@/lib/api"

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/read.php?type=places`)
    const json = await res.json()
    const data: { id: string | number }[] = json.data ?? json
    return data.map((p) => ({ id: String(p.id) }))
  } catch {
    return []
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PlaceDetailsPage placeId={id} />
}
