"use client"

import {
  UtensilsCrossed, Calendar, Sparkles, Hammer, Crown,
} from "lucide-react"
import { asset } from "@/lib/utils"
import { resolveMediaUrl } from "@/lib/utils"
import { FeaturedSlider, type SlideConfig } from "@/components/sections/featured-slider"
import type { CMSPost } from "@/lib/data/admin-data"

const artsCultureSlides: SlideConfig[] = [
  {
    label: "local-cuisine",
    fallbackTitle: "Local Cuisine",
    fallbackDescription: "Signature flavors of Bocaue — from heritage recipes to beloved street food classics.",
    fallbackImage: asset("/images/defaults/no-image.svg"),
    href: "/culture/local-cuisine",
    categoryLabel: "Local Cuisine",
    ctaLabel: "Explore Local Cuisine",
    Icon: UtensilsCrossed,
    dot: "bg-orange-400",
  },
  {
    label: "festivals",
    fallbackTitle: "Festivals",
    fallbackDescription: "Celebrate Bocaue's vibrant fiestas and cultural celebrations.",
    fallbackImage: asset("/images/defaults/no-image.svg"),
    href: "/culture/festivals-celebrations",
    categoryLabel: "Festivals",
    ctaLabel: "View Festivals",
    Icon: Calendar,
    dot: "bg-purple-400",
  },
  {
    label: "cultural-practices",
    fallbackTitle: "Cultural Practices",
    fallbackDescription: "Living traditions that define Bocaue's cultural identity.",
    fallbackImage: asset("/images/defaults/no-image.svg"),
    href: "/culture/practices-traditions",
    categoryLabel: "Cultural Practices",
    ctaLabel: "Explore Practices",
    Icon: Sparkles,
    dot: "bg-teal-400",
  },
  {
    label: "crafts-artisan",
    fallbackTitle: "Crafts & Artisan",
    fallbackDescription: "Master craftspeople preserving traditional skills in Bocaue.",
    fallbackImage: asset("/images/defaults/no-image.svg"),
    href: "/culture/crafts-artisan",
    categoryLabel: "Crafts & Artisan",
    ctaLabel: "Meet Our Artisans",
    Icon: Hammer,
    dot: "bg-amber-400",
  },
  {
    label: "people-wonders",
    fallbackTitle: "People Wonders",
    fallbackDescription: "Remarkable Bocaueños who carry the town's spirit to the national stage.",
    fallbackImage: asset("/images/defaults/no-image.svg"),
    href: "/culture/people-wonders",
    categoryLabel: "People Wonders",
    ctaLabel: "Meet Our Wonders",
    Icon: Crown,
    dot: "bg-rose-400",
  },
]

function mapArtsCulturePost(post: CMSPost) {
  const img = post.image?.[0] ?? ""
  // Use only the short description (body), never the story
  const rawDesc = post.body ?? ""
  const shortDesc = rawDesc.length > 150 ? rawDesc.slice(0, 150).trimEnd() + "…" : rawDesc
  return {
    id: post.id,
    title: post.title,
    description: shortDesc,
    image: resolveMediaUrl(img || null),
    location: post.location ?? undefined,
    bestTime: post.hours ?? undefined,
  }
}

export function ArtsCultureSliderSection() {
  return (
    <FeaturedSlider
      headerIcon={Sparkles}
      headerLabel="Arts & Culture"
      headerTitle="The Living Culture of Bocaue"
      headerDescription="From celebrated cuisine to living artisans — explore five facets of Bocaue's cultural identity."
      slides={artsCultureSlides}
      mapPost={mapArtsCulturePost}
    />
  )
}
