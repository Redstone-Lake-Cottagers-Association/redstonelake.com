import type { Metadata } from 'next'
import listings from '@/data/business-directory.json'
import Link from 'next/link'
import sponsorData from '@/data/sponsors.json'

export const metadata: Metadata = {
  title: 'Business Directory & Sponsors | Redstone Area Lakes Association',
  description: 'Our sponsors and local businesses serving the Redstone group of lakes and Haliburton area.',
}

export default function BusinessDirectoryPage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="mb-3">Business Directory & Sponsors</h1>
        <p className="lead text-muted">
          Local businesses and organizations serving our lake community
        </p>
      </div>

      <div className="card lake-card mb-5">
        <div className="card-body d-flex align-items-center justify-content-between gap-3 py-3">
          <div>
            <strong>Thank you to our {sponsorData.year} sponsors</strong>
            <span className="text-muted"> — their support funds our work on the lakes.</span>
          </div>
          <Link href="/sponsors" className="btn btn-outline-primary btn-sm flex-shrink-0">See Our Sponsors</Link>
        </div>
      </div>

      <h4 className="mb-3">Directory</h4>
      <div className="row g-4">
        {listings.map(l => (
          <div key={l.slug} className="col-md-6 col-lg-4 d-flex">
            <div className="card lake-card h-100 w-100">
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
        ))}
      </div>
    </div>
  )
}
