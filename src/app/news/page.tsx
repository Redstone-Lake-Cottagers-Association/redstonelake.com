import Link from 'next/link'
import type { Metadata } from 'next'
import posts from '@/data/news-index.json'
import eventsData from '@/data/events.json'
import NewsExplorer from '@/components/NewsExplorer'
import { getLatestNewsletters, NEWSLETTER_REVALIDATE } from '@/lib/newsletters'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `News & Articles | ${ORG_NAME}`,
  description: `Community news, conservation insights and updates from the ${ORG_NAME}.`,
}

export const revalidate = NEWSLETTER_REVALIDATE

export default async function NewsPage() {
  const latestNewsletters = await getLatestNewsletters(4)
  const allNewsletters = await getLatestNewsletters(200)
  const now = Date.now()
  const upcomingEvents = (eventsData as { id: number; title: string; date: string; icon: string }[])
    .filter(e => new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">News & Articles</h1>
        <p className="lead text-muted">
          Community news, conservation insights and updates from around our lakes
        </p>
      </div>

      <NewsExplorer
        posts={posts}
        newsletters={allNewsletters.map(n => ({ label: n.label, url: n.url, title: n.title }))}
        events={(eventsData as any[]).map(e => ({ id: e.id, title: e.title, date: e.date, icon: e.icon, type: e.type, description: e.description }))}
      >
      {/* Events strip — the events calendar lives at /events */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card lake-card">
            <div className="card-body py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div style={{ minWidth: 0 }}>
                <span className="fw-semibold me-2">📅 Events</span>
                {upcomingEvents.length > 0 ? (
                  <span className="text-muted small">
                    Next up:{' '}
                    {upcomingEvents.map((e, i) => (
                      <span key={e.id}>
                        {i > 0 && ' · '}
                        {e.icon} {e.title} ({new Date(e.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })})
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-muted small">No upcoming events on the calendar right now.</span>
                )}
              </div>
              <Link href="/events" className="small fw-semibold flex-shrink-0">All events →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Latest newsletters — pulled live from the Mailchimp archive */}
      {latestNewsletters.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="card lake-card">
              <div className="card-body">
                <div className="d-flex align-items-baseline justify-content-between flex-wrap gap-2 mb-2">
                  <h5 className="mb-0">📬 Latest Newsletters</h5>
                  <Link href="/newsletters" className="small">View the full archive →</Link>
                </div>
                <div className="row g-2">
                  {latestNewsletters.map(n => (
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

      </NewsExplorer>
    </div>
  )
}
