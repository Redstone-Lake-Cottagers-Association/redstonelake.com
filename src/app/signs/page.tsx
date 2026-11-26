import Link from 'next/link'
import type { Metadata } from 'next'
import signs from '@/data/signs.json'

export const metadata: Metadata = {
  title: 'Signs | Redstone Area Lakes Association',
  description:
    'Print-ready and editable files for Redstone Area Lakes Association (RALA) signs, with every version kept for reprints and updates.',
  alternates: { canonical: '/signs' },
}

type Version = { date: string; status: string; notes: string }

// Every version lives in its own dated folder: public/signs/<slug>/<date>/
function files(slug: string, date: string) {
  const dir = `/signs/${slug}/${date}`
  const base = `${dir}/${slug}-${date}`
  return {
    preview: `${dir}/preview.png`,
    pdf: `${base}.pdf`,
    svg: `${base}.svg`,
    png: `${base}.png`,
    zip: `${base}-source.zip`,
    html: `${dir}/source/${slug}.html?px=14`,
  }
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

const STATUS_CLASS: Record<string, string> = {
  Draft: 'text-bg-warning',
  Approved: 'text-bg-success',
  Installed: 'text-bg-primary',
  Retired: 'text-bg-secondary',
}

export default function SignsPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h1 className="mb-3">Signs</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '680px' }}>
              Print-ready files and editable sources for the Association&rsquo;s signs. Every
              version is kept here, so we can reprint a sign, update it, or see how it changed.
            </p>
          </div>

          {signs.map(sign => {
            const versions = [...(sign.versions as Version[])].sort((a, b) => b.date.localeCompare(a.date))
            const latest = versions[0]
            const f = files(sign.slug, latest.date)
            return (
              <div key={sign.slug} className="card lake-card mb-5" id={sign.slug}>
                <div className="sign-preview">
                  <img
                    src={f.preview}
                    alt={`${sign.name}, ${latest.status.toLowerCase()} of ${formatDate(latest.date)}`}
                  />
                </div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                    <h2 className="h4 mb-0">{sign.name}</h2>
                    <span className={`badge ${STATUS_CLASS[latest.status] ?? 'text-bg-light border'}`}>
                      {latest.status}
                    </span>
                  </div>
                  <p className="small text-muted mb-3">
                    {formatDate(latest.date)} · {sign.size}
                  </p>
                  <p className="mb-4">{sign.summary}</p>

                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <a href={f.pdf} className="btn btn-lake-primary btn-sm" download>
                      Print PDF (vector)
                    </a>
                    <a href={f.svg} className="btn btn-outline-primary btn-sm" download>
                      SVG (vector)
                    </a>
                    <a href={f.png} className="btn btn-outline-primary btn-sm" download>
                      PNG image
                    </a>
                    <a href={f.zip} className="btn btn-outline-primary btn-sm" download>
                      Editable HTML (ZIP)
                    </a>
                    <a href={f.html} className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener">
                      View HTML
                    </a>
                  </div>
                  <p className="small text-muted mb-4">
                    The PDF and SVG are all vector, with the text converted to shapes, ready for a
                    sign shop. The ZIP has the HTML source, emblem and font, plus a README on how
                    to edit the wording and make a new print file.
                  </p>

                  <h3 className="h6 text-uppercase text-muted mb-2">Version history</h3>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Status</th>
                          <th scope="col">What changed</th>
                          <th scope="col">Files</th>
                        </tr>
                      </thead>
                      <tbody>
                        {versions.map(v => {
                          const vf = files(sign.slug, v.date)
                          return (
                            <tr key={v.date}>
                              <td className="text-nowrap">{formatDate(v.date)}</td>
                              <td>
                                <span className={`badge ${STATUS_CLASS[v.status] ?? 'text-bg-light border'}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="small">{v.notes}</td>
                              <td className="small text-nowrap">
                                <a href={vf.pdf} download>PDF</a> · <a href={vf.svg} download>SVG</a> ·{' '}
                                <a href={vf.zip} download>HTML</a>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="border-top pt-4">
            <h2 className="h5 mb-2">Logos for signs</h2>
            <p className="small text-muted mb-0">
              The vector lake scene emblem, our logos and brand colours are in the{' '}
              <Link href="/media-package">Media Package</Link>. Questions about a sign? Email{' '}
              <a href="mailto:communications@redstonelake.com">communications@redstonelake.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
