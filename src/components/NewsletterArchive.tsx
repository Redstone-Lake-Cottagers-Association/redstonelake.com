'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export interface NewsletterArchiveItem {
  label: string
  year: number
  url: string
  title?: string
  available?: boolean
  href?: string
}

export default function NewsletterArchive({ newsletters }: { newsletters: NewsletterArchiveItem[] }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!normalizedQuery) return newsletters
    const terms = normalizedQuery.split(/\s+/)
    return newsletters.filter(newsletter => {
      const text = `${newsletter.label} ${newsletter.title || 'Monthly Newsletter'}`.toLowerCase()
      return terms.every(term => text.includes(term))
    })
  }, [newsletters, normalizedQuery])

  const years = Array.from(new Set(filtered.map(newsletter => newsletter.year))).sort((a, b) => b - a)

  return (
    <div>
      <div className="position-relative mb-2">
        <input
          type="search"
          className="form-control form-control-lg"
          placeholder="Search newsletters by date or title…"
          aria-label="Search newsletters by date or title"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-decoration-none"
            onClick={() => setQuery('')}
          >
            Clear
          </button>
        )}
      </div>

      <p className="small text-muted mb-4" aria-live="polite">
        {normalizedQuery
          ? `${filtered.length} newsletter${filtered.length === 1 ? '' : 's'} match “${query.trim()}”`
          : `${newsletters.length} newsletters in the archive`}
      </p>

      {years.map(year => (
        <section key={year} className="mb-4" aria-labelledby={`newsletter-year-${year}`}>
          <div className="d-flex align-items-center mb-3">
            <h2 id={`newsletter-year-${year}`} className="h4 mb-0 me-3 text-primary">{year}</h2>
            <div className="flex-grow-1 border-top" />
          </div>
          <div>
            {filtered
              .filter(newsletter => newsletter.year === year)
              .map(newsletter => {
                const content = (
                  <>
                    <span className="text-muted small text-nowrap" style={{ minWidth: '120px' }}>
                      {newsletter.label}
                    </span>
                    <span className="fw-semibold flex-grow-1">
                      {newsletter.title || 'Monthly Newsletter'}
                    </span>
                    {newsletter.available === false ? (
                      <span className="badge bg-light text-muted border">Link unavailable</span>
                    ) : (
                      <span className="small text-muted text-nowrap">Read issue →</span>
                    )}
                  </>
                )

                if (newsletter.available === false || !newsletter.href) {
                  return (
                    <div
                      key={`${newsletter.label}-${newsletter.url}`}
                      className="d-flex align-items-baseline flex-wrap gap-3 py-2 px-3 mb-1 rounded border bg-light"
                    >
                      {content}
                    </div>
                  )
                }

                return (
                  <Link
                    key={`${newsletter.label}-${newsletter.url}`}
                    href={newsletter.href}
                    target="_blank"
                    className="d-flex align-items-baseline flex-wrap gap-3 py-2 px-3 mb-1 rounded border text-decoration-none bg-white newsletter-row"
                  >
                    {content}
                  </Link>
                )
              })}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-5">
          <h2 className="h5 mb-2">No newsletters found</h2>
          <p className="text-muted mb-3">Try a month, year or a word from the issue title.</p>
          <button type="button" className="btn btn-outline-primary" onClick={() => setQuery('')}>
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}
