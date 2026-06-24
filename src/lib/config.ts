// Constantes de simulation + connexion, partagées client/serveur.
// Surclassables par variables d'env pour les démos (scaler la fleet, le débit) :
//   NEXT_PUBLIC_* sont inlinées côté client par Next ; les autres sont serveur-only.
//
// Pas d'import : fichier partagé (chargé par Next ET par tsx côté serveur).

function intFromEnv(value: string | undefined, fallback: number): number {
  const n = value ? Number.parseInt(value, 10) : Number.NaN
  return Number.isFinite(n) ? n : fallback
}

/** Nombre de GPU simulés. Monter à 1000–2000 pour la démo perf (Phase 5). */
export const FLEET_SIZE = intFromEnv(process.env.NEXT_PUBLIC_FLEET_SIZE, 64)

/** Fréquence d'émission des ticks serveur (Hz). 10 par défaut, 20 pour stresser. */
export const TICK_HZ = intFromEnv(process.env.NEXT_PUBLIC_TICK_HZ, 10)

/** Longueur de l'historique gardé par GPU/métrique (ring buffer, Phase 4). */
export const HISTORY_LEN = intFromEnv(process.env.NEXT_PUBLIC_HISTORY_LEN, 120)

/** Plafond du buffer de messages entrants avant drop (backpressure, Phase 2). */
export const MAX_BUFFER = intFromEnv(process.env.NEXT_PUBLIC_MAX_BUFFER, 10_000)

/**
 * URL du serveur WebSocket de télémétrie (lue côté client).
 * 127.0.0.1 plutôt que "localhost" : évite l'ambiguïté IPv6/IPv4 (::1 vs 127.0.0.1)
 * qui peut faire échouer la connexion du navigateur en local/CI.
 * (Le port serveur vit dans server/index.ts — non exposé au bundle client.)
 */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://127.0.0.1:4000'
