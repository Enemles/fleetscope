import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTelemetryStore } from '@/lib/store/telemetry-store'
import type { Gpu, TelemetrySample } from '@/lib/types'

const EMPTY: TelemetrySample[] = []

/** Identité + dernier sample d'un GPU. Re-render seulement si CE sample change. */
export function useGpu(id: string): { gpu?: Gpu; sample?: TelemetrySample } {
  return useTelemetryStore(
    useShallow((s) => ({ gpu: s.gpus[id], sample: s.samples[id] })),
  )
}

/** Historique borné d'un GPU (réf stable tant qu'il ne reçoit pas de sample). */
export function useGpuHistory(id: string): TelemetrySample[] {
  return useTelemetryStore((s) => s.history[id] ?? EMPTY)
}

/**
 * Historique échantillonné à `hz` : lit le store en transient (getState) sur un
 * timer, sans s'abonner → le chart re-render à `hz`, PAS au débit du store.
 */
export function useGpuHistoryThrottled(id: string, hz = 3): TelemetrySample[] {
  const [snapshot, setSnapshot] = useState<TelemetrySample[]>(
    () => useTelemetryStore.getState().history[id] ?? EMPTY,
  )
  useEffect(() => {
    const read = () =>
      setSnapshot(useTelemetryStore.getState().history[id] ?? EMPTY)
    read()
    const t = setInterval(read, Math.round(1000 / hz))
    return () => clearInterval(t)
  }, [id, hz])
  return snapshot
}
