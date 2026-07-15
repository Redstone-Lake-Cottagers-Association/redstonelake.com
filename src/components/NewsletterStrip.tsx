'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Newsletter {
  label: string
  url: string
  title?: string
}

/** Client-side "Latest Newsletters" panel (for use inside client pages like the
 *  homepage). The /news page renders the same panel server-side. */
export default function NewsletterStrip() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])

  useEffect(() => {
    fetch('/api/newsletters')
      .then(res => (res.ok ? res.json() : { newsletters: [] }))
      .then(data => setNewsletters(data.newsletters || []))
      .catch(() => setNewsletters([]))
  }, [])

  if (newsletters.length === 0) return null

  return (
    <div className="card lake-card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-baseline justify-content-between flex-wrap gap-2 mb-2">
          <h5 className="mb-0">📬 Latest Newsletters</h5>
          <Link href="/newsletters" className="small">View the full archive →</Link>
        </div>
        <div className="row g-2">
          {newsletters.map(n => (
            <div key={n.url + n.label} className="col-md-6">
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="d-flex align-items-baseline gap-3 py-2 px-3 rounded border text-decoration-none bg-white newsletter-row h-100"
              >
                <span className="text-muted small text-nowrap" style={{ minWidth: '92px' }}>{n.label}</span>
                <span className="fw-semibold small">{n.title || 'Monthly Newsletter'}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
