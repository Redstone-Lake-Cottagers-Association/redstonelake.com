import Link from 'next/link'
import type { Metadata } from 'next'
import posts from '@/data/news-index.json'

export const metadata: Metadata = {
  title: 'News & Articles | Redstone Area Lakes Association',
  description: 'Community news, conservation insights and updates from the Redstone Area Lakes Association.',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NewsPage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">News & Articles</h1>
        <p className="lead text-muted">
          Community news, conservation insights and updates from around our lakes
        </p>
      </div>

      <div className="row g-4">
        {posts.map(post => (
          <div key={post.slug} className="col-md-6 col-lg-4 d-flex">
            <div className="card lake-card h-100 w-100">
              {post.featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.featuredImage}
                  alt=""
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{post.title}</h5>
                <small className="text-muted mb-2">{formatDate(post.date)}</small>
                <p className="text-muted flex-grow-1">{post.excerpt}</p>
                <Link href={`/news/${post.slug}`} className="fw-semibold">
                  Read Full Article →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
