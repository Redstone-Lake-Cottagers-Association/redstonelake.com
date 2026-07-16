import lakePartner from '@/data/lake-partner.json'
import latestReadings from '@/data/lake-health-latest.json'
import { METRICS, STATUS, classify, contextFor, type Reading, type Status } from '@/lib/water-guidelines'

const READINGS = (latestReadings as { lakes: Record<string, Record<string, Reading>> }).lakes
const LAKES = lakePartner.lakes as { id: string; name: string }[]

function Dot({ status }: { status: Status }) {
  const hollow = status === 'none'
  const dashed = status === 'soon'
  return (
    <span
      style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: hollow || dashed ? 'transparent' : STATUS[status].color,
        border: hollow
          ? `1.5px solid ${STATUS.none.color}`
          : dashed
            ? `1.5px dashed ${STATUS.soon.color}`
            : 'none',
        flex: '0 0 auto',
      }}
    />
  )
}

// Latest reading per lake per measure, classified against published guidelines.
// Rendered on /lake-health; the homepage preview shows a compact dots-only view
// of the same data.
export default function LakeHealthSummary() {
  return (
    <div>
      <div className="d-md-none text-muted text-center mb-1" style={{ fontSize: '0.7rem' }}>
        Swipe sideways to see all measures →
      </div>
      <div className="table-responsive mb-2">
        <table className="table table-sm align-middle mb-0" style={{ minWidth: '760px' }}>
          <thead>
            <tr>
              <th className="border-0" />
              {METRICS.map(m => (
                <th key={m.key} className="border-0 text-center small text-muted fw-semibold" title={m.full}>
                  {m.full}
                  <span className="d-block fw-normal" style={{ fontSize: '0.68rem' }}>{m.unit}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LAKES.map(lake => {
              const readings = READINGS[lake.id] || {}
              return (
                <tr key={lake.id}>
                  <td className="small fw-semibold" style={{ whiteSpace: 'nowrap' }}>
                    {lake.name.replace(/ Lake$/, '')}
                    {LAKE_HAS_CONTEXT(lake.id) && <span title={contextFor(lake.id, 'secchi') || ''}> *</span>}
                  </td>
                  {METRICS.map(m => {
                    if (m.comingSoon) {
                      return (
                        <td key={m.key} className="text-center small text-muted">
                          <span className="d-inline-flex align-items-center gap-1" title={STATUS.soon.label}>
                            <Dot status="soon" /> soon
                          </span>
                        </td>
                      )
                    }
                    const r = readings[m.key]
                    if (!r) {
                      return (
                        <td key={m.key} className="text-center small text-muted">
                          <span className="d-inline-flex align-items-center gap-1" title={STATUS.none.label}>
                            <Dot status="none" /> —
                          </span>
                        </td>
                      )
                    }
                    const status = classify(m.key, r.value)
                    const ctx = contextFor(lake.id, m.key)
                    return (
                      <td key={m.key} className="text-center small">
                        <span
                          className="d-inline-flex align-items-center gap-1"
                          title={`${m.full}: ${r.value} ${m.unit} (${r.year}) — ${STATUS[status].label}${ctx ? `. ${ctx}` : ''}`}
                        >
                          <Dot status={status} />
                          <span className="fw-semibold">{r.value}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>’{String(r.year).slice(2)}</span>
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-wrap gap-3 mb-2" style={{ fontSize: '0.72rem' }}>
        {(['within', 'outside', 'neutral', 'soon', 'none'] as Status[]).map(s => (
          <span key={s} className="text-muted d-inline-flex align-items-center gap-1">
            <Dot status={s} />
            {STATUS[s].label.charAt(0).toUpperCase() + STATUS[s].label.slice(1)}
          </span>
        ))}
      </div>
      <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>
        * Coleman is a shallower, naturally <em>mesotrophic</em> lake — moderate clarity and
        somewhat higher phosphorus are expected and normal there.
      </p>
    </div>
  )
}

function LAKE_HAS_CONTEXT(lakeId: string): boolean {
  return contextFor(lakeId, 'secchi') !== null || contextFor(lakeId, 'phosphorus') !== null
}

export function GuidelinesAndSources() {
  return (
    <div id="guidelines">
      <h3 className="mb-3">The guidelines &amp; sources</h3>
      <div className="row g-3">
        {METRICS.map(m => (
          <div key={m.key} className="col-md-6 d-flex">
            <div className="card lake-card w-100">
              <div className="card-body">
                <h6 className="mb-1">
                  {m.full} <span className="text-muted fw-normal">({m.unit})</span>
                </h6>
                <div className="small fw-semibold mb-2" style={{ color: '#0d6e64' }}>{m.guideline}</div>
                <p className="text-muted small mb-2">{m.detail}</p>
                <ul className="list-unstyled mb-0">
                  {m.citations.map(c => (
                    <li key={c.text} className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {c.href ? (
                        <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-muted">
                          {c.text}
                        </a>
                      ) : (
                        c.text
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
