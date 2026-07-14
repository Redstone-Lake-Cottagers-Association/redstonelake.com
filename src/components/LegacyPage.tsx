import { notFound } from 'next/navigation'
import pages from '@/data/site-pages.json'

/* Renders a page migrated from the legacy WordPress site by its slug. */
export function getLegacyPage(slug: string) {
  return pages.find(p => p.slug === slug)
}

export function legacyMetadata(slug: string, description?: string) {
  const page = getLegacyPage(slug)
  if (!page) return {}
  return {
    title: `${page.title.replace(/&#\d+;|&[a-z]+;/g, '')} | Redstone Area Lakes Association`,
    ...(description ? { description } : {}),
  }
}

export default function LegacyPage({ slug, intro }: { slug: string; intro?: string }) {
  const page = getLegacyPage(slug)
  if (!page) notFound()

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-5">
            <h1 className="display-4" dangerouslySetInnerHTML={{ __html: page.title }} />
            {intro && <p className="lead text-muted mt-3">{intro}</p>}
          </div>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </div>
    </div>
  )
}
