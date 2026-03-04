import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' is only applied during `next build` (production).
  // In dev mode it causes the server to exit immediately on Linux.
  ...(isDev ? {} : { output: 'export' }),
  basePath: '/MHACTO-PROJECT',
  images: {
    unoptimized: true,
    // Note: unoptimized is required for static export (GitHub Pages).
    // For production with a Node server, remove output:'export' and this flag
    // to enable automatic WebP/AVIF conversion and responsive sizing.
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
