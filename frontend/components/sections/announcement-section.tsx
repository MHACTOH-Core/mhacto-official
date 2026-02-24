import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AnnouncementSection() {
  return (
    <section className="relative bg-primary/10 border-t border-b border-border py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-2 items-center">
          {/* Left content */}
          <div className="space-y-6 animate-fade-in-left">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                Plan Your Visit
              </span>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                Ready to Explore Bocaue?
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed sm:text-lg">
                Bocaue welcomes all visitors with open arms. Whether you&#39;re coming for leisure, pilgrimage, or business, we&#39;re here to make your visit memorable and hassle-free.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What to Expect
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Warm hospitality from our local community</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Rich cultural experiences and heritage sites</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Delicious traditional cuisine and local delicacies</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Professional assistance from MHACTO staff</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="rounded-full w-full sm:w-auto">
                <Link href="/inquire">Submit an Inquiry</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>

          {/* Right side - Call to Action Card */}
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-lg lg:sticky lg:top-32 animate-fade-in-right delay-100">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Need Assistance?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get help planning your perfect visit to Bocaue. Our team responds within 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase font-semibold text-primary mb-1">Email</p>
                  <a href="mailto:tourism@bocaue.gov.ph" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    tourism@bocaue.gov.ph
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-primary mb-1">Phone</p>
                  <a href="tel:+(044)1234567" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    (044) 123-4567
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-primary mb-1">Office Hours</p>
                  <p className="text-sm text-muted-foreground">Monday - Friday: 8:00 AM - 5:00 PM</p>
                </div>
              </div>

              <Button asChild className="w-full rounded-full">
                <Link href="/inquire">Book Your Visit Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
