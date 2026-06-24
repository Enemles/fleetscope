import { useShallow } from 'zustand/react/shallow'
import { useTelemetryStore } from '@/lib/store/telemetry-store'
import type { ConnectionState } from '@/lib/types'

export function useConnection(): ConnectionState {
  return useTelemetryStore((s) => s.connection)
}

export interface TelemetryMetrics {
  messagesPerSec: number
  dropped: number
}

export function useTelemetryMetrics(): TelemetryMetrics {
  return useTelemetryStore(
    useShallow((s) => ({ messagesPerSec: s.messagesPerSec, dropped: s.dropped })),
  )
}
