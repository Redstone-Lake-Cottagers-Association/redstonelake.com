'use client'

import { useEffect, useState } from 'react'

interface Result {
  id: string
  name: string
  source: string
  ok: boolean
  ms: number
  detail: string
}

// Internal endpoints + static data files, checked from the browser
const LOCAL_CHECKS: { id: string; name: string; url: string; expectJson?: boolean }[] = [
  { id: 'api-water', name: 'Internal: /api/water-levels', url: '/api/water-levels?stationId=17&lang=EN', expectJson: true },
  { id: 'api-weather', name: 'Internal: /api/weather', url: '/api/weather', expectJson: true },
  { id: 'api-fireban', name: 'Internal: /api/fire-ban', url: '/api/fire-ban?lat=45.19&lng=-78.54', expectJson: true },
  { id: 'api-news', name: 'Internal: /api/newsletters', url: '/api/newsletters', expectJson: true },
  { id: 'api-token', name: 'Internal: /api/mapbox-token', url: '/api/mapbox-token', expectJson: true },
  { id: 'api-aq', name: 'Internal: /api/air-quality', url: '/api/air-quality', expectJson: true },
  { id: 'data-bathy', name: 'Static: bathymetry.geojson', url: '/map-data/bathymetry.geojson' },
  { id: 'data-lakes', name: 'Static: our-lakes.geojson', url: '/map-data/our-lakes.geojson' },
  { id: 'data-wetlands', name: 'Static: wetlands.geojson', url: '/map-data/wetlands.geojson' },
  { id: 'data-ansi', name: 'Static: ansi.geojson', url: '/map-data/ansi.geojson' },
  { id: 'data-wmu', name: 'Static: wmu.geojson', url: '/map-data/wmu.geojson' },
  { id: 'data-crown', name: 'Static: crown-land.geojson', url: '/map-data/crown-land.geojson' },
  { id: 'data-dams', name: 'Static: dams.geojson', url: '/map-data/dams.geojson' },
  { id: 'data-trails', name: 'Static: trails.geojson', url: '/map-data/trails.geojson' },
  { id: 'data-fishing', name: 'Static: fishing-access.geojson', url: '/map-data/fishing-access.geojson' },
  { id: 'data-agg', name: 'Static: aggregates.geojson', url: '/map-data/aggregates.geojson' },
  { id: 'data-cr', name: 'Static: conservation-reserve.geojson', url: '/map-data/conservation-reserve.geojson' },
]

function StatusRow({ r }: { r: Result }) {
  return (
    <tr>
      <td style={{ width: '36px' }} className="text-center fs-5">{r.ok ? '✅' : '❌'}</td>
      <td>
        <div className="fw-semibold small">{r.name}</div>
        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{r.source}</div>
      </td>
      <td className="small text-muted text-nowrap">{r.ms} ms</td>
      <td className={`small ${r.ok ? 'text-muted' : 'text-danger fw-semibold'}`}>{r.detail}</td>
    </tr>
  )
}

export default function HealthPage() {
  const [external, setExternal] = useState<Result[] | null>(null)
  const [local, setLocal] = useState<Result[]>([])
  const [checkedAt, setCheckedAt] = useState<string>('')
  const [running, setRunning] = useState(false)

  async function run() {
    setRunning(true)
    setExternal(null)
    setLocal([])

    // External deps via the server (no CORS distortion)
    fetch('/api/health', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        setExternal(d.results)
        setCheckedAt(d.checkedAt)
      })
      .catch(() =>
        setExternal([{ id: 'api-health', name: '/api/health itself', source: 'internal', ok: false, ms: 0, detail: 'health endpoint unreachable' }])
      )

    // Internal endpoints + static files from the browser
    const results = await Promise.all(
      LOCAL_CHECKS.map(async c => {
        const started = Date.now()
        try {
          const r = await fetch(c.url, { cache: 'no-store' })
          const ms = Date.now() - started
          if (!r.ok) return { ...c, source: c.url, ok: false, ms, detail: `HTTP ${r.status}` }
          if (c.expectJson) {
            const d = await r.json()
            if (d?.error) return { ...c, source: c.url, ok: false, ms, detail: String(d.error) }
            if (c.id === 'api-fireban' && d?.summary?.status === 'error')
              return { ...c, source: c.url, ok: false, ms, detail: 'fire-ban scrape reporting error status' }
          }
          return { ...c, source: c.url, ok: true, ms, detail: `HTTP ${r.status}` }
        } catch (e: unknown) {
          return { ...c, source: c.url, ok: false, ms: Date.now() - started, detail: e instanceof Error ? e.message : String(e) }
        }
      })
    )
    setLocal(results as Result[])
    setRunning(false)
  }

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const all = [...(external || []), ...local]
  const failures = all.filter(r => !r.ok).length

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-3">
        <h1 className="h2 mb-0">Data Source Health</h1>
        <div className="d-flex align-items-center gap-3">
          <span className="small text-muted">
            {checkedAt && `Checked ${new Date(checkedAt).toLocaleTimeString()}`}
          </span>
          <button className="btn btn-sm btn-outline-primary" onClick={run} disabled={running}>
            {running ? 'Checking…' : 'Re-run checks'}
          </button>
        </div>
      </div>

      {external === null && local.length === 0 ? (
        <p className="text-muted">Running checks…</p>
      ) : (
        <>
          <p className={failures ? 'text-danger fw-semibold' : 'text-success fw-semibold'}>
            {failures ? `${failures} of ${all.length} checks failing` : `All ${all.length} checks passing`}
          </p>

          <h5 className="mt-4">External dependencies</h5>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <tbody>{(external || []).map(r => <StatusRow key={r.id} r={r} />)}</tbody>
            </table>
          </div>

          <h5 className="mt-4">Internal APIs &amp; static data</h5>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <tbody>{local.map(r => <StatusRow key={r.id} r={r} />)}</tbody>
            </table>
          </div>
        </>
      )}

      <p className="small text-muted mt-4 mb-0">
        What each source is and how to refresh it is documented in{' '}
        <a href="https://github.com/Redstone-Lake-Cottagers-Association/redstonelake.com/blob/main/docs/DATA-SOURCES.md" target="_blank" rel="noopener noreferrer">
          docs/DATA-SOURCES.md
        </a>
        . This page is unlisted and excluded from search engines.
      </p>
    </div>
  )
}
