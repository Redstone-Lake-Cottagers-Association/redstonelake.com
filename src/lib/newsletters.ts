import archived from '@/data/newsletters.json'

export const NEWSLETTER_FEED_URL =
  'https://us14.campaign-archive.com/feed?u=abfff5b565ccb6c32026c05ab&id=754031d995'

export const NEWSLETTER_REVALIDATE = 21600 // re-check the Mailchimp feed every 6 hours

export interface Newsletter {
  label: string
  year: number
  url: string
  title?: string
  dateMs?: number
}

export function normalizeUrl(url: string) {
  return url.split('?')[0].replace(/\/$/, '')
}

export async function getFeedNewsletters(): Promise<Newsletter[]> {
  try {
    const res = await fetch(NEWSLETTER_FEED_URL, { next: { revalidate: NEWSLETTER_REVALIDATE } })
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
    return items.sort((a, b) => (b.dateMs || 0) - (a.dateMs || 0))
  } catch {
    // Feed unreachable: callers fall back to the static archive
    return []
  }
}

/** Feed items merged ahead of the static archive, deduped by URL. */
export async function getAllNewsletters(): Promise<{ fresh: Newsletter[]; archived: Newsletter[] }> {
  const feed = await getFeedNewsletters()
  const known = new Set(archived.map(n => normalizeUrl(n.url)))
  const fresh = feed.filter(n => !known.has(normalizeUrl(n.url)))
  return { fresh, archived }
}

/** The most recent newsletters — for teasers. The feed is date-sorted and
 *  includes every recent issue (monthlies + one-off eblasts); the static
 *  archive is only the fallback when the feed is unreachable. */
export async function getLatestNewsletters(count: number): Promise<Newsletter[]> {
  const feed = await getFeedNewsletters()
  if (feed.length > 0) return feed.slice(0, count)
  return archived.slice(0, count)
}
