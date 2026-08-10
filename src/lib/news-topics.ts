import topics from '@/data/news-topics.json'

export interface NewsTopic {
  slug: string
  label: string
  description: string
}

export interface TopicPost {
  topics: string[]
}

export const NEWS_TOPICS = topics as NewsTopic[]

export function getNewsTopic(slug: string) {
  return NEWS_TOPICS.find(topic => topic.slug === slug)
}

export function getTopicsForPost(post: TopicPost): NewsTopic[] {
  return post.topics
    .map(topicSlug => getNewsTopic(topicSlug))
    .filter((topic): topic is NewsTopic => Boolean(topic))
}
