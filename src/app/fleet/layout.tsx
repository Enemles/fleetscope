import type { ReactNode } from 'react'
import { ConnectionStatusBar } from '@/components/ConnectionStatusBar'
import { TelemetryProvider } from '@/providers/TelemetryProvider'

export default function FleetLayout({ children }: { children: ReactNode }) {
  return (
    <TelemetryProvider>
      <div className="min-h-dvh">
        <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-base font-semibold tracking-tight">fleetscope</h1>
            <ConnectionStatusBar />
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </TelemetryProvider>
  )
}
