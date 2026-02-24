import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram } from "lucide-react"
import { asset } from "@/lib/utils"

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center">
              <Image
                src={asset("/images/logos/MHACTO_LOGO.png")}
                alt="MHACTO Bocaue Logo"
                width={160}
                height={40}
                sizes="160px"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-card/70">
              Municipal History, Arts, Culture and Tourism Office of Bocaue,
              Bulacan. Promoting heritage, culture, and tourism for all.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-card/50">
              Quick Links
            </h4>
            <Link
              href="/#home"
              className="text-sm text-card/70 transition-colors hover:text-card"
            >
              Home
            </Link>
            <Link
              href="/#attractions"
              className="text-sm text-card/70 transition-colors hover:text-card"
            >
              Attractions
            </Link>
            <Link
              href="/news"
              className="text-sm text-card/70 transition-colors hover:text-card"
            >
              News &amp; Updates
            </Link>
            <Link
              href="/inquire"
              className="text-sm text-card/70 transition-colors hover:text-card"
            >
              Inquiry
            </Link>
            <a
              href="#"
              className="text-sm text-card/70 transition-colors hover:text-card"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-card/70 transition-colors hover:text-card"
            >
              Terms of Use
            </a>
            <Link
              href="/admin"
              className="text-sm text-card/70 transition-colors hover:text-card"
            >
              Admin Portal
            </Link>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-card/50">
              Follow Us
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-card/10 text-card/70 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-card/10 text-card/70 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-card/10 pt-6 text-sm text-card/50">
          <p className="text-center">&copy; {new Date().getFullYear()} MHACTO Bocaue. All rights reserved.</p>
          <div className="mt-4 flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Left side - Bocaue */}
            <div className="flex items-center gap-3 text-center sm:text-left">
              <Image
                src={asset("/images/logos/bocaue-logo.svg")}
                alt="Bocaue Logo"
                width={50}
                height={50}
                className="h-12 w-12 object-contain"
              />
              <div>
                <p className="text-card/70 font-medium">Municipality of Bocaue</p>
                <p className="text-xs">Municipal Government of Bocaue, Bulacan</p>
                <p className="text-xs">MHACTO — History, Arts, Culture & Tourism Office</p>
              </div>
            </div>
            
            {/* Right side - STI and developers */}
            <div className="flex items-center gap-3 text-center sm:text-right">
              <div className="text-right">
                <p className="text-card/70 font-medium">STI College Balagtas</p>
                <p className="text-xs">Developed by Flores, Vissnar, Borja & Chingcuangco</p>
              </div>
              <Image
                src={asset("/images/logos/sti-logo.svg")}
                alt="STI College Balagtas Logo"
                width={50}
                height={50}
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
