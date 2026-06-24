import { useTelemetryStore } from '@/lib/store/telemetry-store'

/** Liste des ids (référence stable entre deltas → la grille ne re-render pas). */
export function useFleetIds(): string[] {
  return useTelemetryStore((s) => s.ids)
}
