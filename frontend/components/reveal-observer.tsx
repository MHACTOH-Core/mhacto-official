"use client"

import { useEffect } from "react"

/**
 * Global IntersectionObserver that automatically reveals ALL elements
 * with the `.reveal-on-scroll` CSS class when they enter the viewport.
 * Works for both server and client components — no per-element ref needed.
 *
 * Auto-injection: Also scans for common content patterns (section headings,
 * card grids, CTA blocks) and injects `.reveal-on-scroll` if not already
 * present, so every page gets scroll effects without manual annotation.
 *
 * Mount this once in the root layout.
 */
export function RevealObserver() {
  useEffect(() => {
    let intersectionObserver: IntersectionObserver | null = null
    let domMutationObserver: MutationObserver | null = null
    let mutationDebounceTimer: ReturnType<typeof setTimeout> | null = null

    // Delay setup so it doesn't mutate the DOM during React hydration
    const hydrationDelayTimer = setTimeout(() => {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed")
              intersectionObserver?.unobserve(entry.target)
            }
          }
        },
        { rootMargin: "-40px", threshold: 0.1 }
      )

      /**
       * Auto-inject reveal-on-scroll to content elements that are
       * below the fold and lack explicit reveal classes.
       */
      function autoInjectRevealClasses() {
        const viewportH = window.innerHeight

        // Target: section > div containers that hold page content
        document.querySelectorAll("main section > div, main > section").forEach((el) => {
          const htmlEl = el as HTMLElement
          // Skip if already has reveal classes, is above fold, or is inside admin
          if (
            htmlEl.classList.contains("reveal-on-scroll") ||
            htmlEl.classList.contains("revealed") ||
            htmlEl.closest("[data-no-reveal]") ||
            htmlEl.closest(".flex.h-screen") // admin layout
          ) return

          const rect = htmlEl.getBoundingClientRect()
          // Only auto-inject for elements below the fold (not initially visible)
          if (rect.top > viewportH * 0.85) {
            htmlEl.classList.add("reveal-on-scroll")
          }
        })

        // Target: card grids — add staggered reveals to direct children
        document.querySelectorAll("main .grid").forEach((grid) => {
          const gridEl = grid as HTMLElement
          if (gridEl.closest("[data-no-reveal]") || gridEl.closest(".flex.h-screen")) return

          const rect = gridEl.getBoundingClientRect()
          if (rect.top <= viewportH * 0.85) return

          Array.from(gridEl.children).forEach((child, i) => {
            const childEl = child as HTMLElement
            if (
              childEl.classList.contains("reveal-on-scroll") ||
              childEl.classList.contains("revealed")
            ) return
            childEl.classList.add("reveal-on-scroll")
            if (i < 6) childEl.classList.add(`reveal-delay-${i + 1}`)
          })
        })
      }

      /** Scan the DOM for unrevealed elements and start observing them */
      function observeUnrevealedElements() {
        autoInjectRevealClasses()
        document.querySelectorAll(".reveal-on-scroll:not(.revealed)").forEach((element) => {
          intersectionObserver?.observe(element)
        })
      }

      observeUnrevealedElements()

      // Watch for elements added by client-side navigation / dynamic rendering.
      // Debounced to avoid thrashing on rapid DOM changes.
      domMutationObserver = new MutationObserver(() => {
        if (mutationDebounceTimer) clearTimeout(mutationDebounceTimer)
        mutationDebounceTimer = setTimeout(observeUnrevealedElements, 100)
      })
      domMutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        // Explicitly disabled — we only care about added/removed nodes
        attributes: false,
        characterData: false,
      })
    }, 100)

    return () => {
      clearTimeout(hydrationDelayTimer)
      if (mutationDebounceTimer) clearTimeout(mutationDebounceTimer)
      intersectionObserver?.disconnect()
      domMutationObserver?.disconnect()
    }
  }, [])

  return null
}
