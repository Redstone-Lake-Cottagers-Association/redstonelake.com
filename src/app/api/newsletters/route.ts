import { NextResponse } from 'next/server'
import { getLatestNewsletters, NEWSLETTER_REVALIDATE } from '@/lib/newsletters'
import { newsletterId } from '@/lib/newsletter-id'

export const revalidate = NEWSLETTER_REVALIDATE

export async function GET() {
  const newsletters = await getLatestNewsletters(4)
  return NextResponse.json(
    {
      newsletters: newsletters.map(newsletter => ({
        ...newsletter,
        href: `/newsletters/${newsletterId(newsletter.label, newsletter.url)}`,
      })),
    },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=21600' } }
  )
}
