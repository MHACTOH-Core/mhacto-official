/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
}

export default nextConfig
