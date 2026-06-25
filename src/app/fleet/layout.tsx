import Link from 'next/link'
import type { ReactNode } from 'react'
import { ConnectionStatusBar } from '@/components/ConnectionStatusBar'
import { GpuDetailDrawer } from '@/components/GpuDetailDrawer'
import { TelemetryProvider } from '@/providers/TelemetryProvider'

export default function FleetLayout({ children }: { children: ReactNode }) {
  return (
    <TelemetryProvider>
      <div className="min-h-dvh">
        <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold tracking-tight">fleetscope</h1>
              <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link
                  href="/fleet"
                  className="rounded px-2 py-0.5 hover:bg-muted hover:text-foreground"
                >
                  Grille
                </Link>
                <Link
                  href="/fleet/heatmap"
                  className="rounded px-2 py-0.5 hover:bg-muted hover:text-foreground"
                >
                  Heatmap
                </Link>
              </nav>
            </div>
            <ConnectionStatusBar />
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
      <GpuDetailDrawer />
    </TelemetryProvider>
  )
}
