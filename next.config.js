// 301s from old WordPress URLs (posts lived at the site root) to the new clean routes
const legacyRedirects = require('./src/data/redirects.json')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      ...legacyRedirects,
      { source: '/directory/:slug', destination: '/business-directory', permanent: true },
    ]
  },
  experimental: {
    outputFileTracingRoot: undefined,
  },
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for deployment
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
