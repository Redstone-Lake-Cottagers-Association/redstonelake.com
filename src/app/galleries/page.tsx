import LegacyPage, { legacyMetadata } from '@/components/LegacyPage'

export const metadata = { ...legacyMetadata('media-galleries'), alternates: { canonical: '/galleries' } }

export default function Page() {
  return <LegacyPage slug="media-galleries" />
}
