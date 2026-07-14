import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Annual General Meeting | Redstone Area Lakes Association',
  description: 'Minutes, presentations and recordings from our Annual General Meetings.',
}

interface AgmItem {
  title: string
  href: string
  external?: boolean
}

const agmYears: { year: string; items: AgmItem[] }[] = [
  {
    year: '2026',
    items: [
      { title: '2026 AGM Business Meeting Deck (July 11, 2026) — name change vote, board, financials', href: '/documents/agm/RLCA-AGM-2026.pptx' },
      { title: '2026 AGM: Environmental Monitoring on Our Lakes (Jess Kidd)', href: '/documents/agm/AGM_2026Presentation_JKidd.pptx' },
      { title: '2026 Sponsor Recognition Deck', href: '/documents/agm/2026-Sponsors.pptx' },
    ],
  },
  {
    year: '2025',
    items: [
      { title: 'RLCA 2025 AGM Presentation (July 12, 2025)', href: '/documents/agm/RLCA-AGM-7-12-25-1.pdf' },
      { title: 'RLCA 2025 AGM: Lake Health Monitoring & Research', href: '/documents/agm/AGM_2025Presentation_JKidd.pdf' },
    ],
  },
  {
    year: '2024',
    items: [
      { title: 'RLCA 2024 AGM Presentation (July 6, 2024)', href: '/documents/agm/2024-RLCA-AGM-July-6-2024-1.pdf' },
    ],
  },
  {
    year: '2023',
    items: [
      { title: 'RLCA 2023 AGM Presentation (July 8, 2023)', href: '/documents/agm/2023-RLCA-AGM-July-8-2023-1-compressed.pdf' },
    ],
  },
  {
    year: '2022',
    items: [
      { title: 'RLCA 2022 Cumulative Effects Assessment & Lake Health Monitoring Presentation', href: '/documents/agm/Presentation_JKidd_2022.pdf' },
    ],
  },
  {
    year: '2021',
    items: [
      { title: 'RLCA 2021 AGM Presentation (July 7, 2021)', href: '/documents/agm/2021_RLCA_AGM_July_7_2021.pdf' },
      { title: 'RLCA 2021 AGM Video Recording', href: 'https://www.redstonelake.com/association_Docs/2021_RLCA_AGM.mp4', external: true },
    ],
  },
  {
    year: '2020',
    items: [
      { title: 'RLCA 2020 AGM Minutes', href: '/documents/agm/RLCA-2020-AGM-Minutes.pdf' },
      { title: 'RLCA 2020 AGM Video Recording', href: 'https://www.redstonelake.com/Association_Docs/RLCA%202020%20AGM.mp4', external: true },
    ],
  },
]

export default function AgmPage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Annual General Meeting</h1>
        <p className="lead text-muted">
          Minutes, presentations and recordings from our Annual General Meetings
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {agmYears.map(({ year, items }) => (
            <div key={year} className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <h4 className="mb-0 me-3 text-primary">{year}</h4>
                <div className="flex-grow-1" style={{ height: '1px', backgroundColor: '#e5e7eb' }}></div>
              </div>
              {items.map(item => (
                <div key={item.href} className="card lake-card mb-2">
                  <div className="card-body d-flex align-items-center justify-content-between gap-3 py-3">
                    <span>{item.title}</span>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm flex-shrink-0"
                    >
                      {item.external ? 'Watch Video' : item.href.endsWith('.pptx') ? 'Download Slides' : 'View PDF'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="card lake-card mt-5">
            <div className="card-body text-center">
              <h5>Be part of something special. Become a Member today!</h5>
              <p className="text-muted mb-3">Members can attend and vote at our Annual General Meetings.</p>
              <Link href="/membership" className="btn btn-lake-primary">Join RLCA</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
