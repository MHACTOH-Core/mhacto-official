"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Users2 } from "lucide-react"
import { asset } from "@/lib/utils"
import { apiFetchByLabel, type CMSPost } from "@/lib/api"

export default function BocauenosPage() {
  const [people, setPeople] = useState<CMSPost[]>([])

  // Sends GET /api/posts/read.php?label=bocauenos&status=published → PHP runs SQL SELECT → returns JSON
  useEffect(() => {
    apiFetchByLabel("bocauenos")
      .then((posts) => {
        if (posts && posts.length > 0) {
          setPeople(posts)
        }
      })
      .catch(() => {})
  }, [])

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

      {/* Content — show CMS people or placeholder */}
      {people.length > 0 ? (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-16">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground sm:text-3xl">Meet the People of Bocaue</h2>
                <p className="text-muted-foreground">Notable Bocauenos and community stories</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((person) => {
                const img = person.image?.[0]
                const imageUrl = img
                  ? (img.startsWith("/images") ? asset(img) : img)
                  : null
                return (
                  <div key={person.id} className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/30 transition-all overflow-hidden">
                    {imageUrl && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image src={imageUrl} alt={person.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-black text-foreground mb-1">{person.title}</h3>
                      {person.location && <p className="text-xs text-muted-foreground mb-2">{person.location}</p>}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{person.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : (
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
      )}
    </main>
  )
}
