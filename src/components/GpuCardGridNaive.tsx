'use client'

import { GpuCard } from '@/components/GpuCard'
import { useFleetIds } from '@/lib/store/telemetry-context'

/**
 * Grille NAÏVE (Phase 1) : monte une card par GPU, sans virtualisation.
 * À FLEET_SIZE élevé (Phase 5), monter des milliers de cards = jank au scroll
 * → la virtualisation (GpuCardGrid) corrige. Gardée exprès comme "avant".
 */
export function GpuCardGridNaive() {
  const ids = useFleetIds()
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
      {ids.map((id) => (
        <GpuCard key={id} id={id} />
      ))}
    </div>
  )
}
