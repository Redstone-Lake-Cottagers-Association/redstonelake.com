import Link from 'next/link'
import { notFound } from 'next/navigation'
import posts from '@/data/news-posts.json'
import { ORG_NAME } from '@/lib/branding'
import { getTopicsForPost } from '@/lib/news-topics'

interface Props {
  params: { slug: string }
}


// Articles reached from the homepage "Essential Lake Protection" section
const LAKE_PROTECTION_SLUGS = new Set([
  'clean-drain-and-dry-your-boat',
  'watch-your-wake-to-protect-our-shorelines',
  'fishing-around-the-lake',
  'shoreline-naturalization-with-abbey-gardens',
])

export function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }))
}

export function generateMetadata({ params }: Props) {
  const post = posts.find(p => p.slug === params.slug)
  if (!post) return {}
  return {
    title: `${post.title.replace(/&#\d+;|&[a-z]+;/g, '')} | ${ORG_NAME}`,
    description: post.excerpt,
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NewsArticle({ params }: Props) {
  const post = posts.find(p => p.slug === params.slug)
  if (!post) notFound()

  const isProtection = LAKE_PROTECTION_SLUGS.has(params.slug)
  const topics = getTopicsForPost(params.slug)
  const backHref = isProtection ? '/#essential-lake-protection' : '/news'
  const backLabel = isProtection ? '← Back to Lake Protection' : '← Back to News'

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <Link href={backHref} className="d-inline-block mb-4">{backLabel}</Link>

          <article>
            <h1 className="display-5 mb-2" dangerouslySetInnerHTML={{ __html: post.title }} />
            <div className="d-flex align-items-center gap-3 text-muted mb-4">
              <small>{formatDate(post.date)}</small>
              {post.categories.map(cat => (
                <span key={cat} className="badge bg-light text-dark border">{cat}</span>
              ))}
            </div>

            {topics.length > 0 && (
              <div className="d-flex align-items-center flex-wrap gap-2 mb-4" aria-label="Article topics">
                <span className="small text-muted me-1">Topics:</span>
                {topics.map(topic => (
                  <Link
                    key={topic.slug}
                    href={`/news/topics/${topic.slug}`}
                    className="badge rounded-pill bg-primary text-white text-decoration-none"
                  >
                    {topic.label}
                  </Link>
                ))}
              </div>
            )}

            {post.featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.featuredImage}
                alt=""
                className="img-fluid rounded mb-4"
              />
            )}

            <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          <hr className="my-5" />
          <div className="text-center">
            <Link href={backHref} className="btn btn-outline-primary">{backLabel}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
