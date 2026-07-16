import type { MetadataRoute } from 'next'
import posts from '@/data/news-index.json'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redstonelake.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/news', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/events', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/lake-health', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/lake-map', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/membership', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/newsletters', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/water-quality', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/board-members', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/business-directory', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/agm', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/governance', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/galleries', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/new-cottager-guide', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/healthy-shoreline', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/septic-systems', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/get-the-lead-out', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/municipal-bylaws', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/initiatives', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/contests', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/private-buoys', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/water-quality-program', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/photo-contest', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/volunteers', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/contribute', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ]

  return [
    ...staticRoutes.map(r => ({
      url: `${SITE_URL}${r.path}`,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...posts.map(p => ({
      url: `${SITE_URL}/news/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
