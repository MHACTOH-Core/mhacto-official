import { Users2 } from "lucide-react"
import { asset } from "@/lib/utils"

export default function BocauenosPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative mt-12 sm:mt-8 md:mt-12 lg:mt-20 min-h-[280px] flex items-end overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.45)), url(${asset('/images/places/oldtownbocaue.jpg')})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="px-6 pb-10 pt-20 lg:px-16">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
            Community
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Bocauenos
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
            Celebrating the people of Bocaue — the individuals, families, and
            communities that make this town truly remarkable.
          </p>
        </div>
      </section>

      {/* Placeholder content */}
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
          <Users2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Meet the People of Bocaue
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          This section is coming soon. We are gathering stories, profiles, and
          features on the notable and everyday Bocauenos who define the heart and
          soul of our municipality.
        </p>
      </section>
    </main>
  )
}
