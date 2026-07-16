import Link from 'next/link'
import MembershipForm from '@/components/MembershipForm'
import type { Metadata } from 'next'
import { ORG_NAME, ORG_ACRONYM } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Membership | ${ORG_NAME}`,
  description: `Join the ${ORG_NAME} (${ORG_ACRONYM}) — membership dues, benefits and how to register.`,
}

const DUES = [
  { term: '1 Year', price: '$30' },
  { term: '3 Years', price: '$80' },
]

// Each benefit links to the part of the site (or partner) that delivers it
const BENEFITS: { text: string; href?: string; linkText?: string; external?: boolean }[] = [
  { text: 'Monthly email newsletter — ', href: '/newsletters', linkText: 'browse the archive' },
  { text: 'Confirmation letter of membership' },
  { text: 'Map of the Redstone Group of Lakes — ', href: '/lake-map', linkText: 'explore the interactive version' },
  { text: 'Two membership signs (dock and driveway)' },
  { text: 'Discounts with local businesses — Superior Propane and participating insurance companies' },
  {
    text: 'FOCA membership benefits and discounts — ',
    href: 'https://foca.on.ca/member-services/benefits/',
    linkText: 'see the full list',
    external: true,
  },
  { text: 'Water quality monitoring alerts — ', href: '/lake-health', linkText: 'see the lake data' },
  { text: 'A vote at the Annual General Meeting (second Saturday in July) — ', href: '/agm', linkText: 'AGM archive' },
]

export default function Membership() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-5">
            <h1 className="mb-3">Become a Member</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '620px' }}>
              Your membership funds water quality monitoring, shoreline preservation and community
              programs across our seven lakes — and it comes with real benefits.
            </p>
            <a href="#register" className="btn btn-lake-primary">Register or Renew Now ↓</a>
          </div>

          {/* Dues */}
          <div className="row g-3 justify-content-center mb-5">
            {DUES.map(d => (
              <div key={d.term} className="col-6 col-md-3">
                <div className="card lake-card h-100 text-center">
                  <div className="card-body py-3">
                    <div className="text-muted small text-uppercase" style={{ letterSpacing: '0.06em' }}>{d.term}</div>
                    <div className="fs-3 fw-bold" style={{ color: '#102e40' }}>{d.price}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-12 text-center">
              <small className="text-muted">
                Members must be property owners within the Redstone Group of Lakes.
                Dues are non-refundable but transfer to new owners.
              </small>
            </div>
          </div>

          <div className="row justify-content-center mb-5" id="register">
            <div className="col-lg-10">
              <MembershipForm />
            </div>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <h4 className="mb-3">What you get</h4>
              <ul className="list-unstyled mb-0">
                {BENEFITS.map(b => (
                  <li key={b.text} className="d-flex gap-2 mb-2">
                    <span style={{ color: '#2f7d5c' }}>✓</span>
                    <span>
                      {b.text}
                      {b.href && b.external && (
                        <a href={b.href} target="_blank" rel="noopener noreferrer">{b.linkText}</a>
                      )}
                      {b.href && !b.external && <Link href={b.href}>{b.linkText}</Link>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-md-6">
              <h4 className="mb-3">How to join</h4>
              <p className="text-muted">
                Fill in the registration form below, then pay your dues by Interac
                e-Transfer® to <strong>treasurer@redstonelake.com</strong> — or mail a cheque
                with your details to <strong>RLCA</strong>, Box 3, West Guilford, Ontario K0M 2S0.
              </p>
              <p className="text-muted small mb-0">
                Questions about joining or renewing? Email{' '}
                <a href="mailto:membership@redstonelake.com">membership@redstonelake.com</a>.
              </p>
            </div>
          </div>

          <div className="text-center border-top pt-4">
            <p className="text-muted mb-2">
              Founded 1961 · Representing Bitter, Burdock, Coleman, Little Redstone, Long (Tedious),
              Pelaw and Redstone Lakes · AGM every second Saturday in July
            </p>
            <p className="mb-0">
              Want to get more involved? <Link href="/volunteers">Volunteer with us</Link> or{' '}
              <Link href="/contact">get in touch</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
