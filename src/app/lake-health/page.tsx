import Link from 'next/link'
import type { Metadata } from 'next'
import LakeHealthExplorer from '@/components/LakeHealthExplorer'
import { ORG_NAME } from '@/lib/branding'

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
        <p className="lead text-muted mx-auto" style={{ maxWidth: '680px' }}>
          Decades of water quality measurements for our seven lakes, collected by volunteers through
          the province&apos;s Lake Partner Program. Pick a lake to explore its record.
        </p>
      </div>

      <LakeHealthExplorer />

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
              annually; the current release covers data through 2024. Live lake levels are on our{' '}
              <Link href="/#water-level-monitor">water level monitor</Link>.
              Want to volunteer as a sampler? <Link href="/contact">Contact us</Link> — more hands
              mean better coverage for the smaller lakes.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
