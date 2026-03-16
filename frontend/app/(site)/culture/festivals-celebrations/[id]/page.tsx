import CultureDetailClient from "@/components/sections/culture-detail-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/read.php?label=festivals&status=published`)
    const data: { id: string | number }[] = await res.json()
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
      label="festivals"
      backHref="/culture/festivals-celebrations"
      backLabel="Festivals & Celebrations"
      categoryLabel="Festival"
      highlightsLabel="Festival Highlights"
      storyLabel="History & Background"
    />
  )
}
