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

/**
 * STORE NAÏF (Phase 1) — le "avant" de la leçon #1.
 *
 * Tout l'état vit dans un seul React Context. À chaque `delta`, le reducer recrée
 * l'objet `samples` ENTIER → nouvelle référence de la provider value → TOUS les
 * consumers du contexte re-render, même ceux qui ne lisent qu'un seul GPU.
 * C'est le re-render storm que la Phase 3 corrige avec un store Zustand + sélecteurs.
 */

interface TelemetryState {
  gpus: Record<string, Gpu>
  ids: string[]
  samples: Record<string, TelemetrySample>
}

const initialState: TelemetryState = { gpus: {}, ids: [], samples: {} }

function reducer(state: TelemetryState, msg: WireMessage): TelemetryState {
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

const StateContext = createContext<TelemetryState>(initialState)
const ConnectionContext = createContext<ConnectionState>('idle')

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const connection = useTelemetrySocket(dispatch)
  return (
    <ConnectionContext.Provider value={connection}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ConnectionContext.Provider>
  )
}

/** Liste stable des ids (ne change qu'au snapshot — mais re-render quand même, naïf). */
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

export interface FleetStats {
  total: number
  live: number
  warn: number
  critical: number
}

/** Agrégats de la fleet (recalculés à chaque tick — re-render du header). */
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
