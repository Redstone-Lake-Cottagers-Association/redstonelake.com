'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import data from '@/data/lake-partner.json'
import { LAKE_NOTES, NOTES_SOURCE } from '@/lib/water-guidelines'

type MetricKey = 'phosphorus' | 'secchi' | 'calcium' | 'chloride' | 'sulphate'

interface MetricDef {
  key: MetricKey
  title: string
  unit: string
  color: string
  description: string
  higherIsBetter?: boolean
}

// Colors validated with the dataviz palette checker (light surface)
const METRICS: MetricDef[] = [
  {
    key: 'phosphorus',
    title: 'Total Phosphorus',
    unit: 'µg/L',
    color: '#0369a1',
    description:
      'The nutrient that most controls algae growth in Ontario lakes. Below 10 µg/L is oligotrophic (low nutrient, clear); 10–20 µg/L is mesotrophic; above 20 µg/L lakes are at risk of nuisance algae blooms.',
  },
  {
    key: 'secchi',
    title: 'Water Clarity (Secchi Depth)',
    unit: 'm',
    color: '#0d9488',
    higherIsBetter: true,
    description:
      'How deep a standard black-and-white disk stays visible from the surface. Deeper readings mean clearer water — typical Precambrian Shield lakes read 3–8 m.',
  },
  {
    key: 'calcium',
    title: 'Calcium',
    unit: 'mg/L',
    color: '#15803d',
    description:
      'Shield lakes are naturally calcium-poor, and levels have declined since the acid-rain era. Below about 1.5 mg/L, calcium-rich organisms like Daphnia (a key algae grazer) begin to struggle.',
  },
  {
    key: 'chloride',
    title: 'Chloride',
    unit: 'mg/L',
    color: '#b45309',
    description:
      'Mostly a road-salt signature. Undeveloped Shield lakes sit well below 5 mg/L; rising chloride indicates runoff from salted roads and driveways.',
  },
  {
    key: 'sulphate',
    title: 'Sulphate',
    unit: 'mg/L',
    color: '#7c3aed',
    description:
      'Largely a legacy of acid rain. Declining sulphate across the Shield reflects cleaner air — a long-term recovery signal.',
  },
]

type LakeData = { samples: [number, number][]; annual: [number, number, number][] }
const metricsData = data.metrics as Record<MetricKey, Record<string, LakeData>>

function formatYear(yearFrac: number) {
  const year = Math.floor(yearFrac)
  const doy = Math.round((yearFrac - year) * 366)
  const date = new Date(year, 0, doy || 1)
  return date.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })
}

