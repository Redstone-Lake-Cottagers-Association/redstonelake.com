// Reads fire-ban alerts from the Municipality of Dysart et al homepage and
// checks that the page still looks the way the parser expects. Dysart's
// 2026 redesign silently broke the old feed for six months, so a page we
// can no longer read must surface as a problem, never as "no fire ban".

export interface FireBanAlert {
  title: string
  description: string
  color: string
}

export const DYSART_HOMEPAGE = 'https://www.dysartetal.ca/'

const stripTags = (s: string) =>
  s.replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’').replace(/&#8211;|&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, ' ').trim()

const severityToColor = (sev: string) =>
  /danger|error|red/i.test(sev) ? 'Red' : /warning/i.test(sev) ? 'Orange' : 'Blue'

// Alert banners: <div id="alert-banner-N" class="umb--alert umb--alert--{severity}"> …
const BANNER_RE = /id="alert-banner-\d+"\s+class="umb--alert umb--alert--(\w+)"[\s\S]*?umb--alert__title"[^>]*>([\s\S]*?)<\/div>[\s\S]*?umb--alert__summary"[^>]*>([\s\S]*?)<\/div>/g
// Alert modals: <div id="alert-modal-N" class="bx--modal umb--alert umb--alert--{severity} …
const MODAL_RE = /id="alert-modal-\d+"\s+class="bx--modal umb--alert umb--alert--(\w+)[\s\S]*?bx--modal-header__heading[^>]*>([\s\S]*?)<\/p>[\s\S]*?bx--modal-content">([\s\S]*?)<\/div>/g

export function parseDysartAlerts(html: string): FireBanAlert[] {
  const alerts: FireBanAlert[] = []
  for (const m of Array.from(html.matchAll(BANNER_RE))) {
    alerts.push({ title: stripTags(m[2]), description: stripTags(m[3]), color: severityToColor(m[1]) })
  }
  for (const m of Array.from(html.matchAll(MODAL_RE))) {
    alerts.push({ title: stripTags(m[2]), description: stripTags(m[3]), color: severityToColor(m[1]) })
  }
  return alerts
}

/**
 * Returns a plain-English reason when the page no longer matches what the
 * parser expects, or null when it looks healthy. Checked against Dysart's
 * live page and archived copies from 2026: pages with no alerts carry no
 * "alert" class or id at all, and every alert they post is parsed.
 */
export function checkDysartPage(html: string, alerts: FireBanAlert[]): string | null {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''
  if (!/dysart/i.test(title)) {
    return 'The page at dysartetal.ca no longer looks like the municipality’s homepage (its title changed).'
  }
  const alertMarkup = html.match(/(?:class|id)="[^"]*alert[^"]*"/gi)?.length ?? 0
  if (alertMarkup > 0 && alerts.length === 0) {
    return 'Dysart’s homepage is showing alerts in a format the website can no longer read.'
  }
  const alertBoxes = html.match(/id="alert-(?:banner|modal)-\d+"/g)?.length ?? 0
  if (alertBoxes > alerts.length) {
    return `Dysart’s homepage has ${alertBoxes} alerts, but the website could read only ${alerts.length}.`
  }
  if (alerts.some(a => !a.title)) {
    return 'Dysart’s homepage has an alert whose text the website could not read.'
  }
  return null
}

export const mentionsFire = (alerts: FireBanAlert[]) =>
  alerts.some(a => /fire|burn|ban|flame/i.test(`${a.title} ${a.description}`))

// ---- Fire and Emergency Services page: the official fire-risk status --------
// The page opens with a dated status block, e.g. "As of November 19, 2026:
// Fire Risk: Moderate", then that season's burning rules. Since 2021 it has
// also said "Fire Risk: Low/High", "Fire Ban" or "Day Burning Permitted".

export const DYSART_FIRE_PAGE = 'https://www.dysartetal.ca/living-in-our-community/fire-and-emergency-services/'

export interface FireRiskStatus {
  level: string // as Dysart writes it: "Moderate", "High", "Total Fire Ban", …
  asOf?: string // e.g. "November 19, 2026"
  details: string // the season heading and rule text that follow the level
}

const pageText = (html: string) =>
  html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/?(h[1-6]|p|div|li|br|tr|td|section|article)\b[^>]*>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’').replace(/&#8211;|&ndash;/g, '–')
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/(\s*\|\s*)+/g, ' | ')

export function parseFireServicesPage(html: string): FireRiskStatus | null {
  const text = pageText(html)
  const asOfMatch = text.match(/As of\s+([A-Z][a-z]+\.?\s+\d{1,2},\s+\d{4})/)
  // Without the dated block, accept only an explicit "Fire Risk:" label: the
  // page's burning rules mention "fire ban" too, and must not pass as a status
  const start = asOfMatch?.index ?? text.search(/Fire Risk:/i)
  if (start < 0) return null
  const rest = text.slice(start)
  const stop = rest.search(/\|\s*(Forest Fires|Burning Regulations|Fireworks)\b/i)
  const block = (stop > 0 ? rest.slice(0, stop) : rest.slice(0, 900))
  const segments = block.split('|').map(s => s.trim()).filter(Boolean)

  let levelIndex = segments.findIndex(s => /^Fire Risk:/i.test(s))
  let level = levelIndex >= 0 ? segments[levelIndex].replace(/^Fire Risk:\s*/i, '').trim() : ''
  if (!level) {
    levelIndex = segments.findIndex(s => /fire ban|day ?(?:time )?burning permitted/i.test(s))
    if (levelIndex >= 0) level = segments[levelIndex].replace(/[.:]+$/, '').trim()
  }
  if (!level || level.length > 60) return null

  const details = segments.slice(levelIndex + 1).join(' — ').slice(0, 400).trim()
  return { level, asOf: asOfMatch?.[1], details }
}

/** Low or Moderate (or "day burning permitted"): the standing rules apply, no ban. */
export const isRoutineFireRisk = (level: string) =>
  /^(low|moderate)\b/i.test(level) || /day ?(time )?burning permitted/i.test(level)

/**
 * Wording that can only mean a ban; used only if the AI classifier is
 * unavailable. Older versions of the page had a "Fire Ban" heading above
 * "There presently is not a fire ban in effect", so negations win.
 */
export const soundsLikeBan = (status: FireRiskStatus) => {
  const text = `${status.level} ${status.details}`
  if (/\b(not|no)\s+(a\s+)?(fire\s+)?ban\b|\blifted\b/i.test(text)) return false
  return /\b(total|complete)\s+fire\s+ban\b|\bfire\s+ban\s+(is\s+)?in\s+effect\b|\bextreme\b/i.test(text)
}

export function checkFireServicesPage(html: string, status: FireRiskStatus | null): string | null {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''
  if (!/fire/i.test(title)) {
    return 'Dysart’s Fire and Emergency Services page has moved or changed (its title no longer mentions fire).'
  }
  if (!status) {
    return 'Dysart’s Fire and Emergency Services page no longer shows its “As of … Fire Risk” status.'
  }
  return null
}
