import LegacyPage, { legacyMetadata } from '@/components/LegacyPage'

export const metadata = legacyMetadata('volunteers')

export default function Page() {
  return <LegacyPage slug="volunteers" />
}
