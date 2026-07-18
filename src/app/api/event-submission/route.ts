import { NextResponse } from 'next/server'

// Community event submissions go to the same Google Sheet as membership
// registrations (MEMBERSHIP_SHEET_WEBHOOK) — the Apps Script routes
// kind:'event' payloads to an "Event submissions" tab and emails the
// president and communications instead of the membership coordinators.
// Setup steps: docs/MEMBERSHIP-FORM.txt. Without the webhook the endpoint
// returns 503 and the form falls back to a prefilled email.

interface EventSubmission {
  name: string
  email: string
  phone?: string
  title: string
  date: string // yyyy-mm-dd from the form's date input
  time?: string
  location?: string
  type?: string
  description: string
  details?: string
}

function validate(b: unknown): EventSubmission | null {
  const s = b as EventSubmission
  if (!s || typeof s !== 'object') return null
  if (!s.name?.trim() || !s.email?.includes('@')) return null
  if (!s.title?.trim() || !s.description?.trim()) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date || '')) return null
  return s
}

// "2026-08-15" → "August 15, 2026" (parsed as local calendar date, not UTC,
// so the day never shifts) — matches the date format in src/data/events.json.
function humanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function POST(request: Request) {
  let sub: EventSubmission | null = null
  try {
    sub = validate(await request.json())
  } catch {
    sub = null
  }
  if (!sub) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const webhook = process.env.MEMBERSHIP_SHEET_WEBHOOK
  if (!webhook) {
    return NextResponse.json({ error: 'email-not-configured' }, { status: 503 })
  }

  try {
    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'event',
        ...sub,
        date: humanDate(sub.date),
        // test: true on non-production hosts → the Apps Script writes to the
        // test tab and emails only the webmaster (same rule as membership)
        test: process.env.NODE_ENV !== 'production',
      }),
      redirect: 'follow', // Apps Script replies via a 302 to a result URL
    })
    if (r.ok) return NextResponse.json({ ok: true })
    console.error('Event webhook failed:', r.status)
    return NextResponse.json({ error: 'send-failed' }, { status: 502 })
  } catch (err) {
    console.error('Event webhook error:', err)
    return NextResponse.json({ error: 'send-failed' }, { status: 502 })
  }
}
