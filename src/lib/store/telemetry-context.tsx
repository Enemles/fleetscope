'use client'

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { useTelemetrySocket } from '@/hooks/use-telemetry-socket'
import type {
  ConnectionState,
  Gpu,
  TelemetrySample,
  WireMessage,
} from '@/lib/types'

// État dans un seul Context : un delta change la value → tous les consumers re-render.

interface TelemetryState {
  gpus: Record<string, Gpu>
  ids: string[]
  samples: Record<string, TelemetrySample>
}

const initialState: TelemetryState = { gpus: {}, ids: [], samples: {} }

/** Applique un message wire à l'état. */
function applyOne(state: TelemetryState, msg: WireMessage): TelemetryState {
  switch (msg.type) {
    case 'hello':
      return state
    case 'snapshot': {
      const gpus: Record<string, Gpu> = {}
      const samples: Record<string, TelemetrySample> = {}
      for (const g of msg.gpus) gpus[g.id] = g
      for (const s of msg.samples) samples[s.gpuId] = s
      return { gpus, ids: msg.gpus.map((g) => g.id), samples }
    }
    case 'delta': {
      const samples = { ...state.samples }
      for (const s of msg.samples) samples[s.gpuId] = s
      return { ...state, samples }
    }
  }
}

/** Plie un lot de messages en un seul état → un commit par frame. */
function reducer(state: TelemetryState, batch: WireMessage[]): TelemetryState {
  let next = state
  for (const msg of batch) next = applyOne(next, msg)
  return next
}

const StateContext = createContext<TelemetryState>(initialState)
const ConnectionContext = createContext<ConnectionState>('idle')

/** Métriques affichées dans la status bar. */
export interface TelemetryMetrics {
  messagesPerSec: number
  dropped: number
}
const MetricsContext = createContext<TelemetryMetrics>({
  messagesPerSec: 0,
  dropped: 0,
})

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [state, applyBatch] = useReducer(reducer, initialState)
  const { connection, messagesPerSec, dropped } = useTelemetrySocket(applyBatch)
  const metrics = useMemo(
    () => ({ messagesPerSec, dropped }),
    [messagesPerSec, dropped],
  )
  return (
    <ConnectionContext.Provider value={connection}>
      <MetricsContext.Provider value={metrics}>
        <StateContext.Provider value={state}>{children}</StateContext.Provider>
      </MetricsContext.Provider>
    </ConnectionContext.Provider>
  )
}

/** Liste des ids de la fleet. */
export function useFleetIds(): string[] {
  return useContext(StateContext).ids
}

/** Identité + dernier sample d'un GPU. */
export function useGpu(id: string): { gpu?: Gpu; sample?: TelemetrySample } {
  const state = useContext(StateContext)
  return { gpu: state.gpus[id], sample: state.samples[id] }
}

export function useConnection(): ConnectionState {
  return useContext(ConnectionContext)
}

/** Débit + drops, pour la status bar. */
export function useTelemetryMetrics(): TelemetryMetrics {
  return useContext(MetricsContext)
}

export interface FleetStats {
  total: number
  live: number
  warn: number
  critical: number
}

/** Agrégats de la fleet. */
export function useFleetStats(): FleetStats {
  const { ids, samples } = useContext(StateContext)
  return useMemo(() => {
    let live = 0
    let warn = 0
    let critical = 0
    for (const id of ids) {
      const s = samples[id]
      if (!s) continue
      live++
      if (s.health === 'critical') critical++
      else if (s.health === 'warn') warn++
    }
    return { total: ids.length, live, warn, critical }
  }, [ids, samples])
}
