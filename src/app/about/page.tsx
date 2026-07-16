import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME, ORG_ACRONYM } from '@/lib/branding'

export const metadata: Metadata = {
  title: `About Us | ${ORG_NAME}`,
  description:
    'A volunteer-run cottagers’ association protecting the Redstone Group of Lakes in Haliburton County since 1961.',
}

const OBR_URL =
  'https://www.obrpartner.mgcs.gov.on.ca/onbis/corporations/viewInstance/view.pub?id=280aa9d4fbca6577ccb365bb8f57e85a8b028ff989a4417163d9faefb51bbd20&_timestamp=2157795618925474'

const PILLARS = [
  {
    icon: '💧',
    title: 'Watch the water',
    text: 'Volunteer samplers have tracked phosphorus, water clarity and calcium on our lakes for nearly 30 years, and the site carries live Redstone Lake water levels.',
    href: '/lake-health',
    link: 'Explore Lake Health Data',
  },
  {
    icon: '🛶',
    title: 'Protect the lakes',
    text: 'Hazard buoys, lead-free tackle exchanges, shoreline naturalization, septic education — practical programs that keep the lakes safe and healthy.',
    href: '/initiatives',
    link: 'See Our Initiatives',
  },
  {
    icon: '🎉',
    title: 'Build community',
    text: 'The AGM every July, monthly newsletters, contests, galleries and get-togethers — sixty years of neighbours becoming friends.',
    href: '/#events-news',
    link: 'News & Events',
  },
]

export default function AboutPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-5">
            <h1 className="mb-3">About the {ORG_NAME}</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '660px' }}>
              A volunteer-run cottagers&rsquo; association protecting the lakes — and the community —
              of the Redstone Group of Lakes in Haliburton County since 1961.
            </p>
          </div>

          <div className="article-content mb-5">
            <h3>Our story</h3>
            <p>
              The association received its letters patent on <strong>August 16, 1961</strong>, when a
              group of cottagers organized to look after the waters their families summered on. Over
              sixty years later the mission hasn&rsquo;t changed: keep the water clean, the
              shorelines natural, and the community strong, so the next generation inherits the
              lakes as we found them. You can still read the{' '}
              <Link href="/governance">original 1961 documents</Link> in our governance archive.
            </p>
            <p>
              We are recognized by the Province of Ontario and work alongside FOCA (the Federation
              of Ontario Cottagers&rsquo; Associations), Ontario Parks, and the Municipality of
              Dysart et al.
            </p>
            <p>
              At the 2026 Annual General Meeting, members voted to change the association&rsquo;s
              name to the <strong>Redstone Area Lakes Association (RALA)</strong> — read the{' '}
              <Link href="/news/2026-annual-general-meeting">full story in our AGM recap</Link>. The
              new name takes effect once the corporate filings are complete.
            </p>

            <h3>Seven lakes, one watershed</h3>
            <p>
              Our stewardship covers seven connected lakes in the heart of Haliburton&rsquo;s
              wilderness: <strong>Redstone</strong>, <strong>Little Redstone</strong>,{' '}
              <strong>Pelaw</strong>, <strong>Bitter</strong>, <strong>Long (Tedious)</strong>,{' '}
              <strong>Burdock</strong> and <strong>Coleman</strong>. Deep, cold and clean, they are
              classic Canadian Shield lake trout waters — a fishery found in only about one per cent
              of Ontario&rsquo;s lakes.
            </p>
            <p>
              Our lakes sit at the heart of the Redstone River watershed — 235 km² of country
              stretching from Upper Redstone Lake inside Algonquin Park down to Green Lake near
              West Guilford. The association&rsquo;s stewardship covers the chain of seven cottage
              lakes within it.
            </p>
          </div>

          <h3 className="mb-3">What we do</h3>
          <div className="row g-3 mb-5">
            {PILLARS.map(p => (
              <div key={p.title} className="col-md-4 d-flex">
                <div className="card lake-card w-100">
                  <div className="card-body d-flex flex-column">
                    <div className="fs-3 mb-1" aria-hidden="true">{p.icon}</div>
                    <h5 className="mb-2">{p.title}</h5>
                    <p className="text-muted small flex-grow-1">{p.text}</p>
                    <Link href={p.href} className="fw-semibold small">{p.link} →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3 mb-5">
            <div className="col-md-6 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body text-center">
                  <h5 className="mb-2">Meet the people behind it</h5>
                  <p className="text-muted small mb-3">
                    The {ORG_ACRONYM} is led by a volunteer board elected each year at the AGM, and
                    powered by volunteers across all seven lakes.
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Link href="/board-members" className="btn btn-outline-primary btn-sm">Board Members</Link>
                    <Link href="/volunteers" className="btn btn-outline-primary btn-sm">Volunteers</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body text-center">
                  <h5 className="mb-2">Be part of it</h5>
                  <p className="text-muted small mb-3">
                    Membership starts at $30 a year and funds everything you see here — monitoring,
                    buoys, events and more.
                  </p>
                  <Link href="/membership" className="btn btn-lake-primary btn-sm">Become a Member</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-top pt-4">
            <h5 className="mb-2">Official organization details</h5>
            <p className="small text-muted mb-1">
              <strong>Legal name:</strong> Redstone Lake Cottagers Association ·{' '}
              <strong>Type:</strong> Ontario Not-for-Profit Corporation (incorporated August 16, 1961) ·{' '}
              <strong>Ontario Corporation Number (OCN):</strong> 114778 ·{' '}
              <strong>Registered office:</strong> West Guilford, Ontario, Canada ·{' '}
              <strong>Mailing address:</strong> RLCA, Box 3, West Guilford, Ontario K0M 2S0
            </p>
            <p className="small text-muted mb-0">
              Verify our registration in the{' '}
              <a href={OBR_URL} target="_blank" rel="noopener noreferrer">Ontario Business Registry record</a>{' '}
              or search the{' '}
              <a href="https://www.ontario.ca/page/ontario-business-registry" target="_blank" rel="noopener noreferrer">
                Ontario Business Registry
              </a>{' '}
              for OCN 114778. This website and the domains redstonelake.com, redstonelakes.com and
              redstonelakes.ca are owned and operated by the association. Questions?{' '}
              <Link href="/contact">Contact us</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
