import Link from 'next/link'
import type { Metadata } from 'next'
import listings from '@/data/business-directory.json'
import sponsorData from '@/data/sponsors.json'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Sponsors & Business Directory | ${ORG_NAME}`,
  description:
    'Our sponsors — whose generous support funds our work on the lakes — and local businesses and organizations serving the Redstone group of lakes.',
}

function domain(url: string | null | undefined) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

// Directory entries whose website matches a sponsor's get the sponsor badge
const sponsorDomains = new Set(sponsorData.sponsors.map(s => domain(s.website)).filter(Boolean))

function SponsorBadge() {
  return (
    <span
      className="badge"
      style={{ backgroundColor: '#b45309', color: '#fff', fontSize: '0.7rem', letterSpacing: '0.03em' }}
    >
      ⭐ {sponsorData.year} SPONSOR
    </span>
  )
}

export default function BusinessDirectoryPage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="mb-3">Sponsors & Business Directory</h1>
        <p className="lead text-muted">
          The businesses that support our association, and local services for our lake community
        </p>
      </div>

      {/* Sponsors — top billing */}
      <h3 className="mb-1">Our {sponsorData.year} Sponsors</h3>
      <p className="text-muted mb-3">
        These businesses generously fund our water quality monitoring, shoreline preservation and
        community programs. Please consider supporting the businesses that support your lakes.
      </p>
      <div className="row g-3 mb-4">
        {sponsorData.sponsors.map(s => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.image}
              alt={s.name}
              className="w-100"
              style={{ height: '150px', objectFit: 'contain', padding: '0.75rem', backgroundColor: '#fff' }}
            />
          )
          return (
            <div key={s.name} className="col-6 col-md-4 col-lg-3 d-flex">
              <div className="card lake-card w-100 position-relative">
                <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 1 }}>
                  <SponsorBadge />
                </div>
                {s.website
                  ? <a href={s.website} target="_blank" rel="noopener noreferrer" aria-label={s.name}>{img}</a>
                  : img}
                <div className="card-body py-2 text-center">
                  <small className="text-muted">{s.name}</small>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card lake-card mb-5">
        <div className="card-body d-flex align-items-center justify-content-between gap-3 py-3">
          <div>
            <strong>Interested in becoming a sponsor?</strong>
            <span className="text-muted">
              {' '}Reach hundreds of cottager families on our website, newsletter and at the AGM.
            </span>
          </div>
          <Link href="/contact" className="btn btn-lake-primary btn-sm flex-shrink-0">Get in Touch</Link>
        </div>
      </div>

      {/* Directory */}
      <h3 className="mb-1">Business Directory</h3>
      <p className="text-muted mb-3">
        Local businesses and lake organizations serving our community.
      </p>
      <div className="row g-4">
        {listings.map(l => {
          const isSponsor = sponsorDomains.has(domain(l.website))
          return (
            <div key={l.slug} className="col-md-6 col-lg-4 d-flex">
              <div className="card lake-card h-100 w-100 position-relative">
                {isSponsor && (
                  <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 1 }}>
                    <SponsorBadge />
                  </div>
                )}
                {l.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.image}
                    alt={l.name}
                    className="card-img-top"
                    style={{ height: '180px', objectFit: 'contain', padding: '1rem', backgroundColor: '#fff' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{l.name}</h5>
                  <p className="text-muted small flex-grow-1">
                    {l.description.length > 180 ? `${l.description.slice(0, 180)}…` : l.description}
                  </p>
                  <ul className="list-unstyled small mb-3">
                    {l.address && <li className="text-muted">📍 {l.address}</li>}
                    {l.phone && <li><a href={`tel:${l.phone.replace(/[^\d+]/g, '')}`}>📞 {l.phone}</a></li>}
                  </ul>
                  {l.website && (
                    <a
                      href={l.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
