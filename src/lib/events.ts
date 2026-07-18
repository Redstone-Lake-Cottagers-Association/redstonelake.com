import rawEvents from '@/data/events.json'

// Loaded/derived event shape used by pages. Maintainers only edit
// src/data/events.json (see CONTRIBUTING.md) — everything derivable
// (id, calendar day/month, upcoming vs past) is computed here so the
// JSON stays minimal and can't drift out of sync.
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

export function getEvents(): LakeEvent[] {
  return (rawEvents as Array<Record<string, unknown>>).map((e, i) => {
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
      type: String(e.type ?? 'Community Event'),
      icon: String(e.icon ?? DEFAULT_ICON),
      color: String(e.color ?? DEFAULT_COLOR),
      description: String(e.description ?? ''),
      details: String(e.details ?? ''),
    }
  })
}
