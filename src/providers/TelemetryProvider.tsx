'use client'

import { useEffect, type ReactNode } from 'react'
import { useTelemetrySocket } from '@/hooks/use-telemetry-socket'
import { useTelemetryStore } from '@/lib/store/telemetry-store'

/** Ouvre le socket une fois et le câble au store (le flush rAF → applyBatch). */
export function TelemetryProvider({ children }: { children: ReactNode }) {
  const applyBatch = useTelemetryStore((s) => s.applyBatch)
  const setConnection = useTelemetryStore((s) => s.setConnection)
  const setMetrics = useTelemetryStore((s) => s.setMetrics)

  const { connection, messagesPerSec, dropped } = useTelemetrySocket(applyBatch)

  useEffect(() => setConnection(connection), [connection, setConnection])
  useEffect(
    () => setMetrics(messagesPerSec, dropped),
    [messagesPerSec, dropped, setMetrics],
  )

  return <>{children}</>
}
