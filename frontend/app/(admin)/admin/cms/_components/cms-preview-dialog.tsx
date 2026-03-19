"use client"

import type { CMSPost, ContentStatus } from "@/lib/data/admin-data"
import { contentLabels } from "@/lib/data/admin-data"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Clock,
  Phone,
  CalendarDays,
  Tag,
  Sparkles,
  List,
  User,
} from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { UNKNOWN_LABEL } from "./cms-types"

const statusColor: Record<ContentStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300",
}

interface CMSPreviewDialogProps {
  post: CMSPost | null
  onClose: () => void
}

export function CMSPreviewDialog({ post, onClose }: CMSPreviewDialogProps) {
  return (
    <Dialog open={!!post} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {post && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={(contentLabels[post.label] ?? UNKNOWN_LABEL).color}>
                  {(contentLabels[post.label] ?? UNKNOWN_LABEL).label}
                </Badge>
                <Badge className={statusColor[post.status]}>
                  {post.status}
                </Badge>
              </div>
              <DialogTitle className="text-xl">
                {post.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {post.author && (
                  <span className="flex items-center gap-1 font-medium">
                    <User className="h-3 w-3" /> {post.author}
                  </span>
                )}
                {post.author && <span>·</span>}
                <span>{format(parseISO(post.createdAt), "MMMM d, yyyy · h:mm a")}</span>
              </div>
            </DialogHeader>
            {post.image.length > 0 && (
              <div className="relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveMediaUrl(post.image[0])}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <div className="whitespace-pre-wrap text-sm text-card-foreground leading-relaxed">
              {post.body}
            </div>

            {post.story && (
              <div className="space-y-1">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Story
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.story}</p>
              </div>
            )}

            {post.highlights && post.highlights.length > 0 && (
              <div className="space-y-1">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                  <List className="h-4 w-4" /> Highlights
                </h4>
                <ul className="list-disc pl-5 space-y-0.5 text-sm text-muted-foreground">
                  {post.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {(post.location || post.hours || post.contact || post.established || post.category) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  {post.established && (
                    <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                      <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Established</p>
                        <p className="text-sm font-medium text-card-foreground">{post.established}</p>
                      </div>
                    </div>
                  )}
                  {post.category && (
                    <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                      <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-medium text-card-foreground">{post.category}</p>
                      </div>
                    </div>
                  )}
                  {post.location && (
                    <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium text-card-foreground">{post.location}</p>
                      </div>
                    </div>
                  )}
                  {post.hours && (
                    <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Hours</p>
                        <p className="text-sm font-medium text-card-foreground">{post.hours}</p>
                      </div>
                    </div>
                  )}
                  {post.contact && (
                    <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        <p className="text-sm font-medium text-card-foreground">{post.contact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
