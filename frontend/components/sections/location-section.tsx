import { MapPin, Clock, Phone } from "lucide-react"

export function LocationSection() {
  return (
    <section className="bg-card py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Info cards */}
          <div className="flex flex-col gap-6 animate-fade-in-up">
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Address</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Municipal Hall, Bocaue, Bulacan, Philippines 3018
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Office Hours</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Monday - Friday: 8:00 AM - 5:00 PM
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Contact</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  tourism@bocaue.gov.ph<br />(044) 123-4567
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 animate-fade-in-up delay-200">
            <div className="h-full min-h-[300px] sm:min-h-[400px] overflow-hidden rounded-xl border border-border shadow-sm">
              <iframe
                title="Bocaue, Bulacan Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30854.02614089981!2d120.91579!3d14.8022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396530e28b4d8f1%3A0x3e07c26d81c3e4a6!2sBocaue%2C%20Bulacan!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 300 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
