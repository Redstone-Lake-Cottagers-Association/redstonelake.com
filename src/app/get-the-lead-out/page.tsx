import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME, ORG_ACRONYM } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Get the Lead Out | ${ORG_NAME}`,
  description: 'Lead fishing tackle kills common loons. Trade in your lead weights and tackle for a free limited edition custom lure.',
}

export default function GetTheLeadOutPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="mb-3">Get the Lead Out</h1>
            <p className="lead text-muted">Lead fishing tackle can kill common loons</p>
          </div>

          <div className="card lake-card mb-4">
            <div className="card-body">
              <p>
                A small amount of lead will cause massive, fatal lead poisoning in a loon. It&apos;s a
                terrible death for these legendary birds — and it is so easily avoidable.
              </p>
              <p className="mb-0">
                Loons swallow small stones from the lake bottom to help grind their food, and lost
                lead sinkers and jigs are easily picked up along with them. A single lead sinker is
                enough to poison an adult loon. Switching to non-toxic alternatives (steel, tin,
                tungsten or bismuth) protects the birds our lakes are known for.
              </p>
            </div>
          </div>

          <div className="card lake-card mb-4">
            <div className="card-body text-center">
              <h4 className="mb-2">🎣 Get a FREE Limited Edition Custom Lure</h4>
              <p className="mb-1">
                Turn in your lead fishing weights or tackle at the association&apos;s tackle exchange,
                held at the <Link href="/agm">Annual General Meeting</Link> (Haliburton Forest
                Presentation Building) — and pick up a free custom lure while supplies last.
              </p>
              <p className="text-muted small mb-0">
                Can&apos;t make the AGM? <Link href="/contact">Contact us</Link> and we&apos;ll arrange
                a drop-off. The campaign is led by our Get the Lead Out Campaign Manager, Amanda Bellerby.
              </p>
            </div>
          </div>

          <h5 className="mb-2">Learn more</h5>
          <ul style={{ lineHeight: 2 }}>
            <li>
              <a href="https://fishleadfree.ca/" target="_blank" rel="noopener noreferrer">
                Fish Lead Free — better for our lakes and our loons →
              </a>
            </li>
            <li>
              <a href="https://www.canada.ca/en/environment-climate-change/services/management-toxic-substances/list-canadian-environmental-protection-act/lead/using-more-lead-free-fishing-tackle.html" target="_blank" rel="noopener noreferrer">
                Environment and Climate Change Canada: Moving toward lead-free fishing tackle →
              </a>
            </li>
            <li>
              <Link href="/nature-watch">{ORG_ACRONYM} Nature Watch — share your loon sightings →</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
