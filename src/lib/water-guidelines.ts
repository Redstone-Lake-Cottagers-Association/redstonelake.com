// Single source of truth for water quality guidelines, classification and citations.
// Rendered on the homepage lake-health preview (matrix + modal) and on /lake-health.

export interface MetricDef {
  key: string
  label: string // short column header
  full: string
  unit: string
  guideline: string // one-line guideline statement shown to users
  detail: string // what the measure means and why it matters
  citations: { text: string; href?: string }[]
  comingSoon?: boolean
}

export const METRICS: MetricDef[] = [
  {
    key: 'phosphorus',
    label: 'Phos.',
    full: 'Total phosphorus',
    unit: 'µg/L',
    guideline: 'At or below 20 µg/L (Ontario interim PWQO for lakes)',
    detail:
      'The nutrient that drives algae growth. Ontario’s interim Provincial Water Quality Objective for lakes is an ice-free-season average of no more than 20 µg/L to avoid nuisance algae; 10 µg/L provides a high level of protection, and lakes between 10 and 20 µg/L are considered mesotrophic.',
    citations: [
      {
        text: 'Ontario Ministry of Environment and Energy (1994). Water Management: Policies, Guidelines, Provincial Water Quality Objectives of the Ministry of Environment and Energy.',
        href: 'https://www.ontario.ca/page/water-management-policies-guidelines-provincial-water-quality-objectives',
      },
    ],
  },
  {
    key: 'secchi',
    label: 'Clarity',
    full: 'Water clarity (Secchi depth)',
    unit: 'm',
    guideline: 'No regulatory guideline — tracked for long-term trends',
    detail:
      'The depth at which a standard black-and-white disk disappears from view. There is no regulatory objective for clarity; it is monitored for trends. In our steward reporting, more than 4 m is described as high transparency and 2–4 m as moderate.',
    citations: [
      {
        text: 'Kidd, J. (2026). Lake Health Monitoring & Research. Presented at the 2026 Annual General Meeting.',
        href: '/documents/agm/AGM_2026Presentation_JKidd.pptx',
      },
    ],
  },
  {
    key: 'calcium',
    label: 'Ca',
    full: 'Calcium',
    unit: 'mg/L',
    guideline: 'At or above 1.5 mg/L (zooplankton reproduction threshold)',
    detail:
      'Decades of acid rain leached calcium from Shield watersheds. Below about 1.5 mg/L, reproduction of calcium-rich zooplankton such as Daphnia — a key food-web link — becomes impaired. Several of our lakes sit close to this threshold, which is why we track it.',
    citations: [
      {
        text: 'Jeziorski, A., Yan, N.D., Paterson, A.M., et al. (2008). “The Widespread Threat of Calcium Decline in Fresh Waters.” Science 322(5906): 1374–1377. doi:10.1126/science.1164949',
        href: 'https://doi.org/10.1126/science.1164949',
      },
      {
        text: 'Ontario Lake Partner Program reporting, which applies the 1.5 mg/L threshold.',
        href: 'https://foca.on.ca/lake-partner-program/',
      },
    ],
  },
  {
    key: 'chloride',
    label: 'Cl',
    full: 'Chloride',
    unit: 'mg/L',
    guideline: 'Below 120 mg/L (CCME long-term guideline for aquatic life)',
    detail:
      'Mostly from road salt. The Canadian long-term water quality guideline for the protection of aquatic life is 120 mg/L, though research shows effects on sensitive zooplankton can begin around 10–20 mg/L — one reason we watch rising trends (such as Burdock Lake) well before the guideline is approached.',
    citations: [
      {
        text: 'Canadian Council of Ministers of the Environment (2011). Canadian Water Quality Guidelines for the Protection of Aquatic Life: Chloride.',
        href: 'https://ccme.ca/en/res/chloride-en-canadian-water-quality-guidelines-for-the-protection-of-aquatic-life.pdf',
      },
    ],
  },
  {
    key: 'sulphate',
    label: 'SO₄',
    full: 'Sulphate',
    unit: 'mg/L',
    guideline: 'No regulatory guideline — tracked for long-term trends',
    detail:
      'A legacy of acid deposition. There is no Ontario or federal freshwater guideline for sulphate at the low concentrations found in our lakes (2–3 mg/L); it is monitored to track the watershed’s continuing recovery from acid rain.',
    citations: [
      {
        text: 'Ontario Lake Partner open dataset, Ministry of the Environment, Conservation and Parks.',
        href: 'https://data.ontario.ca/dataset/ontario-lake-partner',
      },
    ],
  },
  {
    key: 'do',
    label: 'DO',
    full: 'Dissolved oxygen',
    unit: 'mg/L',
    guideline: 'Lake trout lakes assessed against 7 mg/L deep-water DO (Ontario MNR)',
    detail:
      'Cold-water fish such as lake trout depend on oxygen-rich deep water at the end of summer. Ontario assesses lake trout lakes against a mean volume-weighted hypolimnetic dissolved oxygen of 7 mg/L. Our stewards begin September deep-point profiles — data coming soon.',
    citations: [
      {
        text: 'Ontario Ministry of Natural Resources (2010). Inland Ontario Lakes Designated for Lake Trout Management.',
      },
    ],
    comingSoon: true,
  },
]

