'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Droplets, FlaskConical } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import lakePartner from '@/data/lake-partner.json'
import latestReadings from '@/data/lake-health-latest.json'
import { METRICS, STATUS, classify, contextFor, type Reading, type Status } from '@/lib/water-guidelines'

interface WaterDataPoint { t: string; y: string }
interface WaterData { current?: WaterDataPoint[] }

const READINGS = (latestReadings as { lakes: Record<string, Record<string, Reading>> }).lakes

const LAKE_ROWS = (lakePartner.lakes as { id: string; name: string }[]).map(lake => {
  const readings = READINGS[lake.id] || {}
  const cells = METRICS.map(m => {
    if (m.comingSoon) return { status: 'soon' as Status, tip: `${m.full}: ${STATUS.soon.label}` }
    const r = readings[m.key]
    if (!r) return { status: 'none' as Status, tip: `${m.full}: no data yet` }
    const status = classify(m.key, r.value)
    const ctx = contextFor(lake.id, m.key)
    return {
      status,
      tip: `${m.full}: ${r.value} ${m.unit} (${r.year}) — ${STATUS[status].label}${ctx ? `. ${ctx}` : ''}`,
    }
  })
  const years = Object.values(readings).map(r => r.year)
  return {
    id: lake.id,
    name: lake.name.replace(/ Lake$/, ''),
    cells,
    latest: years.length ? Math.max(...years) : null,
  }
})

const LEGEND: Status[] = ['within', 'outside', 'neutral', 'soon', 'none']

function Dot({ status, size = 11 }: { status: Status; size?: number }) {
  const hollow = status === 'none'
  const dashed = status === 'soon'
  return (
    <span
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: hollow || dashed ? 'transparent' : STATUS[status].color,
        border: hollow
          ? `1.5px solid ${STATUS.none.color}`
          : dashed
            ? `1.5px dashed ${STATUS.soon.color}`
            : 'none',
      }}
    />
  )
}

