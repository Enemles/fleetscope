import { create } from 'zustand'
import { HISTORY_LEN } from '@/lib/config'
import { pushBounded } from '@/lib/services/ring-buffer'
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
  /** Historique borné par GPU (HISTORY_LEN derniers samples). */
  history: Record<string, TelemetrySample[]>
  connection: ConnectionState
  messagesPerSec: number
  dropped: number
  /** GPU dont le détail est ouvert (drawer), ou null. */
  selectedGpuId: string | null
  /** Applique un lot de messages wire en UN set → un notify par frame. */
  applyBatch: (batch: WireMessage[]) => void
  setConnection: (connection: ConnectionState) => void
  setMetrics: (messagesPerSec: number, dropped: number) => void
  select: (id: string | null) => void
}

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  gpus: {},
  ids: [],
  samples: {},
  history: {},
  connection: 'idle',
  messagesPerSec: 0,
  dropped: 0,
  selectedGpuId: null,

  applyBatch: (batch) =>
    set((state) => {
      let { gpus, ids, samples, history } = state
      let changed = false
      for (const msg of batch) {
        if (msg.type === 'snapshot') {
          gpus = {}
          samples = {}
          history = {}
          for (const g of msg.gpus) gpus[g.id] = g
          for (const s of msg.samples) {
            samples[s.gpuId] = s
            history[s.gpuId] = [s]
          }
          ids = msg.gpus.map((g) => g.id)
          changed = true
        } else if (msg.type === 'delta') {
          // Clone une fois : seuls les gpuId reçus pointent vers de nouvelles réfs,
          // les autres gardent les leurs → leur sélecteur ne re-render pas.
          if (samples === state.samples) samples = { ...state.samples }
          if (history === state.history) history = { ...state.history }
          for (const s of msg.samples) {
            samples[s.gpuId] = s
            history[s.gpuId] = pushBounded(history[s.gpuId] ?? [], s, HISTORY_LEN)
          }
          changed = true
        }
      }
      return changed ? { gpus, ids, samples, history } : state
    }),

  setConnection: (connection) => set({ connection }),
  setMetrics: (messagesPerSec, dropped) => set({ messagesPerSec, dropped }),
  select: (selectedGpuId) => set({ selectedGpuId }),
}))
