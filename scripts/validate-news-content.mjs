import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = process.env.NEWS_CONTENT_ROOT
  ? path.resolve(process.env.NEWS_CONTENT_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function readJson(relativePath) {
  const file = path.join(root, relativePath)
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    console.error(`✗ ${relativePath} is not valid JSON: ${error.message}`)
    process.exit(1)
  }
}

const topics = readJson('src/data/news-topics.json')
const posts = readJson('src/data/news-posts.json')
const index = readJson('src/data/news-index.json')
const errors = []

if (!Array.isArray(posts) || !Array.isArray(index)) {
  console.error('✗ news-posts.json and news-index.json must each contain an array')
  process.exit(1)
}

function findDuplicates(values) {
  const seen = new Set()
  return [...new Set(values.filter(value => seen.has(value) || !seen.add(value)))]
}

if (!Array.isArray(topics) || topics.length === 0) {
  errors.push('news-topics.json must contain at least one topic definition')
}

const topicSlugs = topics.map(topic => topic?.slug)
for (const duplicate of findDuplicates(topicSlugs)) {
  errors.push(`duplicate topic slug: ${JSON.stringify(duplicate)}`)
}

for (const [position, topic] of topics.entries()) {
  if (!topic || typeof topic.slug !== 'string' || !topic.slug) {
    errors.push(`topic ${position + 1} must have a non-empty slug`)
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug)) {
    errors.push(`topic slug must use lowercase words and hyphens: ${JSON.stringify(topic.slug)}`)
  }
  if (typeof topic?.label !== 'string' || !topic.label) {
    errors.push(`topic ${topic?.slug || position + 1} must have a non-empty label`)
  }
  if (typeof topic?.description !== 'string' || !topic.description) {
    errors.push(`topic ${topic?.slug || position + 1} must have a non-empty description`)
  }
}

const allowedTopics = new Set(topicSlugs)
const postSlugs = posts.map(post => post?.slug)
const indexSlugs = index.map(post => post?.slug)

for (const duplicate of findDuplicates(postSlugs)) errors.push(`duplicate article slug in news-posts.json: ${duplicate}`)
for (const duplicate of findDuplicates(indexSlugs)) errors.push(`duplicate article slug in news-index.json: ${duplicate}`)

for (const [position, post] of posts.entries()) {
  const name = post?.slug || `article ${position + 1}`
  if (!post || typeof post.slug !== 'string' || !post.slug) {
    errors.push(`article ${position + 1} in news-posts.json must have a non-empty slug`)
    continue
  }
  if (!Object.hasOwn(post, 'topics')) {
    errors.push(`${name} is missing topics; use [] when no collection applies`)
    continue
  }
  if (!Array.isArray(post.topics)) {
    errors.push(`${name} topics must be an array`)
    continue
  }
  for (const duplicate of findDuplicates(post.topics)) {
    errors.push(`${name} repeats topic ${JSON.stringify(duplicate)}`)
  }
  for (const topicSlug of post.topics) {
    if (typeof topicSlug !== 'string' || !allowedTopics.has(topicSlug)) {
      errors.push(`${name} uses unknown topic ${JSON.stringify(topicSlug)}`)
    }
  }
}

const postSlugSet = new Set(postSlugs)
const indexSlugSet = new Set(indexSlugs)
for (const slug of postSlugSet) {
  if (!indexSlugSet.has(slug)) errors.push(`${slug} is missing from news-index.json`)
}
for (const slug of indexSlugSet) {
  if (!postSlugSet.has(slug)) errors.push(`${slug} is missing from news-posts.json`)
}

if (errors.length > 0) {
  console.error(`News content validation failed with ${errors.length} error${errors.length === 1 ? '' : 's'}:`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

const assigned = posts.filter(post => post.topics.length > 0).length
console.log(`✓ Validated ${posts.length} articles and ${topics.length} topics (${assigned} articles classified)`)
