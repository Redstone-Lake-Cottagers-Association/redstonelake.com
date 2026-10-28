const fs = require('fs')
const path = require('path')

// 301s from old WordPress URLs (posts lived at the site root) to the new clean routes
const legacyRedirects = require('./src/data/redirects.json')

// Old WordPress uploads (/wp-content/uploads/YYYY/MM/file.pdf) and the even older
// site's /pdf/ folder now live under /documents/<section>/. Filenames are unique,
// so map every file we host back from its old locations.
function legacyDocumentRedirects() {
  const root = path.join(__dirname, 'public', 'documents')
  const redirects = []
  for (const section of fs.readdirSync(root)) {
    const dir = path.join(root, section)
    if (!fs.statSync(dir).isDirectory()) continue
    for (const file of fs.readdirSync(dir)) {
      const destination = `/documents/${section}/${file}`
      redirects.push(
        { source: `/wp-content/uploads/:year/:month/${file}`, destination, permanent: true },
        { source: `/pdf/${file}`, destination, permanent: true },
      )
    }
  }
  return redirects
}

// Leftover WordPress archive and plugin URLs that Google still crawls
const wordpressRedirects = [
  // RSS feeds: the site feed and per-post feeds. Per-post feeds go to the post's
  // old URL, which legacyRedirects then sends on to its /news page.
  { source: '/feed', destination: '/news', permanent: true },
  { source: '/comments/feed', destination: '/news', permanent: true },
  { source: '/directory/:slug/feed', destination: '/business-directory', permanent: true },
  { source: '/:slug/feed', destination: '/:slug', permanent: true },
  // Author, category and dated archives
  { source: '/author/:path*', destination: '/news', permanent: true },
  { source: '/category/rlca-contests/:path*', destination: '/contests', permanent: true },
  { source: '/category/special-events/:path*', destination: '/events', permanent: true },
  { source: '/category/:path*', destination: '/news', permanent: true },
  { source: '/:year(\\d{4})/:path*', destination: '/news', permanent: true },
  // Contest gallery plugin
  { source: '/contest-gallery/:path*', destination: '/contests', permanent: true },
  // Business directory plugin category pages
  { source: '/:category(real_estate|property_management|associations|marina|rentals)', destination: '/business-directory', permanent: true },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        // Google crawls Next's internal `?_rsc=` page-data URLs; without the RSC
        // request header (which Next's own router always sends) they return a
        // full HTML copy of the page, reported as a duplicate. Keep them out.
        source: '/:path*',
        has: [{ type: 'query', key: '_rsc' }],
        missing: [{ type: 'header', key: 'rsc' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ]
  },
  async redirects() {
    return [
      // One canonical host: www otherwise serves a duplicate of every page
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.redstonelake.com' }],
        destination: 'https://redstonelake.com/:path*',
        permanent: true,
      },
      ...legacyRedirects,
      ...legacyDocumentRedirects(),
      ...wordpressRedirects,
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
