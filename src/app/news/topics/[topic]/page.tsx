import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import posts from '@/data/news-index.json'
import NewsCard from '@/components/NewsCard'
import {
  NEWS_TOPICS,
  getNewsTopic,
  getPostSlugsForTopic,
  type NewsTopicSlug,
} from '@/lib/news-topics'
import { ORG_NAME } from '@/lib/branding'

interface Props {
  params: { topic: string }
}

export function generateStaticParams() {
  return NEWS_TOPICS.map(topic => ({ topic: topic.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const topic = getNewsTopic(params.topic)
  if (!topic) return {}

  return {
    title: `${topic.label} | News | ${ORG_NAME}`,
    description: topic.description,
  }
}

export default function NewsTopicPage({ params }: Props) {
  const topic = getNewsTopic(params.topic)
  if (!topic) notFound()

  const postSlugs = new Set(getPostSlugsForTopic(topic.slug as NewsTopicSlug))
  const topicPosts = posts.filter(post => postSlugs.has(post.slug))

  return (
    <div className="container py-5">
      <Link href="/news" className="d-inline-block mb-4">← All news and topics</Link>

      <div className="row justify-content-center text-center mb-5">
        <div className="col-lg-8">
          <p className="text-uppercase text-primary fw-semibold small mb-2">Topic collection</p>
          <h1 className="display-4 mb-3">{topic.label}</h1>
          <p className="lead text-muted mb-2">{topic.description}</p>
          <p className="small text-muted mb-0">
            {topicPosts.length} article{topicPosts.length === 1 ? '' : 's'} in this collection
          </p>
        </div>
      </div>

      <div className="row g-4">
        {topicPosts.map(post => (
          <div key={post.slug} className="col-md-6 col-lg-4 d-flex">
            <NewsCard post={post} />
          </div>
        ))}
      </div>
    </div>
  )
}
