import Link from 'next/link'

interface NewsCardPost {
  slug: string
  title: string
  date: string
  excerpt: string
  featuredImage?: string | null
}

// Deterministic per-post fallback art for posts without a featured image,
// drawn from the lake palette so cards stay uniform in a grid.
const FALLBACKS = [
  { emoji: '🌊', gradient: 'linear-gradient(150deg, #14536b 0%, #0369a1 100%)' },
  { emoji: '🌲', gradient: 'linear-gradient(150deg, #2f7d5c 0%, #0f766e 100%)' },
  { emoji: '🛶', gradient: 'linear-gradient(150deg, #0369a1 0%, #0f766e 100%)' },
  { emoji: '🦆', gradient: 'linear-gradient(150deg, #102e40 0%, #14536b 100%)' },
]

function fallbackFor(slug: string) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0
  return FALLBACKS[Math.abs(hash) % FALLBACKS.length]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Note: .lake-card .card-img-top height is fixed at 200px by globals.css
export default function NewsCard({ post, imageHeight = 200 }: { post: NewsCardPost; imageHeight?: number }) {
  const fallback = fallbackFor(post.slug)

  return (
    <div className="card lake-card h-100 w-100">
      {post.featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featuredImage}
          alt=""
          className="card-img-top"
          style={{ height: `${imageHeight}px`, objectFit: 'cover' }}
        />
      ) : (
        <div
          className="card-img-top d-flex align-items-center justify-content-center"
          aria-hidden="true"
          style={{ height: `${imageHeight}px`, background: fallback.gradient }}
        >
          <span style={{ fontSize: '2.4rem', filter: 'saturate(0.9)' }}>{fallback.emoji}</span>
        </div>
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-1">
          <Link href={`/news/${post.slug}`} className="stretched-link text-decoration-none" style={{ color: 'inherit' }}>
            {post.title}
          </Link>
        </h5>
        <small className="text-muted mb-2">{formatDate(post.date)}</small>
        <p className="text-muted small flex-grow-1 mb-2">{post.excerpt}</p>
        <span className="fw-semibold small" style={{ color: '#0369a1' }}>Read Full Article →</span>
      </div>
    </div>
  )
}
