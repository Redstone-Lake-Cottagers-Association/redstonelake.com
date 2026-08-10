export const NEWS_TOPICS = [
  {
    slug: 'invasive-species',
    label: 'Invasive Species',
    description: 'Prevention, identification and local action to keep invasive plants and animals out of our lakes.',
  },
  {
    slug: 'shorelines',
    label: 'Shorelines',
    description: 'Naturalization, erosion prevention and practical ways to protect the water’s edge.',
  },
  {
    slug: 'water-quality',
    label: 'Water Quality',
    description: 'Lake health, monitoring, algae, runoff and the science behind clean water.',
  },
  {
    slug: 'wildlife',
    label: 'Wildlife',
    description: 'The birds, fish, pollinators and other wildlife that share our watershed.',
  },
  {
    slug: 'local-government-bylaws',
    label: 'Local Government & Bylaws',
    description: 'Municipal decisions, elections and rules that affect lake-area residents.',
  },
] as const

export type NewsTopicSlug = (typeof NEWS_TOPICS)[number]['slug']
export type NewsTopic = (typeof NEWS_TOPICS)[number]

// This is intentionally curated rather than generated from keywords. A post can
// belong to more than one collection, and unlisted posts remain in the news archive.
const TOPICS_BY_POST: Partial<Record<string, readonly NewsTopicSlug[]>> = {
  'off-season-storage-of-docks-on-public-land': ['local-government-bylaws'],
  'shoreline-naturalization-with-abbey-gardens': ['shorelines', 'water-quality'],
  'warmer-temperatures-lake-health': ['water-quality'],
  'clean-drain-and-dry-your-boat': ['invasive-species', 'water-quality'],
  'fire-ban-fireworks': ['local-government-bylaws'],
  'shoreline-restoration': ['shorelines', 'water-quality'],
  'its-time-to-start-thinking-about-planting': ['shorelines'],
  'rewilding-at-our-cottage': ['shorelines', 'wildlife'],
  'two-cell-towers': ['local-government-bylaws'],
  'shoreline-by-law-approval': ['shorelines', 'local-government-bylaws'],
  'vote-for-your-future-municipal-elections': ['local-government-bylaws'],
  'shoreline-restoration-getting-started': ['shorelines', 'water-quality'],
  'do-you-know-algae': ['water-quality'],
  'pretty-going-up-toxic-coming-down': ['water-quality'],
  'are-lakes-natures-bathtub': ['water-quality'],
  'no-mow-may-or-do-nothing-to-help-the-bees': ['wildlife'],
  'what-is-that-slime': ['water-quality'],
  'get-those-geese-off-your-lawn': ['shorelines', 'wildlife'],
  'fishing-around-the-lake': ['wildlife'],
  'nature-watch-club': ['wildlife'],
  'dont-spread-invasive-species': ['invasive-species', 'water-quality'],
  'watch-your-wake-to-protect-our-shorelines': ['shorelines', 'water-quality'],
  'healthy-shoreline-contest': ['shorelines', 'water-quality'],
  'private-hazard-buoy-initiative': ['local-government-bylaws'],
}

export function getNewsTopic(slug: string) {
  return NEWS_TOPICS.find(topic => topic.slug === slug)
}

export function getTopicsForPost(slug: string): NewsTopic[] {
  const slugs = TOPICS_BY_POST[slug] || []
  return slugs
    .map(topicSlug => getNewsTopic(topicSlug))
    .filter((topic): topic is NewsTopic => Boolean(topic))
}

export function getPostSlugsForTopic(topicSlug: NewsTopicSlug) {
  return Object.entries(TOPICS_BY_POST)
    .filter(([, topicSlugs]) => topicSlugs?.includes(topicSlug))
    .map(([postSlug]) => postSlug)
}