export type Status = 'within' | 'outside' | 'neutral' | 'soon' | 'none'

export const STATUS: Record<Status, { color: string; label: string }> = {
  within: { color: '#15803d', label: 'within guideline' },
  outside: { color: '#b91c1c', label: 'outside guideline' },
  neutral: { color: '#0369a1', label: 'no guideline — monitored' },
  soon: { color: '#94a3b8', label: 'data coming soon' },
  none: { color: '#cbd5e1', label: 'no data yet' },
}

// Binary classification against the published guideline for each measure.
// Calcium compares at one decimal, matching how the readings are reported
// (1.45 mg/L is reported as at-threshold in our steward's assessment).
export function classify(metric: string, value: number): Status {
  switch (metric) {
    case 'phosphorus':
      return value <= 20 ? 'within' : 'outside'
    case 'chloride':
      return value < 120 ? 'within' : 'outside'
    case 'calcium':
      return Math.round(value * 10) / 10 >= 1.5 ? 'within' : 'outside'
    case 'do':
      return 'soon'
    default:
      return 'neutral'
  }
}

export interface Reading {
  value: number
  year: number
  source: string
}

// Per-lake context for readings that look different but are expected — a
// naturally mesotrophic (shallower, more productive) lake is not a concern.
// Source: Kidd (2026 AGM), which classifies Coleman as mesotrophic.
export const LAKE_CONTEXT: Record<string, { note: string; metrics: string[] }> = {
  coleman: {
    note: 'Coleman is a shallower, naturally mesotrophic lake — moderate clarity and somewhat higher phosphorus are expected and normal there.',
    metrics: ['secchi', 'phosphorus'],
  },
}

export function contextFor(lakeId: string, metricKey: string): string | null {
  const ctx = LAKE_CONTEXT[lakeId]
  return ctx && ctx.metrics.includes(metricKey) ? ctx.note : null
}

// General 2025 summary and per-lake steward's notes.
// Source: Kidd, J. (2026). Lake Health Monitoring & Research, presented at the
// 2026 AGM (readings, transparency and calcium classes, chloride trends, and
// the August 2025 U-Links aquatic vegetation surveys).
export const SUMMARY_2025 =
  'The 2025 picture is good: readings on all seven lakes were within published guidelines, and aquatic vegetation surveys found healthy native plant communities on every lake.'

export const LAKE_NOTES: Record<string, string[]> = {
  redstone: [
    'High transparency in 2025 (5.0 m Secchi depth, above the 4 m high-transparency mark).',
    'Calcium is on the low side (below 3 mg/L), typical of Canadian Shield lakes still recovering from acid rain.',
    'The 2025 vegetation survey found purple loosestrife at three shoreline points — low-level, long-established, and unlikely to cause significant ecological impact.',
  ],
  'little-redstone': [
    'High transparency in 2025 (4.2 m Secchi depth).',
    'Calcium is on the low side (below 3 mg/L), not far above the 1.5 mg/L threshold zooplankton need.',
    'Purple loosestrife at three points in the 2025 vegetation survey — low-level and long-established.',
  ],
  bitter: [
    'High transparency in 2025 (5.4 m Secchi depth).',
    'Chloride has climbed from about 1 mg/L in 2015 to about 4.3 mg/L — still far below the 120 mg/L guideline, and possibly stabilizing, but a trend our stewards watch.',
    'Calcium in the moderate range (3–20 mg/L).',
    'Purple loosestrife at one point in the 2025 vegetation survey — low-level.',
  ],
  burdock: [
    'The clearest of our lakes in 2025 (7.4 m Secchi depth).',
    'The highest chloride of our lakes (40–44 mg/L in 2025) — well below the 120 mg/L guideline, but within the range where research shows sensitive zooplankton can be affected.',
    'Calcium in the moderate range (3–20 mg/L).',
    'Phragmites here is the native subspecies, which is not a concern. Purple loosestrife at three points — low-level.',
  ],
  coleman: [
    'A shallower, naturally mesotrophic lake — moderate clarity (3.1 m in 2025) and phosphorus above 10 µg/L are expected and normal here.',
    'Calcium in the moderate range (3–20 mg/L).',
    'Purple loosestrife at one point in the 2025 vegetation survey — low-level.',
  ],
  pelaw: [
    'Moderate transparency in 2025 (3.2 m Secchi depth).',
    'Calcium sits closest to the 1.5 mg/L zooplankton threshold of any of our lakes — a key one to keep watching.',
    'The only lake where the 2025 vegetation survey found no purple loosestrife.',
  ],
  tedious: [
    'Back on the monitoring map: 2025 brought the lake’s first steward readings in years — high transparency (5.6 m Secchi) and low phosphorus (3.75 µg/L).',
    'Invasive Phragmites was found at two points — the only lake where it appeared. With so few occurrences removal may be feasible, and a multi-year removal program is recommended.',
    'Purple loosestrife at two points — low-level.',
  ],
}

export const NOTES_SOURCE = {
  text: 'Kidd, J. (2026). Lake Health Monitoring & Research. Presented at the 2026 Annual General Meeting.',
  href: '/documents/agm/AGM_2026Presentation_JKidd.pptx',
}
