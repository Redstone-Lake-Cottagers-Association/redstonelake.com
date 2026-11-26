import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redstonelakes.ca'

export default function robots(): MetadataRoute.Robots {
  return {
    // /cdn-cgi/ is Cloudflare's own path. Its email-obfuscation links
    // (/cdn-cgi/l/email-protection) 404 when crawled, so keep crawlers out.
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/debug/', '/cdn-cgi/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
