import HomeClient from '@/components/HomeClient'
import { getEvents } from '@/lib/events'

// Events come from the Google Sheet (approved rows only) — re-fetch every
// 5 minutes so newly approved events appear without a deploy.
export const revalidate = 300

export default async function Home() {
  const events = await getEvents()
  return <HomeClient events={events} />
}
