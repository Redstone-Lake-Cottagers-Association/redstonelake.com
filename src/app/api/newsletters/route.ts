import { NextResponse } from 'next/server'
import { getLatestNewsletters } from '@/lib/newsletters'
import { newsletterId } from '@/lib/newsletter-id'

// Fly injects the optional Mailchimp API key at runtime, after the image build.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestedCount = Number(new URL(request.url).searchParams.get('count') || 4)
  const count = Number.isInteger(requestedCount) ? Math.min(Math.max(requestedCount, 1), 4) : 4
  const newsletters = await getLatestNewsletters(count)
  return NextResponse.json(
    {
      newsletters: newsletters.map(newsletter => ({
        ...newsletter,
        href: `/newsletters/${newsletterId(newsletter.label, newsletter.url, newsletter.campaignId)}`,
      })),
    },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=21600' } }
  )
}
