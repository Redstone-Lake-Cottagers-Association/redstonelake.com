import seedEvents from '@/data/events.json'

// Events are sourced from the shared Google Sheet (the same Apps Script webhook
// the membership/event forms POST to — see docs/MEMBERSHIP-FORM.txt). Its doGet
// returns rows whose Status column is "Approved", public fields only.
// Production reads the "Event submissions" tab; dev reads "Test event
// submissions" (?test=1). Responses are cached for 5 minutes, so flipping a
// row to Approved publishes it within ~5 min.
//
// src/data/events.json is ONLY an emergency fallback (Google unreachable /
// webhook misconfigured) so the site never renders a broken events section.

export interface LakeEvent {
  id: number
  title: string
  date: string // human-readable, e.g. "July 4, 2026" — parsed with new Date()
  time: string // e.g. "1:30 pm"; "" = unspecified/all-day; "Not yet announced" is fine
  location: string // venue text; "" = unspecified; "Not yet announced" is fine
  day: string // derived from date, e.g. "04"
  month: string // derived from date, e.g. "JUL"
  type: string
  icon: string
  color: string
  description: string
  details: string
}

const DEFAULT_ICON = '📅'
const DEFAULT_COLOR = '#0369a1' // --lake-blue
const REVALIDATE_SECONDS = 300

function derive(rows: Array<Record<string, unknown>>): LakeEvent[] {
  return rows
    .filter(e => String(e.title ?? '').trim() && String(e.date ?? '').trim())
    .map((e, i) => {
      const date = String(e.date ?? '')
      const d = new Date(date)
      const valid = !isNaN(d.getTime())
      return {
        id: i + 1,
        title: String(e.title ?? ''),
        date,
        time: String(e.time ?? ''),
        location: String(e.location ?? ''),
        day: valid ? String(d.getDate()).padStart(2, '0') : '??',
        month: valid ? d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '???',
        type: String(e.type ?? '') || 'Community Event',
        icon: String(e.icon ?? '') || DEFAULT_ICON,
        color: String(e.color ?? '') || DEFAULT_COLOR,
        description: String(e.description ?? ''),
        details: String(e.details ?? ''),
      }
    })
}

// Last successful fetch, kept per server instance so a transient Google outage
// serves slightly stale events rather than falling all the way back to the seed.
let lastGood: LakeEvent[] | null = null

export async function getEvents(): Promise<LakeEvent[]> {
  const base = process.env.MEMBERSHIP_SHEET_WEBHOOK
  if (!base) {
    return derive(seedEvents as Array<Record<string, unknown>>)
  }
  const url = base + (process.env.NODE_ENV === 'production' ? '' : '?test=1')
  try {
    const r = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      redirect: 'follow', // Apps Script replies via a 302 to a result URL
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const data = await r.json()
    const events = derive(Array.isArray(data?.events) ? data.events : [])
    lastGood = events
    return events
  } catch (err) {
    console.error('Events sheet fetch failed:', err)
    if (lastGood) return lastGood
    return derive(seedEvents as Array<Record<string, unknown>>)
  }
}
