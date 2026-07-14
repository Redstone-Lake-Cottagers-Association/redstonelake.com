import LegacyPage, { legacyMetadata } from '@/components/LegacyPage'

export const metadata = legacyMetadata('initiatives')

export default function Page() {
  return <LegacyPage slug="initiatives" />
}
