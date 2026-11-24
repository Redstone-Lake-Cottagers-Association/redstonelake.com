// Reports a broken automatic check (such as the fire-ban scrape) to the
// Google Apps Script web app, which emails president@ and enforces the
// "at most once every 7 days" rule (it keeps that state in Google, so it
// survives this app's machines stopping and restarting).
//
// Set ALERT_WEBHOOK to the Apps Script web-app URL only AFTER the updated
// docs/sheet-apps-script.js is deployed: older script versions treat any
// unknown payload as a membership registration.

export interface SiteProblem {
  check: string // e.g. 'fire-ban'
  reason: string // plain English, shown in the email
  transient: boolean // may clear on its own (timeouts, 5xx); the script waits for it to persist
}

// One report per check per hour from each app instance is plenty: the cron
// worker re-checks every 15 minutes and the script only needs a heartbeat.
const REPORT_INTERVAL_MS = 60 * 60 * 1000
const lastReported = new Map<string, number>()

export async function reportSiteProblem(problem: SiteProblem): Promise<void> {
  console.error(`[site-alert] ${problem.check}: ${problem.reason}${problem.transient ? ' (may be temporary)' : ''}`)

  const webhook = process.env.ALERT_WEBHOOK
  if (!webhook) return

  const now = Date.now()
  if (now - (lastReported.get(problem.check) ?? 0) < REPORT_INTERVAL_MS) return
  lastReported.set(problem.check, now)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'site-alert',
        check: problem.check,
        reason: problem.reason,
        transient: problem.transient,
        detectedAt: new Date().toISOString(),
        // non-production hosts email only the webmaster (same rule as the forms)
        test: process.env.NODE_ENV !== 'production',
      }),
      redirect: 'follow', // Apps Script replies via a 302 to a result URL
      signal: controller.signal,
    })
    if (!r.ok) console.error('[site-alert] webhook responded', r.status)
  } catch (err) {
    console.error('[site-alert] webhook failed:', err)
  } finally {
    clearTimeout(timer)
  }
}
