import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { asset } from "@/lib/utils"

export function TourismTaglineSection() {
  return (
    <section
      id="tagline"
      className="relative z-20 overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
    >
      {/* Decorative background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:gap-16 lg:text-left">

          {/* Logos row */}
          <div className="flex shrink-0 items-center gap-6 lg:flex-col lg:gap-4">
            <div className="flex flex-col items-center gap-1">
              <Image
                src={asset("/images/logos/MHACTO_LOGO.png")}
                alt="MHACTO Bocaue"
                width={180}
                height={60}
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="h-10 w-px bg-border lg:h-px lg:w-10" />
            <div className="flex flex-col items-center gap-1">
              <Image
                src={asset("/images/logos/Municipality_of_bocaue.png")}
                alt="Municipality of Bocaue"
                width={72}
                height={72}
                className="h-16 w-16 object-contain"
              />
              <span className="text-xs font-semibold text-muted-foreground">
                Municipality of Bocaue
              </span>
            </div>
          </div>

          {/* Divider (desktop) */}
          <div className="hidden lg:block h-40 w-px bg-border shrink-0" />

          {/* Tagline text */}
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-primary reveal-on-scroll">
              Official Tourism Portal
            </p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl reveal-on-scroll">
              Discover the{" "}
              <span className="text-primary">Heritage, Arts, Culture</span>
              <br className="hidden sm:block" /> &amp; Tourism of{" "}
              <span className="text-primary">Bocaue, Bulacan</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg reveal-on-scroll">
              Bocaue is a town where centuries-old traditions live on — from the
              thundering Pagoda sa Wawa to the world-record Philippine Arena, from
              hand-crafted pyrotechnics to the irresistible crunch of chicharon.
              Come experience it all.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 lg:justify-start reveal-on-scroll">
              <Button asChild size="lg" className="rounded-full gap-2">
                <Link href="/places">
                  Explore Bocaue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full gap-2"
              >
                <Link href="/tourism-office">Tourism Office</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-border pt-10 sm:grid-cols-4 reveal-on-scroll">
          {[
            { value: "235+", label: "Years of Pagoda Festival" },
            { value: "55,000", label: "Arena Seating Capacity" },
            { value: "400+", label: "Years of Town History" },
            { value: "1 of 1", label: "Fireworks Capital, PH" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
