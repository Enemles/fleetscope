// Modèle de données partagé fleetscope — le contrat entre le serveur de
// simulation (server/) et le front (src/). Le serveur émet, le front consomme.
//
// Aucun import ici : ce fichier est la source unique de vérité, chargée aussi
// bien par Next (alias @/) que par tsx côté serveur (import relatif).

/** Modèles de GPU simulés (clin d'œil aux accélérateurs AI : AMD MI3xx, NVIDIA H100). */
export type GpuModel = 'MI300X' | 'MI325X' | 'H100'

/** État de santé d'un GPU, dérivé côté serveur à partir des seuils (config/thresholds). */
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
  health: GpuHealth // dérivé serveur-side (le client reste un pur renderer)
}

/**
 * Protocole wire (serveur → client). Pattern "snapshot puis deltas" :
 *  - `hello`    : poignée de main (fréquence, taille de fleet)
 *  - `snapshot` : état complet à la connexion / resync (après reconnexion)
 *  - `delta`    : seulement les samples qui ont changé à ce tick
 */
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