function MetricChart({ metric, lakeId }: { metric: MetricDef; lakeId: string }) {
  const lake = metricsData[metric.key]?.[lakeId]

  const { points, annualLine, domain } = useMemo(() => {
    if (!lake) return { points: [], annualLine: [], domain: [2000, 2025] as [number, number] }
    const points = lake.samples.map(([x, y]) => ({ x, y }))
    const annualLine = lake.annual.map(([year, mean, n]) => ({ x: year + 0.5, y: mean, n }))
    const xs = points.map(p => p.x)
    const domain: [number, number] = [Math.floor(Math.min(...xs)) - 1, Math.ceil(Math.max(...xs)) + 1]
    return { points, annualLine, domain }
  }, [lake])

  if (!lake || points.length === 0) {
    return (
      <div className="card lake-card mb-4">
        <div className="card-body">
          <h5 className="mb-1">{metric.title}</h5>
          <p className="text-muted small mb-0">
            No {metric.title.toLowerCase()} measurements on record for this lake in the Lake Partner
            Program dataset. Want to help fill the gap? Volunteer sampling is easy —{' '}
            <a href="/contact">get in touch</a>.
          </p>
        </div>
      </div>
    )
  }

  const values = points.map(p => p.y)
  const latest = points[points.length - 1]
  const yMax = Math.max(...values)

  return (
    <div className="card lake-card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-baseline justify-content-between flex-wrap gap-2 mb-1">
          <h5 className="mb-0">
            <span className="me-2" style={{ color: metric.color }}>●</span>
            {metric.title}
          </h5>
          <span className="text-muted small">
            Latest: <strong>{latest.y} {metric.unit}</strong> ({formatYear(latest.x)}) · {points.length} samples
          </span>
        </div>
        <p className="text-muted small mb-3">{metric.description}</p>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <ComposedChart margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(15,23,42,0.07)" vertical={false} />
              <XAxis
                type="number"
                dataKey="x"
                domain={domain}
                tickCount={8}
                tickFormatter={(v: number) => String(Math.round(v))}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: 'rgba(15,23,42,0.15)' }}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="number"
                domain={[0, Math.ceil(yMax * 1.15 * 10) / 10]}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={44}
                label={{ value: metric.unit, angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(15,23,42,0.2)', strokeDasharray: '3 3' }}
                formatter={(value: any, name: any) => [
                  `${value} ${metric.unit}`,
                  name === 'y' ? 'Sample' : 'Annual mean',
                ]}
                labelFormatter={(label: any) => formatYear(Number(label))}
                contentStyle={{ borderRadius: 8, border: '1px solid rgba(15,23,42,0.1)', fontSize: 13 }}
              />

              {/* Trophic bands for phosphorus */}
              {metric.key === 'phosphorus' && (
                <>
                  <ReferenceArea y1={0} y2={10} fill="#0d9488" fillOpacity={0.06} />
                  <ReferenceArea y1={10} y2={20} fill="#b45309" fillOpacity={0.05} />
                  <ReferenceLine y={10} stroke="#0d9488" strokeDasharray="4 4" strokeOpacity={0.6}
                    label={{ value: 'oligotrophic < 10', position: 'insideTopRight', fill: '#0f766e', fontSize: 11 }} />
                  <ReferenceLine y={20} stroke="#b45309" strokeDasharray="4 4" strokeOpacity={0.6}
                    label={{ value: 'algae-bloom risk > 20', position: 'insideTopRight', fill: '#b45309', fontSize: 11 }} />
                </>
              )}
              {metric.key === 'calcium' && (
                <ReferenceLine y={1.5} stroke="#b45309" strokeDasharray="4 4" strokeOpacity={0.7}
                  label={{ value: 'aquatic-life threshold 1.5', position: 'insideTopRight', fill: '#b45309', fontSize: 11 }} />
              )}

              <Scatter data={points} dataKey="y" fill={metric.color} fillOpacity={0.35} shape="circle" />
              <Line
                data={annualLine}
                dataKey="y"
                stroke={metric.color}
                strokeWidth={2}
                dot={{ r: 3, fill: metric.color, strokeWidth: 0 }}
                name="annual"
                type="monotone"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <details className="mt-2">
          <summary className="small text-muted" style={{ cursor: 'pointer' }}>View annual means table</summary>
          <div className="table-responsive mt-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
            <table className="table table-sm small mb-0">
              <thead><tr><th>Year</th><th>Mean ({metric.unit})</th><th>Samples</th></tr></thead>
              <tbody>
                {lake.annual.slice().reverse().map(([year, mean, n]) => (
                  <tr key={year}><td>{year}</td><td>{mean}</td><td>{n}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  )
}

export default function LakeHealthExplorer() {
  const [lakeId, setLakeId] = useState('redstone')
  const lakeName = data.lakes.find(l => l.id === lakeId)?.name

  // Deep links from the lake map: /lake-health?lake=<id>#explore
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('lake')
    if (wanted && data.lakes.some(l => l.id === wanted)) setLakeId(wanted)
  }, [])

  return (
    <div>
      {/* Lake selector */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
        {data.lakes.map(lake => (
          <button
            key={lake.id}
            type="button"
            onClick={() => setLakeId(lake.id)}
            className={`btn btn-sm ${lakeId === lake.id ? 'btn-lake-primary' : 'btn-outline-primary'}`}
          >
            {lake.name}
          </button>
        ))}
      </div>

      <h4 className="mb-3 text-center">{lakeName}</h4>

      {/* Steward's notes for the selected lake */}
      {LAKE_NOTES[lakeId] && (
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8">
            <div className="card lake-card" style={{ borderLeft: '4px solid #0d9488' }}>
              <div className="card-body py-3">
                <h6 className="mb-2">Steward&rsquo;s notes</h6>
                <ul className="small mb-2 ps-3">
                  {LAKE_NOTES[lakeId].map(note => (
                    <li key={note} className="mb-1">{note}</li>
                  ))}
                </ul>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Source:{' '}
                  <a href={NOTES_SOURCE.href} className="text-muted">{NOTES_SOURCE.text}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {METRICS.map(metric => (
        <MetricChart key={metric.key} metric={metric} lakeId={lakeId} />
      ))}
    </div>
  )
}
