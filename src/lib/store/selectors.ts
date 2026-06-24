import type { TelemetryData } from './telemetry-store'

export interface FleetStats {
  total: number
  live: number
  warn: number
  critical: number
}

/** Agrégats de la fleet à partir des samples courants. */
export function selectFleetStats({ ids, samples }: TelemetryData): FleetStats {
  let live = 0
  let warn = 0
  let critical = 0
  for (const id of ids) {
    const s = samples[id]
    if (!s) continue
    live++
    if (s.health === 'critical') critical++
    else if (s.health === 'warn') warn++
  }
  return { total: ids.length, live, warn, critical }
}
