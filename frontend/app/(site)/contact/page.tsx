import Link from "next/link"
import { asset } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import { LocationSection } from "@/components/sections/location-section"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[300px] sm:min-h-[360px] overflow-hidden flex items-end"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${asset('/images/places/oldtownbocaue.jpg')})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 lg:px-8 flex flex-col justify-end py-12 sm:py-16 md:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
          <div className="space-y-3 max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-widest text-cyan-300">Get in Touch</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
              Contact Us
            </h1>
            <p className="text-lg text-white/90 drop-shadow-lg leading-relaxed max-w-2xl">
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
