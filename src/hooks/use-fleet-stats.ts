import { useShallow } from 'zustand/react/shallow'
import { useTelemetryStore } from '@/lib/store/telemetry-store'
import { selectFleetStats, type FleetStats } from '@/lib/store/selectors'

/** Agrégats de la fleet. Re-render seulement quand un compteur change. */
export function useFleetStats(): FleetStats {
  return useTelemetryStore(useShallow(selectFleetStats))
}
