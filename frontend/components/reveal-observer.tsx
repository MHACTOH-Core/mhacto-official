"use client"

import { useEffect } from "react"

/**
 * Global IntersectionObserver that automatically reveals ALL elements
 * with the `.reveal-on-scroll` CSS class when they enter the viewport.
 * Works for both server and client components — no per-element ref needed.
 *
 * Mount this once in the root layout.
 *
 * Performance note: The MutationObserver only watches for added/removed child
 * nodes (not attribute or text changes) to minimise overhead. A debounce timer
 * batches rapid DOM mutations into a single `observeAll` sweep.
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

      /** Scan the DOM for unrevealed elements and start observing them */
      function observeUnrevealedElements() {
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
