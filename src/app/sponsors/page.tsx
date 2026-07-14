import Link from 'next/link'
import type { Metadata } from 'next'
import sponsorData from '@/data/sponsors.json'

export const metadata: Metadata = {
  title: 'Our Sponsors | Redstone Area Lakes Association',
  description: 'The businesses whose generous support makes our water quality monitoring, shoreline preservation and community programs possible.',
}

export default function SponsorsPage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="mb-3">Our {sponsorData.year} Sponsors</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '640px' }}>
          Our sponsors&apos; generous support helps fund water quality monitoring, shoreline
          preservation and community programs across our seven lakes. Please consider
          supporting the businesses that support your lake community.
        </p>
      </div>

      <div className="row g-3 justify-content-center mb-5">
        {sponsorData.sponsors.map(s => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.image}
              alt={s.name}
              className="w-100"
              style={{ height: '170px', objectFit: 'contain', padding: '1rem', backgroundColor: '#fff' }}
            />
          )
          return (
            <div key={s.name} className="col-6 col-md-4 col-lg-3 d-flex">
              <div className="card lake-card w-100">
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

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card lake-card">
            <div className="card-body text-center">
              <h5 className="mb-2">Interested in becoming a sponsor?</h5>
              <p className="text-muted mb-3">
                Sponsorship puts your business in front of hundreds of cottager families across the
                Redstone group of lakes — on our website, in our monthly newsletter and at the
                Annual General Meeting.
              </p>
              <Link href="/contact" className="btn btn-lake-primary">Get in Touch</Link>
            </div>
          </div>
          <p className="text-center text-muted small mt-4 mb-0">
            Looking for local services? Browse the full <Link href="/business-directory">Business Directory</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
