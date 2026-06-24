// Politique de reconnexion WebSocket — pure (ni React, ni DOM, ni socket), testable seule.

export interface BackoffOptions {
  baseMs?: number // délai de la 1re tentative, avant jitter
  factor?: number // croissance exponentielle entre tentatives
  maxMs?: number // plafond dur
  jitter?: number // amplitude, en fraction du délai (0.3 = ±30 %)
  random?: () => number // injectable pour les tests
}

const DEFAULTS = {
  baseMs: 1_000,
  factor: 2,
  maxMs: 30_000,
  jitter: 0.3,
} as const

// min(maxMs, baseMs · factor^attempt) puis jitter ±, clampé dans [0, maxMs].
export function backoffDelay(attempt: number, opts: BackoffOptions = {}): number {
  const baseMs = opts.baseMs ?? DEFAULTS.baseMs
  const factor = opts.factor ?? DEFAULTS.factor
  const maxMs = opts.maxMs ?? DEFAULTS.maxMs
  const jitter = opts.jitter ?? DEFAULTS.jitter
  const random = opts.random ?? Math.random

  const exponential = baseMs * factor ** Math.max(0, attempt)
  const capped = Math.min(maxMs, exponential)
  const delta = capped * jitter * (random() * 2 - 1) // symétrique : ±jitter·capped
  return Math.min(maxMs, Math.max(0, Math.round(capped + delta)))
}

export const WS_CLOSE_NORMAL = 1000

// retenter sur toute fermeture sauf normale (1000) : 1006/coupure → oui, unmount → non
export function shouldReconnect(closeCode: number): boolean {
  return closeCode !== WS_CLOSE_NORMAL
}
