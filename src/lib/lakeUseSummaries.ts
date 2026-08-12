export type LakeUseSummary = {
  status: string
  text: string
  tone: 'full' | 'transit' | 'low'
}

export const LAKE_USE_SUMMARIES: Record<string, LakeUseSummary> = {
  'Redstone Lake': {
    status: 'Broadest range of boating',
    text: 'Low-wake shoreline travel, planing transit and a practical 300m+ high-wake area.',
    tone: 'full',
  },
  'Little Redstone Lake': {
    status: 'Low-wake travel and transit',
    text: 'Suitable for careful low-wake travel with some planing transit; no practical high-wake area.',
    tone: 'transit',
  },
  'Pelaw Lake': {
    status: 'Paddling and low-wake travel',
    text: 'Best suited to paddling and careful powered travel that keeps wake to a minimum.',
    tone: 'low',
  },
  'Bitter Lake': {
    status: 'Paddling and low-wake travel',
    text: 'Best suited to paddling and careful powered travel that keeps wake to a minimum.',
    tone: 'low',
  },
  'Burdock Lake': {
    status: 'Non-motorized recreation',
    text: 'A no-motor lake suited to paddling, swimming, fishing and quiet shoreline enjoyment.',
    tone: 'low',
  },
  'Long (Tedious) Lake': {
    status: 'Paddling and low-wake travel',
    text: 'Best suited to paddling and careful powered travel that keeps wake to a minimum.',
    tone: 'low',
  },
  'Coleman Lake': {
    status: 'Non-motorized recreation',
    text: 'A no-motor lake suited to paddling, swimming and quiet shoreline enjoyment.',
    tone: 'low',
  },
}
