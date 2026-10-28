import LegacyPage, { legacyMetadata } from '@/components/LegacyPage'

export const metadata = { ...legacyMetadata('septic-systems-information'), alternates: { canonical: '/septic-systems' } }

export default function Page() {
  return <LegacyPage slug="septic-systems-information" />
}
