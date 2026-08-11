'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'

type SimulatorStyle = CSSProperties & {
  '--wake-height': string
  '--boat-angle': string
  '--boat-lift': string
  '--wake-duration': string
  '--shore-gap': string
  '--boat-x': string
  '--wake-travel': string
  '--shore-scale': string
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

function baseWake(speed: number) {
  if (speed <= 3) return speed * 3
  if (speed <= 10) return 9 + (speed - 3) * 1.25
  if (speed <= 25) return 18 + ((speed - 10) / 15) * 67
  if (speed <= 35) return 85 - ((speed - 25) / 10) * 45
  return 40 - ((speed - 35) / 20) * 12
}

function attenuation(distanceTravelled: number) {
  return Math.pow(25 / (25 + Math.max(0, distanceTravelled)), 1 / 3)
}

type RiskLevel = 'low' | 'caution' | 'high'
type PresetId = 'idle' | 'plowing' | 'planing' | 'tow' | 'custom'
type SimulatorSettings = {
  speed: number
  power: number
  trim: number
  load: number
  distance: number
  towing: boolean
}

const DEFAULT_SETTINGS: SimulatorSettings = {
  speed: 19,
  power: 45,
  trim: 3,
  load: 65,
  distance: 30,
  towing: false,
}

const PRESETS: Array<{ id: Exclude<PresetId, 'custom'>; label: string; detail: string; settings: SimulatorSettings }> = [
  { id: 'idle', label: 'Idle', detail: 'Minimum wake', settings: { speed: 3, power: 10, trim: 0, load: 35, distance: 30, towing: false } },
  { id: 'plowing', label: 'Slow & plowing', detail: 'Large wake', settings: DEFAULT_SETTINGS },
  { id: 'planing', label: 'Fully on plane', detail: 'Smaller wake', settings: { speed: 44, power: 65, trim: 0, load: 50, distance: 30, towing: false } },
  { id: 'tow', label: 'Tube + rider', detail: '50 km/h · 400 m', settings: { speed: 50, power: 75, trim: -2, load: 70, distance: 400, towing: true } },
]

function riskLevel(score: number, cautionAt: number, highAt: number): RiskLevel {
  if (score >= highAt) return 'high'
  if (score >= cautionAt) return 'caution'
  return 'low'
}

function WaveHeightLabel({
  sourceHeight,
  distance,
  duration,
  phaseOffset,
  multiplier,
}: {
  sourceHeight: number
  distance: number
  duration: number
  phaseOffset: number
  multiplier: number
}) {
  const [clock, setClock] = useState(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setClock(-1)
      return
    }
    const update = () => setClock(performance.now() / 1000)
    update()
    const interval = window.setInterval(update, 90)
    return () => window.clearInterval(interval)
  }, [])

  const phase = clock < 0 ? 1 : ((clock / duration) + phaseOffset) % 1
  const currentHeight = sourceHeight * multiplier * attenuation(distance * phase)
  return <span>~{currentHeight.toFixed(0)} cm</span>
}

