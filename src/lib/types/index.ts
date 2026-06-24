// Contrat de données partagé serveur/front. Aucun import (chargé par Next ET tsx).

/** Modèles de GPU simulés. */
export type GpuModel = 'MI300X' | 'MI325X' | 'H100'

/** Santé d'un GPU, dérivée serveur-side. */
export type GpuHealth = 'ok' | 'warn' | 'critical' | 'offline'

/** Identité + faits lents d'un GPU. Envoyé une seule fois via le snapshot. */
export interface Gpu {
  id: string // ex. "gpu-0007"
  hostname: string // ex. "node-03"
  rack: string // ex. "rack-A"
  index: number // position dans l'hôte (0–7)
  model: GpuModel
  memoryTotalGb: number // ex. 192
}

/** Un tick de télémétrie haute fréquence pour un GPU. */
export interface TelemetrySample {
  gpuId: string
  ts: number // epoch ms (horloge serveur)
  utilizationPct: number // 0–100 (compute / SM)
  memoryUsedGb: number // 0–memoryTotalGb
  temperatureC: number // ex. 30–95
  powerDrawW: number // ex. 100–750
  fanPct: number // 0–100
  health: GpuHealth // dérivé serveur-side
}

/** Protocole wire (serveur → client) : snapshot puis deltas. */
export type WireMessage =
  | { type: 'hello'; serverTs: number; tickHz: number; fleetSize: number }
  | { type: 'snapshot'; ts: number; gpus: Gpu[]; samples: TelemetrySample[] }
  | { type: 'delta'; ts: number; samples: TelemetrySample[] }

/** État de la connexion temps réel, affiché dans la status bar. */
export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'closed'
