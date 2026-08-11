import HomeClient from '@/components/HomeClient'
import { getEvents } from '@/lib/events'
import { newsletterId } from '@/lib/newsletter-id'
import { getLatestNewsletters } from '@/lib/newsletters'

// Events come from the Google Sheet (approved rows only) — re-fetch every
// 5 minutes so newly approved events appear without a deploy.
export const revalidate = 300

export default async function Home() {
  const [events, newsletters] = await Promise.all([
    getEvents(),
    getLatestNewsletters(1),
  ])
  const newsletter = newsletters[0]
  const latestNewsletter = newsletter
    ? {
        title: newsletter.title,
        dateMs: newsletter.dateMs,
        href: `/newsletters/${newsletterId(newsletter.label, newsletter.url, newsletter.campaignId)}`,
      }
    : null

  return <HomeClient events={events} latestNewsletter={latestNewsletter} />
}
