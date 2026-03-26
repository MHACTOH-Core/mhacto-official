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
  // Strip console.log in production (keep warnings/errors)
  compiler: {
    ...(!isDev ? { removeConsole: { exclude: ['error', 'warn'] } } : {}),
  },
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
  // Disable the X-Powered-By header (less overhead, better security)
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  // Proxy backend uploads through Next.js in dev so images are same-origin
  // (required for canvas pixel access in the crop/enhance dialog).
  // Not added in production — static export doesn't support rewrites.
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: '/uploads/:path*',
              destination: 'http://localhost:8000/uploads/:path*',
              basePath: false,
            },
          ]
        },
      }
    : {}),
}

export default nextConfig
