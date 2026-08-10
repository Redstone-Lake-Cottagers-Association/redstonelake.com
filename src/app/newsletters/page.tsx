import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllNewsletters, NEWSLETTER_REVALIDATE, type Newsletter } from '@/lib/newsletters'
import { ORG_NAME } from '@/lib/branding'
import NewsletterArchive from '@/components/NewsletterArchive'
import { newsletterId } from '@/lib/newsletter-id'

export const metadata: Metadata = {
  title: `Newsletters | ${ORG_NAME}`,
  description: 'Archive of our monthly newsletters. Become a member to get your copy directly in your inbox.',
}

export const revalidate = NEWSLETTER_REVALIDATE

export default async function NewslettersPage() {
  const { fresh, archived } = await getAllNewsletters()
  const newsletters: Newsletter[] = [...fresh, ...archived]

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Newsletters</h1>
        <p className="lead text-muted">
          Stay informed about what matters most in the area with our monthly newsletter.
        </p>
        <p>
          <strong>Become a member to get your copy directly in your email inbox.</strong>{' '}
          <Link href="/membership">Join today →</Link>
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <NewsletterArchive
            newsletters={newsletters.map(newsletter => ({
              ...newsletter,
              href: newsletter.available === false
                ? undefined
                : `/newsletters/${newsletterId(newsletter.label, newsletter.url)}`,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
