import { NextResponse } from 'next/server'
import { getLatestNewsletters, NEWSLETTER_REVALIDATE } from '@/lib/newsletters'

export const revalidate = NEWSLETTER_REVALIDATE

export async function GET() {
  const newsletters = await getLatestNewsletters(4)
  return NextResponse.json(
    { newsletters },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=21600' } }
  )
}
