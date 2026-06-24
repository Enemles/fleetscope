import { useShallow } from 'zustand/react/shallow'
import { useTelemetryStore } from '@/lib/store/telemetry-store'
import type { Gpu, TelemetrySample } from '@/lib/types'

/** Identité + dernier sample d'un GPU. Re-render seulement si CE sample change. */
export function useGpu(id: string): { gpu?: Gpu; sample?: TelemetrySample } {
  return useTelemetryStore(
    useShallow((s) => ({ gpu: s.gpus[id], sample: s.samples[id] })),
  )
}
