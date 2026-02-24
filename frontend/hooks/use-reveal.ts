"use client"

import { useEffect, useRef } from "react"

/**
 * Lightweight replacement for framer-motion's `whileInView`.
 * Returns a ref to attach to the element. When the element enters
 * the viewport it gets the `.revealed` CSS class (pair with `.reveal-on-scroll`).
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { rootMargin: "-60px", threshold: 0.1 }
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add("revealed")
        observer.unobserve(el)
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
