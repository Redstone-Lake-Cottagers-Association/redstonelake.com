'use client'

import { useMemo, useState } from 'react'
import NewsCard from '@/components/NewsCard'

interface Newsletter {
  label: string
  url: string
  title?: string
}

interface EventItem {
  id: number
  title: string
  date: string
  time?: string
  location?: string
  icon: string
  type: string
  description: string
}

// Google-style in-place filtering: typing filters the article grid itself
// (and surfaces matching newsletters); clearing restores the full page.
// The sections passed as children (events strip, latest newsletters) step
// aside while a search is active.
export default function NewsExplorer({
  posts,
  newsletters,
  events,
  children,
}: {
  posts: any[]
  newsletters: Newsletter[]
  events: EventItem[]
  children: React.ReactNode
}) {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const searching = query.length >= 2

  const filtered = useMemo(() => {
    if (!searching) return { posts, newsletters: [] as Newsletter[], events: [] as EventItem[] }
    const terms = query.split(/\s+/)
    const match = (text: string) => {
      const t = text.toLowerCase()
      return terms.every(term => t.includes(term))
    }
    return {
      posts: posts.filter(p => match(`${p.title} ${p.excerpt || ''}`)),
      newsletters: newsletters.filter(n => match(`${n.label} ${n.title || ''}`)),
      events: events.filter(e => match(`${e.title} ${e.description} ${e.type} ${e.location || ''}`)),
    }
  }, [searching, query, posts, newsletters, events])

  const nothingFound =
    searching && filtered.posts.length === 0 && filtered.newsletters.length === 0 && filtered.events.length === 0

  return (
    <div>
      <div className="row justify-content-center mb-4">
        <div className="col-lg-8">
          <div className="position-relative">
            <input
              type="search"
              className="form-control form-control-lg"
              placeholder="Search articles & newsletters…"
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Search articles and newsletters"
            />
            {searching && (
              <button
                type="button"
                className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-decoration-none"
                onClick={() => setQ('')}
              >
                Clear
              </button>
            )}
          </div>
          {/* fixed-height meta line: its text changes but the layout doesn't */}
          <div className="small text-muted mt-1" style={{ minHeight: '20px' }}>
            {searching
              ? `${filtered.posts.length} article${filtered.posts.length === 1 ? '' : 's'}, ${filtered.newsletters.length} newsletter${filtered.newsletters.length === 1 ? '' : 's'} and ${filtered.events.length} event${filtered.events.length === 1 ? '' : 's'} match "${q.trim()}"`
              : `Search ${posts.length} articles, ${newsletters.length} newsletters and ${events.length} events`}
          </div>
        </div>
      </div>

      {!searching && children}

      {searching && filtered.events.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card lake-card">
              <div className="card-body py-3">
                <h6 className="mb-2">📅 Matching events</h6>
                {filtered.events.slice(0, 5).map(e => (
                  <div key={e.id} className="d-flex align-items-baseline gap-2 py-1 flex-wrap">
                    <span>{e.icon}</span>
                    <a href="/events" className="fw-semibold small">{e.title}</a>
                    <span className="text-muted small">{e.date} · {e.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {searching && filtered.newsletters.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card lake-card">
              <div className="card-body py-3">
                <h6 className="mb-2">📬 Matching newsletters</h6>
                <div className="row g-2">
                  {filtered.newsletters.slice(0, 8).map(n => (
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
          </div>
        </div>
      )}

      {nothingFound ? (
        <div className="text-center py-5">
          <div className="fs-1 mb-2" aria-hidden="true">🔍</div>
          <h5 className="mb-2">Nothing found for &ldquo;{q.trim()}&rdquo;</h5>
          <p className="text-muted mb-3">Try a different word, or browse everything below.</p>
          <button type="button" className="btn btn-outline-primary" onClick={() => setQ('')}>
            Clear search &amp; show all
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.posts.map(post => (
            <div key={post.slug} className="col-md-6 col-lg-4 d-flex">
              <NewsCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
