export default function NewsDetailLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="h-[40vh] sm:h-[50vh] w-full mt-14 sm:mt-16 md:mt-20 lg:mt-28 animate-pulse bg-muted" />

      {/* Content skeleton */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="h-4 w-32 animate-pulse rounded bg-muted mb-8" />
          <div className="space-y-4">
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-4/6 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </section>
    </main>
  )
}
