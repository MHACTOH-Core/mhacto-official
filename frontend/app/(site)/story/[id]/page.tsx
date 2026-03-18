import StoryDetailClient from "./story-detail-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/home/milestones.php`)
    const data: { milestoneId: string | number }[] = await res.json()
    return data.map((m) => ({ id: String(m.milestoneId) }))
  } catch {
    return []
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <StoryDetailClient id={Number(id)} />
}
