export default function PlaceDetailLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header skeleton */}
      <section className="border-b border-border bg-card mt-14 pt-8 pb-8 sm:mt-16 sm:pt-12 sm:pb-10 md:mt-20 md:pt-14 lg:mt-28 lg:pt-18 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="h-4 w-40 animate-pulse rounded bg-muted mb-6" />
          <div className="flex flex-col items-center gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-72 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-72 md:h-[28rem] w-full animate-pulse rounded-xl bg-muted" />
              <div className="space-y-3">
                <div className="h-7 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
