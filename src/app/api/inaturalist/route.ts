import { NextRequest, NextResponse } from 'next/server'

// iNaturalist observations around the association's lakes, proxied and cached
// (6 h) so the site is a good API citizen. Docs: https://api.inaturalist.org/v2/docs/
// (v1 endpoints used here; stable and sufficient for read-only queries.)

const BBOX = { swlat: 45.135, swlng: -78.625, nelat: 45.245, nelng: -78.475 }
const BASE = 'https://api.inaturalist.org/v1'

function bboxParams(): string {
  return `nelat=${BBOX.nelat}&nelng=${BBOX.nelng}&swlat=${BBOX.swlat}&swlng=${BBOX.swlng}&verifiable=true`
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('mode') || 'species'

  try {
    if (mode === 'species') {
      const r = await fetch(`${BASE}/observations/species_counts?${bboxParams()}&per_page=500`, {
        next: { revalidate: 21600 },
      })
      if (!r.ok) throw new Error(`iNaturalist ${r.status}`)
      const d = await r.json()
      const species = (d.results || []).map((s: any) => ({
        taxonId: s.taxon?.id,
        name: s.taxon?.name,
        common: s.taxon?.preferred_common_name || null,
        count: s.count,
        iconic: s.taxon?.iconic_taxon_name || 'Unknown',
        photo: s.taxon?.default_photo?.square_url || null,
      }))
      return NextResponse.json(
        { totalSpecies: d.total_results, species },
        { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400' } }
      )
    }

    if (mode === 'obs') {
      const taxon = request.nextUrl.searchParams.get('taxon')
      const taxonParam = taxon && /^\d+(,\d+)*$/.test(taxon) ? `&taxon_id=${taxon}` : ''
      // Iconic taxa groups (birds, mammals, plants, fungi, …) — whitelist only
      const ICONIC = new Set(['Aves', 'Mammalia', 'Reptilia', 'Amphibia', 'Actinopterygii', 'Insecta', 'Arachnida', 'Plantae', 'Fungi', 'Mollusca', 'Animalia'])
      const groups = (request.nextUrl.searchParams.get('groups') || '')
        .split(',')
        .filter(g => ICONIC.has(g))
      const groupParam = groups.length ? `&iconic_taxa=${groups.join(',')}` : ''
      // One page per request; the CLIENT paginates via the returned cursor so
      // the map paints progressively and the progress bar shows real movement.
      const cursorParam = request.nextUrl.searchParams.get('cursor')
      const cursor = cursorParam && /^\d+$/.test(cursorParam) ? `&id_below=${cursorParam}` : ''
      const url = `${BASE}/observations?${bboxParams()}${taxonParam}${groupParam}&per_page=200&order_by=id&order=desc${cursor}`
      let r = await fetch(url, { next: { revalidate: 21600 } })
      if (!r.ok && (r.status === 429 || r.status >= 500)) {
        await new Promise(res => setTimeout(res, 1500))
        r = await fetch(url, { cache: 'no-store' })
      }
      if (!r.ok) throw new Error(`iNaturalist ${r.status}`)
      const d = await r.json()
      const results = d.results || []
      const features = results
        .filter((o: any) => o.geojson?.coordinates)
        .map((o: any) => ({
          type: 'Feature',
          geometry: o.geojson,
          properties: {
            taxonId: o.taxon?.id || 0,
            iconic: o.taxon?.iconic_taxon_name || 'Unknown',
            name: o.taxon?.preferred_common_name || o.taxon?.name || 'Unknown species',
            sciName: o.taxon?.name || '',
            date: o.observed_on || '',
            photo: o.photos?.[0]?.url?.replace('square', 'small') || null,
            thumb: o.photos?.[0]?.url || null,
            url: o.uri,
            observer: o.user?.login || '',
          },
        }))
      const nextCursor = results.length === 200 ? results[results.length - 1].id : null
      return NextResponse.json(
        {
          type: 'FeatureCollection',
          features,
          totalResults: d.total_results ?? features.length,
          nextCursor,
        },
        { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400' } }
      )
    }

    return NextResponse.json({ error: 'unknown mode' }, { status: 400 })
  } catch (err) {
    console.error('iNaturalist proxy error:', err)
    return NextResponse.json(
      { error: 'iNaturalist unavailable' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