export default function LakeDataPreview() {
  const [waterData, setWaterData] = useState<WaterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGuidelines, setShowGuidelines] = useState(false)

  useEffect(() => {
    fetch('/api/water-levels?stationId=17&lang=EN')
      .then(r => (r.ok ? r.json() : null))
      .then(d => setWaterData(d && !d.error ? d : null))
      .catch(() => setWaterData(null))
      .finally(() => setLoading(false))
  }, [])

  const levelSeries = (waterData?.current || [])
    .slice(-90)
    .map(p => ({ t: new Date(p.t).getTime(), level: parseFloat(p.y) }))
  const latest = levelSeries[levelSeries.length - 1]

  return (
    <div className="row g-4">
      {/* Water level preview */}
      <div className="col-lg-6 d-flex">
        <Link
          href="/lake-health#water-level"
          className="card lake-card w-100 text-decoration-none"
          style={{ color: 'inherit' }}
        >
          <div className="card-body d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-1">
              <Droplets size={22} style={{ color: '#0369a1' }} />
              <h4 className="mb-0">Water Level</h4>
            </div>
            <div className="text-muted small mb-2">Redstone Lake, last 90 days</div>
            <div className="h3 fw-bold mb-2" style={{ color: '#0369a1', minHeight: '1.4em' }}>
              {loading ? '—' : latest ? `${latest.level.toFixed(3)} m` : 'Live data unavailable'}
            </div>
            <div style={{ height: '190px' }}>
              {levelSeries.length > 1 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={levelSeries} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <XAxis dataKey="t" hide />
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Line type="monotone" dataKey="level" stroke="#0369a1" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <span className="fw-semibold small mt-auto pt-2" style={{ color: '#0369a1' }}>
              See level trends &amp; history →
            </span>
          </div>
        </Link>
      </div>

      {/* Lake health preview: latest reading vs guideline, all seven lakes */}
      <div className="col-lg-6 d-flex">
        <div className="card lake-card w-100">
          <div className="card-body d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-1">
              <FlaskConical size={22} style={{ color: '#0d9488' }} />
              <h4 className="mb-0">Lake Health</h4>
            </div>
            <div className="text-muted small mb-3">
              The latest steward reading on each lake against published water quality guidelines —
              hover any dot for the value
            </div>
            <div className="d-flex flex-column justify-content-between flex-grow-1">
              <div className="d-flex align-items-center gap-1 pb-1">
                <span style={{ width: '104px', flex: '0 0 auto' }} />
                {METRICS.map(m => (
                  <span
                    key={m.key}
                    className="text-muted text-center"
                    style={{
                      flex: '1 1 0',
                      fontSize: '0.68rem',
                      letterSpacing: '0.02em',
                      textDecoration: 'underline dotted',
                      textUnderlineOffset: '2px',
                      cursor: 'help',
                    }}
                    title={`${m.full} (${m.unit})`}
                  >
                    {m.label}
                  </span>
                ))}
                <span className="text-muted text-end" style={{ width: '40px', flex: '0 0 auto', fontSize: '0.68rem' }}>
                  Latest
                </span>
              </div>
              {LAKE_ROWS.map(lake => (
                <div key={lake.id} className="d-flex align-items-center gap-1 py-1 border-top" style={{ minHeight: '28px' }}>
                  <span className="small" style={{ width: '104px', flex: '0 0 auto' }}>{lake.name}</span>
                  {lake.cells.map((cell, i) => (
                    <span key={METRICS[i].key} className="text-center" style={{ flex: '1 1 0' }} title={cell.tip}>
                      <Dot status={cell.status} />
                    </span>
                  ))}
                  <span className="small text-muted text-end" style={{ width: '40px', flex: '0 0 auto' }}>
                    {lake.latest ?? '—'}
                  </span>
                </div>
              ))}
              <div className="d-flex flex-wrap gap-3 pt-2" style={{ fontSize: '0.68rem' }}>
                {LEGEND.map(s => (
                  <span key={s} className="text-muted d-inline-flex align-items-center gap-1">
                    <Dot status={s} size={9} />
                    {STATUS[s].label.charAt(0).toUpperCase() + STATUS[s].label.slice(1)}
                  </span>
                ))}
              </div>
              <div className="text-muted pt-1" style={{ fontSize: '0.65rem' }}>
                {METRICS.map(m => `${m.label} = ${m.full.toLowerCase()}`).join(' · ')}
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-baseline mt-auto pt-2">
              <button
                type="button"
                className="btn btn-link p-0 weather-cta-link text-muted"
                style={{ fontSize: '0.72rem' }}
                onClick={() => setShowGuidelines(true)}
              >
                Guidelines &amp; sources ›
              </button>
              <Link href="/lake-health" className="fw-semibold small" style={{ color: '#0d9488' }}>
                Explore the full data →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines & sources modal */}
      {showGuidelines && typeof document !== 'undefined' && createPortal(
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setShowGuidelines(false)
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Water Quality Guidelines &amp; Sources</h5>
                <button type="button" className="btn-close" onClick={() => setShowGuidelines(false)} />
              </div>
              <div className="modal-body">
                {METRICS.map(m => (
                  <div key={m.key} className="mb-4">
                    <h6 className="mb-1">
                      {m.full} <span className="text-muted fw-normal">({m.unit})</span>
                    </h6>
                    <div className="small fw-semibold mb-1" style={{ color: '#0d6e64' }}>{m.guideline}</div>
                    <p className="text-muted small mb-1">{m.detail}</p>
                    <ul className="list-unstyled mb-0">
                      {m.citations.map(c => (
                        <li key={c.text} className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {c.href ? (
                            <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-muted">{c.text}</a>
                          ) : c.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="text-muted small mb-0">
                  Readings combine the provincial Lake Partner dataset with our stewards&rsquo; 2025
                  sampling, presented at the{' '}
                  <a href="/documents/agm/AGM_2026Presentation_JKidd.pptx">2026 AGM</a>. See the full
                  record on the <Link href="/lake-health">Lake Health Data page</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
