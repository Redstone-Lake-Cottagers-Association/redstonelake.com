import Link from 'next/link'
import type { Metadata } from 'next'
import archived from '@/data/newsletters.json'

export const metadata: Metadata = {
  title: 'Newsletters | Redstone Area Lakes Association',
  description: 'Archive of our monthly newsletters. Become a member to get your copy directly in your inbox.',
}

// Re-check the Mailchimp archive feed every 6 hours so new issues appear automatically
export const revalidate = 21600

const FEED_URL = 'https://us14.campaign-archive.com/feed?u=abfff5b565ccb6c32026c05ab&id=754031d995'

interface Newsletter {
  label: string
  year: number
  url: string
  title?: string
  dateMs?: number
}

function normalizeUrl(url: string) {
  return url.split('?')[0].replace(/\/$/, '')
}

async function getFeedNewsletters(): Promise<Newsletter[]> {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate } })
    if (!res.ok) return []
    const xml = await res.text()
    const items: Newsletter[] = []
    for (const match of xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/g)) {
      const block = match[0]
      const url = match[1].trim()
      const pubDate = block.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]
      const title = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]?.trim()
      if (!url || !pubDate) continue
      const date = new Date(pubDate)
      if (isNaN(date.getTime())) continue
      items.push({
        label: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }),
        year: date.getFullYear(),
        url,
        title: title?.replace(/^RLCA\s*/i, '').replace(/^[-–:(\s]+/, '').trim() || undefined,
        dateMs: date.getTime(),
      })
    }
    return items
  } catch {
    // Feed unreachable: the static archive below still renders
    return []
  }
}

export default async function NewslettersPage() {
  const feed = await getFeedNewsletters()
  const known = new Set(archived.map(n => normalizeUrl(n.url)))
  const fresh = feed
    .filter(n => !known.has(normalizeUrl(n.url)))
    .sort((a, b) => (b.dateMs || 0) - (a.dateMs || 0))
  const newsletters: Newsletter[] = [...fresh, ...archived]
  const years = Array.from(new Set(newsletters.map(n => n.year))).sort((a, b) => b - a)

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Newsletters</h1>
        <p className="lead text-muted">
          Stay informed about what matters most in the area with our monthly newsletter.
        </p>
        <p>
          <strong>Become a member to get your copy directly in your email inbox.</strong>{' '}
          <Link href="/membership">Join today →</Link>
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {years.map(year => (
            <div key={year} className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <h4 className="mb-0 me-3 text-primary">{year}</h4>
                <div className="flex-grow-1" style={{ height: '1px', backgroundColor: '#e5e7eb' }}></div>
              </div>
              <div>
                {newsletters
                  .filter(n => n.year === year)
                  .map(n => (
                    <a
                      key={n.url + n.label}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-baseline gap-3 py-2 px-3 mb-1 rounded border text-decoration-none bg-white newsletter-row"
                    >
                      <span className="text-muted small text-nowrap" style={{ minWidth: '110px' }}>{n.label}</span>
                      <span className="fw-semibold">{n.title || 'Monthly Newsletter'}</span>
                    </a>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
