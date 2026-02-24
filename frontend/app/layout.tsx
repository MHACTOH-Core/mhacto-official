import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'

import './globals.css'
import { RevealObserverWrapper } from '@/components/reveal-observer-wrapper'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
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
      <body className={`${poppins.variable} font-sans antialiased overflow-x-hidden`}>
        <RevealObserverWrapper />
        {children}
      </body>
    </html>
  )
}
