import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Healthy Shoreline | ${ORG_NAME}`,
  description:
    'Why a naturalized shoreline is the best thing you can do for the lake — and where to find native plants in Haliburton.',
}

const SOURCES = [
  {
    logo: '/images/pages/healthy-shoreline/AbbeyGardens-NewTagline_4.png',
    name: 'Abbey Gardens',
    text: 'Native garden kits — Open Shoreline, Forest Garden and Pollinator — sold each spring in West Guilford. Our partner for shoreline naturalization.',
    href: 'https://abbeygardens.ca/',
    label: 'abbeygardens.ca',
  },
  {
    logo: '/images/pages/healthy-shoreline/feel-logo_3-no-text.png',
    name: 'Friends of Ecological and Environmental Learning (FEEL)',
    text: 'Annual spring native plant sale — trees, shrubs and wildflower perennials, plus themed bundles like the Shoreline Shrub bundle.',
    href: 'https://www.ecoenvirolearn.org/',
    label: 'ecoenvirolearn.org',
  },
  {
    logo: '/images/pages/healthy-shoreline/CRLogo_lg_textheading-5.png',
    name: 'Country Rose Flowers & Garden',
    text: 'Year-round garden centre stocking a range of native species. 13513 Hwy 118 W, Haliburton · 705-457-3774.',
    href: 'https://countryroseflowers.ca/',
    label: 'countryroseflowers.ca',
  },
  {
    logo: '/images/pages/healthy-shoreline/grow-wild-logo-1.png',
    name: 'Grow Wild!',
    text: 'Native plant nursery in Omemee specializing in trees, shrubs and wildflowers, including a Wet/Shoreline pollinator kit. 416-735-7490.',
    href: 'http://www.nativeplantnursery.ca/',
    label: 'nativeplantnursery.ca',
  },
]

export default function HealthyShorelinePage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-5">
            <h1 className="mb-3">Healthy Shoreline</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '640px' }}>
              The shoreline is the lake&rsquo;s immune system. A naturalized shoreline filters
              runoff, prevents erosion, shelters wildlife — and it&rsquo;s less work than a lawn.
            </p>
          </div>

          <div className="article-content mb-5">
            <h3>Better for the lake — and better for you</h3>
            <p>
              Native plants and naturalized shorelines have adapted to local conditions, so they
              need no fertilizer (reducing chemical runoff into the water), live longer, and save
              you the time and money of mowing or hardscaping. Their deep roots hold the bank
              together against ice and wake erosion.
            </p>
            <p>
              There&rsquo;s a bonus: a manicured lawn attracts Canada geese, while a naturalized
              shoreline discourages them from nesting — and provides cover for the wildlife you
              actually want to see.
            </p>
            <p>
              Want help getting started? We partner with Abbey Gardens on a shoreline
              naturalization program —{' '}
              <Link href="/news/shoreline-naturalization-with-abbey-gardens">
                read how it works and what a re-naturalized shoreline looks like
              </Link>.
            </p>
          </div>

          <h3 className="mb-3">Where to get native plants</h3>
          <div className="row g-3 mb-5">
            {SOURCES.map(s => (
              <div key={s.name} className="col-md-6 d-flex">
                <div className="card lake-card w-100">
                  <div className="card-body d-flex flex-column">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.logo}
                      alt={`${s.name} logo`}
                      style={{ height: '56px', width: 'auto', objectFit: 'contain', alignSelf: 'flex-start' }}
                      className="mb-2"
                    />
                    <h5 className="mb-2">{s.name}</h5>
                    <p className="text-muted small flex-grow-1">{s.text}</p>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="fw-semibold small">
                      {s.label} →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card lake-card mb-4">
            <div className="card-body">
              <h5 className="mb-2">🌲 Before you cut: the Shoreline Tree Preservation By-law</h5>
              <p className="text-muted small mb-2">
                Haliburton County&rsquo;s Shoreline Tree Preservation By-law applies to all land
                within 30 metres of a watercourse — its goal is to protect water quality by keeping
                shoreline trees standing. Check before removing any tree near the water.
              </p>
              <div className="small">
                <a
                  href="https://www.haliburtoncounty.ca/living-here/property-and-environment/shoreline-preservation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-block"
                >
                  County of Haliburton — Shoreline Preservation →
                </a>
                <a href="/documents/pages/FAQs-Shoreline-Tree-Preservation-2018.pdf" target="_blank" className="d-block">
                  Download the FAQ sheet (PDF) →
                </a>
                <Link href="/municipal-bylaws" className="d-block">
                  More municipal by-laws that affect cottagers →
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center border-top pt-4">
            <p className="text-muted mb-0">
              See also: <Link href="/news/watch-your-wake-to-protect-our-shorelines">Watch Your Wake</Link> ·{' '}
              <Link href="/lake-health">Lake Health Data</Link> ·{' '}
              <Link href="/#essential-lake-protection">All lake protection guidelines</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
