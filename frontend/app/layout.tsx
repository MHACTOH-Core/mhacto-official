import type { Metadata, Viewport } from 'next'
import { Poppins, Inter } from 'next/font/google'

import './globals.css'
import { RevealObserverWrapper } from '@/components/reveal-observer-wrapper'
import { Toaster } from '@/components/ui/toaster'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MHACTO Bocaue | Municipal History, Arts, Culture & Tourism Office',
  description:
    'Discover the warmth and heritage of Bocaue, Bulacan. Plan your visit, explore attractions, and experience the festivity of one of the Philippines\' most vibrant towns.',
}

export const viewport: Viewport = {
  themeColor: '#1a9bb5',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to API backend to reduce latency on first fetch.
            Only rendered in production when NEXT_PUBLIC_API_URL is set;
            in dev the Next.js rewrite proxy is used instead. */}
        {process.env.NEXT_PUBLIC_API_URL ? (
          <>
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} crossOrigin="anonymous" />
          </>
        ) : null}
      </head>
      <body className={`${poppins.variable} ${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <RevealObserverWrapper />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
