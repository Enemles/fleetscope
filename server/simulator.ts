// Simulateur de fleet GPU : state machine déterministe (PRNG seedé), random walks
// + thermal events rares. Imports relatifs (chargé par tsx).

import { deriveHealth } from '../src/config/thresholds'
import { FLEET_SIZE } from '../src/lib/config'
import type { Gpu, GpuModel, TelemetrySample } from './protocol'

const MODELS: { model: GpuModel; memoryTotalGb: number }[] = [
  { model: 'MI300X', memoryTotalGb: 192 },
  { model: 'MI325X', memoryTotalGb: 256 },
  { model: 'H100', memoryTotalGb: 80 },
]

const GPUS_PER_HOST = 8

/** PRNG déterministe (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface SimState {
  gpu: Gpu
  utilizationPct: number
  memoryUsedGb: number
  temperatureC: number
  powerDrawW: number
  fanPct: number
  /** Ticks restants d'un thermal event en cours (0 = nominal). */
  thermalEvent: number
}

export class FleetSimulator {
  private readonly rng: () => number
  private readonly state: SimState[]

  constructor(size: number = FLEET_SIZE, seed = 1337) {
    this.rng = mulberry32(seed)
    this.state = Array.from({ length: size }, (_, i) => this.spawn(i))
  }

  private spawn(i: number): SimState {
    const spec = MODELS[i % MODELS.length]
    const hostIndex = Math.floor(i / GPUS_PER_HOST)
    const gpu: Gpu = {
      id: `gpu-${String(i).padStart(4, '0')}`,
      hostname: `node-${String(hostIndex).padStart(2, '0')}`,
      rack: `rack-${String.fromCharCode(65 + (hostIndex % 8))}`,
      index: i % GPUS_PER_HOST,
      model: spec.model,
      memoryTotalGb: spec.memoryTotalGb,
    }
    const util = 20 + this.rng() * 60
    return {
      gpu,
      utilizationPct: util,
      memoryUsedGb: (util / 100) * gpu.memoryTotalGb * 0.8,
      temperatureC: 45 + this.rng() * 20,
      powerDrawW: 150 + (util / 100) * 400,
      fanPct: 30 + this.rng() * 30,
      thermalEvent: 0,
    }
  }

  /** Identités de la fleet — pour le snapshot initial. */
  get gpus(): Gpu[] {
    return this.state.map((s) => s.gpu)
  }

  /** Snapshot complet (tous les samples courants), sans avancer la simulation. */
  snapshot(ts: number): TelemetrySample[] {
    return this.state.map((s) => this.sample(s, ts))
  }

  /** Avance d'un tick et renvoie TOUS les samples (toute la fleet bouge à chaque tick). */
  tick(ts: number): TelemetrySample[] {
    for (const s of this.state) this.step(s)
    return this.state.map((s) => this.sample(s, ts))
  }

  private step(s: SimState): void {
    // Random walk borné sur l'utilisation (le driver principal).
    s.utilizationPct = clampPct(s.utilizationPct + (this.rng() - 0.5) * 12)

    // Déclenche/maintient un thermal event rare.
    if (s.thermalEvent > 0) s.thermalEvent--
    else if (this.rng() < 0.002) s.thermalEvent = 40 + Math.floor(this.rng() * 60)

    const load = s.utilizationPct / 100
    const targetTemp = 40 + load * 45 + (s.thermalEvent > 0 ? 18 : 0)
    s.temperatureC = approach(s.temperatureC, targetTemp, 0.1)
    s.powerDrawW = approach(s.powerDrawW, 120 + load * 580, 0.2)
    s.memoryUsedGb = clamp(
      approach(s.memoryUsedGb, load * s.gpu.memoryTotalGb * 0.9, 0.15),
      0,
      s.gpu.memoryTotalGb,
    )
    s.fanPct = clampPct(approach(s.fanPct, 25 + (s.temperatureC - 40) * 1.6, 0.2))
  }

  private sample(s: SimState, ts: number): TelemetrySample {
    return {
      gpuId: s.gpu.id,
      ts,
      utilizationPct: round1(s.utilizationPct),
      memoryUsedGb: round1(s.memoryUsedGb),
      temperatureC: round1(s.temperatureC),
      powerDrawW: round1(s.powerDrawW),
      fanPct: round1(s.fanPct),
      health: deriveHealth(s),
    }
  }
}

function approach(current: number, target: number, rate: number): number {
  return current + (target - current) * rate
}
function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}
function clampPct(v: number): number {
  return clamp(v, 0, 100)
}
function round1(v: number): number {
  return Math.round(v * 10) / 10
}
