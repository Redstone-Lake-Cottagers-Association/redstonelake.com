import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Governing Documents | Redstone Area Lakes Association',
  description: 'RLCA governing documents — letters patent, by-laws, amendments and resolutions dating back to 1961.',
}

const documents = [
  {
    title: '2023 Amendments to Articles of Incorporation',
    file: '/documents/governance/Articles-of-Amendment-Final-Version.pdf',
    description: 'Articles of Amendment, final version (2023).',
  },
  {
    title: '2023 New By-Law No. 1',
    file: '/documents/governance/RLCA-2023-By-Law-No.-1-Final-Version.pdf',
    description: 'RLCA By-Law No. 1, final version enacted in 2023.',
  },
  {
    title: 'Amendment to By-Law No. 1 enacted May 26, 2018 (Certified Copy)',
    file: '/documents/governance/Revised_Amendment_to_By-law_No_1_final_certified.pdf',
    description: 'Certified copy of the 2018 amendment to By-Law No. 1.',
  },
  {
    title: 'Extraordinary Resolution passed July 14, 2018 (Certified Copy)',
    file: '/documents/governance/Extraordinary_Resolution_final_certified.pdf',
    description: 'Certified copy of the extraordinary resolution passed by the membership.',
  },
  {
    title: 'Letters Patent issued August 16, 1961',
    file: '/documents/governance/RLCA_Incorporation.pdf',
    description: 'The original incorporation of the Redstone Lake Cottagers Association.',
  },
  {
    title: 'By-Law No. 1 dated July 29, 1961',
    file: '/documents/governance/RLCA_By-laws_29_July_1961.pdf',
    description: 'The association’s original by-laws from 1961.',
  },
]

export default function GovernancePage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Governing Documents</h1>
        <p className="lead text-muted">We have been making history since 1961</p>
        <p className="text-muted">
          We have kept the original documents to share with you. Click any document below to view or download the PDF.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {documents.map(doc => (
            <div key={doc.file} className="card lake-card mb-3">
              <div className="card-body d-flex align-items-center justify-content-between gap-3">
                <div>
                  <h5 className="card-title mb-1">{doc.title}</h5>
                  <p className="text-muted mb-0">{doc.description}</p>
                </div>
                <a
                  href={doc.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lake-primary flex-shrink-0"
                >
                  View PDF
                </a>
              </div>
            </div>
          ))}

          <div className="card lake-card mt-4">
            <div className="card-body text-center">
              <h5>Looking for meeting records?</h5>
              <p className="text-muted mb-3">
                Minutes and presentations from our Annual General Meetings are archived separately.
              </p>
              <Link href="/agm" className="btn btn-outline-primary">Annual General Meeting Archive</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
