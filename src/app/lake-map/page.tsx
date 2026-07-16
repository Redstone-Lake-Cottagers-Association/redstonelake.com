import Link from 'next/link'
import type { Metadata } from 'next'
import InteractiveLakeMap from '@/components/InteractiveLakeMap'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Lake Map | ${ORG_NAME}`,
  description:
    'Interactive map of the Redstone group of lakes — depth contours, property parcels, and natural heritage areas.',
}

export default function LakeMapPage() {
  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-2">
        <h1 className="h2 mb-0">Lake Map</h1>
        <p className="text-muted small mb-0">
          Depth contours, parcels, wetlands &amp; protected areas — click a lake pin for its{' '}
          <Link href="/lake-health">water quality data</Link>.
        </p>
      </div>

      <InteractiveLakeMap />

      <div className="row justify-content-center mt-4">
        <div className="col-lg-9">
          <div className="card lake-card">
            <div className="card-body small text-muted">
              <strong className="text-dark">About this map — please read.</strong> This map is for
              general information only. It is <strong>not a survey</strong> and must not be used
              for navigation, legal, or property purposes: depth contours come from provincial
              surveys that are decades old in places, parcel boundaries are approximate assessment
              fabric (not legal boundaries), and any feature may be out of date or inaccurate.
              Verify anything that matters with the appropriate authority.
              <br />
              <br />
              <strong className="text-dark">Sources:</strong> Bathymetry, wetlands, Areas of
              Natural and Scientific Interest (ANSI), Crown land, conservation reserves, trails,
              dams, fishing access points, licensed aggregate sites, and Wildlife Management Unit
              boundaries from{' '}
              <a href="https://geohub.lio.gov.on.ca/" target="_blank" rel="noopener noreferrer">
                Ontario GeoHub
              </a>{' '}
              / Land Information Ontario open data (Ministry of Natural Resources; Open Government
              Licence — Ontario). Hunting rules are set per WMU — always confirm with the{' '}
              <a href="https://www.ontario.ca/document/ontario-hunting-regulations-summary" target="_blank" rel="noopener noreferrer">
                Ontario hunting regulations
              </a>
              . Property parcels served live by the{' '}
              <a href="https://gis.haliburtoncounty.ca/arcgis/rest/services" target="_blank" rel="noopener noreferrer">
                County of Haliburton GIS
              </a>{' '}
              (Ontario Parcel assessment fabric © Teranet / MPAC). Topographic overlay from{' '}
              <a
                href="https://www.lioapplications.lrc.gov.on.ca/MakeATopographicMap/index.html?viewer=Make_A_Topographic_Map.MATM&locale=en-CA"
                target="_blank"
                rel="noopener noreferrer"
              >
                Land Information Ontario
              </a>
              . Wildlife sightings from{' '}
              <a href="https://www.inaturalist.org/" target="_blank" rel="noopener noreferrer">
                iNaturalist
              </a>{' '}
              community observations, © their respective observers — identifications are
              community-verified but not authoritative. Base map © Mapbox and OpenStreetMap
              contributors.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
