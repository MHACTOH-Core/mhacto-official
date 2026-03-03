import Link from "next/link"
import { asset } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import { LocationSection } from "@/components/sections/location-section"
import { PageHero } from "@/components/sections/page-hero"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* Hero */}
      <PageHero
        pageSlug="contact"
        fallbackImage="/images/places/oldtownbocaue.jpg"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Get in Touch"
        fallbackTitle="Contact Us"
        fallbackDescription="Reach out to MHACTO for inquiries about tourism, events, and cultural activities in Bocaue."
        showBackButton
        alignBottom

      />

      {/* Contact Information */}
      <LocationSection />
    </main>
  )
}
