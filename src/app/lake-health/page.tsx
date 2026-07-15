import Link from 'next/link'
import type { Metadata } from 'next'
import LakeHealthExplorer from '@/components/LakeHealthExplorer'
import LakeHealthSummary, { GuidelinesAndSources } from '@/components/LakeHealthSummary'
import WaterLevelComponent from '@/components/WaterLevelComponent'
import { ORG_NAME } from '@/lib/branding'
import { SUMMARY_2025 } from '@/lib/water-guidelines'

export const metadata: Metadata = {
  title: `Lake Health Data | ${ORG_NAME}`,
  description:
    'Decades of provincial water quality data for the Redstone group of lakes — phosphorus, water clarity, calcium, chloride and sulphate from the Ontario Lake Partner Program.',
}

export default function LakeHealthPage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="mb-3">Lake Health Data</h1>
        <p className="lead text-muted mx-auto mb-2" style={{ maxWidth: '680px' }}>
          Nearly 30 years of water quality readings on our seven lakes, taken by volunteer
          stewards through Ontario&apos;s Lake Partner Program.
        </p>
        <p className="text-muted mx-auto mb-2" style={{ maxWidth: '680px' }}>
          {SUMMARY_2025}
        </p>
        <p className="small mb-0">
          <Link href="/lake-map">Explore the lakes on our interactive map →</Link>
        </p>
      </div>

      <div className="row justify-content-center mb-5">
        <div className="col-lg-10">
          <div className="card lake-card">
            <div className="card-body">
              <h4 className="mb-1 text-center">The latest readings at a glance</h4>
              <p className="text-muted small text-center mb-3">
                Each lake&apos;s most recent reading, classified against published guidelines —
                hover any value for details, or read the{' '}
                <a href="#guidelines">full guidelines and citations</a>.
              </p>
              <LakeHealthSummary />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-4 pt-3" id="explore">
        <h2 className="mb-2">Explore Each Lake&apos;s Record</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: '620px' }}>
          Pick a lake to see every measurement since the 1990s, charted — with our lake
          steward&apos;s notes on what stands out.
        </p>
      </div>
      <LakeHealthExplorer />

      <div className="row justify-content-center mt-5">
        <div className="col-lg-10">
          <GuidelinesAndSources />
        </div>
      </div>

      <div className="mt-5" id="water-level">
        <div className="text-center mb-4">
          <h2 className="mb-2">Live Water Level</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '620px' }}>
            Current and historical Redstone Lake water levels, updated continuously from the
            Parks Canada gauge.
          </p>
        </div>
        <WaterLevelComponent showHeader={false} />
      </div>

      <div className="row justify-content-center mt-4">
        <div className="col-lg-8">
          <div className="card lake-card">
            <div className="card-body small text-muted">
              <strong className="text-dark">About this data.</strong> Measurements come from the{' '}
              <a href="https://data.ontario.ca/dataset/ontario-lake-partner" target="_blank" rel="noopener noreferrer">
                Ontario Lake Partner
              </a>{' '}
              open dataset (Ministry of the Environment, Conservation and Parks), collected by volunteer
              samplers on each lake and analyzed at the Dorset Environmental Science Centre. Samples
              flagged as possible outliers by the ministry are excluded. The dataset is updated
              annually; the current release covers data through 2024.
              Want to volunteer as a sampler? <Link href="/contact">Contact us</Link> — more hands
              mean better coverage for the smaller lakes.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
