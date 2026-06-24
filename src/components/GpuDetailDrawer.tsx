'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { GpuDetailChart } from '@/components/GpuDetailChart'
import { useTelemetryStore } from '@/lib/store/telemetry-store'

/** Panneau latéral du détail GPU. Piloté par store.selectedGpuId (clic sur une card). */
export function GpuDetailDrawer() {
  const selectedGpuId = useTelemetryStore((s) => s.selectedGpuId)
  const select = useTelemetryStore((s) => s.select)

  useEffect(() => {
    if (!selectedGpuId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedGpuId, select])

  if (!selectedGpuId) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => select(null)} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col gap-4 overflow-y-auto border-l bg-background p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold">{selectedGpuId}</h2>
          <Button variant="ghost" size="sm" onClick={() => select(null)}>
            Fermer
          </Button>
        </div>
        <GpuDetailChart id={selectedGpuId} />
      </div>
    </div>
  )
}
