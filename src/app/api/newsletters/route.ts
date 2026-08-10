import { NextResponse } from 'next/server'
import { getLatestNewsletters } from '@/lib/newsletters'
import { newsletterId } from '@/lib/newsletter-id'

// Fly injects the optional Mailchimp API key at runtime, after the image build.
export const dynamic = 'force-dynamic'

export async function GET() {
  const newsletters = await getLatestNewsletters(4)
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
