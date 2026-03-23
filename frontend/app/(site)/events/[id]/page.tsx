import EventDetailClient from "./event-detail-client"
import { API_BASE } from "@/lib/api"

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/read.php?type=events`)
    const data: { id: string | number }[] = await res.json()
    return data.map((p) => ({ id: String(p.id) }))
  } catch {
    return []
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EventDetailClient id={id} />
}
