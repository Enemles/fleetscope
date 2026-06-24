import { create } from 'zustand'
import type {
  ConnectionState,
  Gpu,
  TelemetrySample,
  WireMessage,
} from '@/lib/types'

/** Données de la fleet (sur quoi portent les sélecteurs). */
export interface TelemetryData {
  gpus: Record<string, Gpu>
  ids: string[]
  samples: Record<string, TelemetrySample>
}

interface TelemetryStore extends TelemetryData {
  connection: ConnectionState
  messagesPerSec: number
  dropped: number
  /** Applique un lot de messages wire en UN set → un notify par frame. */
  applyBatch: (batch: WireMessage[]) => void
  setConnection: (connection: ConnectionState) => void
  setMetrics: (messagesPerSec: number, dropped: number) => void
}

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  gpus: {},
  ids: [],
  samples: {},
  connection: 'idle',
  messagesPerSec: 0,
  dropped: 0,

  applyBatch: (batch) =>
    set((state) => {
      let { gpus, ids, samples } = state
      let changed = false
      for (const msg of batch) {
        if (msg.type === 'snapshot') {
          gpus = {}
          samples = {}
          for (const g of msg.gpus) gpus[g.id] = g
          for (const s of msg.samples) samples[s.gpuId] = s
          ids = msg.gpus.map((g) => g.id)
          changed = true
        } else if (msg.type === 'delta') {
          // Clone une fois : seuls les gpuId reçus pointent vers un nouveau sample,
          // les autres gardent leur référence → leur sélecteur ne re-render pas.
          if (samples === state.samples) samples = { ...state.samples }
          for (const s of msg.samples) samples[s.gpuId] = s
          changed = true
        }
      }
      return changed ? { gpus, ids, samples } : state
    }),

  setConnection: (connection) => set({ connection }),
  setMetrics: (messagesPerSec, dropped) => set({ messagesPerSec, dropped }),
}))
