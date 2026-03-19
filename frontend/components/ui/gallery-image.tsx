"use client"

import { useState } from "react"
import Image from "next/image"

interface GalleryImageProps {
  src: string
  alt: string
  gallery?: string[]
  /** Tailwind classes for the outer flex-col wrapper (use for grid order/sizing) */
  outerClassName?: string
  /** Tailwind classes for the main image wrapper div */
  className?: string
  sizes?: string
  priority?: boolean
  imageClassName?: string
  /** Overlays rendered inside the main image div (gradients, badges, titles) */
  children?: React.ReactNode
}

/**
 * Reusable image block with optional thumbnail strip.
 * Pass `gallery` with 2+ items to show a clickable row of thumbnails
 * below the main image. Any children are layered on top of the image
 * (useful for gradients, badges, overlay text).
 */
export function GalleryImage({
  src,
  alt,
  gallery,
  outerClassName,
  className = "relative h-48",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  imageClassName = "object-cover transition-all duration-500",
  children,
}: GalleryImageProps) {
  const thumbs = gallery && gallery.length > 1 ? gallery : null
  const [selected, setSelected] = useState(src)

  return (
    <div className={`flex flex-col${outerClassName ? ` ${outerClassName}` : ""}`}>
      <div className={className}>
        <Image
          src={selected}
          alt={alt}
          fill
          sizes={sizes}
          className={imageClassName}
          priority={priority}
        />
        {children}
      </div>
      {thumbs && (
        <div className="flex gap-1.5 p-1.5 bg-muted/30 flex-shrink-0">
          {thumbs.map((img, i) => (
            <button
              key={img}
              onClick={(e) => { e.stopPropagation(); setSelected(img) }}
              className={`relative h-12 flex-1 overflow-hidden rounded border-2 transition-all duration-200 ${
                selected === img
                  ? "border-primary"
                  : "border-transparent opacity-55 hover:opacity-85"
              }`}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
