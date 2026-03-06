import dynamic from "next/dynamic"
import { HeroSection } from "@/components/sections/hero-section"
import { TourismTaglineSection } from "@/components/sections/tourism-tagline-section"
import { FeaturedSpotlight } from "@/components/sections/featured-spotlight"
import { ArtsCultureSliderSection } from "@/components/sections/arts-culture-slider-section"

// Lazy-load below-the-fold sections to reduce initial bundle size
const CulinarySection = dynamic(
  () => import("@/components/sections/culinary-section").then((m) => m.CulinarySection),
  { loading: () => <SectionSkeleton /> }
)
const RestaurantsSection = dynamic(
  () => import("@/components/sections/restaurants-section").then((m) => m.RestaurantsSection),
  { loading: () => <SectionSkeleton /> }
)
const TravelToursSection = dynamic(
  () => import("@/components/sections/travel-tours-section").then((m) => m.TravelToursSection),
  { loading: () => <SectionSkeleton /> }
)
const HumanWondersSection = dynamic(
  () => import("@/components/sections/human-wonders-section").then((m) => m.HumanWondersSection),
  { loading: () => <SectionSkeleton /> }
)
const HistoryArtSection = dynamic(
  () => import("@/components/sections/history-art-section").then((m) => m.HistoryArtSection),
  { loading: () => <SectionSkeleton /> }
)
const PlacesCarousel = dynamic(
  () => import("@/components/sections/places-carousel").then((m) => m.PlacesCarousel),
  { loading: () => <SectionSkeleton /> }
)
const NewsSection = dynamic(
  () => import("@/components/sections/news-section").then((m) => m.NewsSection),
  { loading: () => <SectionSkeleton /> }
)

function SectionSkeleton() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          <div className="mt-8 grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main>
      {/* 1. Hero — Pagoda Festival as frontrunner */}
      <HeroSection />

      {/* 2. MHACTO Bocaue Tourism Tagline & Stats */}
      <TourismTaglineSection />

      {/* 3. Featured Spotlight — Pagoda Festival 2026 */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <FeaturedSpotlight />
      </section>

      {/* 4. Arts & Culture Slider */}
      <ArtsCultureSliderSection />

      {/* 5. Featured Culinary Delicacies */}
      <CulinarySection />

      {/* 6. Featured Restaurants & Eateries */}
      <RestaurantsSection />

      {/* 7. Travel & Tours */}
      <TravelToursSection />

      {/* 8. Places Carousel */}
      <PlacesCarousel />

      {/* 9. Featured People Wonders */}
      <HumanWondersSection />

      {/* 10. History & Art */}
      <HistoryArtSection />

      {/* 11. News */}
      <NewsSection />
    </main>
  )
}
