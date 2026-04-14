import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' is only applied during production static builds.
  // In dev mode it causes the server to exit immediately on Linux.
  // Set STATIC_EXPORT=false to build without static export (e.g. when backend is unavailable).
  ...(!isDev && process.env.STATIC_EXPORT !== 'false' ? { output: 'export' } : {}),
  basePath: isDev ? '' : (process.env.NEXT_PUBLIC_BASE_PATH ?? '/mhacto'),
  images: {
    unoptimized: !isDev && process.env.STATIC_EXPORT !== 'false',
    // When STATIC_EXPORT=false (Node.js/Vercel deployment), images are automatically
    // converted to WebP/AVIF with responsive sizing.
    // Static export (GitHub Pages) requires unoptimized: true.
    // In dev and build, allow backend uploads via 127.0.0.1:8000
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Strip console.log in production (keep warnings/errors)
  compiler: {
    ...(!isDev ? { removeConsole: { exclude: ['error', 'warn'] } } : {}),
  },
  // Disable the X-Powered-By header (less overhead, better security)
  poweredByHeader: false,
  experimental: {
    // Tree-shake barrel-export packages to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
  },
  turbopack: {
    root: __dirname,
  },
  // Proxy backend uploads through Next.js in dev so images are same-origin
  // (required for canvas pixel access in the crop/enhance dialog).
  // Not added in production — static export doesn't support rewrites.
  // API requests are proxied by the catch-all Route Handler in app/api/[...path]/route.ts
  // (server-side Node fetch → PHP, more reliable than Turbopack's rewrite proxy).
  // Only the /uploads/* rewrite is still needed for serving uploaded images/videos.
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: '/uploads/:path*',
              destination: 'http://127.0.0.1:8000/uploads/:path*',
              basePath: false,
            },
          ]
        },
      }
    : {}),
}

export default nextConfig
