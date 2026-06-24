// Constantes simulation + connexion, partagées client/serveur (surclassables par env).

function intFromEnv(value: string | undefined, fallback: number): number {
  const n = value ? Number.parseInt(value, 10) : Number.NaN
  return Number.isFinite(n) ? n : fallback
}

/** Nombre de GPU simulés. */
export const FLEET_SIZE = intFromEnv(process.env.NEXT_PUBLIC_FLEET_SIZE, 64)

/** Fréquence des ticks serveur (Hz). */
export const TICK_HZ = intFromEnv(process.env.NEXT_PUBLIC_TICK_HZ, 10)

/** Longueur d'historique par GPU/métrique (ring buffer). */
export const HISTORY_LEN = intFromEnv(process.env.NEXT_PUBLIC_HISTORY_LEN, 120)

/** Plafond du buffer entrant avant drop (backpressure). */
export const MAX_BUFFER = intFromEnv(process.env.NEXT_PUBLIC_MAX_BUFFER, 10_000)

/** URL du serveur WS (client). 127.0.0.1, pas localhost : évite l'ambiguïté IPv6/IPv4. */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://127.0.0.1:4000'
