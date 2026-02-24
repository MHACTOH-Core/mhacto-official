import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LocationSection } from "@/components/sections/location-section"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* Page header */}
      <section className="border-b border-border bg-card mt-14 pt-8 pb-8 sm:mt-16 sm:pt-12 sm:pb-10 md:mt-20 md:pt-14 lg:mt-28 lg:pt-18 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-6 gap-1 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <div className="text-center animate-fade-in-up">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Get in Touch
            </span>
            <h1 className="mt-2 text-3xl font-bold text-card-foreground md:text-4xl lg:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Reach out to MHACTO for inquiries about tourism, events, and cultural activities in Bocaue.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <LocationSection />
    </main>
  )
}
