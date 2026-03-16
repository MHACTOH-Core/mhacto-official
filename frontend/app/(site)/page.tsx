import dynamic from "next/dynamic"
import { HeroSection } from "@/components/sections/hero-section"
import { TourismTaglineSection } from "@/components/sections/tourism-tagline-section"
import { FeaturedSpotlight } from "@/components/sections/featured-spotlight"
import { ArtsCultureSliderSection } from "@/components/sections/arts-culture-slider-section"

// Lazy-load below-the-fold sections to reduce initial bundle size
const DestinationsCarouselSection = dynamic(
  () => import("@/components/sections/destinations-carousel-section").then((m) => m.DestinationsCarouselSection),
  { loading: () => <SectionSkeleton /> }
)
const CulinarySection = dynamic(
  () => import("@/components/sections/culinary-section").then((m) => m.CulinarySection),
  { loading: () => <SectionSkeleton /> }
)
const CulturalPracticesSection = dynamic(
  () => import("@/components/sections/cultural-practices-section").then((m) => m.CulturalPracticesSection),
  { loading: () => <SectionSkeleton /> }
)
const HistoryArtSection = dynamic(
  () => import("@/components/sections/history-art-section").then((m) => m.HistoryArtSection),
  { loading: () => <SectionSkeleton /> }
)
const FeaturedPeopleWonders = dynamic(
  () => import("@/components/sections/featured-people-wonders").then((m) => m.FeaturedPeopleWonders),
  { loading: () => <SectionSkeleton /> }
)
const CraftsSection = dynamic(
  () => import("@/components/sections/crafts-section").then((m) => m.CraftsSection),
  { loading: () => <SectionSkeleton /> }
)
const NewsSection = dynamic(
  () => import("@/components/sections/news-section").then((m) => m.NewsSection),
  { loading: () => <SectionSkeleton /> }
)
const TravelToursSection = dynamic(
  () => import("@/components/sections/travel-tours-section").then((m) => m.RestaurantsSection),
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
      {/* 1. Hero — single topic, no auto-shuffle */}
      <HeroSection />

      {/* 2. Tourism Tagline & Stats */}
      <TourismTaglineSection />

      {/* 3. Featured Spotlight */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <FeaturedSpotlight />
      </section>

      {/* 4. Arts & Culture Slider */}
      <ArtsCultureSliderSection />

      {/* 5. Tourist Wonders Carousel (destinations) */}
      <DestinationsCarouselSection />

      {/* 5b. Travel & Tours */}
      <TravelToursSection />

      {/* 6. Culinary Wonders */}
      <CulinarySection />

      {/* 7. Cultural Practices */}
      <CulturalPracticesSection />

      {/* 8. History Milestones */}
      <HistoryArtSection />

      {/* 9. People Wonders */}
      <FeaturedPeopleWonders />

      {/* 10. Crafts & Artisan */}
      <CraftsSection />

      {/* 11. Featured News & Stories */}
      <NewsSection />
    </main>
  )
}
