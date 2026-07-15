import Link from 'next/link'
import type { Metadata } from 'next'
import posts from '@/data/news-index.json'
import NewsCard from '@/components/NewsCard'
import { getLatestNewsletters, NEWSLETTER_REVALIDATE } from '@/lib/newsletters'

export const metadata: Metadata = {
  title: 'News & Articles | Redstone Area Lakes Association',
  description: 'Community news, conservation insights and updates from the Redstone Area Lakes Association.',
}

export const revalidate = NEWSLETTER_REVALIDATE

export default async function NewsPage() {
  const latestNewsletters = await getLatestNewsletters(4)

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">News & Articles</h1>
        <p className="lead text-muted">
          Community news, conservation insights and updates from around our lakes
        </p>
      </div>

      {/* Latest newsletters — pulled live from the Mailchimp archive */}
      {latestNewsletters.length > 0 && (
        <div className="row justify-content-center mb-5">
          <div className="col-lg-10">
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

      <div className="row g-4">
        {posts.map(post => (
          <div key={post.slug} className="col-md-6 col-lg-4 d-flex">
            <NewsCard post={post} />
          </div>
        ))}
      </div>
    </div>
  )
}
