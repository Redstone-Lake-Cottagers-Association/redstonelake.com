import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Initiatives | ${ORG_NAME}`,
  description:
    'The association’s active programs: hazard buoys, water quality monitoring, lead-free tackle, shoreline health and more.',
}

const INITIATIVES = [
  {
    icon: '🛟',
    title: 'Private Hazard Buoys',
    text: 'Volunteer-maintained buoys mark submerged rocks, sandbars and no-wake zones across the lakes, deployed each spring and retrieved each fall.',
    href: '/private-buoys',
    link: 'Buoy program & locations',
  },
  {
    icon: '🔬',
    title: 'Water Quality Monitoring',
    text: 'Nearly 30 years of volunteer sampling through Ontario’s Lake Partner Program — phosphorus, clarity and calcium on all seven lakes.',
    href: '/water-quality-program',
    link: 'How monitoring works',
    secondary: { href: '/lake-health', label: 'Explore the data' },
  },
  {
    icon: '🦆',
    title: 'Get the Lead Out',
    text: 'Lead tackle kills the loons our lakes are known for. Trade in lead sinkers and jigs for a free custom lure at our tackle exchange.',
    href: '/get-the-lead-out',
    link: 'Join the tackle exchange',
  },
  {
    icon: '🌿',
    title: 'Shoreline Naturalization',
    text: 'Working with Abbey Gardens to help owners re-naturalize their shorelines — the single best defence for water quality and habitat.',
    href: '/news/shoreline-naturalization-with-abbey-gardens',
    link: 'Read about the program',
    secondary: { href: '/healthy-shoreline', label: 'Healthy shoreline guide' },
  },
  {
    icon: '📰',
    title: 'Monthly Newsletter',
    text: 'News, water conditions, events and lake science delivered to members every month since 2020.',
    href: '/newsletters',
    link: 'Browse the archive',
  },
  {
    icon: '🤝',
    title: 'Advocacy with FOCA',
    text: 'Through the Federation of Ontario Cottagers’ Associations we add our voice on issues like dock and boathouse regulation, floating accommodations and lake planning.',
    href: 'https://foca.on.ca/',
    link: 'Visit FOCA',
    external: true,
  },
]

export default function InitiativesPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h1 className="mb-3">Our Initiatives</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '640px' }}>
              Practical, volunteer-powered programs that keep our seven lakes safe, healthy and
              connected. Every one of them is funded by{' '}
              <Link href="/membership">memberships</Link> and run by{' '}
              <Link href="/volunteers">volunteers</Link>.
            </p>
          </div>

          <div className="row g-3 mb-5">
            {INITIATIVES.map(item => (
              <div key={item.title} className="col-md-6 col-lg-4 d-flex">
                <div className="card lake-card w-100">
                  <div className="card-body d-flex flex-column">
                    <div className="fs-3 mb-1" aria-hidden="true">{item.icon}</div>
                    <h5 className="mb-2">{item.title}</h5>
                    <p className="text-muted small flex-grow-1">{item.text}</p>
                    <div className="small">
                      {item.external ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="fw-semibold d-block">
                          {item.link} →
                        </a>
                      ) : (
                        <Link href={item.href} className="fw-semibold d-block">{item.link} →</Link>
                      )}
                      {item.secondary && (
                        <Link href={item.secondary.href}>{item.secondary.label} →</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card lake-card">
            <div className="card-body d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <strong>Have an idea — or a hand to lend?</strong>
                <span className="text-muted">
                  {' '}Every initiative here started with a member who cared. Roles and contacts are
                  on the volunteers page.
                </span>
              </div>
              <Link href="/volunteers" className="btn btn-lake-primary flex-shrink-0">
                Volunteer With Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
