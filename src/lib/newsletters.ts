import archived from '@/data/newsletters.json'

export const NEWSLETTER_FEED_URL =
  'https://us14.campaign-archive.com/feed?u=abfff5b565ccb6c32026c05ab&id=754031d995'

export const NEWSLETTER_REVALIDATE = 21600 // re-check Mailchimp every 6 hours
export const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID || '754031d995'

export interface Newsletter {
  label: string
  year: number
  url: string
  title?: string
  dateMs?: number
  available?: boolean
  campaignId?: string
}

export function normalizeUrl(url: string) {
  return url.split('?')[0].replace(/\/$/, '')
}


function cleanTitle(raw?: string): string | undefined {
  if (!raw) return undefined
  const cleaned = raw
    .replace(/^RLCA\s*/i, '')          // org prefix
    .replace(/^\([^)]*\)\s*:?\s*/, '') // leading "(June/26):" style month tag (date shown separately)
    .replace(/^[-–:\s]+/, '')
    .trim()
  return cleaned || undefined
}

interface MailchimpCampaign {
  id?: string
  archive_url?: string
  long_archive_url?: string
  send_time?: string
  settings?: {
    subject_line?: string
    title?: string
  }
}

interface MailchimpCampaignResponse {
  campaigns?: MailchimpCampaign[]
}

interface TimedCache<T> {
  key: string
  expiresAt: number
  value: T
}

let apiCache: TimedCache<Newsletter[] | null> | null = null
let feedCache: TimedCache<Newsletter[]> | null = null

function cacheExpiry() {
  return Date.now() + NEWSLETTER_REVALIDATE * 1000
}

function apiConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim()
  if (!apiKey) return null

  const server = (process.env.MAILCHIMP_SERVER_PREFIX || apiKey.split('-').at(-1) || '').trim()
  if (!/^us\d+$/.test(server)) return null

  return { apiKey, server }
}

async function fetchApiNewsletters(config: NonNullable<ReturnType<typeof apiConfig>>): Promise<Newsletter[] | null> {
  try {
    const url = new URL(`https://${config.server}.api.mailchimp.com/3.0/campaigns`)
    url.searchParams.set('status', 'sent')
    url.searchParams.set('list_id', MAILCHIMP_LIST_ID)
    url.searchParams.set('count', '1000')
    url.searchParams.set('sort_field', 'send_time')
    url.searchParams.set('sort_dir', 'DESC')
    url.searchParams.set(
      'fields',
      'campaigns.id,campaigns.archive_url,campaigns.long_archive_url,campaigns.send_time,campaigns.settings.subject_line,campaigns.settings.title'
    )

    const authorization = Buffer.from(`redstone:${config.apiKey}`).toString('base64')
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Authorization: `Basic ${authorization}` },
    })
    if (!res.ok) {
      console.error(`Mailchimp campaign API failed: HTTP ${res.status}; using RSS fallback`)
      return null
    }

    const data = await res.json() as MailchimpCampaignResponse
    const newsletters = (data.campaigns || []).flatMap(campaign => {
      const archiveUrl = campaign.archive_url || campaign.long_archive_url
      const date = campaign.send_time ? new Date(campaign.send_time) : null
      if (!campaign.id || !archiveUrl || !date || isNaN(date.getTime())) return []

      return [{
        campaignId: campaign.id,
        label: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }),
        year: date.getFullYear(),
        url: archiveUrl,
        title: cleanTitle(campaign.settings?.subject_line || campaign.settings?.title),
        dateMs: date.getTime(),
      }]
    })

    return newsletters.sort((a, b) => (b.dateMs || 0) - (a.dateMs || 0))
  } catch (error) {
    console.error('Mailchimp campaign API failed; using RSS fallback:', error)
    return null
  }
}

export async function getApiNewsletters(): Promise<Newsletter[] | null> {
  const config = apiConfig()
  if (!config) return null

  const key = `${config.server}:${MAILCHIMP_LIST_ID}`
  if (apiCache?.key === key && apiCache.expiresAt > Date.now()) return apiCache.value

  const value = await fetchApiNewsletters(config)
  apiCache = { key, expiresAt: cacheExpiry(), value }
  return value
}

async function fetchFeedNewsletters(): Promise<Newsletter[]> {
  try {
    // The feed embeds ten complete email bodies and is currently over 2 MB,
    // larger than Next's fetch-cache limit. Cache the small parsed result instead.
    const res = await fetch(NEWSLETTER_FEED_URL, { cache: 'no-store' })
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
        title: cleanTitle(title),
        dateMs: date.getTime(),
      })
    }
    return items.sort((a, b) => (b.dateMs || 0) - (a.dateMs || 0))
  } catch {
    // Feed unreachable: callers fall back to the static archive
    return []
  }
}

export async function getFeedNewsletters(): Promise<Newsletter[]> {
  if (feedCache?.expiresAt && feedCache.expiresAt > Date.now()) return feedCache.value

  const value = await fetchFeedNewsletters()
  feedCache = { key: NEWSLETTER_FEED_URL, expiresAt: cacheExpiry(), value }
  return value
}

/** Prefer the complete campaign API. Without a working key, merge the ten-item
 * public RSS feed ahead of the legacy static archive and deduplicate by URL. */
export async function getAllNewsletters(): Promise<{ fresh: Newsletter[]; archived: Newsletter[] }> {
  const api = await getApiNewsletters()
  if (api && api.length > 0) return { fresh: api, archived: [] }

  const feed = await getFeedNewsletters()
  const archivedNewsletters = archived as Newsletter[]
  const feedByUrl = new Map(feed.map(newsletter => [normalizeUrl(newsletter.url), newsletter]))
  const known = new Set(archivedNewsletters.map(n => normalizeUrl(n.url)))
  const fresh = feed.filter(n => !known.has(normalizeUrl(n.url)))
  const enrichedArchive = archivedNewsletters.map(newsletter => {
    const feedMatch = feedByUrl.get(normalizeUrl(newsletter.url))
    return feedMatch
      ? { ...newsletter, title: newsletter.title || feedMatch.title, dateMs: feedMatch.dateMs }
      : newsletter
  })
  return { fresh, archived: enrichedArchive }
}

/** The most recent newsletters — for teasers. The campaign API is complete;
 *  the RSS feed is the no-key fallback, then the static archive is last. */
export async function getLatestNewsletters(count: number): Promise<Newsletter[]> {
  const api = await getApiNewsletters()
  if (api && api.length > 0) return api.slice(0, count)

  const feed = await getFeedNewsletters()
  if (feed.length > 0) return feed.slice(0, count)
  return (archived as Newsletter[]).filter(newsletter => newsletter.available !== false).slice(0, count)
}
