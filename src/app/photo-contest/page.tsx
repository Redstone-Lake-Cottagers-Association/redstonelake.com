import LegacyPage, { legacyMetadata } from '@/components/LegacyPage'

export const metadata = { ...legacyMetadata('photo-contest'), alternates: { canonical: '/photo-contest' } }

export default function Page() {
  return <LegacyPage slug="photo-contest" />
}
