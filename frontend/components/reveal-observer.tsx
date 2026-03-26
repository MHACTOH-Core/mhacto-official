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

    // Delay setup so it doesn't mutate the DOM during React hydration.
    // Use requestIdleCallback (or a generous setTimeout fallback) so we
    // only touch classNames *after* React has finished hydrating.
    const scheduleSetup = typeof requestIdleCallback === "function"
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 800)

    const hydrationDelayTimer = scheduleSetup(() => {
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

        /**
         * Helper: returns true if the element (or a parent) is already
         * animated by Framer Motion — indicated by a `style` attribute
         * that contains `transform` or `opacity`, which motion.div sets.
         */
        function isFramerManaged(el: HTMLElement): boolean {
          // Framer Motion sets data-projection-id on animated elements
          if (el.hasAttribute("data-projection-id")) return true
          // Walk up to check if a parent container is motion-managed
          const parent = el.parentElement
          if (parent && parent.hasAttribute("data-projection-id")) return true
          return false
        }

        // Target: section > div containers that hold page content
        document.querySelectorAll("main section > div, main > section").forEach((el) => {
          const htmlEl = el as HTMLElement
          // Skip if already has reveal classes, is above fold, is inside admin,
          // is managed by Framer Motion, or already contains children with
          // explicit reveal-on-scroll (avoids hydration mismatch when React
          // re-renders and the DOM has classes the JSX never set).
          if (
            htmlEl.classList.contains("reveal-on-scroll") ||
            htmlEl.classList.contains("revealed") ||
            htmlEl.closest("[data-no-reveal]") ||
            htmlEl.closest(".flex.h-screen") || // admin layout
            isFramerManaged(htmlEl) ||
            htmlEl.querySelector(".reveal-on-scroll")
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
          if (
            gridEl.closest("[data-no-reveal]") ||
            gridEl.closest(".flex.h-screen") ||
            isFramerManaged(gridEl)
          ) return

          const rect = gridEl.getBoundingClientRect()
          if (rect.top <= viewportH * 0.85) return

          Array.from(gridEl.children).forEach((child, i) => {
            const childEl = child as HTMLElement
            if (
              childEl.classList.contains("reveal-on-scroll") ||
              childEl.classList.contains("revealed") ||
              isFramerManaged(childEl)
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
        mutationDebounceTimer = setTimeout(observeUnrevealedElements, 200)
      })
      domMutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        // Explicitly disabled — we only care about added/removed nodes
        attributes: false,
        characterData: false,
      })
    })

    return () => {
      if (typeof cancelIdleCallback === "function" && typeof hydrationDelayTimer === "number") {
        cancelIdleCallback(hydrationDelayTimer)
      } else {
        clearTimeout(hydrationDelayTimer as ReturnType<typeof setTimeout>)
      }
      if (mutationDebounceTimer) clearTimeout(mutationDebounceTimer)
      intersectionObserver?.disconnect()
      domMutationObserver?.disconnect()
    }
  }, [])

  return null
}
