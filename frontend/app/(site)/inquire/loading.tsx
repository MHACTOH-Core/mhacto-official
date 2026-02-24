export default function InquireLoading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card mt-14 pt-8 pb-8 sm:mt-16 sm:pt-12 sm:pb-10 md:mt-20 md:pt-14 lg:mt-28 lg:pt-18 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="h-4 w-32 animate-pulse rounded bg-muted mb-6" />
          <div className="flex flex-col items-center gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </section>
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </section>
    </main>
  )
}