export default function WakeSimulator() {
  const [speed, setSpeed] = useState<number>(DEFAULT_SETTINGS.speed)
  const [power, setPower] = useState<number>(DEFAULT_SETTINGS.power)
  const [trim, setTrim] = useState<number>(DEFAULT_SETTINGS.trim)
  const [load, setLoad] = useState<number>(DEFAULT_SETTINGS.load)
  const [distance, setDistance] = useState<number>(DEFAULT_SETTINGS.distance)
  const [towing, setTowing] = useState<boolean>(DEFAULT_SETTINGS.towing)
  const [preset, setPreset] = useState<PresetId>('plowing')

  function applySettings(settings: SimulatorSettings) {
    setSpeed(settings.speed)
    setPower(settings.power)
    setTrim(settings.trim)
    setLoad(settings.load)
    setDistance(settings.distance)
    setTowing(settings.towing)
  }

  function choosePreset(nextPreset: PresetId) {
    setPreset(nextPreset)
    if (nextPreset === 'custom') return
    const selected = PRESETS.find(option => option.id === nextPreset)
    if (selected) applySettings(selected.settings)
  }

  function choosePresetDistance(nextPreset: Exclude<PresetId, 'custom'>, nextDistance: 30 | 400) {
    const selected = PRESETS.find(option => option.id === nextPreset)
    if (!selected) return
    setPreset(nextPreset)
    applySettings({ ...selected.settings, distance: nextDistance })
  }

  function customize(update: () => void) {
    setPreset('custom')
    update()
  }

  function resetSimulator() {
    setPreset('plowing')
    applySettings(DEFAULT_SETTINGS)
  }

  const result = useMemo(() => {
    const trimFactor = 1 + Math.max(0, trim) * 0.055 - Math.max(0, -trim) * 0.035
    const loadFactor = 0.78 + load * 0.0044
    const towFactor = towing ? 1.16 : 1
    const powerMismatch = speed === 0 ? 0 : clamp((power - speed * 1.8) / 100, 0, 0.85)
    const powerFactor = 0.85 + power * 0.003
    const wakeIndex = Math.round(clamp(baseWake(speed) * trimFactor * loadFactor * towFactor * powerFactor * (1 + powerMismatch * 1.7), 0, 100))
    const waveSpeed = 1.45 + wakeIndex * 0.009
    const arrivalSeconds = wakeIndex === 0 ? 0 : Math.round(distance / waveSpeed)
    const sourceHeightCm = clamp(wakeIndex * 0.42, 0, 55)
    const shoreHeightCm = Math.round(sourceHeightCm * attenuation(distance) * 10) / 10
    const proximityFactor = distance <= 45 ? 1.25 : distance <= 200 ? 1.1 : 1
    const risks: Array<{ label: string; detail: string; level: RiskLevel }> = wakeIndex === 0 ? [
      { label: 'Nesting wildlife', detail: 'Loons and shoreline nests', level: 'low' },
      { label: 'Shoreline erosion', detail: 'Banks, soil and sediment', level: 'low' },
      { label: 'Docks and property', detail: 'Docks, boats and structures', level: 'low' },
      { label: 'Swimmers and watercraft', detail: 'People, paddlers and small craft', level: 'low' },
    ] : [
      {
        label: 'Nesting wildlife',
        detail: 'Loons and shoreline nests',
        level: riskLevel(shoreHeightCm * 1.2 * proximityFactor + (distance <= 200 ? 2 : 0), 8, 18),
      },
      {
        label: 'Shoreline erosion',
        detail: 'Banks, soil and sediment',
        level: riskLevel(shoreHeightCm * proximityFactor * (load >= 70 ? 1.15 : 1), 10, 22),
      },
      {
        label: 'Docks and property',
        detail: 'Docks, boats and structures',
        level: riskLevel(shoreHeightCm * (distance <= 45 ? 1.2 : 1), 12, 25),
      },
      {
        label: 'Swimmers and watercraft',
        detail: 'People, paddlers and small craft',
        level: riskLevel(shoreHeightCm * (speed > 10 ? 1.1 : 1) * (towing ? 1.2 : 1), 8, 20),
      },
    ]

    let mode = 'Planing'
    let guidance = 'More hull is lifted clear of the water, reducing displacement.'
    let boatAngle = -1 + trim * 0.35 + powerMismatch * 3
    let boatLift = 17
    if (speed === 0) {
      mode = 'Stopped / no wake'
      guidance = 'The boat is not moving, so it is not generating a travelling wake.'
      boatAngle = 0
      boatLift = 0
    } else if (speed <= 3) {
      mode = 'Idle / minimal wake'
      guidance = 'Low throttle and a settled hull usually produce the smallest wake.'
      boatAngle = trim * 0.25 + powerMismatch * 5
      boatLift = 0
    } else if (speed <= 10) {
      mode = 'Slow displacement'
      guidance = 'Legal speed does not guarantee a small wake—watch the water behind you.'
      boatAngle = 1.5 + trim * 0.45 + powerMismatch * 9
      boatLift = 0
    } else if (speed <= 28) {
      mode = 'Transition / plowing'
      guidance = 'The bow is high and the hull is displacing the most water. Avoid lingering here.'
      boatAngle = 6 + trim * 0.7 + powerMismatch * 8
      boatLift = 2
    }

    if (speed > 0 && speed <= 10 && powerMismatch > 0.35) {
      mode = 'High-power slow / bow high'
      guidance = 'High engine power without matching boat speed drives the stern down and holds the bow high—like slow flight at a high angle of attack.'
    } else if (speed > 10 && speed <= 28 && powerMismatch > 0.25) {
      mode = 'High-power plowing'
      guidance = 'Power is high for this speed. The hull is bow-high, displacing heavily and producing a larger wake.'
    }

    if (towing) {
      if (distance < 400) {
        guidance += ' Move at least 400 m offshore before adding speed for this low-impact towing example.'
      } else if (speed < 45) {
        guidance += ' This comparison uses a high planing speed to lift more hull clear of the water and minimize displacement.'
      } else if (trim > -2) {
        guidance += ' Keep the boat cleanly on plane and trim fully in to hold the bow down.'
      } else {
        guidance += ' This is the lowest dock-and-property-impact towing setup represented by the model: 400m+ offshore, high planing speed for minimum hull displacement and fully bow-down trim.'
      }
    }

    return { wakeIndex, arrivalSeconds, sourceHeightCm, shoreHeightCm, mode, guidance, boatAngle, boatLift, risks }
  }, [distance, load, power, speed, towing, trim])

  const operationAdvice = useMemo(() => {
    if (towing) {
      const conditionsMet = distance >= 400 && speed >= 45 && trim <= -2
      if (distance < 400) {
        return {
          level: 'high' as RiskLevel,
          label: 'Never',
          title: 'Never use this parallel-to-shore setup close to shore',
          detail: 'Move at least 400 m offshore before adding towing speed in this low-impact example.',
        }
      }
      if (!conditionsMet) {
        return {
          level: 'caution' as RiskLevel,
          label: 'Adjust',
          title: 'Conditions not met—adjust before towing',
          detail: 'The low-impact comparison requires 400m+ offshore, a high planing speed and fully bow-down trim.',
        }
      }
      return {
        level: 'low' as RiskLevel,
        label: 'Conditional',
        title: 'OK only when every condition is met',
        detail: 'Model comparison only: 50 km/h is not a recommended towing speed. Choose a safe speed for the rider, boat, traffic and conditions.',
      }
    }

    if (preset === 'idle' || speed <= 3) {
      return {
        level: 'low' as RiskLevel,
        label: 'Lowest wake',
        title: 'OK for wake impact at either distance',
        detail: 'This is the simulator’s lowest-wake mode. Keep watching for swimmers, docks, wildlife and changing conditions.',
      }
    }

    if (preset === 'plowing' || (speed > 10 && speed <= 28) || result.mode.includes('High-power')) {
      return {
        level: 'high' as RiskLevel,
        label: 'Avoid',
        title: 'Not recommended in any conditions',
        detail: 'A bow-high plowing hull displaces heavily. Pass through this range promptly rather than sustaining it.',
      }
    }

    if (speed > 28 && distance <= 45) {
      return {
        level: 'high' as RiskLevel,
        label: 'Unsafe',
        title: 'Unsafe at close distance',
        detail: 'At this close distance, the speed exceeds the general 10 km/h near-shore limit and leaves little margin around people or property.',
      }
    }

    return {
      level: 'caution' as RiskLevel,
      label: 'Caution',
      title: 'Operate with precaution',
      detail: 'A planing boat can make a smaller wake, but speed, traffic, water depth and the wake behind you still matter.',
    }
  }, [distance, preset, result.mode, speed, towing, trim])

  const powerLabel = power < 25 ? 'Low' : power < 70 ? 'Cruise' : 'High'
  const trimLabel = trim <= -1 ? 'Bow down' : trim >= 2 ? 'Bow high' : 'Neutral'
  const loadLabel = load < 35 ? 'Light' : load < 70 ? 'Typical' : 'Heavy'
  const wakeDuration = 6.8 - result.wakeIndex * 0.018
  const hasWake = speed > 0 && result.wakeIndex > 0
  const style: SimulatorStyle = {
    '--wake-height': `${12 + result.wakeIndex * 0.72}px`,
    '--boat-angle': `${-result.boatAngle}deg`,
    '--boat-lift': `${result.boatLift}px`,
    '--wake-duration': `${wakeDuration}s`,
    '--shore-gap': `${clamp(distance, 30, 400)}%`,
    '--boat-x': `${65 - ((distance - 30) / 370) * 49}%`,
    '--wake-travel': `${105 + ((distance - 30) / 370) * 235}px`,
    '--shore-scale': `${result.sourceHeightCm > 0 ? result.shoreHeightCm / result.sourceHeightCm : 0.25}`,
  }

  return (
    <div className="wake-simulator" style={style}>
      <div className="wake-sim-toolbar">
        <div>
          <strong>Choose a scenario</strong>
          <span>Start with a preset, or choose Custom to adjust every setting.</span>
        </div>
        <button type="button" onClick={resetSimulator}>Reset</button>
      </div>
      <div className="wake-sim-presets" role="group" aria-label="Wake simulator scenarios">
        {PRESETS.map(option => (
          <div className={`wake-sim-preset ${preset === option.id ? 'is-active' : ''}`} key={option.id}>
            <button type="button" className="wake-sim-preset-main" aria-pressed={preset === option.id} onClick={() => choosePreset(option.id)}>
              <strong>{option.label}</strong><small>{option.detail}</small>
            </button>
            <div className="wake-sim-preset-distances" role="group" aria-label={`${option.label} shoreline distance`}>
              <button type="button" className={preset === option.id && distance === 30 ? 'is-active' : ''} aria-pressed={preset === option.id && distance === 30} onClick={() => choosePresetDistance(option.id, 30)}>
                <strong>Close</strong><small>30 m</small>
              </button>
              <button type="button" className={preset === option.id && distance === 400 ? 'is-active' : ''} aria-pressed={preset === option.id && distance === 400} onClick={() => choosePresetDistance(option.id, 400)}>
                <strong>Far</strong><small>400 m</small>
              </button>
            </div>
          </div>
        ))}
        <div className={`wake-sim-preset wake-sim-preset-custom ${preset === 'custom' ? 'is-active' : ''}`}>
          <button type="button" className="wake-sim-preset-main" aria-pressed={preset === 'custom'} onClick={() => choosePreset('custom')}>
            <strong>Custom</strong><small>Set your own</small>
          </button>
        </div>
      </div>

      <div className={`wake-custom-reveal ${preset === 'custom' ? 'is-open' : ''}`} aria-hidden={preset !== 'custom'}>
        <div>
          <div className="wake-sim-controls" aria-label="Custom wake simulator controls">
            <label>
              <span><strong>Boat speed</strong><output>{speed} km/h</output></span>
              <input type="range" min="0" max="55" step="1" value={speed} onChange={event => customize(() => setSpeed(Number(event.target.value)))} />
              <small>Idle <i /> Transition <i /> On plane</small>
            </label>
            <label>
              <span><strong>Engine power</strong><output>{powerLabel} · {power}%</output></span>
              <input type="range" min="0" max="100" step="5" value={power} onChange={event => customize(() => setPower(Number(event.target.value)))} />
              <small>Low <i /> Cruise <i /> High power</small>
            </label>
            <label>
              <span><strong>Trim position</strong><output>{trimLabel}</output></span>
              <input type="range" min="-2" max="6" step="1" value={trim} onChange={event => customize(() => setTrim(Number(event.target.value)))} />
              <small>Bow down <i /> Neutral <i /> Bow high</small>
            </label>
            <label>
              <span><strong>Boat load</strong><output>{loadLabel}</output></span>
              <input type="range" min="0" max="100" step="5" value={load} onChange={event => customize(() => setLoad(Number(event.target.value)))} />
              <small>Light <i /> Passengers &amp; gear <i /> Heavy</small>
            </label>
            <label>
              <span><strong>Distance from shore</strong><output>{distance} m</output></span>
              <input type="range" min="30" max="400" step="10" value={distance} onChange={event => customize(() => setDistance(Number(event.target.value)))} />
              <small>30 m <i /> 200 m <i /> 400 m</small>
            </label>
            <div className="wake-tow-control">
              <span><strong>Tow setup</strong><output>{towing ? 'Tube + rider' : 'No tow'}</output></span>
              <div role="group" aria-label="Choose whether the boat is towing a person on a tube">
                <button type="button" className={!towing ? 'is-active' : ''} aria-pressed={!towing} onClick={() => customize(() => setTowing(false))}>Boat only</button>
                <button type="button" className={towing ? 'is-active' : ''} aria-pressed={towing} onClick={() => customize(() => setTowing(true))}>Tube + rider</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wake-sim-readout" aria-live="polite">
        <div className="wake-sim-mode"><span>Operating mode</span><strong>{result.mode}</strong><small>{result.guidance}</small></div>
        <div><span>Relative wake</span><strong>{result.wakeIndex}<small>/100</small></strong></div>
        <div><span>Est. maximum at shore</span><strong>~{result.shoreHeightCm.toFixed(0)}<small> cm</small></strong></div>
        <div><span>Estimated arrival</span><strong>~{result.arrivalSeconds}<small> sec</small></strong></div>
      </div>

      <section className="wake-risk-panel" aria-label="Relative shoreline risk indicators">
        <div className="wake-risk-heading">
          <div><strong>Relative shoreline risk screen</strong><span>Comparative model indicator · not a damage forecast</span></div>
          <div className="wake-risk-legend" aria-label="Risk scale: green is low, orange is caution, red is high">
            <small>Risk scale</small><b className="legend-low">Low</b><b className="legend-caution">Caution</b><b className="legend-high">High</b>
          </div>
        </div>
        <div className={`wake-operation-guide advice-${operationAdvice.level}`} role="status">
          <div className="wake-operation-copy">
            <small>Operating guidance</small>
            <strong>{operationAdvice.title}</strong>
            <span>{operationAdvice.detail}</span>
          </div>
          {towing && (
            <div className="wake-operation-conditions" aria-label="Low-impact towing conditions">
              <span className={distance >= 400 ? 'is-met' : ''}>400m+ offshore</span>
              <span className={speed >= 45 ? 'is-met' : ''}>High planing speed</span>
              <span className={trim <= -2 ? 'is-met' : ''}>Bow fully down</span>
            </div>
          )}
          <b>{operationAdvice.label}</b>
        </div>
        <div className="wake-risk-grid">
          {result.risks.map(risk => (
            <div className={`wake-risk-card risk-${risk.level}`} key={risk.label}>
              <i aria-hidden="true" />
              <div><strong>{risk.label}</strong><span>{risk.detail}</span></div>
              <b>{risk.level === 'low' ? 'Low' : risk.level === 'caution' ? 'Caution' : 'High'}</b>
            </div>
          ))}
        </div>
      </section>

      <div className="wake-sim-views">
        <div className="wake-sim-stage wake-sim-side" aria-label={`Animated side view of a boat travelling parallel to shore at ${speed} kilometres per hour with a relative wake index of ${result.wakeIndex}`}>
          <span className="wake-sim-view-label">Boat profile · parallel to shore</span>
          <div className="wake-sim-speed"><span>Boat speed</span><strong>{speed}<small> km/h</small></strong></div>
          <div className="wake-sim-boat" />
          {towing && <><div className="wake-tow-rope-side" /><div className="wake-tube-side"><i /></div></>}
          {hasWake && <>
            <div className="wake-sim-wave wave-one" />
            <div className="wake-sim-wave wave-two" />
            <div className="wake-sim-wave wave-three" />
            <div className="wake-side-value value-one"><WaveHeightLabel sourceHeight={result.sourceHeightCm} distance={distance} duration={wakeDuration} phaseOffset={0} multiplier={1} /></div>
            <div className="wake-side-value value-two"><WaveHeightLabel sourceHeight={result.sourceHeightCm} distance={distance} duration={wakeDuration} phaseOffset={0.34} multiplier={0.78} /></div>
            <div className="wake-side-value value-three"><WaveHeightLabel sourceHeight={result.sourceHeightCm} distance={distance} duration={wakeDuration} phaseOffset={0.68} multiplier={0.6} /></div>
          </>}
          <div className="wake-shore-height"><span>Maximum at shore</span><strong>~{result.shoreHeightCm.toFixed(0)} cm</strong></div>
        </div>
        <div className="wake-sim-stage wake-sim-top" aria-label={`Animated top view with the boat travelling parallel to and ${distance} metres from shore`}>
          <span className="wake-sim-view-label">Top view · travelling parallel to shore</span>
          <div className="wake-sim-speed"><span>Boat speed</span><strong>{speed}<small> km/h</small></strong></div>
          <div className="wake-top-boat-live" />
          {towing && <><div className="wake-tow-rope-top" /><div className="wake-tube-top"><i /></div></>}
          {hasWake && <>
            <div className="wake-top-fan" />
            <div className="wake-top-ripple ripple-one" />
            <div className="wake-top-ripple ripple-two" />
            <div className="wake-top-ripple ripple-three" />
            <div className="wake-top-value value-one"><WaveHeightLabel sourceHeight={result.sourceHeightCm} distance={distance} duration={wakeDuration} phaseOffset={0} multiplier={1} /></div>
            <div className="wake-top-value value-two"><WaveHeightLabel sourceHeight={result.sourceHeightCm} distance={distance} duration={wakeDuration} phaseOffset={0.5} multiplier={0.78} /></div>
            <div className="wake-top-value value-three"><WaveHeightLabel sourceHeight={result.sourceHeightCm} distance={distance} duration={wakeDuration} phaseOffset={0.75} multiplier={0.6} /></div>
          </>}
          <div className="wake-sim-distance"><i /><span>{distance} m</span></div>
          <div className="wake-sim-shore"><span>shore</span></div>
          <div className="wake-shore-height"><span>Maximum at shore</span><strong>~{result.shoreHeightCm.toFixed(0)} cm</strong></div>
        </div>
      </div>

      <div className="wake-sim-benchmarks">
        <strong>Why the slower boat can make the larger wake</strong>
        <span>In one measured test at 50 m, a boat plowing at 19 km/h made a 22 cm wave. Once fully on plane at 44 km/h, it made a smaller 13 cm wave.</span>
        <small>A plowing hull pushes more water aside. These are reference measurements—not predictions for every boat.</small>
      </div>
    </div>
  )
}
