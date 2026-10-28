import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { findLegacyNewsletter, getAllNewsletters, NEWSLETTER_REVALIDATE, type Newsletter } from '@/lib/newsletters'
import { newsletterId } from '@/lib/newsletter-id'
import { ORG_NAME } from '@/lib/branding'

export const revalidate = NEWSLETTER_REVALIDATE

interface Props {
  params: { id: string }
}

async function findNewsletter(id: string): Promise<Newsletter | undefined> {
  const { fresh, archived } = await getAllNewsletters()
  const all = [...fresh, ...archived].filter(newsletter => newsletter.available !== false)
  const newsletter = all.find(n => newsletterId(n.label, n.url, n.campaignId) === id)
  if (newsletter) return newsletter

  // An ID from before the switch to Mailchimp campaign IDs: 301 to the current page
  const legacy = findLegacyNewsletter(id, all)
  if (legacy) permanentRedirect(`/newsletters/${newsletterId(legacy.label, legacy.url, legacy.campaignId)}`)
  return undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const newsletter = await findNewsletter(params.id)
  if (!newsletter) return {}

  return {
    title: `${newsletter.label} Newsletter | ${ORG_NAME}`,
    description: newsletter.title || `${ORG_NAME} newsletter for ${newsletter.label}.`,
    alternates: { canonical: `/newsletters/${params.id}` },
  }
}

export default async function NewsletterPage({ params }: Props) {
  const newsletter = await findNewsletter(params.id)
  if (!newsletter) notFound()

  return (
    <div className="container-fluid px-0">
      <div className="container py-4">
        <Link href="/newsletters" className="d-inline-block mb-3">← Newsletter archive</Link>
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div>
            <p className="text-uppercase text-primary fw-semibold small mb-1">{newsletter.label}</p>
            <h1 className="h3 mb-1">{newsletter.title || 'Monthly Newsletter'}</h1>
            <p className="small text-muted mb-0">
              You are already viewing this email in your browser. Mailchimp may repeat that instruction below.
            </p>
          </div>
          <a
            href={newsletter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary btn-sm"
          >
            Open directly in Mailchimp ↗
          </a>
        </div>
      </div>

      <div className="border-top bg-light p-2 p-md-3">
        <iframe
          src={newsletter.url}
          title={`${newsletter.label} newsletter`}
          className="d-block w-100 bg-white border rounded"
          style={{ minHeight: '78vh' }}
          sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
    </div>
  )
}
