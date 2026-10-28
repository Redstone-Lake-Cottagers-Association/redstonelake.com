import type { Metadata } from 'next'
import HomeClient from '@/components/HomeClient'
import { getEvents } from '@/lib/events'
import { ORG_NAME, ORG_ACRONYM } from '@/lib/branding'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redstonelake.com'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// Lets Google show the association's name, contact and social profiles in a
// knowledge panel, and the site name above search results
const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: ORG_NAME,
    alternateName: ORG_ACRONYM,
    url: SITE_URL,
    foundingDate: '1961-08-16',
    email: 'communications@redstonelake.com',
    areaServed: 'Redstone group of lakes, Haliburton County, Ontario',
    address: {
      '@type': 'PostalAddress',
      postOfficeBoxNumber: '3',
      addressLocality: 'West Guilford',
      addressRegion: 'ON',
      postalCode: 'K0M 2S0',
      addressCountry: 'CA',
    },
    sameAs: [
      'https://www.facebook.com/RedstoneLakeCottagersAssociation/',
      'https://www.instagram.com/RLCA_Haliburton1/',
      'https://twitter.com/RLCA_Haliburton',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    alternateName: ORG_ACRONYM,
    url: SITE_URL,
  },
]

// Events come from the Google Sheet (approved rows only) — re-fetch every
// 5 minutes so newly approved events appear without a deploy.
export const revalidate = 300

export default async function Home() {
  const events = await getEvents()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeClient events={events} />
    </>
  )
}
