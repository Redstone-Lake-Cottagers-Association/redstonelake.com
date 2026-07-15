import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Water Quality Program | ${ORG_NAME}`,
  description:
    'How our volunteer lake stewards monitor water quality on all seven lakes — and where to explore nearly 30 years of results.',
}

const MEASURES = [
  {
    icon: '🧪',
    title: 'Annual chemistry samples',
    text: 'Every spring, stewards collect samples on each lake for total phosphorus (the nutrient that drives algae growth), calcium and chloride, analyzed by the provincial lab.',
  },
  {
    icon: '👁️',
    title: 'Monthly water clarity',
    text: 'Through the summer, stewards lower a Secchi disk over the deep point of each lake and record the depth at which it disappears — a simple, decades-long record of clarity.',
  },
  {
    icon: '🌡️',
    title: 'Dissolved oxygen',
    text: 'Each September, stewards profile dissolved oxygen in the deep basins — the cold, oxygen-rich water that lake trout depend on.',
  },
  {
    icon: '🌿',
    title: 'Aquatic vegetation surveys',
    text: 'In August 2025, U-Links Centre for Community-Based Research and our volunteers surveyed aquatic plants on all seven lakes, finding healthy native communities of 34–42 species per lake.',
  },
]

export default function WaterQualityProgramPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-5">
            <h1 className="mb-3">Water Quality Program</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '660px' }}>
              Volunteer lake stewards have monitored the water on all seven of our lakes for nearly
              30 years through Ontario&rsquo;s Lake Partner Program. Here&rsquo;s what we measure —
              and where to see the results.
            </p>
            <Link href="/lake-health" className="btn btn-lake-primary">
              Explore the Results
            </Link>
          </div>

          <h3 className="mb-3">What we measure</h3>
          <div className="row g-3 mb-5">
            {MEASURES.map(m => (
              <div key={m.title} className="col-md-6 d-flex">
                <div className="card lake-card w-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fs-4" aria-hidden="true">{m.icon}</span>
                      <h5 className="mb-0">{m.title}</h5>
                    </div>
                    <p className="text-muted small mb-0">{m.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="article-content mb-5">
            <h3>How it works</h3>
            <p>
              Our lakes participate in the <strong>Lake Partner Program</strong>, Ontario&rsquo;s
              volunteer-based water monitoring network. A trained{' '}
              <Link href="/volunteers">lake steward on each lake</Link> collects the samples and
              readings, the province analyzes them, and the results become part of a public,
              decades-long scientific record. It costs the province a fraction of professional
              monitoring and gives our lakes a continuous health history that few Ontario lakes
              have. Learn more about the program from{' '}
              <a href="https://foca.on.ca/lake-partner-program/" target="_blank" rel="noopener noreferrer">
                FOCA, which coordinates it province-wide
              </a>.
            </p>
            <p>
              We&rsquo;re also evaluating additions to the program: deep-water phosphorus sampling
              with a Van Dorn sampler, a conductivity logger for continuous chloride monitoring,
              and an invasive species management plan.
            </p>
          </div>

          <h3 className="mb-3">See the results</h3>
          <div className="row g-3 mb-5">
            <div className="col-md-6 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body text-center">
                  <h5 className="mb-2">📊 Lake Health Data Explorer</h5>
                  <p className="text-muted small mb-3">
                    Nearly 30 years of phosphorus, clarity, calcium, chloride and sulphate data for
                    all seven lakes, charted interactively.
                  </p>
                  <Link href="/lake-health" className="btn btn-outline-primary btn-sm">Open the Explorer</Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body text-center">
                  <h5 className="mb-2">💧 Live Water Level</h5>
                  <p className="text-muted small mb-3">
                    Current Redstone Lake water level with historical trends, updated continuously
                    from the Parks Canada gauge.
                  </p>
                  <Link href="/lake-health#water-level" className="btn btn-outline-primary btn-sm">View Live Water Level</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center border-top pt-4">
            <p className="text-muted small mb-2">
              The association is also a member of the{' '}
              <a href="https://www.cewf.ca/" target="_blank" rel="noopener noreferrer">
                Coalition for Equitable Water Flow (CEWF)
              </a>, which advocates for responsible water-level management in the Trent–Severn
              watershed.
            </p>
            <p className="mb-0">
              Want to help take the readings? We train new{' '}
              <Link href="/volunteers">lake stewards</Link> every season.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
