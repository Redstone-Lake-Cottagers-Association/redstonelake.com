import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllNewsletters, NEWSLETTER_REVALIDATE, type Newsletter } from '@/lib/newsletters'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Newsletters | ${ORG_NAME}`,
  description: 'Archive of our monthly newsletters. Become a member to get your copy directly in your inbox.',
}

export const revalidate = NEWSLETTER_REVALIDATE

export default async function NewslettersPage() {
  const { fresh, archived } = await getAllNewsletters()
  const newsletters: Newsletter[] = [...fresh, ...archived]
  const years = Array.from(new Set(newsletters.map(n => n.year))).sort((a, b) => b - a)

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
          {years.map(year => (
            <div key={year} className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <h4 className="mb-0 me-3 text-primary">{year}</h4>
                <div className="flex-grow-1" style={{ height: '1px', backgroundColor: '#e5e7eb' }}></div>
              </div>
              <div>
                {newsletters
                  .filter(n => n.year === year)
                  .map(n => (
                    <a
                      key={n.url + n.label}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-baseline gap-3 py-2 px-3 mb-1 rounded border text-decoration-none bg-white newsletter-row"
                    >
                      <span className="text-muted small text-nowrap" style={{ minWidth: '110px' }}>{n.label}</span>
                      <span className="fw-semibold">{n.title || 'Monthly Newsletter'}</span>
                    </a>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
