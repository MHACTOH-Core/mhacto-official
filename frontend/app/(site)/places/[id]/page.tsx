import PlaceDetailsPage from "./place-details-client"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PlaceDetailsPage placeId={id} />
}
