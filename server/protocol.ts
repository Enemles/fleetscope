// Réexporte le contrat wire de src/lib/types (import relatif : tsx ne résout pas @/).
export type {
  Gpu,
  GpuModel,
  GpuHealth,
  TelemetrySample,
  WireMessage,
} from '../src/lib/types'
