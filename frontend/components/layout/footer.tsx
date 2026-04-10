"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram } from "lucide-react"
import { asset, resolveMediaUrl } from "@/lib/utils"
import { apiFetchSettings } from "@/lib/api"

export function Footer() {
  const [facebookUrl, setFacebookUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")

  useEffect(() => {
    apiFetchSettings()
      .then((s) => {
        if (s?.facebookUrl) setFacebookUrl(s.facebookUrl)
        if (s?.instagramUrl) setInstagramUrl(s.instagramUrl)
      })
      .catch(() => {})
  }, [])
  return (
    <footer className="relative border-t border-border bg-white shadow-[0_-8px_40px_0_rgba(0,0,0,0.15)] text-foreground overflow-hidden">
      {/* Animated wave accent at top of footer */}
      <style>{`
        @keyframes footerWave1 { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes footerWave2 { 0% { transform: translateX(-50%) } 100% { transform: translateX(0) } }
      `}</style>
      <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden pointer-events-none" aria-hidden>
        <svg
          className="absolute top-0 h-[3px]"
          style={{ width: '200%', animation: 'footerWave1 10s linear infinite' }}
          viewBox="0 0 2880 6" preserveAspectRatio="none"
        >
          <path d="M0,3 C120,0 240,6 360,3 C480,0 600,6 720,3 C840,0 960,6 1080,3 C1200,0 1320,6 1440,3 C1560,0 1680,6 1800,3 C1920,0 2040,6 2160,3 C2280,0 2400,6 2520,3 C2640,0 2760,6 2880,3" fill="none" stroke="rgba(45,212,191,0.35)" strokeWidth="2" />
        </svg>
        <svg
          className="absolute top-0 h-[3px]"
          style={{ width: '200%', animation: 'footerWave2 7s linear infinite' }}
          viewBox="0 0 2880 6" preserveAspectRatio="none"
        >
          <path d="M0,3 C180,6 360,0 540,3 C720,6 900,0 1080,3 C1260,6 1440,0 1620,3 C1800,6 1980,0 2160,3 C2340,6 2520,0 2700,3 C2880,6 2880,0 2880,3" fill="none" stroke="rgba(45,212,191,0.2)" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center">
              <Image
                src={resolveMediaUrl("/uploads/images/logos/MHACTO_LOGO.png")}
                alt="MHACTO Bocaue Logo"
                width={160}
                height={40}
                sizes="160px"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Municipal History, Arts, Culture and Tourism Office of Bocaue,
              Bulacan. Promoting heritage, culture, and tourism for all.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">
              Quick Links
            </h4>
            <Link
              href="/#home"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/#attractions"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Attractions
            </Link>
            <Link
              href="/news"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              News &amp; Updates
            </Link>
            <Link
              href="/inquire"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Inquiry
            </Link>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Use
            </a>
            <Link
              href="/admin"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin Portal
            </Link>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {!facebookUrl && !instagramUrl && (
                <p className="text-sm text-muted-foreground">Coming soon</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          <p className="text-center">&copy; {new Date().getFullYear()} MHACTO Bocaue. All rights reserved.</p>
          <div className="mt-4 flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Left side - Bocaue */}
            <div className="flex items-center gap-3 text-center sm:text-left">
              <Image
                src={resolveMediaUrl("/uploads/images/logos/bocaue-logo.png")}
                alt="Bocaue Logo"
                width={56}
                height={56}
                className="h-14 w-14 object-contain flex-shrink-0"
              />
              <div>
                <p className="text-foreground font-medium">Municipality of Bocaue</p>
                <p className="text-xs">Municipal Government of Bocaue, Bulacan</p>
                <p className="text-xs">MHACTO — History, Arts, Culture & Tourism Office</p>
              </div>
            </div>
            
            {/* ════════════════════════════════════════════════════════════════════
                STI COLLEGE BALAGTAS PARTNERSHIP & DEVELOPER CREDITS
                ════════════════════════════════════════════════════════════════════
                DO NOT REMOVE, HIDE, OR MODIFY THIS SECTION.
                This is a permanent, non-removable partnership acknowledgment.
                Removing this section violates the partnership agreement.
                ════════════════════════════════════════════════════════════════════ */}
            {/* Right side - STI partnership */}
            <div className="flex items-center gap-4 text-center sm:text-right">
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1.5">In partnership with STI College Balagtas</p>
                <Link href="/developers" target="_blank" className="text-foreground font-semibold text-sm hover:text-primary transition-colors">
                  Developer Team
                </Link>
              </div>
              <Image
                src={resolveMediaUrl("/uploads/images/logos/sti-logo.jpg")}
                alt="STI College Balagtas Logo"
                width={120}
                height={90}
                className="h-[72px] w-[96px] object-contain rounded-lg flex-shrink-0"
              />
            </div>
            {/* ═══════ END STI PARTNERSHIP & CREDITS — DO NOT REMOVE ═══════ */}
          </div>
        </div>
      </div>
    </footer>
  )
}