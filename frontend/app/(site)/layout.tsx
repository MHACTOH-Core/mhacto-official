import type { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: {
    template: "%s | MHACTO Bocaue",
    default: "MHACTO Bocaue | History, Arts, Culture & Tourism",
  },
  description:
    "Discover the warmth and heritage of Bocaue, Bulacan. Plan your visit, explore attractions, and experience the festivity of one of the Philippines' most vibrant towns.",
  openGraph: {
    siteName: "MHACTO Bocaue",
    type: "website",
    locale: "en_PH",
  },
  robots: { index: true, follow: true },
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
