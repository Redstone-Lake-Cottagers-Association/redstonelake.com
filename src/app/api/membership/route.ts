import { NextResponse } from 'next/server'

// Membership applications are emailed to the membership coordinator and the
// president. Requires SES credentials (Fly secrets): AWS_ACCESS_KEY_ID,
// AWS_SECRET_ACCESS_KEY, AWS_REGION, and a verified MEMBERSHIP_FROM sender.
// Without them the endpoint returns 503 and the form falls back to a
// prefilled email the applicant sends themselves.

const TO = ['membership@redstonelake.com', 'president@redstonelake.com']

interface Application {
  primaryName: string
  primaryEmail: string
  associateName?: string
  associateEmail?: string
  lakeAddress: string
  phone?: string
  mailingAddress?: string
  term: '1yr' | '3yr'
  newsletter: boolean
}

function validate(b: unknown): Application | null {
  const a = b as Application
  if (!a || typeof a !== 'object') return null
  if (!a.primaryName?.trim() || !a.primaryEmail?.includes('@') || !a.lakeAddress?.trim()) return null
  if (a.term !== '1yr' && a.term !== '3yr') return null
  return a
}

export async function POST(request: Request) {
  let app: Application | null = null
  try {
    app = validate(await request.json())
  } catch {
    app = null
  }
  if (!app) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const amount = app.term === '3yr' ? '$80 (3 years)' : '$30 (1 year)'

  // Preferred delivery: Google Apps Script webhook — appends a row to the
  // membership Google Sheet and emails the coordinators from Google's side.
  // Setup steps: docs/MEMBERSHIP-FORM.txt. Falls back to SES if configured.
  const webhook = process.env.MEMBERSHIP_SHEET_WEBHOOK
  if (webhook) {
    try {
      const r = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // test: true on non-production hosts → the Apps Script emails only the
        // webmaster instead of the membership coordinators
        body: JSON.stringify({ ...app, test: process.env.NODE_ENV !== 'production' }),
        redirect: 'follow', // Apps Script replies via a 302 to a result URL
      })
      if (r.ok) return NextResponse.json({ ok: true })
      console.error('Sheet webhook failed:', r.status)
    } catch (err) {
      console.error('Sheet webhook error:', err)
    }
  }

  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    return NextResponse.json({ error: 'email-not-configured' }, { status: 503 })
  }
  const lines = [
    `New membership registration from the website`,
    ``,
    `Primary member:   ${app.primaryName}`,
    `Primary email:    ${app.primaryEmail}`,
    `Associate member: ${app.associateName || '—'}`,
    `Associate email:  ${app.associateEmail || '—'}`,
    `Lake address:     ${app.lakeAddress}`,
    `Phone:            ${app.phone || '—'}`,
    `Mailing address:  ${app.mailingAddress || '—'}`,
    `Term:             ${amount}`,
    `Newsletter:       ${app.newsletter ? 'Yes' : 'No'}`,
    ``,
    `The applicant was directed to pay by Interac e-Transfer to treasurer@redstonelake.com.`,
  ]

  try {
    const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses')
    const client = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' })
    await client.send(
      new SendEmailCommand({
        Source: process.env.MEMBERSHIP_FROM || 'website@redstonelake.com',
        Destination: { ToAddresses: TO },
        ReplyToAddresses: [app.primaryEmail],
        Message: {
          Subject: { Data: `Membership registration — ${app.primaryName} (${app.term === '3yr' ? '3 years' : '1 year'})` },
          Body: { Text: { Data: lines.join('\n') } },
        },
      })
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Membership email failed:', err)
    return NextResponse.json({ error: 'send-failed' }, { status: 502 })
  }
}
