import type { Metadata } from "next"
import { attractions, categoryLabels } from "@/lib/data/places-data"
import PlaceDetailsPage from "./place-details-client"

export function generateStaticParams() {
  return attractions.map((place) => ({
    id: place.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const place = attractions.find((p) => p.id === id)
  if (!place) {
    return { title: "Place Not Found" }
  }
  return {
    title: place.title,
    description: place.description,
    openGraph: {
      title: `${place.title} | MHACTO Bocaue`,
      description: place.description,
      images: place.image ? [{ url: place.image }] : undefined,
    },
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const place = attractions.find((p) => p.id === id)
  return <PlaceDetailsPage place={place} />
}
