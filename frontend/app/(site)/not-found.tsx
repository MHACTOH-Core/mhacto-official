import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SiteNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <FileQuestion className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-lg font-medium text-muted-foreground mb-6">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Button asChild>
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    </div>
  )
}
