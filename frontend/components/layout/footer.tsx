"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram } from "lucide-react"
import { asset, resolveMediaUrl } from "@/lib/utils"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

export function Footer() {
  const siteSettings = useSiteSettings()
  const [facebookUrl, setFacebookUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")

  useEffect(() => {
    if (siteSettings.facebookUrl) setFacebookUrl(siteSettings.facebookUrl)
    if (siteSettings.instagramUrl) setInstagramUrl(siteSettings.instagramUrl)
  }, [siteSettings])
  return (
    <footer className="relative border-t border-border bg-white shadow-[0_-8px_40px_0_rgba(0,0,0,0.15)] text-foreground overflow-hidden">

      <div className="relative z-[1] mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={resolveMediaUrl("/uploads/images/logos/MHACTO_LOGO.png")}
                alt="MHACTO Logo"
                width={160}
                height={40}
                sizes="160px"
                className="h-10 w-auto object-contain"
              />
              <div className="w-px h-8 bg-blue-200" />
              <Image
                src={resolveMediaUrl("/uploads/images/logos/bocaue-logo.png")}
                alt="Municipality of Bocaue Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain flex-shrink-0"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              The Municipal History, Arts, Culture, and Tourism Office (MHACTO) of Bocaue, Bulacan
              — your gateway to the heritage, stories, culture, and breathtaking wonders of the
              RiverTown. Discover Bocaue&rsquo;s proud past and vibrant present.
            </p>
          </div>

          {/* Quick Links — 2 columns */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 border-b border-blue-200/50 pb-2">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Bocaue Wonders", href: "/bocaue-wonders" },
                { label: "Community", href: "/community" },
                { label: "News", href: "/news" },
                { label: "Events", href: "/events" },
                { label: "Tourism Office", href: "/tourism-office" },
                { label: "Inquiry", href: "/inquire" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-slate-500 hover:text-blue-700 transition-colors hover:translate-x-0.5 transform duration-150 flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary/50 group-hover:bg-primary transition-colors flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Follow Us */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 border-b border-blue-200/50 pb-2">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-400 transition-all hover:bg-primary hover:border-primary hover:text-white hover:scale-105"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-400 transition-all hover:bg-primary hover:border-primary hover:text-white hover:scale-105"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {!facebookUrl && !instagramUrl && (
                <p className="text-sm text-slate-500">Coming soon</p>
              )}
            </div>

            {/* Partner logos */}
            <p className="text-[11px] text-slate-400 mt-1">In partnership with STI College Balagtas</p>
            <div className="inline-flex items-center gap-3 p-3 rounded-lg">
              <Image
                src={resolveMediaUrl("/uploads/images/logos/bocaue-logo.png")}
                alt="Municipality of Bocaue Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain flex-shrink-0"
              />
              <div className="w-px h-7 bg-blue-200 flex-shrink-0" />
              <Image
                src={resolveMediaUrl("/uploads/images/logos/sti-logo.jpg")}
                alt="STI College Balagtas Logo"
                width={72}
                height={48}
                className="h-12 w-auto object-contain rounded flex-shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-blue-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} MHACTO Bocaue. All rights reserved.</p>

          {/* ════════════════════════════════════════════════════════════════════
              STI COLLEGE BALAGTAS PARTNERSHIP & DEVELOPER CREDITS
              ════════════════════════════════════════════════════════════════════
              DO NOT REMOVE, HIDE, OR MODIFY THIS SECTION.
              This is a permanent, non-removable partnership acknowledgment.
              Removing this section violates the partnership agreement.
              ════════════════════════════════════════════════════════════════════ */}
          <Link
            href="/developers"
            className="text-xs text-slate-500 underline underline-offset-2 hover:text-blue-600 transition-colors"
          >
            Meet the Dev Team →
          </Link>
          {/* ═══════ END STI PARTNERSHIP & CREDITS — DO NOT REMOVE ═══════ */}
        </div>
      </div>
    </footer>
  )
}