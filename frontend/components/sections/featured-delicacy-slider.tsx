"use client"

import { UtensilsCrossed, Store, Coffee } from "lucide-react"
import { asset, resolveMediaUrl } from "@/lib/utils"
import { FeaturedSlider, type SlideConfig } from "@/components/sections/featured-slider"
import type { CMSPost } from "@/lib/data/admin-data"

const delicacySlides: SlideConfig[] = [
  {
    label: "local-cuisine",
    fallbackTitle: "Local Cuisine",
    fallbackDescription: "Savor Bocaue's finest — heritage recipes passed down for generations.",
    fallbackImage: asset("/images/defaults/no-image.svg"),
    href: "/culture/local-cuisine",
    categoryLabel: "Local Cuisine",
    ctaLabel: "Explore Cuisine",
    Icon: UtensilsCrossed,
    dot: "bg-orange-400",
  },
  {
    label: "restaurants",
    fallbackTitle: "Restaurants & Eateries",
    fallbackDescription: "From beloved carinderias to cozy cafés — the best places to eat in Bocaue.",
    fallbackImage: asset("/images/defaults/no-image.svg"),
    href: "/culture/restaurants",
    categoryLabel: "Restaurants",
    ctaLabel: "See Restaurants",
    Icon: Store,
    dot: "bg-red-400",
  },
]

function mapDelicacyPost(post: CMSPost) {
  const img = post.image?.[0] ?? ""
  const rawDesc = post.body ?? ""
  const shortDesc = rawDesc.length > 150 ? rawDesc.slice(0, 150).trimEnd() + "\u2026" : rawDesc
  return {
    id: post.id,
    title: post.title,
    description: shortDesc,
    image: resolveMediaUrl(img || null),
    location: post.location ?? undefined,
    bestTime: post.hours ?? undefined,
  }
}

export function FeaturedDelicacySlider() {
  return (
    <FeaturedSlider
      headerIcon={UtensilsCrossed}
      headerLabel="Featured Delicacies"
      headerTitle="Taste of Bocaue"
      headerDescription="From signature dishes to beloved restaurants — explore Bocaue's culinary scene."
      slides={delicacySlides}
      mapPost={mapDelicacyPost}
    />
  )
}
