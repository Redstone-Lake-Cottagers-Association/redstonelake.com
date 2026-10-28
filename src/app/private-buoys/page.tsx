import LegacyPage, { legacyMetadata } from '@/components/LegacyPage'

export const metadata = { ...legacyMetadata('private-buoys'), alternates: { canonical: '/private-buoys' } }

export default function Page() {
  return <LegacyPage slug="private-buoys" />
}
