import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Municipal By-Laws | ${ORG_NAME}`,
  description:
    'The Dysart et al by-laws cottagers ask about most — burning, noise, fireworks, shoreline trees, septic and short-term rentals — with links to the official sources.',
}

const DYSART = 'https://www.dysartetal.ca'

const BYLAWS = [
  {
    icon: '🔥',
    title: 'Open Air Burning',
    text: 'During fire season (April 1 – October 31), open-air burning is permitted only between 7 p.m. and 7 a.m., and never during a fire ban. Our homepage shows the live fire-ban status.',
    links: [
      { href: `${DYSART}/media/gqdjapkg/by-law-2024-26-open-air-burning-bylaw.pdf`, label: 'By-Law 2024-26 (PDF)' },
      { href: '/#water-level-monitor', label: 'Check current fire-ban status', internal: true },
    ],
  },
  {
    icon: '🔊',
    title: 'Noise',
    text: 'The municipality enforces a noise by-law — sound carries remarkably far over water. For after-hours noise complaints, contact the O.P.P. if necessary.',
    links: [{ href: `${DYSART}/media/esfhqljc/by-law-2019-42-noise-by-law.pdf`, label: 'Noise By-Law 2019-42 (PDF)' }],
  },
  {
    icon: '🎆',
    title: 'Fireworks',
    text: 'Consumer fireworks are permitted only on New Year’s Eve and the weekends of Victoria Day, Canada Day, the Civic Holiday and Labour Day. Flying lanterns are not permitted.',
    links: [{ href: `${DYSART}/municipal-government/by-law-enforcement/`, label: 'Fireworks rules & permitted times' }],
  },
  {
    icon: '🌲',
    title: 'Shoreline Tree Preservation',
    text: 'Haliburton County restricts tree removal within 30 metres of the high-water mark. Check before you cut — or call the County’s Forestry Conservation Officer at 705-286-1333.',
    links: [
      { href: `${DYSART}/media/drtddnab/faqs-county-of-haliburton-shoreline-tree-preservation2018.pdf`, label: 'FAQ sheet (PDF)' },
      { href: '/healthy-shoreline', label: 'Why shoreline trees matter', internal: true },
    ],
  },
  {
    icon: '🚽',
    title: 'Septic Maintenance & Inspections',
    text: 'Dysart et al runs a Septic Maintenance Inspection Program (SMIP) for waterfront properties. A healthy septic system is one of the biggest factors in lake water quality.',
    links: [
      { href: `${DYSART}/build-and-invest/septic-maintenance-inspection-program/`, label: 'SMIP program details' },
      { href: '/septic-systems', label: 'Our septic care guide', internal: true },
    ],
  },
  {
    icon: '🏠',
    title: 'Short-Term Rentals',
    text: 'Renting out your cottage? The municipality licenses and regulates short-term rentals — check the requirements before listing.',
    links: [{ href: `${DYSART}/municipal-government/short-term-rentals/`, label: 'Short-term rental rules' }],
  },
  {
    icon: '🐕',
    title: 'Canine Control',
    text: 'Dogs must be under control at all times; the canine control by-law covers licensing, leashing and kennels.',
    links: [{ href: `${DYSART}/media/z2rji24o/by-law-2020-45-canine-control.pdf`, label: 'Canine Control By-Law 2020-45 (PDF)' }],
  },
  {
    icon: '🏗️',
    title: 'Site Alteration & Property Standards',
    text: 'Grading, fill and shoreline work near the water are regulated, and minimum property standards apply to all properties.',
    links: [
      { href: `${DYSART}/media/a3sa4f4h/by-law-2023-101-site-alteration-by-law.pdf`, label: 'Site Alteration By-Law (PDF)' },
      { href: `${DYSART}/media/amblrz5p/by-law-2014-29-property-standards-by-law.pdf`, label: 'Property Standards By-Law (PDF)' },
    ],
  },
]

export default function MunicipalBylawsPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h1 className="mb-3">Municipal By-Laws</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '660px' }}>
              The Municipality of Dysart et al rules cottagers ask about most, with links to the
              official sources. By-laws change — when in doubt, confirm with the municipality.
            </p>
          </div>

          <div className="row g-3 mb-5">
            {BYLAWS.map(b => (
              <div key={b.title} className="col-md-6 d-flex">
                <div className="card lake-card w-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fs-4" aria-hidden="true">{b.icon}</span>
                      <h5 className="mb-0">{b.title}</h5>
                    </div>
                    <p className="text-muted small flex-grow-1">{b.text}</p>
                    <div className="small">
                      {b.links.map(l =>
                        l.internal ? (
                          <Link key={l.href} href={l.href} className="d-block">{l.label} →</Link>
                        ) : (
                          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="d-block">
                            {l.label} →
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card lake-card mb-4">
            <div className="card-body">
              <h5 className="mb-2">Filing a complaint</h5>
              <p className="text-muted small mb-0">
                By-law complaints must be submitted to the By-Law Department in writing — by mail
                (PO Box 389, Haliburton, Ontario K0M 1S0) or by email to{' '}
                <a href="mailto:bylaw@dysartetal.ca">bylaw@dysartetal.ca</a> — including your
                contact information and the nature of the complaint. Full enforcement details are
                on the{' '}
                <a href={`${DYSART}/municipal-government/by-law-enforcement/`} target="_blank" rel="noopener noreferrer">
                  Dysart et al By-Law Enforcement page
                </a>.
              </p>
            </div>
          </div>

          <p className="text-center text-muted small mb-0">
            This page is a community summary, not legal advice. Always verify current rules with{' '}
            <a href={DYSART} target="_blank" rel="noopener noreferrer">the Municipality of Dysart et al</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
