import Image from "next/image"
import { format } from "date-fns"
import { CalendarDays, MapPin, Megaphone } from "lucide-react"
import { featuredEvents } from "@/lib/data/places-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturedEventsPortrait() {
  return (
    <div className="lg:max-w-sm animate-fade-in-right delay-100">
      <Card className="border-border shadow-lg sticky top-32 overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Announcements</CardTitle>
              <p className="text-xs text-muted-foreground">Featured events</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {featuredEvents.slice(0, 3).map((event, i) => (
            <div
              key={event.id}
              className={`pb-4 border-b border-border last:border-b-0 last:pb-0 animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              {event.image && (
                <div className="relative h-32 w-full overflow-hidden rounded-lg mb-2">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 24rem"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              )}
              <h4 className="font-semibold text-sm text-foreground mb-1">
                {event.title}
              </h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {format(event.date, "MMM dd, yyyy")}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {event.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
