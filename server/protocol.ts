// Protocole wire côté serveur — réexporte le contrat canonique de src/lib/types.
// Source unique de vérité : src/lib/types. Import relatif volontaire (tsx ne
// résout pas l'alias @/ des paths tsconfig côté serveur).
export type {
  Gpu,
  GpuModel,
  GpuHealth,
  TelemetrySample,
  WireMessage,
} from '../src/lib/types'
