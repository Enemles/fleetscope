'use client'

import { GpuCard } from '@/components/GpuCard'
import { useFleetIds } from '@/hooks/use-fleet-ids'

// Grille sans virtualisation (une card par GPU).
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
