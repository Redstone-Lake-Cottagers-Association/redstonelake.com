import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllNewsletters, type Newsletter } from '@/lib/newsletters'
import { newsletterId } from '@/lib/newsletter-id'
import { ORG_NAME } from '@/lib/branding'

// Must be a literal for Next to read it; keep in sync with NEWSLETTER_REVALIDATE
export const revalidate = 21600

interface Props {
  params: Promise<{ id: string }>
}

async function findNewsletter(id: string): Promise<Newsletter | undefined> {
  const { fresh, archived } = await getAllNewsletters()
  return [...fresh, ...archived].find(newsletter => (
    newsletter.available !== false && newsletterId(newsletter.label, newsletter.url, newsletter.campaignId) === id
  ))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const newsletter = await findNewsletter(id)
  if (!newsletter) return {}

  return {
    title: `${newsletter.label} Newsletter | ${ORG_NAME}`,
    description: newsletter.title || `${ORG_NAME} newsletter for ${newsletter.label}.`,
  }
}

export default async function NewsletterPage({ params }: Props) {
  const { id } = await params
  const newsletter = await findNewsletter(id)
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
