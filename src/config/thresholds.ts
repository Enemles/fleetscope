// Seuils de santé GPU + mapping couleur. Utilisé serveur-side pour dériver
// `health` au moment du tick, et client-side pour colorer cards/heatmap de
// façon cohérente. Import relatif (fichier partagé, cf. lib/config).

import type { GpuHealth } from '../lib/types'

export interface MetricThresholds {
  /** Au-delà = état "warn". */
  warn: number
  /** Au-delà = état "critical". */
  critical: number
}

/** Seuils par métrique (au-delà du seuil = dégradé). */
export const THRESHOLDS = {
  temperatureC: { warn: 80, critical: 90 },
  utilizationPct: { warn: 92, critical: 99 },
  powerDrawW: { warn: 600, critical: 700 },
} as const satisfies Record<string, MetricThresholds>

/**
 * Dérive l'état de santé global d'un sample : le pire signal gagne.
 * (Un seul `critical` suffit à passer le GPU en critique.)
 */
export function deriveHealth(input: {
  temperatureC: number
  utilizationPct: number
  powerDrawW: number
}): GpuHealth {
  let worst: GpuHealth = 'ok'
  for (const key of ['temperatureC', 'utilizationPct', 'powerDrawW'] as const) {
    const { warn, critical } = THRESHOLDS[key]
    if (input[key] >= critical) return 'critical'
    if (input[key] >= warn) worst = 'warn'
  }
  return worst
}

/** Couleur (token CSS Tailwind v4) associée à un état de santé — cards, légende, heatmap. */
export const HEALTH_COLOR: Record<GpuHealth, string> = {
  ok: 'var(--color-emerald-500)',
  warn: 'var(--color-amber-500)',
  critical: 'var(--color-red-500)',
  offline: 'var(--color-zinc-500)',
}
